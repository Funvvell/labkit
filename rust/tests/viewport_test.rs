use pathology_crop_rs::render::Viewport;
use pathology_crop_rs::sdpc::{LevelInfo, SlideInfo};

fn info() -> SlideInfo {
    let levels = (0..7)
        .map(|i| LevelInfo {
            level: i,
            width: 258_048 >> i,
            height: 69_888 >> i,
            downsample: 2f64.powi(i as i32),
        })
        .collect();
    SlideInfo {
        levels,
        full_w: 258_048,
        full_h: 69_888,
        mpp: Some(0.102_306_547_619_047_62),
        scale: 0.5,
    }
}

#[test]
fn screen_level0_roundtrip() {
    let mut vp = Viewport::new();
    vp.scale = 0.25;
    vp.offset_x = 123.5;
    vp.offset_y = -77.25;
    let (x, y) = vp.screen_to_level0(640.0, 480.0);
    let (sx, sy) = vp.level0_to_screen(x, y);
    assert!((sx - 640.0).abs() < 1e-9);
    assert!((sy - 480.0).abs() < 1e-9);
}

#[test]
fn zoom_keeps_mouse_anchor() {
    let mut vp = Viewport::new();
    vp.scale = 0.5;
    vp.offset_x = 1000.0;
    vp.offset_y = 2000.0;
    let (lx, ly) = vp.screen_to_level0(300.0, 400.0);
    vp.zoom_at(300.0, 400.0, true, 1e-6);
    let (lx2, ly2) = vp.screen_to_level0(300.0, 400.0);
    assert!((lx2 - lx).abs() < 1e-6);
    assert!((ly2 - ly).abs() < 1e-6);
    assert!((vp.scale - 0.575).abs() < 1e-9);
}

#[test]
fn pan_changes_offset_by_screen_delta() {
    let mut vp = Viewport::new();
    vp.scale = 2.0;
    vp.pan(100.0, -40.0);
    assert!((vp.offset_x + 50.0).abs() < 1e-9);
    assert!((vp.offset_y - 20.0).abs() < 1e-9);
}

#[test]
fn fit_centres_the_slide() {
    let mut vp = Viewport::new();
    vp.fit(1000.0, 500.0, 2000.0, 1000.0);
    assert!((vp.scale - 0.49).abs() < 1e-9);
    let (x0, y0) = vp.screen_to_level0(0.0, 0.0);
    let (x1, y1) = vp.screen_to_level0(1000.0, 500.0);
    assert!((x0 + x1 - 2000.0).abs() < 1e-6);
    assert!((y0 + y1 - 1000.0).abs() < 1e-6);
}

#[test]
fn best_level_matches_canvas_rule() {
    let i = info();
    assert_eq!(i.best_level(1.0), 0);
    assert_eq!(i.best_level(0.5), 1);
    assert_eq!(i.best_level(1.0 / 64.0), 6);
    assert_eq!(i.best_level(0.01), 6);
}

#[test]
fn visible_rect_has_margin() {
    let mut vp = Viewport::new();
    vp.scale = 1.0;
    let (x, y, w, h) = vp.visible_rect(1000.0, 800.0, 0.3);
    assert!((x + 300.0).abs() < 1e-9);
    assert!((y + 240.0).abs() < 1e-9);
    assert!((w - 1600.0).abs() < 1e-9);
    assert!((h - 1280.0).abs() < 1e-9);
}
