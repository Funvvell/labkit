//! D3 图片批处理 + D2 TIFF/DPI 导出 —— 复用 image crate (MIT/Apache-2.0) + rayon (MIT/Apache-2.0)。
//!
//! 功能：格式互转（PNG/JPEG/TIFF）、缩放、JPEG 质量、体积上限迭代降质、
//! DPI 元数据写入（PNG pHYs 块 / TIFF XResolution/YResolution/ResolutionUnit 标签）、
//! 批量重命名（模板 + 冲突检测，绝不覆盖）、rayon 并行 + Tauri 进度事件。

use std::collections::HashSet;
use std::io::{Cursor, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

use base64::Engine;
use image::{DynamicImage, ExtendedColorType, GenericImageView, ImageEncoder, ImageFormat};
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tiff::encoder::TiffEncoder;
use tiff::tags::{ResolutionUnit, Tag};

// ---------------------------- 类型 ----------------------------

#[derive(Debug, Clone, Deserialize)]
pub struct ImgJob {
    pub path: String,
    /// 显式新文件名（含扩展名则忽略 format 推导的扩展名）
    pub new_name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ImgOptions {
    /// keep | png | jpeg | tiff
    pub format: String,
    /// none | width | height | percent | fit
    pub resize_mode: String,
    pub resize_value: f64,
    pub quality: u8,
    pub dpi: Option<u32>,
    /// JPEG 体积上限（字节），超出则迭代降质
    pub max_bytes: Option<u64>,
    pub out_dir: String,
    #[serde(default)]
    pub overwrite: bool,
    /// 重命名模板：{name} {ext} {i} {i:03} {date}
    pub rename_pattern: Option<String>,
}

impl Default for ImgOptions {
    fn default() -> Self {
        Self {
            format: "keep".into(),
            resize_mode: "none".into(),
            resize_value: 100.0,
            quality: 90,
            dpi: None,
            max_bytes: None,
            out_dir: String::new(),
            overwrite: false,
            rename_pattern: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ImgResult {
    pub src: String,
    pub out: String,
    pub ok: bool,
    pub error: Option<String>,
    pub width: u32,
    pub height: u32,
    pub bytes: u64,
}

#[derive(Debug, Serialize)]
pub struct ImgProbe {
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub bytes: u64,
}

#[derive(Debug, Serialize)]
pub struct RenamePreview {
    pub src: String,
    pub target: String,
    pub conflict: Option<String>,
}

// ---------------------------- DPI 元数据 ----------------------------

fn crc32_ieee(data: &[u8]) -> u32 {
    let mut table = [0u32; 256];
    for (i, e) in table.iter_mut().enumerate() {
        let mut c = i as u32;
        for _ in 0..8 {
            c = if c & 1 != 0 { 0xEDB88320 ^ (c >> 1) } else { c >> 1 };
        }
        *e = c;
    }
    let mut crc = 0xFFFF_FFFFu32;
    for &b in data {
        crc = table[((crc ^ b as u32) & 0xFF) as usize] ^ (crc >> 8);
    }
    crc ^ 0xFFFF_FFFF
}

/// 在 IEND 前插入 pHYs 块（单位：米），写入 DPI 元数据。
pub fn set_png_dpi(png: &[u8], dpi: u32) -> Result<Vec<u8>, String> {
    if png.len() < 12 || &png[0..8] != b"\x89PNG\r\n\x1a\n" {
        return Err("非 PNG 数据".into());
    }
    let ppm = (dpi as f64 / 0.0254).round() as u32;
    let mut chunk = Vec::with_capacity(21);
    chunk.extend_from_slice(&9u32.to_be_bytes()); // length
    chunk.extend_from_slice(b"pHYs");
    chunk.extend_from_slice(&ppm.to_be_bytes());
    chunk.extend_from_slice(&ppm.to_be_bytes());
    chunk.push(1); // unit = meter
    let crc = crc32_ieee(&chunk[4..]);
    chunk.extend_from_slice(&crc.to_be_bytes());
    // IEND 是最后 12 字节
    let iend = png.len() - 12;
    let mut out = Vec::with_capacity(png.len() + 21);
    out.extend_from_slice(&png[..iend]);
    out.extend_from_slice(&chunk);
    out.extend_from_slice(&png[iend..]);
    Ok(out)
}

/// 手工组装 IFD 写 RGB8 TIFF（未压缩，无损），带分辨率标签。
pub fn write_tiff_with_dpi(path: &Path, img: &DynamicImage, dpi: Option<u32>) -> Result<(), String> {
    let rgb = img.to_rgb8();
    let (w, h) = rgb.dimensions();
    let data = rgb.as_raw();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let file = std::io::BufWriter::new(std::fs::File::create(path).map_err(|e| e.to_string())?);
    let mut encoder = TiffEncoder::new(file).map_err(|e| e.to_string())?;
    let mut dir = encoder.new_directory().map_err(|e| e.to_string())?;
    let map_err = |e: tiff::TiffError| e.to_string();
    dir.write_tag(Tag::ImageWidth, w).map_err(map_err)?;
    dir.write_tag(Tag::ImageLength, h).map_err(map_err)?;
    dir.write_tag(Tag::BitsPerSample, &[8u16, 8, 8][..]).map_err(map_err)?;
    dir.write_tag(Tag::Compression, 1u16).map_err(map_err)?; // none
    dir.write_tag(Tag::PhotometricInterpretation, 2u16).map_err(map_err)?; // RGB
    dir.write_tag(Tag::SamplesPerPixel, 3u16).map_err(map_err)?;
    dir.write_tag(Tag::RowsPerStrip, h).map_err(map_err)?;
    let d = dpi.unwrap_or(72);
    dir.write_tag(Tag::XResolution, tiff::encoder::Rational { n: d, d: 1 }).map_err(map_err)?;
    dir.write_tag(Tag::YResolution, tiff::encoder::Rational { n: d, d: 1 }).map_err(map_err)?;
    dir.write_tag(Tag::ResolutionUnit, ResolutionUnit::Inch.to_u16()).map_err(map_err)?;
    let offset = dir.write_data(&data[..]).map_err(map_err)?;
    dir.write_tag(Tag::StripOffsets, offset as u32).map_err(map_err)?;
    dir.write_tag(Tag::StripByteCounts, data.len() as u32).map_err(map_err)?;
    dir.finish().map_err(map_err)?;
    Ok(())
}

// ---------------------------- 编码核心 ----------------------------

fn target_format(opts: &ImgOptions, src: &Path) -> Result<ImageFormat, String> {
    match opts.format.as_str() {
        "png" => Ok(ImageFormat::Png),
        "jpeg" | "jpg" => Ok(ImageFormat::Jpeg),
        "tiff" | "tif" => Ok(ImageFormat::Tiff),
        "keep" => {
            let ext = src.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
            match ext.as_str() {
                "png" => Ok(ImageFormat::Png),
                "jpg" | "jpeg" => Ok(ImageFormat::Jpeg),
                "tif" | "tiff" => Ok(ImageFormat::Tiff),
                "bmp" => Ok(ImageFormat::Bmp),
                "gif" => Ok(ImageFormat::Gif),
                "webp" => Ok(ImageFormat::WebP),
                _ => Err(format!("无法识别源格式：{ext}")),
            }
        }
        other => Err(format!("不支持的目标格式：{other}")),
    }
}

fn resized(img: &DynamicImage, opts: &ImgOptions) -> DynamicImage {
    let (w, h) = img.dimensions();
    let v = opts.resize_value;
    match opts.resize_mode.as_str() {
        "width" if v > 0.0 => img.resize(v as u32, u32::MAX, image::imageops::FilterType::Lanczos3),
        "height" if v > 0.0 => img.resize(u32::MAX, v as u32, image::imageops::FilterType::Lanczos3),
        "percent" if v > 0.0 => img.resize_exact(
            ((w as f64 * v / 100.0).round() as u32).max(1),
            ((h as f64 * v / 100.0).round() as u32).max(1),
            image::imageops::FilterType::Lanczos3,
        ),
        "fit" if v > 0.0 => img.resize(v as u32, v as u32, image::imageops::FilterType::Lanczos3),
        _ => img.clone(),
    }
}

fn encode_jpeg(img: &DynamicImage, quality: u8) -> Result<Vec<u8>, String> {
    let rgb = img.to_rgb8();
    let (w, h) = rgb.dimensions();
    let mut buf = Cursor::new(Vec::new());
    let enc = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, quality);
    enc.write_image(rgb.as_raw(), w, h, ExtendedColorType::Rgb8).map_err(|e| e.to_string())?;
    Ok(buf.into_inner())
}

/// 编码到字节（含 DPI 元数据与体积上限迭代）。
pub fn encode_image(img: &DynamicImage, fmt: ImageFormat, opts: &ImgOptions) -> Result<Vec<u8>, String> {
    match fmt {
        ImageFormat::Jpeg => {
            let mut q = opts.quality.clamp(1, 100);
            let mut bytes = encode_jpeg(img, q)?;
            if let Some(max) = opts.max_bytes {
                while bytes.len() as u64 > max && q > 10 {
                    q = q.saturating_sub(5).max(10);
                    bytes = encode_jpeg(img, q)?;
                }
            }
            Ok(bytes)
        }
        ImageFormat::Png => {
            let mut buf = Cursor::new(Vec::new());
            img.write_to(&mut buf, ImageFormat::Png).map_err(|e| e.to_string())?;
            let bytes = buf.into_inner();
            match opts.dpi {
                Some(d) if d > 0 => set_png_dpi(&bytes, d),
                _ => Ok(bytes),
            }
        }
        ImageFormat::Tiff => {
            // 先写临时内存文件再读回（统一走带 DPI 的 IFD 路径）；唯一文件名避免并行竞态
            static SEQ: AtomicUsize = AtomicUsize::new(0);
            let n = SEQ.fetch_add(1, Ordering::SeqCst);
            let tmp = std::env::temp_dir().join(format!("labkit_tiff_{}_{}.tif", std::process::id(), n));
            write_tiff_with_dpi(&tmp, img, opts.dpi)?;
            let bytes = std::fs::read(&tmp).map_err(|e| e.to_string())?;
            let _ = std::fs::remove_file(&tmp);
            Ok(bytes)
        }
        other => {
            let mut buf = Cursor::new(Vec::new());
            img.write_to(&mut buf, other).map_err(|e| e.to_string())?;
            Ok(buf.into_inner())
        }
    }
}

// ---------------------------- 重命名 ----------------------------

fn apply_pattern(pattern: &str, src: &Path, index: usize) -> String {
    let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("image");
    let ext = src.extension().and_then(|s| s.to_str()).unwrap_or("");
    let date = chrono::Local::now().format("%Y%m%d").to_string();
    let mut out = pattern
        .replace("{name}", stem)
        .replace("{ext}", ext)
        .replace("{date}", &date)
        .replace("{i}", &index.to_string());
    // {i:03} 形式
    while let Some(start) = out.find("{i:") {
        if let Some(end) = out[start..].find('}') {
            let spec = &out[start + 3..start + end];
            let width: usize = spec.parse().unwrap_or(0);
            let rep = format!("{:0>width$}", index, width = width);
            out = format!("{}{}{}", &out[..start], rep, &out[start + end + 1..]);
        } else {
            break;
        }
    }
    out
}

fn target_name(job: &ImgJob, opts: &ImgOptions, fmt: ImageFormat, index: usize) -> String {
    if let Some(n) = &job.new_name {
        if !n.trim().is_empty() {
            return n.trim().to_string();
        }
    }
    let src = Path::new(&job.path);
    let ext = match fmt {
        ImageFormat::Png => "png",
        ImageFormat::Jpeg => "jpg",
        ImageFormat::Tiff => "tiff",
        ImageFormat::Bmp => "bmp",
        ImageFormat::Gif => "gif",
        ImageFormat::WebP => "webp",
        _ => "png",
    };
    match &opts.rename_pattern {
        Some(p) if !p.trim().is_empty() => {
            let mut name = apply_pattern(p, src, index);
            if Path::new(&name).extension().is_none() {
                name = format!("{name}.{ext}");
            }
            name
        }
        _ => {
            let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("image");
            format!("{stem}.{ext}")
        }
    }
}

// ---------------------------- Tauri 命令 ----------------------------

#[tauri::command(async)]
pub fn img_probe(path: String) -> Result<ImgProbe, String> {
    let p = Path::new(&path);
    let bytes = std::fs::metadata(p).map_err(|e| e.to_string())?.len();
    let img = image::open(p).map_err(|e| e.to_string())?;
    let (w, h) = img.dimensions();
    let fmt = image::guess_format(&std::fs::read(p).map_err(|e| e.to_string())?[..16.min(bytes as usize)])
        .map(|f| format!("{f:?}"))
        .unwrap_or_else(|_| "unknown".into());
    Ok(ImgProbe { width: w, height: h, format: fmt, bytes })
}

/// D2 拼图器导出：dataURL → 指定格式 + DPI 元数据 → 落盘。
#[tauri::command(async)]
pub fn img_encode(data_url: String, format: String, dpi: Option<u32>, path: String) -> Result<String, String> {
    let b64 = data_url.split(',').nth(1).ok_or("dataURL 格式无效")?;
    let bytes = base64::engine::general_purpose::STANDARD.decode(b64).map_err(|e| e.to_string())?;
    let img = image::load_from_memory(&bytes).map_err(|e| e.to_string())?;
    let fmt = match format.as_str() {
        "png" => ImageFormat::Png,
        "jpeg" | "jpg" => ImageFormat::Jpeg,
        "tiff" | "tif" => ImageFormat::Tiff,
        other => return Err(format!("不支持的格式：{other}")),
    };
    let opts = ImgOptions { format: format.clone(), dpi, ..Default::default() };
    let out = encode_image(&img, fmt, &opts)?;
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(p, &out).map_err(|e| e.to_string())?;
    Ok(path)
}

#[tauri::command]
pub fn img_rename_preview(jobs: Vec<ImgJob>, pattern: String, out_dir: String) -> Result<Vec<RenamePreview>, String> {
    let opts = ImgOptions { rename_pattern: Some(pattern.clone()), out_dir: out_dir.clone(), ..Default::default() };
    let mut seen: HashSet<String> = HashSet::new();
    let mut out = Vec::new();
    for (i, job) in jobs.iter().enumerate() {
        let src = Path::new(&job.path);
        let fmt = target_format(&ImgOptions { format: "keep".into(), ..Default::default() }, src).unwrap_or(ImageFormat::Png);
        let name = target_name(job, &opts, fmt, i + 1);
        let target = Path::new(&out_dir).join(&name);
        let key = target.to_string_lossy().to_lowercase();
        let conflict = if seen.contains(&key) {
            Some("批内重名".into())
        } else if target.exists() {
            Some("目标已存在".into())
        } else {
            None
        };
        seen.insert(key);
        out.push(RenamePreview { src: job.path.clone(), target: target.to_string_lossy().into_owned(), conflict });
    }
    Ok(out)
}

#[tauri::command(async)]
pub fn img_batch(app: tauri::AppHandle, jobs: Vec<ImgJob>, opts: ImgOptions) -> Result<Vec<ImgResult>, String> {
    if jobs.is_empty() {
        return Ok(vec![]);
    }
    let out_dir = PathBuf::from(&opts.out_dir);
    std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;
    let total = jobs.len();
    let done = AtomicUsize::new(0);

    // 先算全部目标名并做冲突检测（批内 + 磁盘），避免并行写入互相覆盖
    let mut planned: Vec<(usize, PathBuf, Option<String>)> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    for (i, job) in jobs.iter().enumerate() {
        let src = Path::new(&job.path);
        let fmt = match target_format(&opts, src) {
            Ok(f) => f,
            Err(e) => {
                planned.push((i, out_dir.join(""), Some(e)));
                continue;
            }
        };
        let name = target_name(job, &opts, fmt, i + 1);
        let target = out_dir.join(&name);
        let key = target.to_string_lossy().to_lowercase();
        let conflict = if seen.contains(&key) {
            Some(format!("批内重名：{name}"))
        } else if target.exists() && !opts.overwrite && target.as_path() != Path::new(&job.path) {
            Some(format!("目标已存在（未勾选覆盖）：{name}"))
        } else {
            None
        };
        seen.insert(key);
        planned.push((i, target, conflict));
    }

    use rayon::prelude::*;
    let results: Vec<ImgResult> = planned
        .par_iter()
        .map(|(i, target, conflict)| {
            let job = &jobs[*i];
            let src = job.path.clone();
            let finish = |r: ImgResult| {
                let n = done.fetch_add(1, Ordering::SeqCst) + 1;
                let _ = app.emit("imgbatch-progress", serde_json::json!({
                    "done": n, "total": total, "src": r.src, "ok": r.ok, "error": r.error,
                }));
                r
            };
            if let Some(e) = conflict {
                return finish(ImgResult { src, out: target.to_string_lossy().into_owned(), ok: false, error: Some(e.clone()), width: 0, height: 0, bytes: 0 });
            }
            let work = || -> Result<ImgResult, String> {
                let img = image::open(&src).map_err(|e| format!("读取失败：{e}"))?;
                let img = resized(&img, &opts);
                let (w, h) = img.dimensions();
                let fmt = target_format(&opts, Path::new(&src))?;
                let bytes = encode_image(&img, fmt, &opts)?;
                if let Some(parent) = target.parent() {
                    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                std::fs::write(target, &bytes).map_err(|e| format!("写入失败：{e}"))?;
                Ok(ImgResult { src: src.clone(), out: target.to_string_lossy().into_owned(), ok: true, error: None, width: w, height: h, bytes: bytes.len() as u64 })
            };
            match work() {
                Ok(r) => finish(r),
                Err(e) => finish(ImgResult { src, out: target.to_string_lossy().into_owned(), ok: false, error: Some(e), width: 0, height: 0, bytes: 0 }),
            }
        })
        .collect();
    let _ = std::io::stdout().flush();
    Ok(results)
}

// ---------------------------- 测试 ----------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn gradient(w: u32, h: u32) -> DynamicImage {
        let mut rgb = image::RgbImage::new(w, h);
        for (x, y, p) in rgb.enumerate_pixels_mut() {
            *p = image::Rgb([(x * 255 / w) as u8, (y * 255 / h) as u8, ((x + y) * 255 / (w + h)) as u8]);
        }
        DynamicImage::ImageRgb8(rgb)
    }

    fn png_bytes(img: &DynamicImage, dpi: Option<u32>) -> Vec<u8> {
        let opts = ImgOptions { dpi, ..Default::default() };
        encode_image(img, ImageFormat::Png, &opts).unwrap()
    }

    #[test]
    fn png_dpi_phys_roundtrip() {
        let img = gradient(8, 8);
        let bytes = png_bytes(&img, Some(300));
        // 找 pHYs 块
        let pos = bytes.windows(4).position(|w| w == b"pHYs").expect("pHYs 存在");
        let ppm = u32::from_be_bytes([bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]]);
        assert_eq!(ppm, 11811); // round(300/0.0254)
        assert_eq!(bytes[pos + 12], 1); // unit meter
        // 仍可解码
        let back = image::load_from_memory(&bytes).unwrap();
        assert_eq!(back.dimensions(), (8, 8));
    }

    #[test]
    fn tiff_resolution_tags_roundtrip() {
        let img = gradient(16, 12);
        let tmp = std::env::temp_dir().join("labkit_test_dpi.tif");
        write_tiff_with_dpi(&tmp, &img, Some(300)).unwrap();
        let file = std::fs::File::open(&tmp).unwrap();
        let mut dec = tiff::decoder::Decoder::new(file).unwrap();
        match dec.get_tag(Tag::XResolution).unwrap() {
            tiff::decoder::ifd::Value::Rational(n, d) => assert_eq!((n, d), (300, 1)),
            v => panic!("XResolution 类型错误：{v:?}"),
        }
        match dec.get_tag(Tag::ResolutionUnit).unwrap() {
            tiff::decoder::ifd::Value::Short(u) => assert_eq!(u, 2), // Inch
            tiff::decoder::ifd::Value::Unsigned(u) => assert_eq!(u, 2), // 解码器可能归一化为 Unsigned
            v => panic!("ResolutionUnit 类型错误：{v:?}"),
        }
        let _ = std::fs::remove_file(&tmp);
    }

    #[test]
    fn png_tiff_pixel_identical() {
        let img = gradient(24, 18);
        let png = png_bytes(&img, None);
        let from_png = image::load_from_memory(&png).unwrap();
        let tmp = std::env::temp_dir().join("labkit_test_px.tif");
        write_tiff_with_dpi(&tmp, &from_png, Some(300)).unwrap();
        let from_tiff = image::open(&tmp).unwrap();
        assert_eq!(from_png.to_rgb8().as_raw(), from_tiff.to_rgb8().as_raw());
        let _ = std::fs::remove_file(&tmp);
    }

    #[test]
    fn jpeg_quality_affects_size() {
        let img = gradient(128, 128);
        let hi = encode_image(&img, ImageFormat::Jpeg, &ImgOptions { quality: 95, ..Default::default() }).unwrap();
        let lo = encode_image(&img, ImageFormat::Jpeg, &ImgOptions { quality: 30, ..Default::default() }).unwrap();
        assert!(hi.len() > lo.len());
        // 体积上限迭代降质
        let capped = encode_image(&img, ImageFormat::Jpeg, &ImgOptions { quality: 95, max_bytes: Some((lo.len() as u64) + 1), ..Default::default() }).unwrap();
        assert!(capped.len() as u64 <= (lo.len() as u64) + 1);
    }

    #[test]
    fn resize_modes() {
        let img = gradient(100, 50);
        let w = resized(&img, &ImgOptions { resize_mode: "width".into(), resize_value: 50.0, ..Default::default() });
        assert_eq!(w.dimensions(), (50, 25));
        let p = resized(&img, &ImgOptions { resize_mode: "percent".into(), resize_value: 200.0, ..Default::default() });
        assert_eq!(p.dimensions(), (200, 100));
        let f = resized(&img, &ImgOptions { resize_mode: "fit".into(), resize_value: 40.0, ..Default::default() });
        assert_eq!(f.dimensions(), (40, 20));
    }

    #[test]
    fn rename_pattern_and_conflicts() {
        let p = Path::new("/data/IMG_001.tif");
        assert_eq!(apply_pattern("Fig_{i:03}_{name}", p, 2), "Fig_002_IMG_001");
        assert_eq!(apply_pattern("{name}_copy.{ext}", p, 1), "IMG_001_copy.tif");
        let jobs = vec![
            ImgJob { path: "/data/a.png".into(), new_name: None },
            ImgJob { path: "/data/b.png".into(), new_name: None },
        ];
        let opts = ImgOptions { rename_pattern: Some("same.png".into()), ..Default::default() };
        let fmt = ImageFormat::Png;
        let n1 = target_name(&jobs[0], &opts, fmt, 1);
        let n2 = target_name(&jobs[1], &opts, fmt, 2);
        assert_eq!(n1, n2); // 批内重名由 img_batch/preview 检测
    }
}