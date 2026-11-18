//! Generic CSV/TSV Cq tables, with UTF-8 BOM and GBK sniffing.

use std::io::Cursor;
use std::path::Path;

use csv::ReaderBuilder;

use crate::errors::{AppError, Result};
use crate::qpcr::model::Well;
use crate::qpcr::normalize::{to_wells, RawTable};

pub fn decode_text(bytes: &[u8]) -> String {
    let bytes = bytes.strip_prefix(&[0xEF, 0xBB, 0xBF]).unwrap_or(bytes);
    match std::str::from_utf8(bytes) {
        Ok(s) => s.to_string(),
        Err(_) => encoding_rs::GBK.decode(bytes).0.into_owned(),
    }
}

fn parse_table(text: &str, delimiter: u8) -> Result<RawTable> {
    let mut rdr = ReaderBuilder::new()
        .has_headers(true)
        .flexible(true)
        .delimiter(delimiter)
        .from_reader(Cursor::new(text.as_bytes()));
    let headers = rdr
        .headers()
        .map_err(|e| AppError::Qpcr(format!("读取表头失败: {e}")))?
        .iter()
        .map(|s| s.to_string())
        .collect();
    let mut rows = Vec::new();
    for rec in rdr.records() {
        let rec = rec.map_err(|e| AppError::Qpcr(format!("读取 CSV 行失败: {e}")))?;
        rows.push(rec.iter().map(|s| s.to_string()).collect());
    }
    Ok(RawTable { headers, rows })
}

pub fn parse_csv_text(text: &str, delimiter: u8) -> Result<Vec<Well>> {
    to_wells(&parse_table(text, delimiter)?)
}

pub fn read_csv(path: &Path) -> Result<Vec<Well>> {
    let bytes = std::fs::read(path)?;
    let text = decode_text(&bytes);
    let delimiter = if text.lines().next().map(|l| l.contains('\t')).unwrap_or(false) {
        b'\t'
    } else {
        b','
    };
    parse_csv_text(&text, delimiter)
}
