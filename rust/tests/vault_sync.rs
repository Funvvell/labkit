//! Vault 摄入测试（markdown → JSON）：外部编辑优先、删除传播、重命名不留孤儿、
//! 双改冲突与裁决、快筛不误判删除、并发投影不丢文件。
//!
//! 全部用临时目录直连 `*_at(db, vault, …)`，不依赖 LABKIT_DB_DIR 环境变量。

use labkit::store::{load_at, merge_save_at};
use labkit::vault::{
    conflicts_at, ingest_at, project_at, render_record, resolve_at, sync_at, Index,
};
use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use tempfile::TempDir;

fn setup(dir: &TempDir, data: Value) -> (PathBuf, PathBuf) {
    let db = dir.path().join("labkit_db.json");
    let vault = dir.path().join("vault");
    merge_save_at(&db, &data, None).unwrap();
    project_at(&db, &vault, None).unwrap();
    (db, vault)
}

fn read_index(vault: &Path) -> Index {
    serde_json::from_str(&fs::read_to_string(vault.join(".labkit/index.json")).unwrap()).unwrap()
}

fn disk(db: &Path) -> Value {
    load_at(db).unwrap().unwrap()
}

fn notes_db() -> Value {
    json!({"notes":[
        {"id":"n1","at":"2026-11-16T21:10","text":"原始速记"},
        {"id":"n2","at":"2026-11-16T21:11","text":"第二条"}],
        "reagents":[{"id":"r1","name":"示例一抗","quantity":80,"unit":"%","left":"80%"}]})
}

/// 模拟用户在 Obsidian 里改文件：改正文并让 mtime 前进。
fn edit_md(vault: &Path, rel: &str, new_text: &str) {
    let p = vault.join(rel);
    let old = fs::read_to_string(&p).unwrap();
    fs::write(&p, old.replace("原始速记", new_text)).unwrap();
    bump_mtime(&p);
}

/// 文件系统 mtime 粒度可能粗于写入间隔，显式前移一秒确保快筛不会漏掉外部编辑。
fn bump_mtime(p: &Path) {
    let future = std::time::SystemTime::now() + std::time::Duration::from_secs(2);
    let _ = fs::File::options().write(true).open(p).and_then(|f| f.set_modified(future));
}

#[test]
fn external_edit_is_adopted_and_bumps_rev() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let rev0 = disk(&db)["_rev"].as_u64().unwrap();
    edit_md(&vault, "速记/原始速记.md", "在 Obsidian 里改过的内容");
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 1, "{rep:?}");
    assert!(rep.errors.is_empty(), "{:?}", rep.errors);
    assert_eq!(rep.changed, vec!["notes".to_string()]);
    assert_eq!(disk(&db)["notes"][0]["text"], json!("在 Obsidian 里改过的内容"));
    assert!(disk(&db)["_rev"].as_u64().unwrap() > rev0, "摄入必须经 merge_save 递增 rev");
    // 其它记录不受影响
    assert_eq!(disk(&db)["notes"][1]["text"], json!("第二条"));
    assert_eq!(disk(&db)["reagents"][0]["name"], json!("示例一抗"));
}

#[test]
fn external_delete_propagates_to_ledger() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    fs::remove_file(vault.join("速记/原始速记.md")).unwrap();
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.removed, 1);
    let d = disk(&db);
    let notes = d["notes"].as_array().unwrap();
    assert_eq!(notes.len(), 1);
    assert_eq!(notes[0]["id"], json!("n2"));
    assert!(!read_index(&vault).files.contains_key("n1"));
    // 再投影不得把已删记录复活
    project_at(&db, &vault, None).unwrap();
    assert!(!vault.join("速记/原始速记.md").exists());
}

#[test]
fn user_rename_is_respected_and_leaves_no_orphan() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let old = vault.join("速记/原始速记.md");
    let new = vault.join("速记/我自己起的名字.md");
    fs::rename(&old, &new).unwrap();
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.renamed, 1, "{rep:?}");
    assert_eq!(rep.ingested, 0, "只改名不算内容编辑");
    assert_eq!(read_index(&vault).files["n1"].path, "速记/我自己起的名字.md");
    assert_eq!(disk(&db)["notes"].as_array().unwrap().len(), 2, "记录不得丢失");
    // 投影必须沿用用户的文件名，不得改回标签名
    project_at(&db, &vault, None).unwrap();
    assert!(new.exists(), "用户的重命名必须被尊重");
    assert!(!old.exists(), "不得产生孤儿文件");
}

#[test]
fn label_change_renames_file_and_trashes_old() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let mut data = notes_db();
    data["notes"][0]["text"] = json!("改过的标题内容");
    merge_save_at(&db, &data, Some(&["notes".to_string()])).unwrap();
    project_at(&db, &vault, None).unwrap();
    assert!(vault.join("速记/改过的标题内容.md").exists());
    assert!(!vault.join("速记/原始速记.md").exists());
    assert_eq!(read_index(&vault).files["n1"].path, "速记/改过的标题内容.md");
    // 摄入不得把这次本地改名误判成外部编辑
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 0, "{rep:?}");
}

#[test]
fn new_markdown_with_labkit_id_is_ingested() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let md = render_record("note", &json!({"id":"n-new","at":"2026-11-20T10:00","text":"在 Obsidian 里新建的速记"})).unwrap();
    let p = vault.join("速记/在 Obsidian 里新建的速记.md");
    fs::write(&p, md).unwrap();
    bump_mtime(&p);
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 1);
    let d = disk(&db);
    let notes = d["notes"].as_array().unwrap();
    assert_eq!(notes.len(), 3);
    assert!(notes.iter().any(|n| n["id"] == json!("n-new")));
}

#[test]
fn unrelated_markdown_is_skipped_and_untouched() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let p = vault.join("速记/用户自己的笔记.md");
    fs::write(&p, "# 普通笔记\n\n没有 frontmatter，不该被当成台账记录。\n").unwrap();
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.skipped, 1);
    assert_eq!(rep.ingested, 0);
    assert_eq!(rep.removed, 0, "无 frontmatter 的文件不得触发删除判定");
    assert_eq!(disk(&db)["notes"].as_array().unwrap().len(), 2);
    assert!(p.exists());
    assert_eq!(fs::read_to_string(&p).unwrap(), "# 普通笔记\n\n没有 frontmatter，不该被当成台账记录。\n");
}

#[test]
fn pure_local_change_is_left_to_projection() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    let mut data = notes_db();
    data["notes"][0]["text"] = json!("本地改的");
    merge_save_at(&db, &data, Some(&["notes".to_string()])).unwrap();
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 0, "md 没变就不能反过来覆盖本地改动");
    assert_eq!(disk(&db)["notes"][0]["text"], json!("本地改的"));
    // 投影把本地改动写进 md
    project_at(&db, &vault, None).unwrap();
    let md = fs::read_to_string(vault.join("速记/本地改的.md")).unwrap();
    assert!(md.contains("本地改的"), "{md}");
}

#[test]
fn double_edit_conflict_prefers_vault_and_keeps_local() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    // 外部改 md
    edit_md(&vault, "速记/原始速记.md", "Obsidian 版");
    // 同时本地也改同一条
    let mut data = notes_db();
    data["notes"][0]["text"] = json!("LabKit 版");
    merge_save_at(&db, &data, Some(&["notes".to_string()])).unwrap();

    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.conflicts, vec!["n1".to_string()], "{rep:?}");
    assert_eq!(disk(&db)["notes"][0]["text"], json!("Obsidian 版"), "外部编辑优先");
    let list = conflicts_at(&vault);
    assert_eq!(list.len(), 1);
    assert_eq!(list[0]["local"]["text"], json!("LabKit 版"));
    assert_eq!(list[0]["vault"]["text"], json!("Obsidian 版"));
    assert_eq!(list[0]["label"], json!("LabKit 版"), "UI 需要一个可读标签");

    // 一键还原本地版
    let r = resolve_at(&db, &vault, "n1", "local").unwrap();
    assert!(r.projected.errors.is_empty());
    assert_eq!(disk(&db)["notes"][0]["text"], json!("LabKit 版"));
    assert!(conflicts_at(&vault).is_empty(), "裁决后冲突记录应清除");
    // md 也被重新投影成本地版
    let files: Vec<String> = fs::read_dir(vault.join("速记")).unwrap()
        .filter_map(|e| e.ok().map(|e| e.file_name().to_string_lossy().into_owned())).collect();
    assert!(files.iter().any(|f| f.contains("LabKit 版")), "{files:?}");
}

#[test]
fn resolve_keeping_vault_just_clears_conflict() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    edit_md(&vault, "速记/原始速记.md", "Obsidian 版");
    let mut data = notes_db();
    data["notes"][0]["text"] = json!("LabKit 版");
    merge_save_at(&db, &data, Some(&["notes".to_string()])).unwrap();
    ingest_at(&db, &vault).unwrap();
    resolve_at(&db, &vault, "n1", "vault").unwrap();
    assert!(conflicts_at(&vault).is_empty());
    assert_eq!(disk(&db)["notes"][0]["text"], json!("Obsidian 版"));
}

#[test]
fn mtime_fast_path_does_not_mistake_files_for_deleted() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    // 刚投影完立刻摄入：全部走 mtime 快筛，不读文件
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 0);
    assert_eq!(rep.removed, 0, "快筛命中的文件必须算作「仍在」");
    assert_eq!(rep.skipped, 0);
    assert_eq!(disk(&db)["notes"].as_array().unwrap().len(), 2);
}

#[test]
fn sync_is_idempotent_on_second_run() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    edit_md(&vault, "速记/原始速记.md", "外部改一次");
    let first = sync_at(&db, &vault).unwrap();
    assert_eq!(first.ingested, 1);
    let second = sync_at(&db, &vault).unwrap();
    assert_eq!(second.ingested, 0, "第二次不得重复摄入");
    assert_eq!(second.projected.written, 0, "第二次不得重复改写文件");
    assert_eq!(second.removed, 0);
    assert!(second.conflicts.is_empty());
}

#[test]
fn corrupt_yaml_reports_error_without_blocking_others() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    // 一个文件坏掉，另一个正常编辑
    let bad = vault.join("速记/第二条.md");
    fs::write(&bad, "---\nid: \"n2\"\nkind: \"note\"\nlabkit_schema: 1\nat: [unclosed\n---\n\n正文\n").unwrap();
    bump_mtime(&bad);
    edit_md(&vault, "速记/原始速记.md", "仍然可用的编辑");
    let rep = ingest_at(&db, &vault).unwrap();
    assert!(!rep.errors.is_empty(), "坏文件必须上报");
    assert_eq!(rep.ingested, 1, "好文件仍要被摄入");
    assert_eq!(disk(&db)["notes"][0]["text"], json!("仍然可用的编辑"));
    assert_eq!(disk(&db)["notes"][1]["text"], json!("第二条"), "坏文件不得破坏原记录");
}

#[test]
fn concurrent_projection_writes_every_file() {
    let dir = TempDir::new().unwrap();
    let notes: Vec<Value> = (0..24).map(|i| json!({"id":format!("n{i}"),"at":"2026-11-20T10:00","text":format!("并发速记 {i}")})).collect();
    let (db, vault) = setup(&dir, json!({"notes": notes}));
    let mut handles = vec![];
    for _ in 0..6 {
        let (d, v) = (db.clone(), vault.clone());
        handles.push(std::thread::spawn(move || {
            for _ in 0..4 {
                project_at(&d, &v, None).unwrap();
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    let idx = read_index(&vault);
    assert_eq!(idx.files.len(), 24, "并发投影不得丢索引项");
    for i in 0..24 {
        assert!(vault.join(format!("速记/并发速记 {i}.md")).exists(), "丢文件 n{i}");
    }
}

#[test]
fn ingest_then_project_round_trips_external_edit() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, notes_db());
    // 外部把试剂存量改了：left 是派生值，应通过 quantity 表达
    let p = vault.join("试剂/示例一抗.md");
    let md = fs::read_to_string(&p).unwrap().replace("quantity: 80", "quantity: 45");
    fs::write(&p, md).unwrap();
    bump_mtime(&p);
    sync_at(&db, &vault).unwrap();
    let r = &disk(&db)["reagents"][0];
    assert_eq!(r["quantity"], json!(45));
    assert_eq!(r["left"], json!("45%"), "派生余量必须跟着 quantity 走");
    // 投影后的 md 与台账一致，且再摄入无变化
    let again = ingest_at(&db, &vault).unwrap();
    assert_eq!(again.ingested, 0);
}

#[test]
fn external_milestone_tick_is_adopted() {
    let dir = TempDir::new().unwrap();
    let data = json!({"projects":[{"id":"p1","name":"方法学验证","progress":42,
        "milestones":[["开题",1],["检测",0]]}]});
    let (db, vault) = setup(&dir, data);
    let p = vault.join("项目/方法学验证.md");
    let md = fs::read_to_string(&p).unwrap().replace("- [ ] 检测", "- [x] 检测");
    fs::write(&p, md).unwrap();
    bump_mtime(&p);
    let rep = ingest_at(&db, &vault).unwrap();
    assert_eq!(rep.ingested, 1);
    assert_eq!(disk(&db)["projects"][0]["milestones"], json!([["开题",1],["检测",1]]));
}