//! FFI boundary #3: in-memory layout of `SqPicHead` and layer-info parsing.
//!
//! Offsets were dumped with `tools/dump_offsets.py` from
//! `sdpc.Sdpc_struct.SqPicHead` (ctypes `sizeof = 153`). These are the
//! **in-memory** offsets of the pointer returned by the DLL. The on-disk
//! `PicHead` record is 160 bytes (`reader.py:83-89`) and must not be used here.

#![allow(unsafe_code)]

use std::ptr::NonNull;

use crate::errors::{AppError, Result};
use crate::sdpc::ffi::SqSdpcInfo;

pub const OFF_PIC_HEAD: usize = 8;

pub const OFF_HIERARCHY: usize = 38; // c_ulong (u32 on Windows)
pub const OFF_SCALE: usize = 72; // c_float
pub const OFF_RULER: usize = 76; // c_double
pub const OFF_SRC_WIDTH: usize = 42;
pub const OFF_SRC_HEIGHT: usize = 46;

#[derive(Debug, Clone, Copy)]
pub struct PicHeadView {
    pub hierarchy: u32,
    pub scale: f64,
    pub ruler: f64,
    pub src_width: u32,
    pub src_height: u32,
}

pub fn read_head(handle: NonNull<SqSdpcInfo>) -> Result<PicHeadView> {
    // Sanity check: the pointer field must sit where the dump says it does.
    debug_assert_eq!(
        std::mem::offset_of!(SqSdpcInfo, pic_head),
        OFF_PIC_HEAD,
        "SqSdpcInfo layout changed"
    );

    let ph = unsafe { handle.as_ref() }.pic_head;
    if ph.is_null() {
        return Err(AppError::BadMetadata("picHead 为空指针".into()));
    }
    unsafe {
        Ok(PicHeadView {
            hierarchy: std::ptr::read_unaligned(ph.add(OFF_HIERARCHY) as *const u32),
            scale: std::ptr::read_unaligned(ph.add(OFF_SCALE) as *const f32) as f64,
            ruler: std::ptr::read_unaligned(ph.add(OFF_RULER) as *const f64),
            src_width: std::ptr::read_unaligned(ph.add(OFF_SRC_WIDTH) as *const u32),
            src_height: std::ptr::read_unaligned(ph.add(OFF_SRC_HEIGHT) as *const u32),
        })
    }
}

/// Parse `rawWidth=10000|rawHeight=8000|boundWidth=0|boundHeight=0`.
/// The effective size is `(raw - bound)`, ported from
/// `reader.py::_extract_dimensions`.
pub fn parse_layer_info(s: &str) -> Result<(u32, u32)> {
    let parts: Vec<&str> = s.split('|').collect();
    if parts.len() < 4 {
        return Err(AppError::Parse(format!("层级信息段数不足: {s:?}")));
    }
    let value = |p: &str| -> Result<i64> {
        p.split_once('=')
            .map(|(_, v)| v)
            .unwrap_or("")
            .trim()
            .parse::<i64>()
            .map_err(|e| AppError::Parse(format!("无法解析 {p:?}: {e}")))
    };
    let raw_w = value(parts[0])?;
    let raw_h = value(parts[1])?;
    let bound_w = value(parts[2])?;
    let bound_h = value(parts[3])?;
    let w = raw_w - bound_w;
    let h = raw_h - bound_h;
    if w <= 0 || h <= 0 {
        return Err(AppError::Parse(format!("无效层级尺寸: {w}x{h} ({s:?})")));
    }
    Ok((w as u32, h as u32))
}
