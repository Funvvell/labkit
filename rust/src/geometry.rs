//! Pure geometry helpers. These are the behaviour contracts inherited from
//! `liver_portal_crop/utils.py` and `reader.py`.

/// An axis-aligned rectangle in level-0 (full resolution) coordinates.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Rect {
    pub x: i64,
    pub y: i64,
    pub w: i64,
    pub h: i64,
}

impl Rect {
    pub fn new(x: i64, y: i64, w: i64, h: i64) -> Self {
        Self { x, y, w, h }
    }

    pub fn right(&self) -> i64 {
        self.x + self.w
    }

    pub fn bottom(&self) -> i64 {
        self.y + self.h
    }

    pub fn center(&self) -> (i64, i64) {
        (self.x + self.w / 2, self.y + self.h / 2)
    }
}

/// Port of `utils.py::center_crop_rect`.
///
/// The crop is centred on `(center_x, center_y)` using `crop_w/crop_h`, with
/// integer floor division by two. When it crosses an image boundary the
/// rectangle is **clamped and shrunk** (never shifted back to keep its size).
pub fn center_crop_rect(
    center_x: i64,
    center_y: i64,
    crop_w: i64,
    crop_h: i64,
    image_w: i64,
    image_h: i64,
) -> Rect {
    let half_w = crop_w / 2;
    let half_h = crop_h / 2;

    let x1_raw = center_x - half_w;
    let y1_raw = center_y - half_h;
    let x2_raw = x1_raw + crop_w;
    let y2_raw = y1_raw + crop_h;

    let x1 = x1_raw.max(0);
    let y1 = y1_raw.max(0);
    let x2 = x2_raw.min(image_w);
    let y2 = y2_raw.min(image_h);

    Rect::new(x1, y1, (x2 - x1).max(0), (y2 - y1).max(0))
}

/// Second clamp performed inside `reader.py::extract_region` before the FFI
/// call. Note `x` is clamped to `image_w - 1`, not `image_w`.
pub fn clamp_region(x: i64, y: i64, w: i64, h: i64, image_w: i64, image_h: i64) -> Rect {
    let x = x.max(0).min(image_w.saturating_sub(1));
    let y = y.max(0).min(image_h.saturating_sub(1));
    let w = w.min(image_w - x).max(0);
    let h = h.min(image_h - y).max(0);
    Rect::new(x, y, w, h)
}

/// Axis-aligned bounding box of a `w x h` rectangle centred at `(cx, cy)`
/// after rotating `angle_deg` degrees. Used for rotated ROIs; the exporter
/// always crops this bounding box and ignores the angle, matching the
/// Qt implementation's `mapRectToScene` write-back.
pub fn rotated_bounds(cx: f64, cy: f64, w: f64, h: f64, angle_deg: f64) -> Rect {
    let r = angle_deg.to_radians();
    let c = r.cos().abs();
    let s = r.sin().abs();
    let bw = w * c + h * s;
    let bh = w * s + h * c;
    Rect::new(
        (cx - bw / 2.0).round() as i64,
        (cy - bh / 2.0).round() as i64,
        bw.round() as i64,
        bh.round() as i64,
    )
}
