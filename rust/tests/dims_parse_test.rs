use pathology_crop_rs::sdpc::structs::parse_layer_info;

#[test]
fn plain_dimensions() {
    let s = "rawWidth=10000|rawHeight=8000|boundWidth=0|boundHeight=0";
    assert_eq!(parse_layer_info(s).unwrap(), (10000, 8000));
}

#[test]
fn dimensions_subtract_bound() {
    let s = "rawWidth=10000|rawHeight=8000|boundWidth=200|boundHeight=100";
    assert_eq!(parse_layer_info(s).unwrap(), (9800, 7900));
}

#[test]
fn too_few_segments() {
    assert!(parse_layer_info("rawWidth=10|rawHeight=20").is_err());
}

#[test]
fn non_numeric() {
    assert!(parse_layer_info("rawWidth=x|rawHeight=20|boundWidth=0|boundHeight=0").is_err());
}

#[test]
fn negative_result() {
    assert!(parse_layer_info("rawWidth=1|rawHeight=1|boundWidth=5|boundHeight=0").is_err());
}
