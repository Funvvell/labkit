//! Vault 投影测试（JSON → markdown）：文件命名、hash 跳过、软删除、
//! 改名不留孤儿、写失败不伤台账、索引幂等重建。
//!
//! 全部用临时目录直连 `*_at(db, vault, …)`，不依赖 LABKIT_DB_DIR 环境变量
//! （cargo 测试同进程并行，env 会互相串扰）。摄入与冲突见 vault_sync.rs。

use labkit::store::merge_save_at;
use labkit::vault::{configure_at, project_at, status_at, Index};
use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use tempfile::TempDir;

fn setup(dir: &TempDir, data: Value) -> (PathBuf, PathBuf) {
    let db = dir.path().join("labkit_db.json");
    let vault = dir.path().join("vault");
    merge_save_at(&db, &data, None).unwrap();
    (db, vault)
}

fn read_index(vault: &Path) -> Index {
    let text = fs::read_to_string(vault.join(".labkit/index.json")).unwrap();
    serde_json::from_str(&text).unwrap()
}

fn md_files(vault: &Path) -> Vec<String> {
    let mut out = Vec::new();
    fn walk(d: &Path, base: &Path, out: &mut Vec<String>) {
        let Ok(rd) = fs::read_dir(d) else { return };
        for e in rd.filter_map(|e| e.ok()) {
            let p = e.path();
            if p.is_dir() {
                if p.file_name().map(|n| n == ".labkit").unwrap_or(false) {
                    continue;
                }
                walk(&p, base, out);
            } else if p.extension().map(|x| x == "md").unwrap_or(false) {
                out.push(p.strip_prefix(base).unwrap().to_string_lossy().replace('\\', "/"));
            }
        }
    }
    walk(vault, vault, &mut out);
    out.sort();
    out
}

fn full_db() -> Value {
    json!({
        "tasks": [{"id":"t1","name":"缓冲液配制","pri":"urgent","state":"todo","done":false,"tags":["试剂"]}],
        "projects": [{"id":"p1","name":"方法学验证","progress":42,"milestones":[["开题",1],["检测",0]]}],
        "experiments": [{"id":"EXP-1","proj":"方法学验证","type":"qPCR","date":"11-17","who":"示例用户","status":"进行中","note":"Ct 漂移"}],
        "literatures": [{"id":"l1","title":"方法学综述","meta":"示例期刊 · 2026","status":"待精读","note":"笔记"}],
        "reagents": [{"id":"r1","name":"示例一抗","no":"AB1","lot":"007","loc":"4°C","exp":"2026-12-02","quantity":80,"unit":"%","left":"80%"}],
        "instruments": [{"id":"i1","name":"荧光定量 PCR 仪","cal":"2026-10-12","next":"2027-04-12","note":"运行正常"}],
        "bookings": [{"id":"k1","inst":"荧光定量 PCR 仪","date":"2026-11-19","slot":"09:00-11:00","who":"示例用户","proj":""}],
        "budget": [{"id":"b1","item":"耗材采购","cat":"耗材","amount":4860,"date":"2026-11-05","note":"含一抗"}],
        "notes": [{"id":"n1","at":"2026-11-16T21:10","text":"排查思路"}],
        "reminders": [{"id":"m1","text":"设备校准到期","date":"2026-12-15","color":"var(--orange)"}],
        "focusRecords": [{"id":"f1","project":"方法学验证","type":"实验操作","minutes":50,"at":"2026-11-20T09:00"}],
        "_store": {}
    })
}

#[test]
fn projects_all_eleven_kinds_into_named_dirs() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    let rep = project_at(&db, &vault, None).unwrap();
    assert_eq!(rep.written, 11, "11 类各一条记录");
    assert!(rep.errors.is_empty(), "{:?}", rep.errors);
    let files = md_files(&vault);
    assert_eq!(files.len(), 11);
    for expect in ["任务/缓冲液配制.md", "项目/方法学验证.md", "实验/EXP-1.md", "文献/方法学综述.md",
        "试剂/示例一抗.md", "仪器/荧光定量 PCR 仪.md", "经费/耗材采购.md", "速记/排查思路.md",
        "提醒/设备校准到期.md"] {
        assert!(files.contains(&expect.to_string()), "缺少 {expect}，实际 {files:?}");
    }
    // 预约与专注用组合标签
    assert!(files.iter().any(|f| f.starts_with("预约/荧光定量 PCR 仪 2026-11-19")), "{files:?}");
    assert!(files.iter().any(|f| f.starts_with("专注/方法学验证 2026-11-20")), "{files:?}");
}

#[test]
fn second_projection_skips_unchanged_records() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    project_at(&db, &vault, None).unwrap();
    let rep = project_at(&db, &vault, None).unwrap();
    assert_eq!(rep.written, 0, "内容未变不得改写文件（否则用户的 Obsidian 库被无意义 churn）");
    assert_eq!(rep.skipped, 11);
}

#[test]
fn only_changed_record_is_rewritten() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    project_at(&db, &vault, None).unwrap();
    let mut data = full_db();
    data["notes"][0]["text"] = json!("改过的排查思路");
    merge_save_at(&db, &data, Some(&["notes".to_string()])).unwrap();
    let rep = project_at(&db, &vault, Some(&["notes".to_string()])).unwrap();
    assert_eq!(rep.written, 1);
    // 改名 → 新文件 + 旧文件进回收站，不留孤儿
    let files = md_files(&vault);
    assert!(files.contains(&"速记/改过的排查思路.md".to_string()), "{files:?}");
    assert!(!files.contains(&"速记/排查思路.md".to_string()), "旧名必须移走\n{files:?}");
    let trash = fs::read_dir(vault.join(".labkit/trash")).unwrap().count();
    assert_eq!(trash, 1, "旧文件应软删除进回收站而非硬删");
}

#[test]
fn deleted_record_moves_file_to_trash_not_hard_delete() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    project_at(&db, &vault, None).unwrap();
    let mut data = full_db();
    data["reagents"] = json!([]);
    merge_save_at(&db, &data, Some(&["reagents".to_string()])).unwrap();
    let rep = project_at(&db, &vault, None).unwrap();
    assert_eq!(rep.trashed, 1);
    assert!(!vault.join("试剂/示例一抗.md").exists());
    let trash: Vec<String> = fs::read_dir(vault.join(".labkit/trash")).unwrap()
        .filter_map(|e| e.ok().map(|e| e.file_name().to_string_lossy().into_owned())).collect();
    assert_eq!(trash.len(), 1);
    assert!(trash[0].ends_with("示例一抗.md"), "回收站里应能认出原文件：{trash:?}");
    assert!(read_index(&vault).files.is_empty() || !read_index(&vault).files.contains_key("r1"));
}

#[test]
fn collision_suffix_is_stable_under_array_reorder() {
    let dir = TempDir::new().unwrap();
    let data = json!({"reagents":[
        {"id":"rB","name":"同名试剂","left":"1 盒"},
        {"id":"rA","name":"同名试剂","left":"2 盒"}]});
    let (db, vault) = setup(&dir, data);
    project_at(&db, &vault, None).unwrap();
    let idx = read_index(&vault);
    // 按 id 排序分配后缀，与数组顺序无关
    assert_eq!(idx.files["rA"].path, "试剂/同名试剂.md");
    assert_eq!(idx.files["rB"].path, "试剂/同名试剂 2.md");

    // 新增记录 unshift 到队首，既有文件不得集体改名
    let data2 = json!({"reagents":[
        {"id":"rC","name":"新来的","left":"3 盒"},
        {"id":"rB","name":"同名试剂","left":"2 盒"},
        {"id":"rA","name":"同名试剂","left":"1 盒"}]});
    merge_save_at(&db, &data2, Some(&["reagents".to_string()])).unwrap();
    project_at(&db, &vault, None).unwrap();
    let idx2 = read_index(&vault);
    assert_eq!(idx2.files["rA"].path, "试剂/同名试剂.md", "既有文件不得因数组重排而改名");
    assert_eq!(idx2.files["rB"].path, "试剂/同名试剂 2.md");
    assert_eq!(idx2.files["rC"].path, "试剂/新来的.md");
}

#[test]
fn windows_illegal_chars_and_reserved_names_are_sanitized() {
    let dir = TempDir::new().unwrap();
    let data = json!({"notes":[
        {"id":"n1","at":"2026-11-20T10:00","text":"a/b:c*d?e\"f<g>h|i"},
        {"id":"n2","at":"2026-11-20T10:00","text":"CON"},
        {"id":"n3","at":"2026-11-20T10:00","text":""},
        {"id":"n4","at":"2026-11-20T10:00","text":"长".repeat(120)},
        {"id":"n5","at":"2026-11-20T10:00","text":"尾部点和空格. "},
        {"id":"n6","at":"2026-11-20T10:00","text":"COM1"}],
        "reagents":[{"id":"r1","name":"名".repeat(120),"left":"1 盒"}]});
    let (db, vault) = setup(&dir, data);
    let rep = project_at(&db, &vault, None).unwrap();
    assert!(rep.errors.is_empty(), "{:?}", rep.errors);
    let idx = read_index(&vault);
    let p1 = &idx.files["n1"].path;
    assert_eq!(p1.matches('/').count(), 1, "只保留目录分隔符，其余非法字符必须映射：{p1}");
    assert!(!p1.contains(['\\', ':', '*', '?', '"', '<', '>', '|'].as_ref()), "{p1}");
    assert!(p1.contains('：') && p1.contains('？'), "应映射为全角保住可读性：{p1}");
    assert_eq!(idx.files["n2"].path, "速记/_CON.md", "Windows 保留名要加前缀");
    assert_eq!(idx.files["n6"].path, "速记/_COM1.md");
    assert_eq!(idx.files["n3"].path, "速记/未命名.md", "空标签兜底");
    assert!(!idx.files["n5"].path.ends_with(". "), "尾部点空格必须去掉");
    // 速记标签本就取正文前 20 字（正文才是完整内容）
    let note_stem = idx.files["n4"].path.trim_start_matches("速记/").trim_end_matches(".md");
    assert_eq!(note_stem.chars().count(), 20);
    // 其余实体走 sanitize 的 80 字符上限，防 MAX_PATH
    let stem = idx.files["r1"].path.trim_start_matches("试剂/").trim_end_matches(".md");
    assert_eq!(stem.chars().count(), 80, "超长标签截断到 80 字符");
    // 全部文件真实落盘
    for e in idx.files.values() {
        assert!(vault.join(&e.path).exists(), "{} 未落盘", e.path);
    }
}

#[test]
fn index_loss_rebuilds_idempotently() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    project_at(&db, &vault, None).unwrap();
    let before = md_files(&vault);
    fs::remove_file(vault.join(".labkit/index.json")).unwrap();
    let rep = project_at(&db, &vault, None).unwrap();
    assert!(rep.errors.is_empty(), "{:?}", rep.errors);
    assert_eq!(md_files(&vault), before, "索引丢失后重建不得产生重复或孤儿文件");
    assert_eq!(read_index(&vault).files.len(), 11);
}

#[test]
fn vault_write_failure_never_damages_the_ledger() {
    let dir = TempDir::new().unwrap();
    let (db, _) = setup(&dir, full_db());
    // 把 vault 指到一个普通文件的子路径 → create_dir_all 必然失败（跨平台可靠）
    let blocker = dir.path().join("blocker");
    fs::write(&blocker, "not a dir").unwrap();
    let vault = blocker.join("vault");
    let rep = project_at(&db, &vault, None).unwrap();
    assert!(!rep.errors.is_empty(), "写失败必须上报");
    assert_eq!(rep.written, 0);
    // 台账 JSON 完好无损
    let disk = labkit::store::load_at(&db).unwrap().unwrap();
    assert_eq!(disk["reagents"][0]["id"], json!("r1"));
    assert_eq!(disk["tasks"].as_array().unwrap().len(), 1);
}

#[test]
fn unrelated_files_in_existing_vault_are_untouched() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    fs::create_dir_all(&vault).unwrap();
    let mine = vault.join("我自己的笔记.md");
    fs::write(&mine, "# 用户原有内容\n\n不该被动到。\n").unwrap();
    let sub = vault.join("已有目录");
    fs::create_dir_all(&sub).unwrap();
    fs::write(sub.join("other.md"), "other").unwrap();
    project_at(&db, &vault, None).unwrap();
    assert_eq!(fs::read_to_string(&mine).unwrap(), "# 用户原有内容\n\n不该被动到。\n");
    assert_eq!(fs::read_to_string(sub.join("other.md")).unwrap(), "other");
}

#[test]
fn configure_enables_backs_up_and_reports_status() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    let rep = configure_at(&db, vault.to_str().unwrap(), true).unwrap();
    assert_eq!(rep.projected.written, 11);
    let backups = fs::read_dir(dir.path().join("backups")).unwrap().count();
    assert_eq!(backups, 1, "启用前必须强制备份");
    let st = status_at(&db).unwrap();
    assert_eq!(st["enabled"], json!(true));
    assert_eq!(st["files"], json!(11));
    assert_eq!(st["conflicts"], json!(0));
    // 关闭：文件保留，配置落盘
    configure_at(&db, vault.to_str().unwrap(), false).unwrap();
    let st = status_at(&db).unwrap();
    assert_eq!(st["enabled"], json!(false));
    assert_eq!(md_files(&vault).len(), 11, "关闭不得删除用户的 markdown");
}

#[test]
fn configure_rejects_empty_dir_and_no_vault_means_disabled() {
    let dir = TempDir::new().unwrap();
    let (db, _) = setup(&dir, full_db());
    assert!(configure_at(&db, "   ", true).is_err());
    let st = status_at(&db).unwrap();
    assert_eq!(st["enabled"], json!(false));
    assert_eq!(st["files"], json!(0));
}

#[test]
fn projection_is_scoped_to_requested_kinds() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, full_db());
    let rep = project_at(&db, &vault, Some(&["reagents".to_string()])).unwrap();
    assert_eq!(rep.written, 1);
    assert_eq!(md_files(&vault), vec!["试剂/示例一抗.md".to_string()]);
    // 用 kind slug 也能选中
    let rep = project_at(&db, &vault, Some(&["task".to_string()])).unwrap();
    assert_eq!(rep.written, 1);
}

#[test]
fn records_without_id_are_reported_not_silently_dropped() {
    let dir = TempDir::new().unwrap();
    let (db, vault) = setup(&dir, json!({"notes":[{"text":"没有 id"},{"id":"n2","text":"有 id","at":"2026-11-20T10:00"}]}));
    let rep = project_at(&db, &vault, None).unwrap();
    assert_eq!(rep.written, 1);
    assert_eq!(rep.errors.len(), 1, "缺 id 必须上报，提醒用户数据异常");
    assert!(rep.errors[0].contains("id"));
}