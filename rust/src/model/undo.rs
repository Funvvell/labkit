//! Undo / redo command stack, ported from `liver_portal_crop/roi_undo.py`.

use std::collections::VecDeque;
use std::path::PathBuf;

use crate::constants::UNDO_MAX_DEPTH;
use crate::model::{Roi, RoiStore};

#[derive(Clone, Debug)]
pub enum RoiCommand {
    Add(Roi),
    Remove(Roi),
    BatchRemove(Vec<Roi>),
    BatchAdd(Vec<Roi>),
    Update { old: Roi, new: Roi },
    BatchUpdate { old: Vec<Roi>, new: Vec<Roi> },
    ClearSlide { path: PathBuf, rois: Vec<Roi> },
}

#[derive(Default)]
pub struct UndoStack {
    undo: VecDeque<RoiCommand>,
    redo: VecDeque<RoiCommand>,
    max_depth: usize,
    suspend: bool,
}

impl UndoStack {
    pub fn new(max_depth: usize) -> Self {
        Self {
            undo: VecDeque::new(),
            redo: VecDeque::new(),
            max_depth,
            suspend: false,
        }
    }

    pub fn can_undo(&self) -> bool {
        !self.undo.is_empty()
    }

    pub fn can_redo(&self) -> bool {
        !self.redo.is_empty()
    }

    pub fn undo_depth(&self) -> usize {
        self.undo.len()
    }

    /// Record a command whose effect has already been applied, then clear redo.
    pub fn push(&mut self, cmd: RoiCommand) {
        if self.suspend {
            return;
        }
        self.undo.push_back(cmd);
        while self.undo.len() > self.max_depth {
            self.undo.pop_front();
        }
        self.redo.clear();
    }

    /// Apply a command and record it as one undo step.
    pub fn push_and_apply(&mut self, store: &mut RoiStore, cmd: RoiCommand) {
        apply(store, &cmd, true);
        self.push(cmd);
    }

    pub fn undo(&mut self, store: &mut RoiStore) -> bool {
        let Some(cmd) = self.undo.pop_back() else {
            return false;
        };
        self.suspend = true;
        apply(store, &cmd, false);
        self.suspend = false;
        self.redo.push_back(cmd);
        true
    }

    pub fn redo(&mut self, store: &mut RoiStore) -> bool {
        let Some(cmd) = self.redo.pop_back() else {
            return false;
        };
        self.suspend = true;
        apply(store, &cmd, true);
        self.suspend = false;
        self.undo.push_back(cmd);
        true
    }
}

impl Default for RoiCommand {
    fn default() -> Self {
        Self::BatchRemove(Vec::new())
    }
}

fn apply(store: &mut RoiStore, cmd: &RoiCommand, forward: bool) {
    match cmd {
        RoiCommand::Add(roi) => {
            if forward {
                store.add(roi.clone())
            } else {
                store.remove(&roi.id);
            }
        }
        RoiCommand::Remove(roi) => {
            if forward {
                store.remove(&roi.id);
            } else {
                store.add(roi.clone())
            }
        }
        RoiCommand::BatchAdd(rois) => {
            for r in rois {
                if forward {
                    store.add(r.clone())
                } else {
                    store.remove(&r.id);
                }
            }
        }
        RoiCommand::BatchRemove(rois) => {
            for r in rois {
                if forward {
                    store.remove(&r.id);
                } else {
                    store.add(r.clone())
                }
            }
        }
        RoiCommand::Update { old, new } => {
            let r = if forward { new } else { old };
            store.replace(r.clone());
        }
        RoiCommand::BatchUpdate { old, new } => {
            let list = if forward { new } else { old };
            for r in list {
                store.replace(r.clone());
            }
        }
        RoiCommand::ClearSlide { path, rois } => {
            if forward {
                store.clear_slide(path);
            } else {
                for r in rois {
                    store.add(r.clone());
                }
            }
        }
    }
}

pub fn default_stack() -> UndoStack {
    UndoStack::new(UNDO_MAX_DEPTH)
}
