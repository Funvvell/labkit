//! Manual paste input (tab-separated from Excel, or comma-separated).

use crate::errors::Result;
use crate::qpcr::io_csv::parse_csv_text;
use crate::qpcr::model::Well;

pub fn parse_pasted(text: &str) -> Result<Vec<Well>> {
    let first = text.lines().next().unwrap_or("");
    let tabs = first.matches('\t').count();
    let commas = first.matches(',').count();
    let delimiter = if tabs >= commas && tabs > 0 { b'\t' } else { b',' };
    parse_csv_text(text.trim_start_matches('\u{feff}'), delimiter)
}
