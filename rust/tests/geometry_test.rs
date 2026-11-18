use labkit::geometry::{center_crop_rect, clamp_region, Rect};

fn r(x: i64, y: i64, w: i64, h: i64) -> Rect {
    Rect::new(x, y, w, h)
}

#[test]
fn centred_crop() {
    assert_eq!(center_crop_rect(1000, 1000, 500, 500, 2000, 2000), r(750, 750, 500, 500));
}

#[test]
fn crop_near_left_edge_shrinks() {
    assert_eq!(center_crop_rect(10, 500, 200, 200, 1000, 1000), r(0, 400, 110, 200));
}

#[test]
fn crop_near_right_edge_shrinks() {
    assert_eq!(center_crop_rect(990, 500, 200, 200, 1000, 1000), r(890, 400, 110, 200));
}

#[test]
fn crop_larger_than_image() {
    assert_eq!(center_crop_rect(500, 500, 3000, 3000, 1000, 1000), r(0, 0, 1000, 1000));
}

#[test]
fn crop_near_top_edge_shrinks() {
    assert_eq!(center_crop_rect(500, 10, 200, 200, 1000, 1000), r(400, 0, 200, 110));
}

#[test]
fn odd_crop_size_uses_floor_half() {
    assert_eq!(center_crop_rect(100, 100, 101, 101, 500, 500), r(50, 50, 101, 101));
}

#[test]
fn exporter_contract_1024() {
    assert_eq!(
        center_crop_rect(1000, 1000, 1024, 1024, 10000, 8000),
        r(488, 488, 1024, 1024)
    );
}

#[test]
fn never_exceeds_bounds() {
    let c = center_crop_rect(50, 50, 1024, 1024, 10000, 8000);
    assert!(c.x >= 0 && c.y >= 0);
    assert!(c.x + c.w <= 10000 && c.y + c.h <= 8000);
}

#[test]
fn extreme_values_do_not_panic() {
    let c = center_crop_rect(i64::MAX / 4, -5, 2_000_000_000, 2_000_000_000, 1000, 1000);
    assert!(c.w >= 0 && c.h >= 0);
}

#[test]
fn reader_second_clamp() {
    // reader.py clamps x to full_w - 1 and then shrinks w.
    assert_eq!(clamp_region(-5, -5, 100, 100, 1000, 1000), r(0, 0, 100, 100));
    assert_eq!(clamp_region(999, 0, 500, 10, 1000, 1000), r(999, 0, 1, 10));
}
