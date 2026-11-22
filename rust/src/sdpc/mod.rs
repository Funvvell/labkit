//! Safe public surface of the SDPC decoder.

pub mod download;
pub mod ffi;
pub mod loader;
pub mod reader;
pub mod structs;

pub use download::{ensure as ensure_decoder, Progress as DownloadProgress};
pub use reader::{LevelInfo, RgbImage, RgbaImage, SlideInfo, SlideReader};
