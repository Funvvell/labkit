//! RGB888 -> egui texture conversion. Textures are uploaded only once, when a
//! `TileReady` response arrives (never per frame).

use egui::{ColorImage, Context, TextureHandle, TextureOptions};

use crate::sdpc::RgbImage;

pub fn upload(ctx: &Context, name: &str, img: &RgbImage, linear: bool) -> TextureHandle {
    let ci = ColorImage::from_rgb([img.w as usize, img.h as usize], &img.data);
    let options = if linear {
        TextureOptions::LINEAR
    } else {
        TextureOptions::NEAREST
    };
    ctx.load_texture(name, ci, options)
}
