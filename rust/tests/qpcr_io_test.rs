use pathology_crop_rs::qpcr::io_csv::{decode_text, parse_csv_text};
use pathology_crop_rs::qpcr::io_manual::parse_pasted;

#[test]
fn tidy_long_table() {
    let text = "sample_id,target_id,cq\nCal,GAPDH,18.0\nCal,Target,20.0\n";
    let wells = parse_csv_text(text, b',').unwrap();
    assert_eq!(wells.len(), 2);
    assert_eq!(wells[0].sample_id, "Cal");
    assert_eq!(wells[0].target_id, "GAPDH");
    assert_eq!(wells[0].cq, Some(18.0));
}

#[test]
fn chinese_headers() {
    let text = "样本,基因,Ct值,孔位\n对照,GAPDH,18.0,A1\n对照,目标基因,20.0,A2\n";
    let wells = parse_csv_text(text, b',').unwrap();
    assert_eq!(wells.len(), 2);
    assert_eq!(wells[0].sample_id, "对照");
    assert_eq!(wells[0].target_id, "GAPDH");
    assert_eq!(wells[0].well_position.as_deref(), Some("A1"));
    assert_eq!(wells[1].target_id, "目标基因");
}

#[test]
fn wide_table_becomes_long() {
    let text = "样本,GAPDH,Target\nCal,18,20\n";
    let wells = parse_csv_text(text, b',').unwrap();
    assert_eq!(wells.len(), 2);
    assert!(wells.iter().any(|w| w.target_id == "GAPDH" && w.cq == Some(18.0)));
    assert!(wells.iter().any(|w| w.target_id == "Target" && w.cq == Some(20.0)));
}

#[test]
fn pasted_tsv_with_undetermined() {
    let text = "样本\t基因\tCt\n处理\tTarget\tUndetermined\n处理\tGAPDH\t18.5\n";
    let wells = parse_pasted(text).unwrap();
    assert_eq!(wells.len(), 2);
    assert_eq!(wells[0].cq, None);
    assert!(wells[0].flags.contains(&"Undetermined".to_string()));
    assert_eq!(wells[1].cq, Some(18.5));
}

#[test]
fn missing_sample_column_is_an_error() {
    let text = "foo,bar\n1,2\n";
    assert!(parse_csv_text(text, b',').is_err());
}

#[test]
fn gbk_and_bom_decode() {
    let (gbk, _, _) = encoding_rs::GBK.encode("样本,基因,Ct值\n");
    let decoded = decode_text(&gbk);
    assert!(decoded.starts_with("样本"));
    let mut with_bom = vec![0xEF, 0xBB, 0xBF];
    with_bom.extend_from_slice(b"sample,target,cq\n");
    assert!(decode_text(&with_bom).starts_with("sample"));
}
