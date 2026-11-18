//! TIFF writing, compatible with Python's `tifffile.imwrite(compression="zlib")`.
//!
//! Only decoded RGB pixels are comparable between the two implementations;
//! Deflate streams and IFD tag ordering are not byte-identical.

use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

use tiff::encoder::{colortype, compression::Deflate, TiffEncoder};

use crate::errors::{AppError, Result};
use crate::sdpc::RgbImage;

pub fn write_rgb_tiff(path: &Path, image: &RgbImage) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let file = BufWriter::new(File::create(path)?);
    let mut encoder = TiffEncoder::new(file).map_err(|e| AppError::Tiff(e.to_string()))?;
    encoder
        .write_image_with_compression::<colortype::RGB8, Deflate>(
            image.w,
            image.h,
            Deflate::default(),
            &image.data,
        )
        .map_err(|e| AppError::Tiff(e.to_string()))?;
    Ok(())
}
