//! 台账落盘的可靠性回归。
//!
//! 这些用例守的是「科研记录不能丢」：原子写不留半截文件、覆盖前留备份、
//! 主文件坏了能回退、非法数据不许覆盖既有记录。

use labkit::store;
use serde_json::json;
use tempfile::TempDir;

fn db(dir: &TempDir) -> std::path::PathBuf {
    dir.path().join("labkit_db.json")
}

#[test]
fn missing_file_is_none_not_error() {
    let d = TempDir::new().unwrap();
    assert!(store::load_at(&db(&d)).unwrap().is_none());
}

#[test]
fn round_trip_preserves_data() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    let v = json!({"tasks":[{"id":"t1","name":"灌胃"}],"budgetTotal":30000});
    store::save_at(&p, &v).unwrap();
    assert_eq!(store::load_at(&p).unwrap().unwrap(), v);
}

#[test]
fn save_leaves_no_temp_file_behind() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"a":1})).unwrap();
    assert!(!p.with_extension("json.tmp").exists());
}

#[test]
fn overwrite_keeps_previous_version_as_bak() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"rev":1})).unwrap();
    store::save_at(&p, &json!({"rev":2})).unwrap();
    let bak = std::fs::read_to_string(p.with_extension("json.bak")).unwrap();
    assert_eq!(serde_json::from_str::<serde_json::Value>(&bak).unwrap(), json!({"rev":1}));
    assert_eq!(store::load_at(&p).unwrap().unwrap(), json!({"rev":2}));
}

#[test]
fn corrupt_main_recovers_from_bak_without_clobbering_backup() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"rev":1})).unwrap();
    store::save_at(&p, &json!({"rev":2})).unwrap();
    // 模拟断电/被别的程序写坏：主文件成了半截 JSON
    std::fs::write(&p, "{\"rev\":2,\"tasks\":[").unwrap();
    let got = store::load_at(&p).unwrap().unwrap();
    assert_eq!(got, json!({"rev":1}), "应回退到 .bak 里上一版完整数据");
    // 回退是只读的：不得把损坏主文件 copy 成 .bak 毁掉唯一好备份，
    // 也不在无锁的 load 路径修主文件；主文件留待下次持锁保存自然修复。
    let bak = std::fs::read_to_string(p.with_extension("json.bak")).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&bak).unwrap(),
        json!({"rev":1}),
        ".bak 必须仍是好数据"
    );
    assert_eq!(std::fs::read_to_string(&p).unwrap(), "{\"rev\":2,\"tasks\":[");
    store::save_at(&p, &json!({"rev":3})).unwrap();
    assert_eq!(store::load_at(&p).unwrap().unwrap(), json!({"rev":3}));
}

#[test]
fn non_object_payload_is_rejected_and_existing_data_survives() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"tasks":[1,2,3]})).unwrap();
    for bad in [json!([]), json!("oops"), json!(42), json!(null)] {
        assert!(store::save_at(&p, &bad).is_err(), "顶层非对象必须拒绝: {bad}");
    }
    assert_eq!(store::load_at(&p).unwrap().unwrap(), json!({"tasks":[1,2,3]}));
}

#[test]
fn manual_backup_lands_in_backups_dir() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"tasks":[]})).unwrap();
    let out = store::backup_at(&p).unwrap();
    assert!(out.exists());
    assert_eq!(out.parent().unwrap().file_name().unwrap(), "backups");
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&std::fs::read_to_string(&out).unwrap()).unwrap(),
        json!({"tasks":[]})
    );
}

#[test]
fn import_validates_before_touching_existing_data() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"keep":"me"})).unwrap();

    let bad = d.path().join("bad.json");
    std::fs::write(&bad, "[1,2,3]").unwrap();
    assert!(store::import_at(&p, &bad).is_err());
    assert_eq!(store::load_at(&p).unwrap().unwrap(), json!({"keep":"me"}));

    let broken = d.path().join("broken.json");
    std::fs::write(&broken, "{not json").unwrap();
    assert!(store::import_at(&p, &broken).is_err());
    assert_eq!(store::load_at(&p).unwrap().unwrap(), json!({"keep":"me"}));

    let good = d.path().join("good.json");
    std::fs::write(&good, r#"{"tasks":[{"id":"x"}]}"#).unwrap();
    store::import_at(&p, &good).unwrap();
    let disk = store::load_at(&p).unwrap().unwrap();
    assert_eq!(disk["tasks"], json!([{"id":"x"}]));
    // P1：导入延续盘上 rev 序列（此前 save_at 无 _rev → 0，导入后 = 1）
    assert_eq!(disk["_rev"], json!(1));
    // 导入前的旧数据进了 backups，可找回
    assert!(d.path().join("backups").read_dir().unwrap().count() >= 1);
}

#[test]
fn export_writes_a_readable_copy() {
    let d = TempDir::new().unwrap();
    let p = db(&d);
    store::save_at(&p, &json!({"notes":[{"text":"Ct 漂移"}]})).unwrap();
    let dest = d.path().join("out").join("我的台账.json");
    store::export_at(&p, &dest).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&std::fs::read_to_string(&dest).unwrap()).unwrap(),
        json!({"notes":[{"text":"Ct 漂移"}]})
    );
}

#[test]
fn default_db_path_uses_existing_session_dir_and_filename() {
    // 不设 LABKIT_DB_DIR 时应落在既有会话目录里，和 ROI/qPCR 会话同一处。
    if std::env::var_os("LABKIT_DB_DIR").is_some() {
        return;
    }
    let p = store::db_path().unwrap();
    assert_eq!(p.file_name().unwrap(), "labkit_db.json");
    assert_eq!(p.parent().unwrap().file_name().unwrap(), ".liver_portal_crop");
}