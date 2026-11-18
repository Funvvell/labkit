//! FFI boundary #1: C ABI declarations, function pointers, and the *only*
//! place where raw DLL buffers / handles are dereferenced.
//!
//! All functions exposed from this module are safe: the unsafe operations are
//! contained in their bodies and guarded by `DLL_LOCK`.

#![allow(unsafe_code)]

use std::ffi::{c_char, c_int, c_uint, CStr};
use std::path::Path;
use std::ptr::NonNull;
use std::sync::{Mutex, OnceLock};

use crate::errors::{AppError, Result};
use crate::geometry::clamp_region;

/// Only the first two fields are needed: `picHead` lives at byte offset 8.
#[repr(C)]
pub struct SqSdpcInfo {
    pub file_name: *const c_char,
    pub pic_head: *const u8,
}

pub type FnOpen = unsafe extern "C" fn(*const c_char) -> *mut SqSdpcInfo;
pub type FnClose = unsafe extern "C" fn(*mut SqSdpcInfo);
pub type FnLayerInfo = unsafe extern "C" fn(*mut SqSdpcInfo, c_int) -> *const c_char;
pub type FnGetRoi = unsafe extern "C" fn(
    *mut SqSdpcInfo,
    *mut *mut u8,
    c_int, // w
    c_int, // h
    c_uint, // x
    c_uint, // y
    c_int, // level
) -> c_int;
pub type FnDispose = unsafe extern "C" fn(*mut u8);

#[derive(Clone, Copy)]
pub struct Dll {
    pub open: FnOpen,
    #[allow(dead_code)] // deliberately never called (see reader.rs)
    pub close: FnClose,
    pub layer_info: FnLayerInfo,
    pub get_roi: FnGetRoi,
    pub dispose: FnDispose,
}

/// The decoder has global mutable state; every FFI call must be serialised.
pub static DLL_LOCK: Mutex<()> = Mutex::new(());

static DLL: OnceLock<std::result::Result<Dll, String>> = OnceLock::new();

/// Load the DLL once and keep it resident for the lifetime of the process.
pub fn dll() -> Result<&'static Dll> {
    let slot = DLL.get_or_init(|| {
        crate::sdpc::loader::load_library()
            .map(|d| d)
            .map_err(|e| e.to_string())
    });
    match slot {
        Ok(d) => Ok(d),
        Err(msg) => Err(AppError::Dll(msg.clone())),
    }
}

fn lock() -> std::sync::MutexGuard<'static, ()> {
    DLL_LOCK.lock().unwrap_or_else(|e| e.into_inner())
}

/// Encode a Windows path as GBK (the DLL's codepage), NUL-terminated.
/// Exposed so tests can compare against Python's `.encode("gbk")`.
pub fn gbk_path_bytes(path: &Path) -> Result<Vec<u8>> {
    let text = path.to_string_lossy().to_string();
    let (encoded, _, had_unmappable) = encoding_rs::GBK.encode(&text);
    if had_unmappable {
        return Err(AppError::GbkEncode(text));
    }
    let mut bytes = encoded.into_owned();
    bytes.push(0);
    Ok(bytes)
}

/// Encode a Windows path as GBK (the DLL's codepage) and open a slide.
pub fn open_slide(path: &Path) -> Result<NonNull<SqSdpcInfo>> {
    if !path.exists() {
        return Err(AppError::OpenFailed(path.to_path_buf()));
    }
    let bytes = gbk_path_bytes(path)?;

    let d = dll()?;
    let _g = lock();
    let handle = unsafe { (d.open)(bytes.as_ptr() as *const c_char) };
    NonNull::new(handle).ok_or_else(|| AppError::OpenFailed(path.to_path_buf()))
}

/// Read the `GetLayerInfo` string for a pyramid level.
pub fn layer_info(handle: NonNull<SqSdpcInfo>, level: u32) -> Result<String> {
    let d = dll()?;
    let _g = lock();
    let ptr = unsafe { (d.layer_info)(handle.as_ptr(), level as c_int) };
    if ptr.is_null() {
        return Err(AppError::Parse(format!("GetLayerInfo({level}) 返回空指针")));
    }
    Ok(unsafe { CStr::from_ptr(ptr) }.to_string_lossy().into_owned())
}

/// RAII guard: the DLL allocates the pixel buffer, so it must be freed with
/// `Dispose` even when decoding fails or panics.
struct DllBuffer {
    ptr: *mut u8,
    dispose: FnDispose,
}

impl Drop for DllBuffer {
    fn drop(&mut self) {
        if !self.ptr.is_null() {
            unsafe { (self.dispose)(self.ptr) };
        }
    }
}

/// Decode a rectangle from a pyramid level and return contiguous **RGB888**.
///
/// Coordinates `(x, y)` and dimensions `(w, h)` are in the target level's
/// local pixel space, matching `reader.py::_read_level_region`.
pub fn decode_region(
    handle: NonNull<SqSdpcInfo>,
    x: u32,
    y: u32,
    w: u32,
    h: u32,
    level: u32,
) -> Result<Vec<u8>> {
    let d = dll()?;
    let len = (w as usize)
        .checked_mul(h as usize)
        .and_then(|v| v.checked_mul(3))
        .ok_or_else(|| AppError::InvalidRegion("尺寸溢出".into()))?;
    if len > i32::MAX as usize {
        return Err(AppError::InvalidRegion(format!("区域过大: {w}x{h}")));
    }

    let mut out: *mut u8 = std::ptr::null_mut();
    let _g = lock();
    let ret = unsafe {
        (d.get_roi)(
            handle.as_ptr(),
            &mut out,
            w as c_int,
            h as c_int,
            x as c_uint,
            y as c_uint,
            level as c_int,
        )
    };
    // Guard is created immediately so the buffer is always released.
    let _buf = DllBuffer {
        ptr: out,
        dispose: d.dispose,
    };

    if ret != 0 {
        return Err(AppError::Decode(ret));
    }
    if out.is_null() {
        return Err(AppError::Decode(-1));
    }

    let bgr = unsafe { std::slice::from_raw_parts(out, len) };
    let mut rgb = vec![0u8; len];
    for i in (0..len).step_by(3) {
        rgb[i] = bgr[i + 2];
        rgb[i + 1] = bgr[i + 1];
        rgb[i + 2] = bgr[i];
    }
    Ok(rgb)
}

/// Apply the same second clamp as `reader.py::extract_region` before decoding.
pub fn clamp_to_slide(x: i64, y: i64, w: i64, h: i64, iw: i64, ih: i64) -> crate::geometry::Rect {
    clamp_region(x, y, w, h, iw, ih)
}
