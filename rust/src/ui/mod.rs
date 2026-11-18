pub mod app;
pub mod canvas_view;
pub mod file_panel;
pub mod fonts;
pub mod navigator;
pub mod qpcr_panel;
pub mod roi_panel;
pub mod theme;
pub mod topbar;
pub mod widgets;

pub use app::AppState;

use crate::errors::{AppError, Result};

/// Start the egui application (default Glow/OpenGL renderer; no Node/WebView).
pub fn run() -> Result<()> {
    let icon = load_icon()?;
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1500.0, 940.0])
            .with_min_inner_size([1024.0, 680.0])
            .with_icon(icon),
        ..Default::default()
    };

    eframe::run_native(
        "病理裁剪工具 · Rust",
        options,
        Box::new(|cc| {
            fonts::configure(&cc.egui_ctx);
            theme::apply(&cc.egui_ctx, theme::ThemeMode::System);
            let app = AppState::new(cc).map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;
            Ok(Box::new(app) as Box<dyn eframe::App>)
        }),
    )
    .map_err(|e| AppError::Other(format!("无法启动图形界面: {e}")))
}

fn load_icon() -> Result<egui::IconData> {
    let img = image::load_from_memory_with_format(
        include_bytes!("../../assets/icon.png"),
        image::ImageFormat::Png,
    )
    .map_err(|e| AppError::Other(format!("图标解码失败: {e}")))?
    .to_rgba8();
    Ok(egui::IconData {
        rgba: img.to_vec(),
        width: img.width(),
        height: img.height(),
    })
}
