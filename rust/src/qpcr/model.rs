//! Core qPCR data structures. All coordinates and Cq values are plain data;
//! no GUI types are referenced so this module is fully unit-testable.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DataSource {
    Manual,
    Csv { path: String },
    Excel { path: String, sheet: String },
    Instrument { format: String, path: String },
}

impl DataSource {
    pub fn name(&self) -> String {
        match self {
            DataSource::Manual => "手动输入".to_string(),
            DataSource::Csv { path } | DataSource::Instrument { path, .. } => {
                std::path::Path::new(path)
                    .file_stem()
                    .map(|s| s.to_string_lossy().into_owned())
                    .unwrap_or_else(|| path.clone())
            }
            DataSource::Excel { path, .. } => std::path::Path::new(path)
                .file_stem()
                .map(|s| s.to_string_lossy().into_owned())
                .unwrap_or_else(|| path.clone()),
        }
    }
}

/// One well × target measurement (matches tidyqpcr's long-table model).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Well {
    pub id: String,
    pub sample_id: String,
    pub target_id: String,
    pub cq: Option<f64>,
    pub plate: String,
    pub well_position: Option<String>,
    pub row: Option<u32>,
    pub col: Option<u32>,
    pub replicate_group: String,
    pub task: Option<String>,
    pub dye: Option<String>,
    pub source_row: usize,
    pub flags: Vec<String>,
    pub excluded: bool,
}

impl Well {
    pub fn new(sample_id: String, target_id: String, cq: Option<f64>) -> Self {
        let plate = String::new();
        let well_position = None;
        let replicate_group = format!("{sample_id}|{target_id}|{plate}");
        let id = format!("{plate}|{sample_id}|{target_id}|{}", well_position.as_deref().unwrap_or(""));
        Self {
            id,
            sample_id,
            target_id,
            cq,
            plate,
            well_position,
            row: None,
            col: None,
            replicate_group,
            task: None,
            dye: None,
            source_row: 0,
            flags: Vec::new(),
            excluded: false,
        }
    }

    pub fn flag(&mut self, tag: &str) {
        if !self.flags.iter().any(|f| f == tag) {
            self.flags.push(tag.to_string());
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RefStrategy {
    GeometricMean,
    Genorm,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Design {
    pub calibrator_sample: Option<String>,
    pub reference_targets: Vec<String>,
    pub target_ids: Vec<String>,
    /// sample_id -> group name, for t-test / ANOVA.
    pub sample_groups: BTreeMap<String, String>,
    pub cv_threshold: f64,
    pub sd_threshold: Option<f64>,
    /// target_id -> efficiency (qPCRtools definition: E = -1 + 10^(-1/slope)).
    pub efficiency: BTreeMap<String, f64>,
    pub ref_strategy: RefStrategy,
}

impl Default for Design {
    fn default() -> Self {
        Self {
            calibrator_sample: None,
            reference_targets: Vec::new(),
            target_ids: Vec::new(),
            sample_groups: BTreeMap::new(),
            cv_threshold: 0.05,
            sd_threshold: Some(0.25),
            efficiency: BTreeMap::new(),
            ref_strategy: RefStrategy::GeometricMean,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum QcFlag {
    Undetermined,
    HighCv(f64),
    HighSd(f64),
    Outlier,
    ExcludedByUser,
    ExcludedBySource,
    NoReference,
    NoCalibrator,
}

impl QcFlag {
    pub fn as_str(&self) -> String {
        match self {
            QcFlag::Undetermined => "未检出".into(),
            QcFlag::HighCv(v) => format!("高CV {v:.3}"),
            QcFlag::HighSd(v) => format!("高SD {v:.3}"),
            QcFlag::Outlier => "离群孔".into(),
            QcFlag::ExcludedByUser => "手动排除".into(),
            QcFlag::ExcludedBySource => "来源排除".into(),
            QcFlag::NoReference => "无内参".into(),
            QcFlag::NoCalibrator => "无对照".into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QpcrResult {
    pub sample_id: String,
    pub target_id: String,
    pub group: Option<String>,
    pub mean_cq: Option<f64>,
    pub n_tech: usize,
    pub cv: Option<f64>,
    pub delta_ct: Option<f64>,
    pub delta_delta_ct: Option<f64>,
    pub fold_change: Option<f64>,
    pub efficiency: Option<f64>,
    pub flags: Vec<QcFlag>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct QpcrAnalysis {
    pub results: Vec<QpcrResult>,
    /// (target_id, M), ascending — smaller is more stable.
    pub ref_stability: Vec<(String, f64)>,
    pub ref_used: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QpcrRun {
    pub id: String,
    pub name: String,
    pub source: Option<DataSource>,
    pub wells: Vec<Well>,
    pub design: Design,
    pub created_at: String,
}

impl QpcrRun {
    pub fn new(wells: Vec<Well>, source: Option<DataSource>) -> Self {
        let mut bytes = [0u8; 6];
        let _ = getrandom::getrandom(&mut bytes);
        let id: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
        let name = source
            .as_ref()
            .map(|s| s.name())
            .unwrap_or_else(|| "手动输入".to_string());
        Self {
            id,
            name,
            source,
            wells,
            design: Design::default(),
            created_at: chrono::Local::now().format("%Y-%m-%dT%H:%M:%S").to_string(),
        }
    }
}
