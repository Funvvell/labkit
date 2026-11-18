use pathology_crop_rs::export::{output_name, sorted_for_export};
use pathology_crop_rs::model::Roi;
use std::path::Path;

fn roi(id: &str, x: i64, y: i64) -> Roi {
    let mut r = Roi::new(Path::new("liver_slide_001.sdpc"), x, y, 512, 512, 0.0);
    r.id = id.to_string();
    r
}

#[test]
fn naming_contract() {
    assert_eq!(
        output_name("liver_slide_001", 0, None),
        "liver_slide_001_ROI_0000.tiff"
    );
}

#[test]
fn zero_padding_and_large_index() {
    assert_eq!(output_name("s", 7, None), "s_ROI_0007.tiff");
    assert_eq!(output_name("s", 1234, None), "s_ROI_1234.tiff");
}

#[test]
fn mag_suffix() {
    assert_eq!(
        output_name("liver_slide_001", 0, Some("20")),
        "liver_slide_001_ROI_0000_20.tiff"
    );
    assert_eq!(output_name("s", 0, Some("")), "s_ROI_0000.tiff");
}

#[test]
fn chinese_stem() {
    assert_eq!(output_name("病理切片", 3, None), "病理切片_ROI_0003.tiff");
}

#[test]
fn deterministic_sort_by_x_y_id() {
    let rois = vec![roi("b", 50, 0), roi("a", 10, 5), roi("c", 10, 1)];
    let sorted = sorted_for_export(&rois);
    assert_eq!(sorted[0].id, "c");
    assert_eq!(sorted[1].id, "a");
    assert_eq!(sorted[2].id, "b");
}
