use labkit::sdpc::ffi::gbk_path_bytes;
use std::path::Path;

#[test]
fn chinese_path_is_gbk_with_nul() {
    let p = Path::new("D:/病理/切片 甲.sdpc");
    let bytes = gbk_path_bytes(p).unwrap();
    let text = p.to_string_lossy().to_string();
    let (expected, _, _) = encoding_rs::GBK.encode(&text);
    assert_eq!(&bytes[..bytes.len() - 1], expected.as_ref());
    assert_eq!(bytes.last().copied(), Some(0));
}

#[test]
fn unmappable_character_is_an_error() {
    assert!(gbk_path_bytes(Path::new("D:/😀.sdpc")).is_err());
}

#[test]
fn ascii_path_unchanged() {
    let bytes = gbk_path_bytes(Path::new("C:/slide.sdpc")).unwrap();
    assert_eq!(&bytes[..bytes.len() - 1], b"C:/slide.sdpc");
}
