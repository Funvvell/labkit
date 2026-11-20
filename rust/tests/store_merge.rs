//! P1 多窗口台账合并写回归测试（store::merge_save_at）。
//!
//! 契约（计划 §2.2）：
//! * 不相交顶层键合并无损——两个窗口各写各的键，互不抹掉；
//! * `_store` 二级合并——不同工具窗口写各自 `toolform:<id>` 互不干扰；
//!   子键 null = 删除墓碑（favs→pins 迁移 / Store.set(k,null)）；
//! * 同键并发编辑 = 后写覆盖（键级 LWW）；
//! * `changed` 缺省 = 整库写（旧契约兼容），且 `_rev` 由 Rust 独占管理；
//! * 每次成功写入 rev+1；前端传入的 `_rev` 一律忽略。
//!
//! 全部用临时目录直连 `merge_save_at(path,…)`，不依赖 LABKIT_DB_DIR 环境变量
//! （cargo 测试同进程并行，env 会互相串扰）。

use labkit::store::{load_at, merge_save_at, save_at};
use serde_json::json;
use tempfile::TempDir;

fn db(dir: &TempDir) -> std::path::PathBuf {
    dir.path().join("labkit_db.json")
}

fn keys(v: &[&str]) -> Vec<String> {
    v.iter().map(|s| s.to_string()).collect()
}

#[test]
fn disjoint_top_level_keys_merge_lossless() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    // 窗口 A 的基线：整库首写
    let base = json!({"tasks":[{"id":"t1"}],"projects":[],"_store":{}});
    merge_save_at(&p, &base, None).unwrap();

    // 窗口 B 只改 projects（它的 data 里 tasks 还是旧值——合并必须忽略未 changed 的键）
    let win_b = json!({"tasks":[{"id":"OLD"}],"projects":[{"id":"p1"}],"_store":{}});
    merge_save_at(&p, &win_b, Some(&keys(&["projects"]))).unwrap();

    // 窗口 A 只改 tasks
    let win_a = json!({"tasks":[{"id":"t1"},{"id":"t2"}],"projects":[],"_store":{}});
    merge_save_at(&p, &win_a, Some(&keys(&["tasks"]))).unwrap();

    let disk = load_at(&p).unwrap().unwrap();
    assert_eq!(disk["tasks"], json!([{"id":"t1"},{"id":"t2"}]));
    assert_eq!(disk["projects"], json!([{"id":"p1"}]), "B 的 projects 不能被 A 抹掉");
}

#[test]
fn store_subkey_merge_isolated_toolforms() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(
        &p,
        &json!({"_store":{"pins":[],"settings":{"theme":"light"}}}),
        None,
    )
    .unwrap();

    // 工具窗口 primer 写自己的表单快照（data 里 _store 不含别的窗口的键）
    let win_primer = json!({"_store":{"toolform:primer":{"v":"AAA"}}});
    merge_save_at(&p, &win_primer, Some(&keys(&["_store"]))).unwrap();
    // 工具窗口 tests 同时写自己的
    let win_tests = json!({"_store":{"toolform:tests":{"v":"BBB"}}});
    merge_save_at(&p, &win_tests, Some(&keys(&["_store"]))).unwrap();

    let disk = load_at(&p).unwrap().unwrap();
    let store = &disk["_store"];
    assert_eq!(store["toolform:primer"], json!({"v":"AAA"}));
    assert_eq!(store["toolform:tests"], json!({"v":"BBB"}));
    assert_eq!(store["settings"], json!({"theme":"light"}), "未触碰的子键保留");
    assert_eq!(store["pins"], json!([]));
}

#[test]
fn store_null_subkey_is_tombstone() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"_store":{"favs":["primer"],"pins":[]}}), None).unwrap();
    // favs→pins 迁移：pins 写入、favs 置 null
    merge_save_at(
        &p,
        &json!({"_store":{"pins":[{"kind":"tool","id":"primer"}],"favs":null}}),
        Some(&keys(&["_store"])),
    )
    .unwrap();
    let disk = load_at(&p).unwrap().unwrap();
    assert!(disk["_store"].get("favs").is_none(), "null 墓碑应移除盘上旧键");
    assert_eq!(disk["_store"]["pins"][0]["id"], json!("primer"));
}

#[test]
fn same_key_last_write_wins() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"tasks":[{"id":"a"}]}), None).unwrap();
    merge_save_at(&p, &json!({"tasks":[{"id":"b"}]}), Some(&keys(&["tasks"]))).unwrap();
    merge_save_at(&p, &json!({"tasks":[{"id":"c"}]}), Some(&keys(&["tasks"]))).unwrap();
    let disk = load_at(&p).unwrap().unwrap();
    assert_eq!(disk["tasks"], json!([{"id":"c"}]));
}

#[test]
fn changed_none_is_full_write_legacy_contract() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"tasks":[],"projects":[{"id":"p"}]}), None).unwrap();
    // 旧契约整库写：未出现在 data 里的键被替换掉
    merge_save_at(&p, &json!({"tasks":[{"id":"t"}]}), None).unwrap();
    let disk = load_at(&p).unwrap().unwrap();
    assert_eq!(disk["tasks"], json!([{"id":"t"}]));
    assert!(disk.get("projects").is_none());
}

#[test]
fn rev_increments_and_frontend_rev_ignored() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    let r1 = merge_save_at(&p, &json!({"tasks":[],"_rev":999}), None).unwrap();
    assert_eq!(r1, 1, "首写 rev=1，前端传入的 999 必须被忽略");
    let r2 = merge_save_at(&p, &json!({"tasks":[],"_rev":0}), Some(&keys(&["tasks"]))).unwrap();
    assert_eq!(r2, 2);
    // changed 里显式带 _rev 也不生效
    let r3 = merge_save_at(&p, &json!({"_rev":50}), Some(&keys(&["_rev"]))).unwrap();
    assert_eq!(r3, 3);
    let disk = load_at(&p).unwrap().unwrap();
    assert_eq!(disk["_rev"], json!(3));
}

#[test]
fn changed_key_absent_from_data_removes_disk_key() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"tasks":[],"notes":[{"id":"n"}]}), None).unwrap();
    merge_save_at(&p, &json!({"tasks":[]}), Some(&keys(&["notes"]))).unwrap();
    let disk = load_at(&p).unwrap().unwrap();
    assert!(disk.get("notes").is_none());
}

#[test]
fn rejects_non_object_data() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    assert!(merge_save_at(&p, &json!([1, 2, 3]), None).is_err());
    assert!(merge_save_at(&p, &json!("scalar"), Some(&keys(&["tasks"]))).is_err());
    assert!(!p.exists(), "拒绝写入后不应产生文件");
}

#[test]
fn legacy_save_at_then_merge_preserves_keys() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    // 旧路径 save_at 整库写（无 _rev），随后合并写必须能接续
    save_at(&p, &json!({"tasks":[{"id":"t"}],"_store":{"pins":[]}})).unwrap();
    let rev = merge_save_at(
        &p,
        &json!({"_store":{"toolform:x":{"v":1}}}),
        Some(&keys(&["_store"])),
    )
    .unwrap();
    assert_eq!(rev, 1);
    let disk = load_at(&p).unwrap().unwrap();
    assert_eq!(disk["tasks"], json!([{"id":"t"}]));
    assert_eq!(disk["_store"]["pins"], json!([]));
    assert_eq!(disk["_store"]["toolform:x"], json!({"v":1}));
}

#[test]
fn concurrent_writers_no_lost_updates() {
    // 多线程模拟两个窗口并发 flush 不相交键：锁内读-改-写必须零丢失。
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"_store":{}}), None).unwrap();
    let mut handles = vec![];
    for w in 0..8 {
        let pp = p.clone();
        handles.push(std::thread::spawn(move || {
            for i in 0..25 {
                let key = format!("toolform:w{w}-{i}");
                let data = json!({"_store":{key.clone():{"v":i}}});
                merge_save_at(&pp, &data, Some(&keys(&["_store"]))).unwrap();
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    let disk = load_at(&p).unwrap().unwrap();
    let store = disk["_store"].as_object().unwrap();
    for w in 0..8 {
        for i in 0..25 {
            let key = format!("toolform:w{w}-{i}");
            assert_eq!(store.get(&key), Some(&json!({"v":i})), "丢失键 {key}");
        }
    }
    assert_eq!(disk["_rev"], json!(201), "200 次合并 + 1 次首写");
}

#[test]
fn import_continues_rev_sequence() {
    let dir = TempDir::new().unwrap();
    let p = db(&dir);
    merge_save_at(&p, &json!({"tasks":[]}), None).unwrap(); // rev 1
    merge_save_at(&p, &json!({"tasks":[]}), Some(&keys(&["tasks"]))).unwrap(); // rev 2
    let src = dir.path().join("import.json");
    std::fs::write(&src, serde_json::to_string(&json!({"tasks":[{"id":"imp"}],"_rev":1})).unwrap()).unwrap();
    let data = labkit::store::import_at(&p, &src).unwrap();
    assert_eq!(data["_rev"], json!(3), "导入忽略文件自带 rev，延续盘上序列");
    assert_eq!(data["tasks"], json!([{"id":"imp"}]));
}