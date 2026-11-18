//! Constants mirrored from `liver_portal_crop/constants.py`.

pub const TILE_SIZE: u32 = 1024;
pub const MAX_TILE_CACHE: usize = 512;
pub const RENDER_DEBOUNCE_MS: u64 = 200;
pub const PRELOAD_MARGIN: f64 = 0.30;
pub const MAX_TILES_PER_CYCLE: usize = 8;

pub const ROI_ID_LENGTH: usize = 12;
pub const MIN_ROI_SIZE: i64 = 20;
pub const UNDO_MAX_DEPTH: usize = 50;

pub const FIELD_NUMBER_MM: f64 = 22.0;
pub const WHEEL_FACTOR: f64 = 1.15;
pub const SMOOTH_RESTORE_MS: u64 = 300;

pub const SESSION_DIR_NAME: &str = ".liver_portal_crop";
pub const SESSION_FILE_NAME: &str = "session_rust.json";
pub const QPPCR_SESSION_FILE_NAME: &str = "qpcr_session_rust.json";
pub const LEGACY_SESSION_FILE_NAME: &str = "session.json";
pub const DEFAULT_OUTPUT_DIR_NAME: &str = "liver_crop_output";

pub const DEFAULT_FRAME_W: i64 = 1024;
pub const DEFAULT_FRAME_H: i64 = 1024;

/// Relative directory (to the executable) that carries the decoder DLLs.
pub const DLL_REL_DIR: &str = "sdpc/WINDOWS/dll";
