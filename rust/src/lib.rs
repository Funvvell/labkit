//! Library root for the Rust rewrite of the pathology crop tool.
//!
//! `unsafe` is confined to `sdpc::ffi`, `sdpc::loader` and `sdpc::structs`.
//! Everything else interacts with the closed-source decoder through safe
//! types and the single background worker thread.

#![deny(unsafe_code)]

pub mod constants;
pub mod errors;
pub mod geometry;
pub mod sdpc;
pub mod model;
pub mod export;
pub mod cli;
pub mod decode;
pub mod qpcr;
pub mod render;
pub mod store;
pub mod vault;
pub mod imgbatch;
pub mod zotero;
pub mod inventree;
pub mod plugins;

/// Tauri command layer — bridges the reused core to the macOS-style web UI.
pub mod commands;
