//! Generic .xlsx/.xls Cq tables via calamine (read-only).

use std::path::Path;

use calamine::{open_workbook, Data, Reader, Xlsx};

use crate::errors::{AppError, Result};
use crate::qpcr::model::Well;
use crate::qpcr::normalize::{to_wells, RawTable};

pub fn read_excel(path: &Path, sheet: Option<&str>) -> Result<(Vec<Well>, String)> {
    let mut book: Xlsx<_> =
        open_workbook(path).map_err(|e| AppError::Qpcr(format!("无法打开 Excel: {e}")))?;
    let names = book.sheet_names().to_vec();
    let first = names
        .first()
        .cloned()
        .ok_or_else(|| AppError::Qpcr("Excel 中没有工作表".into()))?;
    let chosen = sheet.unwrap_or(&first);
    let range = book
        .worksheet_range(chosen)
        .map_err(|e| AppError::Qpcr(format!("读取工作表 {chosen} 失败: {e}")))?;

    let mut rows = Vec::new();
    for row in range.rows() {
        rows.push(
            row.iter()
                .map(|c| match c {
                    Data::String(s) => s.clone(),
                    Data::Float(v) => format!("{v}"),
                    Data::Int(v) => format!("{v}"),
                    Data::Bool(v) => v.to_string(),
                    Data::DateTime(_) => String::new(),
                    Data::DateTimeIso(s) => s.clone(),
                    Data::DurationIso(s) => s.clone(),
                    Data::Error(e) => format!("{e:?}"),
                    Data::Empty => String::new(),
                })
                .collect::<Vec<String>>(),
        );
    }
    if rows.is_empty() {
        return Err(AppError::Qpcr("工作表中没有数据".into()));
    }
    let headers = rows.remove(0);
    let wells = to_wells(&RawTable { headers, rows })?;
    Ok((wells, chosen.to_string()))
}
