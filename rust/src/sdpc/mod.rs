//! Safe public surface of the SDPC decoder.

pub mod ffi;
pub mod loader;
pub mod reader;
pub mod structs;

pub use reader::{LevelInfo, RgbImage, SlideInfo, SlideReader};
