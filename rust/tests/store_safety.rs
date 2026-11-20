//! 持久化可靠性回归（审查修复项）：
//! 自愈不得毁掉唯一好备份、非法类型不得覆盖既有记录、ROI 会话与台账同标准（原子写 + .bak 回退）。

use std::path::PathBuf;

use labkit::model::session as roi_session;
use labkit::model::{Roi, RoiStore};
use labkit::store;
use serde_json::json;
use tempfile::TempDir;

fn db(dir: &TempDir) -> PathBuf {
    dir.path().join("labkit_db.json")
}

fn roi(id: &str, slide: &str) -> Roi {
    Roi {
        id: id.into(),
        slide_path: PathBuf::from(slide),
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        angle: 0.0,
        created_at: String::new(),
    }
}

#[test]
fn wrong_field_type_rejected_and_existing_data_preserved() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    let good = json!({"tasks":[{"id":"t1"}]});
    store::save_at(&p, &good).unwrap();
    // 只查 is_object 会让 {"tasks":"str"} 通过并炸掉所有列表页；必须拒写。
    assert!(store::save_at(&p, &json!({"tasks":"str"})).is_err());
    assert!(store::save_at(&p, &json!({"_store":[]})).is_err());
    assert!(store::save_at(&p, &json!({"_rev":"x"})).is_err());
    assert_eq!(store::load_at(&p).unwrap().unwrap(), good, "拒写后既有数据不得被改动");
}

#[test]
fn import_rejects_wrong_field_type() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"tasks":[{"id":"t1"}]})).unwrap();
    let src = d.path().join("bad.json");
    std::fs::write(&src, r#"{"tasks":"not-an-array"}"#).unwrap();
    assert!(store::import_at(&p, &src).is_err());
    assert_eq!(
        store::load_at(&p).unwrap().unwrap()["tasks"][0]["id"],
        "t1",
        "非法导入不得覆盖既有台账"
    );
}

#[test]
fn recover_reads_bak_without_clobbering_it_or_repairing_main_unlocked() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    let v1 = json!({"tasks":[{"id":"t1"}]});
    let v2 = json!({"tasks":[{"id":"t1"},{"id":"t2"}]});
    store::save_at(&p, &v1).unwrap();
    store::save_at(&p, &v2).unwrap(); // 此时 .bak = v1
    let bak = p.with_extension("json.bak");
    std::fs::write(&p, "{corrupt").unwrap();

    let got = store::load_at(&p).unwrap().unwrap();
    assert_eq!(got, v1, "主文件坏时应回退到 .bak");
    // 关键：回退是只读的，不得把损坏主文件 copy 成 .bak 毁掉唯一好备份。
    let bak_val: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&bak).unwrap()).unwrap();
    assert_eq!(bak_val, v1, ".bak 必须仍是好数据");
    assert_eq!(std::fs::read_to_string(&p).unwrap(), "{corrupt", "主文件留待下次持锁保存修复");

    let v3 = json!({"tasks":[{"id":"t3"}]});
    store::save_at(&p, &v3).unwrap();
    assert_eq!(store::load_at(&p).unwrap().unwrap(), v3, "下次保存自然修复主文件");
}

#[test]
fn roi_session_is_atomic_and_falls_back_to_bak() {
    let d = TempDir::new().unwrap();
    let p = d.path().join("session_rust.json");
    let mut s1 = RoiStore::new();
    s1.add(roi("a#0", "slideA"));
    roi_session::save(&p, &s1).unwrap();
    let mut s2 = RoiStore::new();
    s2.add(roi("a#0", "slideA"));
    s2.add(roi("b#0", "slideB"));
    roi_session::save(&p, &s2).unwrap(); // .bak = s1
    assert!(!p.with_extension("json.tmp").exists(), "原子写不得留下临时文件");

    std::fs::write(&p, "{corrupt").unwrap();
    let got = roi_session::load_if_exists(&p);
    assert_eq!(got.len(), 1, "主文件坏时应从 .bak 回退而不是返回空 store");
    assert_eq!(got.all()[0].id, "a#0");
}