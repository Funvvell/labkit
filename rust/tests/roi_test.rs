use pathology_crop_rs::model::session::parse_rois;
use pathology_crop_rs::model::{Roi, RoiStore};
use std::path::Path;

fn roi(id: &str, path: &str, x: i64, y: i64) -> Roi {
    let mut r = Roi::new(Path::new(path), x, y, 20, 30, 0.0);
    r.id = id.to_string();
    r
}

#[test]
fn id_is_12_hex_chars_and_unique() {
    let a = Roi::new(Path::new("a.sdpc"), 0, 0, 10, 10, 0.0);
    let b = Roi::new(Path::new("a.sdpc"), 0, 0, 10, 10, 0.0);
    assert_eq!(a.id.len(), 12);
    assert!(a.id.bytes().all(|c| c.is_ascii_hexdigit()));
    assert_ne!(a.id, b.id);
}

#[test]
fn clone_is_independent() {
    let a = Roi::new(Path::new("a.sdpc"), 1, 2, 3, 4, 0.0);
    let mut b = a.clone();
    b.x = 999;
    assert_eq!(a.x, 1);
}

#[test]
fn empty_store_json() {
    let store = RoiStore::new();
    assert_eq!(store.to_json(), serde_json::json!({"rois": []}));
}

#[test]
fn json_roundtrip() {
    let mut store = RoiStore::new();
    store.add(roi("abc", "D:/病理/a.sdpc", 10, 20));
    let text = serde_json::to_string(&store.to_json()).unwrap();
    let restored = parse_rois(&text).unwrap();
    assert_eq!(restored.len(), 1);
    assert_eq!(restored[0].id, "abc");
    assert_eq!(restored[0].x, 10);
    assert_eq!(restored[0].w, 20);
}

#[test]
fn legacy_thumb_fields() {
    let data = r#"{"rois":[{"id":"old","slide_path":"a.sdpc","thumb_x":100,"thumb_y":200,"thumb_w":300,"thumb_h":400,"angle":15.0,"created_at":"2026-01-01T00:00:00"}]}"#;
    let rois = parse_rois(data).unwrap();
    assert_eq!(rois.len(), 1);
    assert_eq!((rois[0].x, rois[0].y, rois[0].w, rois[0].h), (100, 200, 300, 400));
    assert_eq!(rois[0].angle, 15.0);
}

#[test]
fn malformed_entries_are_skipped() {
    let data = r#"{"rois":[{"id":"ok","slide_path":"a.sdpc","x":1,"y":2,"w":3,"h":4},{"nope":1},null]}"#;
    let rois = parse_rois(data).unwrap();
    assert_eq!(rois.len(), 1);
}

#[test]
fn stable_sort_c_a_b() {
    let mut store = RoiStore::new();
    store.add(roi("b", "a.sdpc", 50, 0));
    store.add(roi("a", "a.sdpc", 10, 5));
    store.add(roi("c", "a.sdpc", 10, 1));
    let v = store.sorted_slide_rois(Path::new("a.sdpc"));
    let ids: Vec<&str> = v.iter().map(|r| r.id.as_str()).collect();
    assert_eq!(ids, vec!["c", "a", "b"]);
}

#[test]
fn clear_slide_only_affects_one_file() {
    let mut store = RoiStore::new();
    store.add(roi("a", "a.sdpc", 0, 0));
    store.add(roi("b", "b.sdpc", 0, 0));
    store.clear_slide(Path::new("a.sdpc"));
    assert_eq!(store.len(), 1);
    assert!(store.get("b").is_some());
}

#[test]
fn replace_overwrites_same_id() {
    let mut store = RoiStore::new();
    store.add(roi("a", "a.sdpc", 0, 0));
    let mut changed = roi("a", "a.sdpc", 7, 8);
    changed.angle = 9.0;
    store.replace(changed);
    assert_eq!(store.len(), 1);
    assert_eq!(store.get("a").unwrap().x, 7);
    assert_eq!(store.get("a").unwrap().angle, 9.0);
}
