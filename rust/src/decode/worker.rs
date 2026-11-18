//! The single background decoder thread.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

use crossbeam_channel::{bounded, unbounded, Receiver, Sender};

use crate::decode::messages::{Request, Response, TileKey};
use crate::errors::{AppError, Result};
use crate::export::export_with;
use crate::geometry::center_crop_rect;
use crate::sdpc::SlideReader;

/// Handle used by the UI. Every method is non-blocking.
/// Clone is cheap: it only duplicates channel endpoints (Senders/Receiver),
/// allowing Tauri commands to enqueue work without holding the state lock.
#[derive(Clone)]
pub struct DecodeHandle {
    high_tx: Sender<Request>,
    tile_tx: Sender<Request>,
    resp_rx: Receiver<Response>,
}

impl DecodeHandle {
    pub fn spawn() -> crate::errors::Result<Self> {
        let (high_tx, high_rx) = unbounded::<Request>();
        let (tile_tx, tile_rx) = unbounded::<Request>();
        let (resp_tx, resp_rx) = bounded::<Response>(256);

        thread::Builder::new()
            .name("sdpc-decoder".into())
            .spawn(move || {
                let mut worker = Worker {
                    high_rx,
                    tile_rx,
                    resp_tx,
                    readers: HashMap::new(),
                    latest_tile_gen: 0,
                };
                worker.run();
            })
            .map_err(|e| crate::errors::AppError::Other(format!("无法启动解码线程: {e}")))?;

        Ok(Self {
            high_tx,
            tile_tx,
            resp_rx,
        })
    }

    pub fn open(&self, path: PathBuf, gen: u64) {
        let _ = self.high_tx.send(Request::Open { path, gen });
    }

    pub fn request_thumbnail(&self, path: PathBuf, gen: u64) {
        let _ = self.high_tx.send(Request::Thumbnail { path, gen });
    }

    pub fn request_tile(&self, path: PathBuf, key: TileKey, gen: u64) {
        let _ = self.tile_tx.send(Request::Tile { path, key, gen });
    }

    pub fn start_export(&self, rois: Vec<crate::model::Roi>, opts: crate::export::ExportOptions, gen: u64) {
        let _ = self.high_tx.send(Request::Export { rois, opts, gen });
    }

    pub fn cancel_tiles(&self, gen: u64) {
        let _ = self.high_tx.send(Request::CancelTiles { gen });
    }

    /// Drain responses without ever blocking the UI thread.
    pub fn poll(&self, max: usize) -> Vec<Response> {
        let mut out = Vec::new();
        for _ in 0..max {
            match self.resp_rx.try_recv() {
                Ok(r) => out.push(r),
                Err(_) => break,
            }
        }
        out
    }

    pub fn shutdown(&self) {
        let _ = self.high_tx.send(Request::Shutdown);
    }
}

struct Worker {
    high_rx: Receiver<Request>,
    tile_rx: Receiver<Request>,
    resp_tx: Sender<Response>,
    /// Readers are cached forever: `SqCloseSdpc` must never be called.
    readers: HashMap<PathBuf, SlideReader>,
    latest_tile_gen: u64,
}

impl Worker {
    fn run(&mut self) {
        loop {
            // Control messages always win over tile work.
            let mut stop = false;
            while let Ok(req) = self.high_rx.try_recv() {
                if matches!(req, Request::Shutdown) {
                    stop = true;
                    break;
                }
                self.handle_high(req);
            }
            if stop {
                break;
            }

            match self.tile_rx.try_recv() {
                Ok(Request::Tile { path, key, gen }) => self.handle_tile(&path, key, gen),
                Ok(_) => {}
                Err(crossbeam_channel::TryRecvError::Disconnected) => break,
                Err(crossbeam_channel::TryRecvError::Empty) => {
                    thread::sleep(Duration::from_millis(2));
                }
            }
        }
    }

    fn send(&self, r: Response) {
        let _ = self.resp_tx.send(r);
    }

    fn ensure_reader(&mut self, path: &Path) -> Result<()> {
        if self.readers.contains_key(path) {
            return Ok(());
        }
        let reader = SlideReader::open(path)?;
        self.readers.insert(path.to_path_buf(), reader);
        Ok(())
    }

    fn handle_high(&mut self, req: Request) {
        match req {
            Request::Open { path, gen } | Request::Thumbnail { path, gen } => {
                match self.ensure_reader(&path) {
                    Ok(()) => {
                        if let Some(reader) = self.readers.get(&path) {
                            match reader.thumbnail() {
                                Ok(thumb) => self.send(Response::Opened {
                                    path: path.clone(),
                                    info: reader.info().clone(),
                                    thumb,
                                    gen,
                                }),
                                Err(e) => self.send(Response::Error(e.to_string())),
                            }
                        }
                    }
                    Err(e) => self.send(Response::Error(e.to_string())),
                }
            }
            Request::Export { rois, opts, .. } => self.handle_export(&rois, &opts),
            Request::CancelTiles { gen } => {
                self.latest_tile_gen = gen;
            }
            Request::Tile { .. } | Request::Shutdown => {}
        }
    }

    fn handle_tile(&mut self, path: &Path, key: TileKey, gen: u64) {
        if gen != self.latest_tile_gen {
            return;
        }
        if let Err(e) = self.ensure_reader(path) {
            self.send(Response::Error(e.to_string()));
            return;
        }
        let Some(reader) = self.readers.get(path) else {
            return;
        };
        match reader.read_level_region(key.level, key.x, key.y, key.w, key.h) {
            Ok(img) => self.send(Response::TileReady { key, img, gen }),
            Err(e) => self.send(Response::TileFailed {
                key,
                err: e.to_string(),
                gen,
            }),
        }
    }

    fn handle_export(&mut self, rois: &[crate::model::Roi], opts: &crate::export::ExportOptions) {
        // Pre-open every slide referenced by the ROI set.
        let mut paths: Vec<PathBuf> = rois.iter().map(|r| r.slide_path.clone()).collect();
        paths.sort();
        paths.dedup();
        for p in &paths {
            if let Err(e) = self.ensure_reader(p) {
                self.send(Response::Error(format!("导出跳过 {}: {e}", p.display())));
            }
        }

        let readers = &self.readers;
        let tx = self.resp_tx.clone();
        let _ = export_with(
            rois,
            opts,
            |roi| {
                let reader = readers
                    .get(&roi.slide_path)
                    .ok_or_else(|| AppError::Other("切片未加载".into()))?;
                let info = reader.info();
                let r = roi.rect();
                let (cx, cy) = r.center();
                let crop = center_crop_rect(cx, cy, r.w, r.h, info.full_w, info.full_h);
                reader.extract_region(crop.x, crop.y, crop.w, crop.h, 0)
            },
            |ev| {
                let _ = tx.send(Response::Export(ev));
            },
        );
    }
}
