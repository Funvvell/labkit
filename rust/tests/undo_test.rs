use labkit::model::undo::default_stack;
use labkit::model::{Roi, RoiCommand, RoiStore, UndoStack};
use std::path::{Path, PathBuf};

fn roi(id: &str, path: &str, x: i64, y: i64, w: i64, h: i64) -> Roi {
    let mut r = Roi::new(Path::new(path), x, y, w, h, 0.0);
    r.id = id.to_string();
    r
}

#[test]
fn add_undo_redo() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    u.push_and_apply(&mut s, RoiCommand::Add(roi("a", "a.sdpc", 0, 0, 10, 10)));
    assert_eq!(s.len(), 1);
    assert!(u.undo(&mut s));
    assert_eq!(s.len(), 0);
    assert!(u.redo(&mut s));
    assert_eq!(s.len(), 1);
}

#[test]
fn remove_restores_snapshot_geometry() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let r = roi("a", "a.sdpc", 5, 6, 20, 30);
    s.add(r.clone());
    u.push_and_apply(&mut s, RoiCommand::Remove(r));
    assert_eq!(s.len(), 0);
    u.undo(&mut s);
    let restored = s.get("a").unwrap();
    assert_eq!((restored.x, restored.y, restored.w, restored.h), (5, 6, 20, 30));
}

#[test]
fn batch_remove_is_one_step() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let rs = vec![
        roi("a", "a.sdpc", 0, 0, 10, 10),
        roi("b", "a.sdpc", 1, 1, 10, 10),
        roi("c", "a.sdpc", 2, 2, 10, 10),
    ];
    for r in &rs {
        s.add(r.clone());
    }
    u.push_and_apply(&mut s, RoiCommand::BatchRemove(rs));
    assert_eq!(s.len(), 0);
    u.undo(&mut s);
    assert_eq!(s.len(), 3);
    assert!(!u.can_undo());
}

#[test]
fn update_undo_redo_with_angle() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let old = roi("a", "a.sdpc", 0, 0, 10, 10);
    let mut new = old.clone();
    new.x = 42;
    new.angle = 15.0;
    s.add(old.clone());
    u.push_and_apply(&mut s, RoiCommand::Update { old, new });
    assert_eq!(s.get("a").unwrap().x, 42);
    u.undo(&mut s);
    assert_eq!(s.get("a").unwrap().x, 0);
    u.redo(&mut s);
    assert_eq!(s.get("a").unwrap().angle, 15.0);
}

#[test]
fn clear_slide_restores_only_that_slide() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let a = roi("a", "a.sdpc", 0, 0, 10, 10);
    let other = roi("o", "b.sdpc", 0, 0, 10, 10);
    s.add(a.clone());
    s.add(other.clone());
    u.push_and_apply(
        &mut s,
        RoiCommand::ClearSlide {
            path: PathBuf::from("a.sdpc"),
            rois: vec![a],
        },
    );
    assert_eq!(s.len(), 1);
    u.undo(&mut s);
    assert_eq!(s.len(), 2);
    assert!(s.get("a").is_some() && s.get("o").is_some());
}

#[test]
fn stack_depth_is_limited() {
    let mut s = RoiStore::new();
    let mut u = UndoStack::new(3);
    for i in 0..5 {
        u.push_and_apply(&mut s, RoiCommand::Add(roi(&format!("d{i}"), "a.sdpc", i, 0, 1, 1)));
    }
    assert_eq!(u.undo_depth(), 3);
    // d0, d1 were dropped; undoing 3 times leaves d2 in the store.
    u.undo(&mut s);
    u.undo(&mut s);
    u.undo(&mut s);
    assert_eq!(s.len(), 2);
}

#[test]
fn new_command_clears_redo() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    u.push_and_apply(&mut s, RoiCommand::Add(roi("a", "a.sdpc", 0, 0, 1, 1)));
    u.undo(&mut s);
    assert!(u.can_redo());
    u.push_and_apply(&mut s, RoiCommand::Add(roi("b", "a.sdpc", 0, 0, 1, 1)));
    assert!(!u.can_redo());
}

#[test]
fn batch_add_copy_undo() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let copies = vec![roi("x", "a.sdpc", 0, 0, 10, 10), roi("y", "a.sdpc", 5, 5, 10, 10)];
    u.push_and_apply(&mut s, RoiCommand::BatchAdd(copies));
    assert_eq!(s.len(), 2);
    u.undo(&mut s);
    assert_eq!(s.len(), 0);
}

#[test]
fn undo_receives_fresh_objects() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    let r = roi("a", "a.sdpc", 0, 0, 10, 10);
    u.push_and_apply(&mut s, RoiCommand::Add(r));
    u.undo(&mut s);
    u.redo(&mut s);
    if let Some(live) = s.get("a").cloned() {
        let mut changed = live;
        changed.x = 999;
        s.replace(changed);
    }
    u.undo(&mut s);
    u.redo(&mut s);
    assert_eq!(s.get("a").unwrap().x, 0);
}

#[test]
fn default_depth_is_50() {
    let mut s = RoiStore::new();
    let mut u = default_stack();
    for i in 0..55 {
        u.push_and_apply(&mut s, RoiCommand::Add(roi(&format!("r{i}"), "a.sdpc", i, 0, 1, 1)));
    }
    assert_eq!(u.undo_depth(), 50);
}
