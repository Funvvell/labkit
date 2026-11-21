//! 科研台账（Dashboard 卡片 + 九个子页）的磁盘持久化。
//!
//! 为什么不能只靠 localStorage：WebView2 的 localStorage 会被「清理浏览数据」
//! 一并抹掉，用户拿不到文件、没法备份也没法换机迁移。这里落成一个 JSON 文件，
//! 放在既有会话目录 `~/.liver_portal_crop/` 下，和 ROI / qPCR 会话同一处，
//! 整个目录拷走就等于把全部科研记录带走。
//!
//! 可靠性设计（参考 tauri-plugin-store 的原子写 + eLabFTW 的改动留痕）：
//! * **原子写**：先写同目录临时文件并 `sync_all`，再 `rename` 覆盖。断电/崩溃
//!   只会留下临时文件，主文件要么是旧的要么是新的，不会是半截 JSON。
//! * **滚动备份**：每次覆盖前把旧内容留一份 `.bak`；主文件解析失败时自动回退它。
//! * **写入校验**：只接受 JSON 对象，拒绝数组/标量，避免前端一个 bug 把库清空。

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde_json::{json, Value};

use crate::constants::{DB_FILE_NAME, SESSION_DIR_NAME};
use crate::errors::{AppError, Result};

/// P1 多窗口：读-改-写必须串行。Tauri 命令在线程池并发执行，两个工具窗口
/// 同时 flush 时，不加锁的「读盘→合并→写盘」会互相抹掉对方的键。
static DB_WRITE_LOCK: Mutex<()> = Mutex::new(());

fn write_guard() -> std::sync::MutexGuard<'static, ()> {
    // 中毒（某次写入 panic）不应让台账永久不可写：数据本身有原子写 + .bak 兜底。
    DB_WRITE_LOCK.lock().unwrap_or_else(|e| e.into_inner())
}

/// 台账库文件路径。`LABKIT_DB_DIR` 可覆盖目录，便于测试与便携模式。
pub fn db_path() -> Result<PathBuf> {
    let dir = match std::env::var_os("LABKIT_DB_DIR") {
        Some(d) => PathBuf::from(d),
        None => dirs::home_dir()
            .ok_or_else(|| AppError::Other("无法确定用户主目录".into()))?
            .join(SESSION_DIR_NAME),
    };
    Ok(dir.join(DB_FILE_NAME))
}

fn bak_path(path: &Path) -> PathBuf {
    path.with_extension("json.bak")
}

/// 临时文件名 = 原名 + `.tmp`。不能用 with_extension：那会把 `X.md` 变成
/// `X.json.tmp`，Vault 的 markdown 投影会与别的记录撞名。
fn tmp_path(path: &Path) -> PathBuf {
    let mut s = path.as_os_str().to_os_string();
    s.push(".tmp");
    PathBuf::from(s)
}

/// 接受 JSON 对象，且已知台账键的类型必须正确：
/// 只查 is_object 会让 `{"tasks":"str"}` 通过，随后所有列表页 .slice/.map 崩溃。
/// 未知键放行（向前兼容），已知键类型错一律拒写。
fn validate(data: &Value) -> Result<()> {
    let o = data.as_object().ok_or_else(|| {
        AppError::Other("台账数据必须是 JSON 对象，已拒绝写入以免覆盖现有记录".into())
    })?;
    const ARR: &[&str] = &[
        "projects",
        "tasks",
        "focusRecords",
        "experiments",
        "literatures",
        "reagents",
        "instruments",
        "reminders",
        "budget",
        "bookings",
        "notes",
        "recentSlides",
    ];
    for k in ARR {
        if let Some(v) = o.get(*k) {
            if !v.is_array() {
                return Err(AppError::Other(format!("台账字段 {k} 必须是数组，已拒绝写入")));
            }
        }
    }
    for k in ["_store", "ui"] {
        if let Some(v) = o.get(k) {
            if !v.is_object() {
                return Err(AppError::Other(format!("台账字段 {k} 必须是对象，已拒绝写入")));
            }
        }
    }
    for k in ["_rev", "budgetTotal"] {
        if let Some(v) = o.get(k) {
            if !v.is_number() {
                return Err(AppError::Other(format!("台账字段 {k} 必须是数字，已拒绝写入")));
            }
        }
    }
    if let Some(v) = o.get("isDemo") {
        if !v.is_boolean() {
            return Err(AppError::Other("台账字段 isDemo 必须是布尔，已拒绝写入".into()));
        }
    }
    Ok(())
}

fn parse(text: &str) -> Result<Value> {
    let v: Value = serde_json::from_str(text)?;
    validate(&v)?;
    Ok(v)
}

/// 原子写：临时文件 + fsync + rename。覆盖前保留 `.bak`。
/// 公开给 ROI / qPCR 会话复用，保证它们与台账同一可靠性标准。
pub fn atomic_write(path: &Path, text: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    if path.exists() {
        // 备份失败不该阻断写入，但要留痕：真正的数据是接下来那次 rename。
        if let Err(e) = fs::copy(path, bak_path(path)) {
            tracing::warn!("台账备份失败（继续写入）: {e}");
        }
    }
    atomic_write_no_bak(path, text)
}

/// 同上但不留 `.bak`。给 Markdown Vault 用：那些 .md 是从 JSON 派生的投影，
/// 损坏可直接重建，没必要在用户的 Obsidian 库里堆一倍数量的备份文件。
pub fn atomic_write_no_bak(path: &Path, text: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let tmp = tmp_path(path);
    {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(text.as_bytes())?;
        f.sync_all()?;
    }
    if let Err(e) = fs::rename(&tmp, path) {
        let _ = fs::remove_file(&tmp);
        return Err(AppError::Io(e));
    }
    Ok(())
}

pub fn load_at(path: &Path) -> Result<Option<Value>> {
    match fs::read_to_string(path) {
        Ok(text) => match parse(&text) {
            Ok(v) => Ok(Some(v)),
            Err(e) => {
                tracing::warn!("台账主文件不可用（{e}），尝试 .bak 回退");
                recover_from_bak(path)
            }
        },
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => {
            tracing::warn!("台账读取失败（{e}），尝试 .bak 回退");
            recover_from_bak(path)
        }
    }
}

fn recover_from_bak(path: &Path) -> Result<Option<Value>> {
    let bak = bak_path(path);
    if !bak.exists() {
        return Ok(None);
    }
    let text = fs::read_to_string(&bak)?;
    let v = parse(&text)?;
    // 只读回退，**不**在这里修主文件：atomic_write 会先把损坏的主文件 copy 成 .bak，
    // 那会毁掉唯一的好备份；且 load 路径不持写锁，并发写会互踩。
    // 主文件留待下一次持锁的 save/merge_save 原子覆盖，届时自然修复。
    tracing::warn!("台账主文件损坏，本次从 .bak 回退读取；主文件将在下次保存时修复");
    Ok(Some(v))
}

pub fn save_at(path: &Path, data: &Value) -> Result<()> {
    let _g = write_guard();
    save_at_locked(path, data)
}

/// 调用方已持 DB_WRITE_LOCK 时的整库写（import 复用，避免 std::Mutex 不可重入死锁）。
fn save_at_locked(path: &Path, data: &Value) -> Result<()> {
    validate(data)?;
    atomic_write(path, &serde_json::to_string_pretty(data)?)
}

/// P1 多窗口合并写：锁内读当前盘 → 仅覆盖 `changed` 顶层键 → 原子写 → rev+1。
///
/// * `changed = None`：整库写（旧契约兼容；仍保留盘上 `_rev` 并递增）。
/// * `_store` 键做**二级合并**（逐子键覆盖），不同工具窗口写各自
///   `toolform:<id>` / `pins` / `settings` 互不干扰；子键值为 `null` 视为
///   删除墓碑（前端 `Store.set(k,null)` 与 favs→pins 迁移用它清旧键）。
/// * 其余顶层键整键替换 = 键级 LWW（同键并发编辑后写覆盖，文档明示）。
/// * `_rev` 由本函数独占管理，前端传入值一律忽略。
///
/// 返回写入后的修订号（供 `db-changed` 事件广播）。
pub fn merge_save_at(path: &Path, data: &Value, changed: Option<&[String]>) -> Result<u64> {
    validate(data)?;
    let _g = write_guard();
    let mut base = load_at(path)?.unwrap_or_else(|| json!({}));
    if !base.is_object() {
        base = json!({});
    }
    let old_rev = base.get("_rev").and_then(|v| v.as_u64()).unwrap_or(0);
    match changed {
        None => {
            base = data.clone();
        }
        Some(keys) => {
            let incoming = data.as_object().expect("validate 已保证对象");
            let bo = base.as_object_mut().expect("base 已保证对象");
            for k in keys {
                if k == "_rev" {
                    continue; // 修订号只由 Rust 管理
                }
                if k == "_store" {
                    let cur = bo.entry("_store".to_string()).or_insert_with(|| json!({}));
                    if !cur.is_object() {
                        *cur = json!({});
                    }
                    let co = cur.as_object_mut().expect("刚保证对象");
                    if let Some(Value::Object(inc)) = incoming.get("_store") {
                        for (sk, sv) in inc {
                            if sv.is_null() {
                                co.remove(sk);
                            } else {
                                co.insert(sk.clone(), sv.clone());
                            }
                        }
                    }
                } else if let Some(v) = incoming.get(k) {
                    bo.insert(k.clone(), v.clone());
                } else {
                    bo.remove(k); // 前端删了顶层键 → 盘上同步删除
                }
            }
        }
    }
    let rev = old_rev + 1;
    if let Some(o) = base.as_object_mut() {
        o.insert("_rev".into(), json!(rev));
    }
    atomic_write(path, &serde_json::to_string_pretty(&base)?)?;
    Ok(rev)
}

/// 手动备份到 `backups/labkit_db.<时间戳>.json`，返回备份文件路径。
pub fn backup_at(path: &Path) -> Result<PathBuf> {
    let data = load_at(path)?
        .ok_or_else(|| AppError::Other("还没有台账数据，无需备份".into()))?;
    let dir = path
        .parent()
        .ok_or_else(|| AppError::Other("台账路径没有父目录".into()))?
        .join("backups");
    fs::create_dir_all(&dir)?;
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let dest = dir.join(format!("labkit_db.{stamp}.json"));
    fs::write(&dest, serde_json::to_string_pretty(&data)?)?;
    Ok(dest)
}

pub fn load() -> Result<Option<Value>> {
    load_at(&db_path()?)
}

pub fn save(data: &Value) -> Result<()> {
    save_at(&db_path()?, data)
}

/// P1：合并写（db_save 命令专用），返回新修订号。
pub fn merge_save(data: &Value, changed: Option<&[String]>) -> Result<u64> {
    merge_save_at(&db_path()?, data, changed)
}

pub fn backup() -> Result<PathBuf> {
    backup_at(&db_path()?)
}

/// 另存一份到用户选定的位置（导出/迁移用）。
pub fn export_at(path: &Path, dest: &Path) -> Result<PathBuf> {
    let data = load_at(path)?
        .ok_or_else(|| AppError::Other("还没有台账数据，无需导出".into()))?;
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(dest, serde_json::to_string_pretty(&data)?)?;
    Ok(dest.to_path_buf())
}

/// 从外部文件导入：先校验再落盘，导入前自动备份现有数据。
/// P1：锁内进行；修订号延续盘上序列 +1（导入文件的 _rev 一律忽略），
/// 保证其它窗口的聚焦对账与 db-changed 广播语义一致。
pub fn import_at(path: &Path, src: &Path) -> Result<Value> {
    let text = fs::read_to_string(src)?;
    let mut data = parse(&text)?;
    let _g = write_guard();
    if path.exists() && load_at(path)?.is_some() {
        // 有数据时备份失败必须中止，不能「继续导入」覆盖掉唯一副本。
        backup_at(path)?;
    }
    let old_rev = load_at(path)?
        .and_then(|v| v.get("_rev").and_then(|r| r.as_u64()))
        .unwrap_or(0);
    if let Some(o) = data.as_object_mut() {
        o.insert("_rev".into(), json!(old_rev + 1));
    }
    save_at_locked(path, &data)?;
    Ok(data)
}

pub fn export_to(dest: &Path) -> Result<PathBuf> {
    export_at(&db_path()?, dest)
}

pub fn import_from(src: &Path) -> Result<Value> {
    import_at(&db_path()?, src)
}

/// 清空台账：先备份再删主文件与 `.bak`，返回备份路径供前端提示。
pub fn reset() -> Result<Option<PathBuf>> {
    let path = db_path()?;
    let _g = write_guard();
    // 备份失败必须中止：否则磁盘满等场景下会无备份删库。无数据时才允许免备份重置。
    let bak = if load_at(&path)?.is_some() {
        Some(backup_at(&path)?)
    } else {
        None
    };
    if path.exists() {
        fs::remove_file(&path)?;
    }
    let b = bak_path(&path);
    if b.exists() {
        fs::remove_file(&b)?;
    }
    Ok(bak)
}

/// 给设置页展示：文件在哪、多大、上次什么时候写的。
pub fn info() -> Result<Value> {
    let path = db_path()?;
    let (exists, bytes, modified) = match fs::metadata(&path) {
        Ok(m) => {
            let ts = m
                .modified()
                .ok()
                .map(|t| chrono::DateTime::<chrono::Local>::from(t).format("%Y-%m-%d %H:%M:%S").to_string())
                .unwrap_or_default();
            (true, m.len(), ts)
        }
        Err(_) => (false, 0, String::new()),
    };
    let backups = path
        .parent()
        .map(|p| p.join("backups"))
        .filter(|p| p.exists())
        .map(|p| fs::read_dir(p).map(|d| d.count()).unwrap_or(0))
        .unwrap_or(0);
    Ok(json!({
        "path": path.to_string_lossy(),
        "exists": exists,
        "bytes": bytes,
        "modified": modified,
        "backups": backups,
    }))
}