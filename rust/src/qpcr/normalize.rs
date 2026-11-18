//! Column-name normalisation shared by CSV / Excel / pasted input.
//! Accepts tidyqpcr's `sample_id,target_id,cq` and common Chinese headers.

use crate::errors::{AppError, Result};
use crate::qpcr::model::Well;

/// A header/data matrix before column mapping.
#[derive(Debug, Clone, Default)]
pub struct RawTable {
    pub headers: Vec<String>,
    pub rows: Vec<Vec<String>>,
}

#[derive(Debug, Clone, Default)]
struct ColumnMap {
    sample: Option<usize>,
    target: Option<usize>,
    cq: Option<usize>,
    well: Option<usize>,
    plate: Option<usize>,
    row: Option<usize>,
    col: Option<usize>,
    task: Option<usize>,
    dye: Option<usize>,
    exclude: Option<usize>,
}

/// Lowercase, drop whitespace / underscores / hyphens / full-width spaces.
pub fn normalize_key(s: &str) -> String {
    s.trim()
        .to_lowercase()
        .chars()
        .filter(|c| !matches!(c, ' ' | '_' | '-' | '\u{3000}' | '\t' | '\r' | '\n'))
        .collect()
}

const SAMPLE_ALIASES: &[&str] = &[
    "sampleid", "sample", "samplename", "样本", "样品", "样本名", "样本编号", "样品名",
];
const TARGET_ALIASES: &[&str] = &[
    "targetid", "target", "gene", "detector", "assay", "基因", "靶标", "靶基因", "内参", "目的基因",
];
const CQ_ALIASES: &[&str] = &[
    "cq", "ct", "cqvalue", "ctvalue", "cyclethreshold", "ct值", "cq值", "循环阈值",
];
const WELL_ALIASES: &[&str] = &["well", "position", "wellposition", "孔位", "位置"];
const PLATE_ALIASES: &[&str] = &["plate", "run", "板", "板号", "板名"];
const ROW_ALIASES: &[&str] = &["row", "行"];
const COL_ALIASES: &[&str] = &["col", "column", "列"];
const TASK_ALIASES: &[&str] = &["task", "任务", "孔类型"];
const DYE_ALIASES: &[&str] = &["dye", "荧光", "染料"];
const EXCLUDE_ALIASES: &[&str] = &["excluded", "exclude", "排除", "剔除"];

fn find(headers: &[String], aliases: &[&str]) -> Option<usize> {
    headers.iter().position(|h| {
        let k = normalize_key(h);
        aliases.iter().any(|a| k == *a)
    })
}

/// `Undetermined`/`NA`/`NaN`/`-1`/empty -> None; otherwise parse f64.
pub fn parse_cq(s: &str) -> Option<f64> {
    let t = s.trim();
    if t.is_empty() {
        return None;
    }
    let lower = t.to_lowercase();
    if matches!(
        lower.as_str(),
        "undetermined" | "na" | "n/a" | "nan" | "none" | "null" | "no result" | "-1" | "未检出"
    ) {
        return None;
    }
    t.parse::<f64>().ok().filter(|v| v.is_finite() && *v > 0.0)
}

fn cell(row: &[String], idx: Option<usize>) -> String {
    idx.and_then(|i| row.get(i))
        .map(|s| s.trim().to_string())
        .unwrap_or_default()
}

/// Convert a raw table into normalised wells. Long tables use explicit
/// sample/target/cq columns; wide tables treat every other column as a gene.
pub fn to_wells(table: &RawTable) -> Result<Vec<Well>> {
    let map = ColumnMap {
        sample: find(&table.headers, SAMPLE_ALIASES),
        target: find(&table.headers, TARGET_ALIASES),
        cq: find(&table.headers, CQ_ALIASES),
        well: find(&table.headers, WELL_ALIASES),
        plate: find(&table.headers, PLATE_ALIASES),
        row: find(&table.headers, ROW_ALIASES),
        col: find(&table.headers, COL_ALIASES),
        task: find(&table.headers, TASK_ALIASES),
        dye: find(&table.headers, DYE_ALIASES),
        exclude: find(&table.headers, EXCLUDE_ALIASES),
    };

    let long_format = map.sample.is_some() && map.target.is_some() && map.cq.is_some();
    if !long_format && map.sample.is_none() {
        return Err(AppError::Qpcr(
            "缺少样本列（sample_id / 样本 / 样品）".into(),
        ));
    }
    if !long_format && map.cq.is_some() {
        return Err(AppError::Qpcr("长表需要同时包含样本列、基因列和 Ct 列".into()));
    }

    let gene_cols: Vec<usize> = if long_format {
        Vec::new()
    } else {
        let known: Vec<usize> = [
            map.sample, map.well, map.plate, map.row, map.col, map.task, map.dye, map.exclude,
        ]
        .into_iter()
        .flatten()
        .collect();
        (0..table.headers.len())
            .filter(|i| !known.contains(i))
            .collect()
    };
    if !long_format && gene_cols.is_empty() {
        return Err(AppError::Qpcr("宽表中未找到任何基因列".into()));
    }

    let mut out = Vec::new();
    for (row_idx, row) in table.rows.iter().enumerate() {
        if row.iter().all(|c| c.trim().is_empty()) {
            continue;
        }
        let source_row = row_idx + 2; // 1-based, header included
        let sample = cell(row, map.sample);
        if sample.is_empty() {
            continue;
        }
        let plate = cell(row, map.plate);
        let well_pos = cell(row, map.well);
        let make = |target: String, raw_cq: String, source_row: usize| -> Well {
            let mut w = Well::new(sample.clone(), target, parse_cq(&raw_cq));
            w.source_row = source_row;
            w.plate = plate.clone();
            w.well_position = if well_pos.is_empty() {
                None
            } else {
                Some(well_pos.clone())
            };
            let coord = format!("{}|{}|{}", plate, sample, w.target_id);
            w.replicate_group = coord.clone();
            w.id = format!("{coord}|{}", w.well_position.as_deref().unwrap_or(""));
            w.row = map
                .row
                .and_then(|i| row.get(i))
                .and_then(|s| s.parse::<u32>().ok());
            w.col = map
                .col
                .and_then(|i| row.get(i))
                .and_then(|s| s.parse::<u32>().ok());
            w.task = cell(row, map.task).pipe(|s| (!s.is_empty()).then_some(s));
            w.dye = cell(row, map.dye).pipe(|s| (!s.is_empty()).then_some(s));
            w.excluded = matches!(
                cell(row, map.exclude).to_lowercase().as_str(),
                "1" | "true" | "yes" | "是" | "排除"
            );
            if w.cq.is_none() {
                w.flag("Undetermined");
            }
            if w.excluded {
                w.flag("ExcludedBySource");
            }
            w
        };

        if long_format {
            let target = cell(row, map.target);
            if target.is_empty() {
                continue;
            }
            out.push(make(target, cell(row, map.cq), source_row));
        } else {
            for &c in &gene_cols {
                let target = table
                    .headers
                    .get(c)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
                if target.is_empty() {
                    continue;
                }
                out.push(make(target, cell(row, Some(c)), source_row));
            }
        }
    }
    Ok(out)
}

/// Small helper trait to keep the closures above readable.
trait Pipe: Sized {
    fn pipe<T>(self, f: impl FnOnce(Self) -> T) -> T {
        f(self)
    }
}
impl<T> Pipe for T {}
