//! 台账 Markdown Vault —— 一条记录一个 `.md`（YAML frontmatter + 正文）。
//!
//! 为什么要有它：台账原本只存在 `labkit_db.json` 里，用户拿到的是一坨私有 JSON，
//! 换任何软件都用不了。Vault 把每条记录落成人类可读、Obsidian 可直接打开编辑的
//! markdown 文件，成为**对外的权威数据**；JSON 退为内部索引与崩溃快照。
//!
//! 可靠性边界（刻意与 store.rs 一致）：
//! * 投影发生在 `merge_save` **成功之后**，且从盘上重读已提交的 JSON 作为源。
//!   Vault 写失败只记进 report，绝不回滚已提交的 JSON。
//! * 每个 md 走 tmp + fsync + rename 原子写，但不留 `.bak`——它们是派生物，
//!   损坏可从 JSON 重建，没必要在用户的 Obsidian 库里堆一倍备份文件。
//! * 记录靠 frontmatter 里的稳定 `id` 匹配，**不靠文件名**。用户在 Obsidian 里
//!   重命名文件不会产生孤儿，改名也不会丢记录。
//!
//! 确定性：投影输出不含时间戳等派生字段，同一条记录永远渲染出同样的字节，
//! 这样 sha256 才能跳过未变记录，不在用户的库里制造无意义的文件改动。

use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use yaml_rust2::{Yaml, YamlLoader};

use crate::errors::{AppError, Result};
use crate::store;

/// 整个 sync pass 串行化。
///
/// **锁序不变式：只允许 VAULT_LOCK → DB_WRITE_LOCK，绝不反向。**
/// 摄入持 VAULT_LOCK 期间会调 `merge_save_at`（内部取 DB 写锁）；而 `db_save`
/// 是先让 `merge_save` 取完并释放 DB 写锁，再取 VAULT_LOCK 投影。两条路径都是
/// 同向或顺序取锁，不存在环，因此不会死锁。
static VAULT_LOCK: Mutex<()> = Mutex::new(());

fn vault_guard() -> std::sync::MutexGuard<'static, ()> {
    VAULT_LOCK.lock().unwrap_or_else(|e| e.into_inner())
}

pub const SCHEMA: u32 = 1;
const META_DIR: &str = ".labkit";
const TRASH_DIR: &str = ".labkit/trash";
const CONFLICT_DIR: &str = ".labkit/conflicts";

/* ===================== 实体映射表 =====================
   frontmatter 的 key 与 DB 字段同名同值，Obsidian Dataview 可直接查询。
   字段顺序固定 → 输出字节确定 → hash 跳过才有意义。 */

#[derive(Clone, Copy, PartialEq, Eq)]
enum Ty {
    Str,
    Num,
    Bool,
    List,
    /// 出入库流水：对象数组，走嵌套 YAML（md 表格太脆，用户改竖线就坏）
    Moves,
}

struct Kind {
    /// DB 顶层数组键
    key: &'static str,
    /// frontmatter 的 kind 值
    slug: &'static str,
    /// Vault 子目录名（中文，与 UI 一致）
    dir: &'static str,
    label: fn(&Value) -> String,
    fields: &'static [(&'static str, Ty)],
    /// 映射到正文 markdown 的 DB 字段
    body: Option<&'static str>,
    /// 由特殊规则处理、不走普通字段循环的 DB 键
    special: &'static [&'static str],
}

fn s(v: &Value, k: &str) -> String {
    v.get(k).and_then(|x| x.as_str()).unwrap_or("").to_string()
}

fn head_chars(v: &str, n: usize) -> String {
    v.chars().take(n).collect()
}

static KINDS: &[Kind] = &[
    Kind {
        key: "tasks", slug: "task", dir: "任务", label: |r| s(r, "name"),
        fields: &[("name", Ty::Str), ("pri", Ty::Str), ("state", Ty::Str), ("done", Ty::Bool),
            ("due", Ty::Str), ("dueDate", Ty::Str), ("proj", Ty::Str), ("exp", Ty::Str),
            ("key", Ty::Bool), ("tags", Ty::List)],
        body: None, special: &[],
    },
    Kind {
        key: "projects", slug: "project", dir: "项目", label: |r| s(r, "name"),
        fields: &[("name", Ty::Str), ("code", Ty::Str), ("owner", Ty::Str), ("start", Ty::Str),
            ("end", Ty::Str), ("stage", Ty::Str), ("progress", Ty::Num), ("risk", Ty::Str)],
        body: Some("milestones"), special: &["milestones"],
    },
    Kind {
        key: "experiments", slug: "exp", dir: "实验", label: |r| s(r, "id"),
        fields: &[("proj", Ty::Str), ("type", Ty::Str), ("date", Ty::Str), ("who", Ty::Str), ("status", Ty::Str)],
        body: Some("note"), special: &[],
    },
    Kind {
        key: "literatures", slug: "lit", dir: "文献", label: |r| s(r, "title"),
        fields: &[("title", Ty::Str), ("meta", Ty::Str), ("status", Ty::Str), ("doi", Ty::Str),
            ("zoteroKey", Ty::Str), ("zoteroUrl", Ty::Str)],
        body: Some("note"), special: &[],
    },
    Kind {
        key: "reagents", slug: "reagent", dir: "试剂", label: |r| s(r, "name"),
        fields: &[("name", Ty::Str), ("no", Ty::Str), ("lot", Ty::Str), ("loc", Ty::Str),
            ("open", Ty::Str), ("exp", Ty::Str), ("category", Ty::Str), ("spec", Ty::Str),
            ("quantity", Ty::Num), ("unit", Ty::Str), ("min_stock", Ty::Num),
            ("supplier", Ty::Str), ("movements", Ty::Moves)],
        body: Some("notes"), special: &["left"],
    },
    Kind {
        key: "instruments", slug: "instrument", dir: "仪器", label: |r| s(r, "name"),
        fields: &[("name", Ty::Str), ("cal", Ty::Str), ("next", Ty::Str)],
        body: Some("note"), special: &[],
    },
    Kind {
        key: "bookings", slug: "booking", dir: "预约",
        label: |r| format!("{} {}", s(r, "inst"), s(r, "date")).trim().to_string(),
        fields: &[("inst", Ty::Str), ("date", Ty::Str), ("slot", Ty::Str), ("who", Ty::Str), ("proj", Ty::Str)],
        body: None, special: &[],
    },
    Kind {
        key: "budget", slug: "budget", dir: "经费", label: |r| s(r, "item"),
        fields: &[("item", Ty::Str), ("cat", Ty::Str), ("amount", Ty::Num), ("date", Ty::Str)],
        body: Some("note"), special: &[],
    },
    Kind {
        key: "notes", slug: "note", dir: "速记", label: |r| head_chars(&s(r, "text"), 20),
        fields: &[("at", Ty::Str)],
        body: Some("text"), special: &[],
    },
    Kind {
        key: "reminders", slug: "reminder", dir: "提醒", label: |r| s(r, "text"),
        fields: &[("text", Ty::Str), ("date", Ty::Str)],
        body: None, special: &["color"],
    },
    Kind {
        key: "focusRecords", slug: "focus", dir: "专注",
        // 只取日期部分：时间里的冒号会被映射成全角，文件名反而难读
        label: |r| format!("{} {}", s(r, "project"), head_chars(&s(r, "at"), 10)).trim().to_string(),
        fields: &[("project", Ty::Str), ("type", Ty::Str), ("minutes", Ty::Num), ("at", Ty::Str)],
        body: None, special: &[],
    },
];

fn kind_by_slug(slug: &str) -> Option<&'static Kind> {
    KINDS.iter().find(|k| k.slug == slug)
}

fn kind_by_key(key: &str) -> Option<&'static Kind> {
    KINDS.iter().find(|k| k.key == key)
}

/// 已由表头/字段表/特殊规则/正文覆盖的 DB 键；其余键按未知字段原样保留。
fn known_keys(k: &Kind) -> BTreeSet<&'static str> {
    let mut set: BTreeSet<&'static str> = BTreeSet::from(["id"]);
    for (n, _) in k.fields {
        set.insert(*n);
    }
    for n in k.special {
        set.insert(*n);
    }
    if let Some(b) = k.body {
        set.insert(b);
    }
    set
}

/* ===================== 语义脱耦 ===================== */

/// 提醒的紧急程度：DB 里存的是 CSS 变量字符串（UI 耦合），
/// Vault 里换成语义值，别的软件才看得懂。
fn priority_of(color: &str) -> &'static str {
    match color {
        "var(--red)" => "urgent",
        "var(--orange)" => "warn",
        _ => "normal",
    }
}

fn color_of(priority: &str) -> &'static str {
    match priority {
        "urgent" => "var(--red)",
        "warn" => "var(--orange)",
        _ => "var(--accent)",
    }
}

/// 试剂是否按 quantity+unit 计量。计量时 left 是派生字符串，不写进 frontmatter，
/// 避免两个字段在投影/摄入之间来回打架（前端同一规则见 db.js reagentSyncLeft）。
fn tracked(rec: &Value) -> bool {
    match rec.get("quantity") {
        Some(Value::Number(_)) => true,
        Some(Value::String(t)) => !t.is_empty(),
        _ => false,
    }
}

fn derive_left(rec: &Value) -> String {
    let q = match rec.get("quantity") {
        Some(Value::Number(n)) => n.to_string(),
        Some(Value::String(t)) => t.clone(),
        _ => String::new(),
    };
    format!("{q}{}", s(rec, "unit"))
}

/* ===================== 确定性 JSON 与哈希 ===================== */

/// 递归按 key 排序。serde_json 的 Map 在 preserve_order 特性下是插入序，
/// 显式排序才能保证哈希不受特性开关与写入顺序影响。
fn canonical(v: &Value) -> Value {
    match v {
        Value::Object(m) => {
            let mut keys: Vec<&String> = m.keys().collect();
            keys.sort();
            let mut out = Map::new();
            for k in keys {
                out.insert(k.clone(), canonical(&m[k]));
            }
            Value::Object(out)
        }
        Value::Array(a) => Value::Array(a.iter().map(canonical).collect()),
        _ => v.clone(),
    }
}

fn sha256(text: &str) -> String {
    let mut h = Sha256::new();
    h.update(text.as_bytes());
    format!("{:x}", h.finalize())
}

fn json_hash(v: &Value) -> String {
    sha256(&serde_json::to_string(&canonical(v)).unwrap_or_default())
}

/* ===================== YAML ↔ JSON ===================== */

fn yaml_to_json(y: &Yaml) -> Value {
    match y {
        // yaml-rust2 把浮点存成字符串，按需解析
        Yaml::Real(t) => t
            .parse::<f64>()
            .ok()
            .and_then(serde_json::Number::from_f64)
            .map(Value::Number)
            .unwrap_or_else(|| json!(t)),
        Yaml::Integer(i) => json!(i),
        Yaml::String(t) => json!(t),
        Yaml::Boolean(b) => json!(b),
        Yaml::Array(a) => Value::Array(a.iter().map(yaml_to_json).collect()),
        Yaml::Hash(h) => {
            let mut m = Map::new();
            for (k, v) in h {
                if let Some(ks) = k.as_str() {
                    m.insert(ks.to_string(), yaml_to_json(v));
                }
            }
            Value::Object(m)
        }
        _ => Value::Null, // Null / Alias / BadValue
    }
}

/// 按 schema 声明的类型收敛 YAML 解析结果。
/// 我们自己输出时字符串一律带引号，但用户手改可能去掉引号：
/// `007` 会被 YAML 1.2 解析成整数 7、`2026-11-05` 可能被当成别的标量，
/// 这里按字段类型拉回来，保证往返保真。
fn coerce(v: Value, ty: Ty) -> Value {
    if v.is_null() {
        return Value::Null;
    }
    match ty {
        Ty::Str => match &v {
            Value::String(_) => v,
            Value::Number(n) => json!(n.to_string()),
            Value::Bool(b) => json!(b.to_string()),
            _ => v,
        },
        Ty::Num => match &v {
            Value::Number(_) => v,
            Value::String(t) => {
                let t = t.trim();
                // 先试整数：80 不能变成 80.0，否则与 DB 里的整数不深相等
                if let Ok(i) = t.parse::<i64>() {
                    return json!(i);
                }
                if let Ok(f) = t.parse::<f64>() {
                    if let Some(n) = serde_json::Number::from_f64(f) {
                        return Value::Number(n);
                    }
                }
                v
            }
            Value::Bool(b) => json!(if *b { 1 } else { 0 }),
            _ => v,
        },
        Ty::Bool => match &v {
            Value::Bool(_) => v,
            Value::String(t) => json!(matches!(t.as_str(), "true" | "yes" | "1")),
            Value::Number(n) => json!(n.as_i64().unwrap_or(0) != 0),
            _ => v,
        },
        Ty::List => match v {
            Value::Array(_) => v,
            other => Value::Array(vec![other]),
        },
        Ty::Moves => match v {
            Value::Array(a) => Value::Array(
                a.into_iter()
                    .filter(|x| x.is_object())
                    .map(|mut x| {
                        if let Some(m) = x.as_object_mut() {
                            if let Some(d) = m.get("delta").cloned() {
                                m.insert("delta".into(), coerce(d, Ty::Num));
                            }
                        }
                        x
                    })
                    .collect(),
            ),
            _ => Value::Array(vec![]),
        },
    }
}

/* ===================== frontmatter 输出 =====================
   字符串一律用 JSON 转义后加双引号：JSON 的转义集（\" \\ \n \r \t \b \f \uXXXX）
   是 YAML 双引号转义的子集，天然合法，且防住前导零 / 日期 / 百分号被误解析。 */

fn scalar(v: &Value) -> Option<String> {
    match v {
        Value::String(_) => serde_json::to_string(v).ok(),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Null => Some("null".into()),
        Value::Array(a) if a.is_empty() => Some("[]".into()),
        Value::Object(m) if m.is_empty() => Some("{}".into()),
        _ => None,
    }
}

fn emit_node(out: &mut String, v: &Value, ind: usize) {
    let pad = " ".repeat(ind);
    match v {
        Value::Array(a) => {
            for item in a {
                match item {
                    // 对象数组用 `- key: …` 起头，后续键对齐到 ind+2
                    Value::Object(m) => emit_map(out, m, ind + 2, &format!("{pad}- ")),
                    _ => out.push_str(&format!("{pad}- {}\n", scalar(item).unwrap_or_default())),
                }
            }
        }
        Value::Object(m) => emit_map(out, m, ind, ""),
        _ => out.push_str(&format!("{pad}{}\n", scalar(v).unwrap_or_default())),
    }
}

fn emit_map(out: &mut String, m: &Map<String, Value>, ind: usize, head: &str) {
    let pad = " ".repeat(ind);
    for (i, (k, v)) in m.iter().enumerate() {
        let lead = if i == 0 && !head.is_empty() { head.to_string() } else { pad.clone() };
        emit_field(out, &lead, k, v, ind);
    }
}

/// 键名是否需要加引号。
///
/// YAML 1.1 把 `no` / `yes` / `on` / `off` / `y` / `n` 当布尔字面量——试剂的货号字段
/// 正好叫 `no`，不加引号会被 PyYAML 这类 1.1 解析器读成布尔键 `False`，字段直接消失。
/// yaml-rust2 走 1.2 不会踩，所以自家人往返测不出来，必须靠第三方解析器验。
fn key_needs_quotes(k: &str) -> bool {
    const AMBIGUOUS: &[&str] = &["y", "n", "yes", "no", "true", "false", "on", "off", "null", "~"];
    if AMBIGUOUS.iter().any(|x| k.eq_ignore_ascii_case(x)) {
        return true;
    }
    // 非标识符样式的键（含空格/标点/以数字开头）一律加引号，避免各解析器分歧
    let mut chars = k.chars();
    match chars.next() {
        None => return true,
        Some(c) if !(c.is_ascii_alphabetic() || c == '_') => return true,
        _ => {}
    }
    !k.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
}

fn emit_field(out: &mut String, lead: &str, name: &str, v: &Value, ind: usize) {
    let key = if key_needs_quotes(name) { q(name) } else { name.to_string() };
    match scalar(v) {
        Some(t) => out.push_str(&format!("{lead}{key}: {t}\n")),
        None => {
            out.push_str(&format!("{lead}{key}:\n"));
            emit_node(out, v, ind + 2);
        }
    }
}

fn q(t: &str) -> String {
    serde_json::to_string(t).unwrap_or_else(|_| "\"\"".into())
}

fn render_body(k: &Kind, rec: &Value) -> String {
    let Some(bf) = k.body else { return String::new() };
    if k.slug == "project" {
        // 里程碑 → Obsidian 可直接勾选的 task list。
        // 空数组也要留下标题：标题在 = 字段存在，标题不在 = 字段缺省，
        // 这样 `milestones: []` 与「没有里程碑字段」才能区分开。
        let Some(ms) = rec.get(bf).and_then(|v| v.as_array()) else { return String::new() };
        let mut b = String::from("## 里程碑\n\n");
        for m in ms {
            let a = m.as_array();
            let name = a.and_then(|x| x.first()).and_then(|x| x.as_str()).unwrap_or("");
            let done = a.and_then(|x| x.get(1)).and_then(|x| x.as_i64()).unwrap_or(0) != 0;
            b.push_str(&format!("- [{}] {}\n", if done { 'x' } else { ' ' }, name));
        }
        return b;
    }
    let t = s(rec, bf);
    if t.trim().is_empty() {
        return String::new();
    }
    format!("{}\n", t.trim_end_matches('\n'))
}

/// 记录 → markdown。输出**不含时间戳**，同一记录永远同样字节。
fn render_md(k: &Kind, rec: &Value) -> String {
    let mut out = String::from("---\n");
    out.push_str(&format!("id: {}\n", q(&s(rec, "id"))));
    out.push_str(&format!("kind: {}\n", q(k.slug)));
    out.push_str(&format!("labkit_schema: {SCHEMA}\n"));

    for (name, ty) in k.fields {
        if let Some(v) = rec.get(*name) {
            emit_field(&mut out, "", name, &coerce(v.clone(), *ty), 0);
        }
    }

    match k.slug {
        "reagent" => {
            if !tracked(rec) {
                if let Some(v) = rec.get("left") {
                    emit_field(&mut out, "", "left", v, 0);
                }
            }
        }
        "reminder" => {
            let color = s(rec, "color");
            out.push_str(&format!("priority: {}\n", q(priority_of(&color))));
            // 非标准 color 原样保留，摄入时优先用它，保证未知值不丢
            if !color.is_empty() && color != color_of(priority_of(&color)) {
                emit_field(&mut out, "", "color", &json!(color), 0);
            }
        }
        _ => {}
    }

    // 正文为空但字段存在 → frontmatter 留一个空值标记。
    // 绝不能把「空字符串」归一化成「字段缺省」：home.js 直接 esc(e.note)，
    // 缺省会在实验/仪器表格里渲染成字面量 "undefined"。
    if let Some(bf) = k.body {
        if k.slug != "project" && render_body(k, rec).is_empty() {
            if let Some(v) = rec.get(bf) {
                emit_field(&mut out, "", bf, v, 0);
            }
        }
    }

    // 未知字段原样保留（向前兼容），排序输出保证确定性
    let known = known_keys(k);
    if let Some(m) = rec.as_object() {
        let mut extra: Vec<&String> = m.keys().filter(|x| !known.contains(x.as_str())).collect();
        extra.sort();
        for name in extra {
            emit_field(&mut out, "", name, &m[name], 0);
        }
    }

    out.push_str("---\n");
    let body = render_body(k, rec);
    if !body.is_empty() {
        out.push('\n');
        out.push_str(&body);
    }
    out
}

/* ===================== markdown → 记录 ===================== */

fn split_frontmatter(text: &str) -> Option<(&str, &str)> {
    let t = text.strip_prefix("---\n").or_else(|| text.strip_prefix("---\r\n"))?;
    let mut idx = 0usize;
    for line in t.split_inclusive('\n') {
        let bare = line.trim_end_matches(['\r', '\n']);
        if bare == "---" || bare == "..." {
            return Some((&t[..idx], &t[idx + line.len()..]));
        }
        idx += line.len();
    }
    None
}

fn parse_milestones(body: &str) -> Vec<Value> {
    let mut out = Vec::new();
    for line in body.lines() {
        let t = line.trim();
        let Some(rest) = t.strip_prefix("- [") else { continue };
        let Some(ch) = rest.chars().next() else { continue };
        let done = ch == 'x' || ch == 'X';
        let Some(name) = rest[ch.len_utf8()..].strip_prefix(']') else { continue };
        let name = name.trim();
        if name.is_empty() {
            continue;
        }
        out.push(json!([name, if done { 1 } else { 0 }]));
    }
    out
}

/// markdown → 记录。正文非空时正文优先；正文为空则回落到 frontmatter 里的
/// 空值标记，从而严格区分「字段为空字符串」与「字段缺省」——两者在 UI 上不等价。
fn parse_md(k: &Kind, text: &str) -> Result<Value> {
    let (fm, body) = split_frontmatter(text)
        .ok_or_else(|| AppError::Other("缺少 YAML frontmatter（--- 包裹块）".into()))?;
    let docs = YamlLoader::load_from_str(fm)
        .map_err(|e| AppError::Other(format!("frontmatter 解析失败：{e}")))?;
    let doc = docs.into_iter().next().unwrap_or(Yaml::Null);
    let parsed = yaml_to_json(&doc);
    let obj = parsed
        .as_object()
        .ok_or_else(|| AppError::Other("frontmatter 必须是键值映射".into()))?;

    let id = obj.get("id").and_then(|v| v.as_str()).unwrap_or("");
    if id.is_empty() {
        return Err(AppError::Other("frontmatter 缺少 id".into()));
    }
    let mut rec = Map::new();
    rec.insert("id".into(), json!(id));

    for (name, ty) in k.fields {
        if let Some(v) = obj.get(*name) {
            rec.insert((*name).into(), coerce(v.clone(), *ty));
        }
    }

    match k.slug {
        "reagent" => {
            let partial = Value::Object(rec.clone());
            if tracked(&partial) {
                rec.insert("left".into(), json!(derive_left(&partial)));
            } else if let Some(v) = obj.get("left") {
                rec.insert("left".into(), coerce(v.clone(), Ty::Str));
            }
        }
        "reminder" => {
            if let Some(c) = obj.get("color").and_then(|v| v.as_str()) {
                rec.insert("color".into(), json!(c));
            } else {
                let p = obj.get("priority").and_then(|v| v.as_str()).unwrap_or("normal");
                rec.insert("color".into(), json!(color_of(p)));
            }
        }
        _ => {}
    }

    let known = known_keys(k);
    for (name, v) in obj {
        // kind / labkit_schema / priority 是 frontmatter 侧的派生或元信息，不回写记录
        if matches!(name.as_str(), "kind" | "labkit_schema" | "priority") || known.contains(name.as_str()) {
            continue;
        }
        rec.insert(name.clone(), v.clone());
    }

    if let Some(bf) = k.body {
        if k.slug == "project" {
            // 标题在 = 字段存在（哪怕是空数组），标题不在 = 字段缺省
            if body.lines().any(|l| l.trim() == "## 里程碑") {
                rec.insert(bf.into(), Value::Array(parse_milestones(body)));
            }
        } else {
            let t = body.trim();
            if !t.is_empty() {
                rec.insert(bf.into(), json!(t));
            } else if let Some(v) = obj.get(bf) {
                rec.insert(bf.into(), v.clone());
            }
        }
    }

    Ok(Value::Object(rec))
}

/* ===================== 文件名 ===================== */

/// Windows 非法字符映射成全角等价字符，保住中文可读性（直接删字会让用户认不出）。
fn sanitize(label: &str) -> String {
    let mapped: String = label
        .chars()
        .map(|c| match c {
            '\\' => '＼', '/' => '／', ':' => '：', '*' => '＊', '?' => '？',
            '"' => '＂', '<' => '＜', '>' => '＞', '|' => '｜',
            c if (c as u32) < 0x20 => ' ',
            c => c,
        })
        .collect();
    let mut out: String = mapped.trim().trim_end_matches(['.', ' ']).chars().take(80).collect();
    if out.is_empty() {
        out = "未命名".into();
    }
    const RESERVED: &[&str] = &[
        "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7",
        "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
    ];
    let stem = out.split('.').next().unwrap_or("").to_ascii_uppercase();
    if RESERVED.contains(&stem.as_str()) {
        out = format!("_{out}");
    }
    out
}

/* ===================== 索引 ===================== */

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Entry {
    pub kind: String,
    /// 相对 Vault 根的路径（用户在 Obsidian 里重命名后由摄入更新）
    pub path: String,
    pub label: String,
    #[serde(rename = "fileHash")]
    pub file_hash: String,
    #[serde(rename = "jsonHash")]
    pub json_hash: String,
    #[serde(rename = "mtimeMs")]
    pub mtime_ms: u64,
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct Index {
    pub schema: u32,
    pub files: BTreeMap<String, Entry>,
    #[serde(default, rename = "lastSync")]
    pub last_sync: String,
    #[serde(default)]
    pub errors: Vec<String>,
}

fn index_path(vault: &Path) -> PathBuf {
    vault.join(META_DIR).join("index.json")
}

/// 索引丢失或损坏一律当空索引：全量扫描即可幂等重建，不能因此阻断台账。
fn read_index(vault: &Path) -> Index {
    let p = index_path(vault);
    let Ok(text) = fs::read_to_string(&p) else { return Index { schema: SCHEMA, ..Default::default() } };
    serde_json::from_str::<Index>(&text).unwrap_or(Index { schema: SCHEMA, ..Default::default() })
}

fn write_index(vault: &Path, idx: &Index) -> Result<()> {
    store::atomic_write_no_bak(&index_path(vault), &serde_json::to_string_pretty(idx)?)
}

fn mtime_ms(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn now_stamp() -> String {
    chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

/// 软删除：移到 `.labkit/trash/`，用户可手工找回。绝不硬删用户的记录文件。
fn trash(vault: &Path, rel: &str, rep: &mut ProjectReport) {
    let src = vault.join(rel);
    if !src.exists() {
        return;
    }
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let name = src.file_name().map(|x| x.to_string_lossy().into_owned()).unwrap_or_else(|| "record.md".into());
    let dest = vault.join(TRASH_DIR).join(format!("{stamp}-{name}"));
    if let Err(e) = fs::create_dir_all(dest.parent().unwrap_or(vault)).and_then(|_| fs::rename(&src, &dest)) {
        rep.errors.push(format!("移入回收站失败 {rel}：{e}"));
    } else {
        rep.trashed += 1;
    }
}

/* ===================== 配置 ===================== */

#[derive(Debug, Clone)]
pub struct Cfg {
    pub enabled: bool,
    pub dir: String,
}

/// 配置存在 `DB._store.vault`，随台账原子写与多窗口合并同步，不另立配置文件。
pub fn config_at(db: &Path) -> Result<Option<Cfg>> {
    let Some(data) = store::load_at(db)? else { return Ok(None) };
    let v = data.get("_store").and_then(|x| x.get("vault"));
    let Some(v) = v else { return Ok(None) };
    let dir = v.get("dir").and_then(|x| x.as_str()).unwrap_or("").to_string();
    let enabled = v.get("enabled").and_then(|x| x.as_bool()).unwrap_or(false);
    if dir.is_empty() {
        return Ok(None);
    }
    Ok(Some(Cfg { enabled, dir }))
}

pub fn config() -> Result<Option<Cfg>> {
    config_at(&store::db_path()?)
}

/// 从已读入的台账 JSON 里取启用的 Vault 目录（未启用/未配置返回 None）。
/// 给 db_save 用：一次读盘同时拿到配置与投影源。
pub fn dir_from_data(data: &Value) -> Option<PathBuf> {
    let v = data.get("_store")?.get("vault")?;
    if !v.get("enabled").and_then(|x| x.as_bool()).unwrap_or(false) {
        return None;
    }
    let dir = v.get("dir").and_then(|x| x.as_str()).unwrap_or("");
    if dir.is_empty() { None } else { Some(PathBuf::from(dir)) }
}

/// 启用的 Vault 根目录；未启用返回 None。
pub fn active_dir_at(db: &Path) -> Result<Option<PathBuf>> {
    Ok(config_at(db)?.filter(|c| c.enabled).map(|c| PathBuf::from(c.dir)))
}

pub fn active_dir() -> Result<Option<PathBuf>> {
    active_dir_at(&store::db_path()?)
}

fn write_cfg(db: &Path, cfg: &Cfg) -> Result<u64> {
    store::merge_save_at(
        db,
        &json!({"_store": {"vault": {"enabled": cfg.enabled, "dir": cfg.dir}}}),
        Some(&["_store".to_string()]),
    )
}

/* ===================== 投影 ===================== */

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct ProjectReport {
    pub written: usize,
    pub skipped: usize,
    pub trashed: usize,
    pub errors: Vec<String>,
}

/// 稳定文件名规划：
/// * label 未变且文件仍在 → 沿用索引里的路径（**尊重用户在 Obsidian 里的重命名**）；
/// * 其余按 sanitize(label) 分组，同组按 id 排序分配 ` ` / ` 2` / ` 3` 后缀。
///   按 id 而非数组顺序分配，新增记录 unshift 到队首也不会让既有文件集体改名。
fn plan_names(k: &Kind, arr: &[Value], idx: &Index, vault: &Path) -> BTreeMap<String, String> {
    let mut out = BTreeMap::new();
    let mut occupied: BTreeSet<String> = BTreeSet::new();
    let mut pending: Vec<(String, String)> = Vec::new(); // (id, base)

    for rec in arr {
        let id = s(rec, "id");
        if id.is_empty() {
            continue;
        }
        let label = (k.label)(rec);
        if let Some(e) = idx.files.get(&id) {
            if e.label == label && vault.join(&e.path).exists() {
                out.insert(id, e.path.clone());
                occupied.insert(e.path.clone());
                continue;
            }
        }
        pending.push((id, sanitize(&label)));
    }

    let mut groups: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for (id, base) in pending {
        groups.entry(base).or_default().push(id);
    }
    for (base, mut ids) in groups {
        ids.sort();
        for (n, id) in ids.iter().enumerate() {
            let mut suffix = if n == 0 { String::new() } else { format!(" {}", n + 1) };
            let mut rel = format!("{}/{base}{suffix}.md", k.dir);
            while occupied.contains(&rel) {
                suffix = if suffix.is_empty() { " 2".to_string() } else { format!(" {}", suffix.trim().parse::<usize>().unwrap_or(1) + 1) };
                rel = format!("{}/{base}{suffix}.md", k.dir);
            }
            occupied.insert(rel.clone());
            out.insert(id.clone(), rel);
        }
    }
    out
}

/// JSON → Vault。`kinds` 为 None 时投影全部 11 类；否则只投影指定的 DB 键或 kind。
///
/// 源是**盘上已提交的 JSON**（不是调用方的内存态），并发写时后一次投影天然覆盖
/// 前一次；配合 hash 跳过不会写出旧内容。
pub fn project_at(db: &Path, vault: &Path, kinds: Option<&[String]>) -> Result<ProjectReport> {
    let data = store::load_at(db)?.unwrap_or_else(|| json!({}));
    project_data_at(vault, &data, kinds)
}

/// 同 `project_at`，但复用调用方已读入的已提交 JSON，省一次读盘。
/// 调用方必须保证 `data` 来自盘上（merge_save 之后），不能传前端内存态。
pub fn project_data_at(vault: &Path, data: &Value, kinds: Option<&[String]>) -> Result<ProjectReport> {
    let _g = vault_guard();
    let mut idx = read_index(vault);
    let mut rep = ProjectReport::default();

    for k in KINDS {
        if let Some(ks) = kinds {
            if !ks.iter().any(|x| x == k.key || x == k.slug) {
                continue;
            }
        }
        let arr = data.get(k.key).and_then(|v| v.as_array()).cloned().unwrap_or_default();
        let names = plan_names(k, &arr, &idx, vault);
        let mut live: BTreeSet<String> = BTreeSet::new();

        for rec in &arr {
            let id = s(rec, "id");
            if id.is_empty() {
                rep.errors.push(format!("{} 有记录缺少 id，已跳过", k.key));
                continue;
            }
            live.insert(id.clone());
            let Some(rel) = names.get(&id) else { continue };
            let text = render_md(k, rec);
            let fh = sha256(&text);
            let jh = json_hash(rec);
            let abs = vault.join(rel);
            let prev = idx.files.get(&id).cloned();

            if let Some(p) = &prev {
                if p.file_hash == fh && p.path == *rel && abs.exists() {
                    rep.skipped += 1;
                    continue;
                }
                if p.path != *rel {
                    trash(vault, &p.path, &mut rep);
                }
            }

            match store::atomic_write_no_bak(&abs, &text) {
                Ok(()) => {
                    idx.files.insert(id.clone(), Entry {
                        kind: k.slug.into(),
                        path: rel.clone(),
                        label: (k.label)(rec),
                        file_hash: fh,
                        json_hash: jh,
                        mtime_ms: mtime_ms(&abs),
                    });
                    rep.written += 1;
                }
                Err(e) => {
                    // 不更新索引 → 下次投影自动重试；JSON 已提交的数据不受影响
                    rep.errors.push(format!("写入 {rel} 失败：{e}"));
                }
            }
        }

        let gone: Vec<String> = idx.files.iter()
            .filter(|(id, e)| e.kind == k.slug && !live.contains(*id))
            .map(|(id, _)| id.clone())
            .collect();
        for id in gone {
            if let Some(e) = idx.files.remove(&id) {
                trash(vault, &e.path, &mut rep);
            }
        }
    }

    idx.schema = SCHEMA;
    idx.last_sync = now_stamp();
    idx.errors = rep.errors.clone();
    // 索引写失败同样只上报：Vault 的任何问题都不能影响已提交的台账
    if let Err(e) = write_index(vault, &idx) {
        rep.errors.push(format!("写入 Vault 索引失败：{e}"));
    }
    Ok(rep)
}

/* ===================== 摄入（Vault → JSON） =====================
   用户在 Obsidian 里改了 md，LabKit 要读回来，且**外部编辑优先**。
   判定靠 content hash，mtime 只作快筛（避免每次聚焦都读全部文件）。 */

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct IngestReport {
    /// 采纳的外部编辑与新记录数
    pub ingested: usize,
    /// 外部删除传播到台账的记录数
    pub removed: usize,
    /// 双改冲突的记录 id（本地版已留存到 .labkit/conflicts/）
    pub conflicts: Vec<String>,
    /// 用户重命名文件（只更新索引路径，不动内容）
    pub renamed: usize,
    /// 无 frontmatter / 无 id / 未知 kind 的文件，忽略且不动
    pub skipped: usize,
    pub errors: Vec<String>,
    /// 本次摄入改动的 DB 顶层键
    pub changed: Vec<String>,
    pub rev: u64,
}

/// 只读 frontmatter 头拿 id 与 kind，不做完整记录解析。
fn peek(text: &str) -> Option<(String, String)> {
    let (fm, _) = split_frontmatter(text)?;
    let doc = YamlLoader::load_from_str(fm).ok()?.into_iter().next()?;
    let v = yaml_to_json(&doc);
    let id = v.get("id")?.as_str()?.to_string();
    let slug = v.get("kind")?.as_str()?.to_string();
    if id.is_empty() || kind_by_slug(&slug).is_none() {
        return None;
    }
    Some((id, slug))
}

/// 这个文件是不是「本该是台账记录但坏了」。
/// 用户的 Obsidian 库里本来就有大量带 frontmatter 的普通笔记，那些要静默忽略；
/// 但带 labkit 标记却解析不了的文件必须上报——否则用户以为编辑生效了，实际被丢掉。
fn looks_labkit(fm: &str) -> bool {
    if fm.contains("labkit_schema") {
        return true;
    }
    KINDS.iter().any(|k| {
        fm.contains(&format!("kind: \"{}\"", k.slug)) || fm.contains(&format!("kind: {}", k.slug))
    })
}

fn rec_id(r: &Value) -> Option<&str> {
    r.get("id").and_then(|x| x.as_str())
}

fn upsert(data: &mut Value, key: &str, id: &str, rec: Value) {
    let Some(o) = data.as_object_mut() else { return };
    let arr = o.entry(key.to_string()).or_insert_with(|| json!([]));
    if !arr.is_array() {
        *arr = json!([]);
    }
    let a = arr.as_array_mut().expect("刚保证数组");
    match a.iter().position(|r| rec_id(r) == Some(id)) {
        Some(i) => a[i] = rec,
        None => a.push(rec),
    }
}

fn remove_rec(data: &mut Value, key: &str, id: &str) -> bool {
    let Some(a) = data.get_mut(key).and_then(|v| v.as_array_mut()) else { return false };
    let before = a.len();
    a.retain(|r| rec_id(r) != Some(id));
    a.len() != before
}

fn find_rec<'a>(data: &'a Value, key: &str, id: &str) -> Option<&'a Value> {
    data.get(key)?.as_array()?.iter().find(|r| rec_id(r) == Some(id))
}

fn write_conflict(vault: &Path, id: &str, slug: &str, local: &Value, vault_rec: &Value) -> Result<()> {
    let p = vault.join(CONFLICT_DIR).join(format!("{id}.json"));
    store::atomic_write_no_bak(
        &p,
        &serde_json::to_string_pretty(&json!({
            "id": id, "kind": slug, "local": local, "vault": vault_rec, "at": now_stamp(),
        }))?,
    )
}

/// 扫描 Vault → 判定 → 采纳外部编辑 → 经 `merge_save_at` 落 JSON。
///
/// 判定表（fileHash = 盘上 md 的哈希，jsonHash = 台账里该记录的哈希，均对比索引）：
/// * md 变了、JSON 没变 → 纯外部编辑，采纳 md；
/// * md 没变、JSON 变了 → 纯本地改动，跳过交给投影；
/// * 两边都变了 → 冲突：仍采纳 md（外部优先），本地版留存供一键还原；
/// * 索引里有、盘上文件没了 → 外部删除，传播到台账；
/// * 全新 md → 摄入为新记录。
pub fn ingest_at(db: &Path, vault: &Path) -> Result<IngestReport> {
    let _g = vault_guard();
    let mut data = store::load_at(db)?.unwrap_or_else(|| json!({}));
    let mut idx = read_index(vault);
    let mut rep = IngestReport::default();

    // 路径 → id，供 mtime 快筛 O(1) 命中
    let by_path: BTreeMap<String, String> =
        idx.files.iter().map(|(id, e)| (e.path.clone(), id.clone())).collect();

    // 1. 扫描：present[id] = (相对路径, 需要时才读的正文, mtime)
    let mut present: BTreeMap<String, (String, Option<String>, u64)> = BTreeMap::new();
    for k in KINDS {
        let Ok(rd) = fs::read_dir(vault.join(k.dir)) else { continue };
        for entry in rd.filter_map(|e| e.ok()) {
            let path = entry.path();
            if !path.is_file() || path.extension().map(|x| x != "md").unwrap_or(true) {
                continue;
            }
            let rel = path.strip_prefix(vault).unwrap_or(&path).to_string_lossy().replace('\\', "/");
            let mt = mtime_ms(&path);
            // 快筛：同路径且 mtime 未前进 → 不读文件（数百文件毫秒级）
            if let Some(id) = by_path.get(&rel) {
                if let Some(e) = idx.files.get(id) {
                    if mt <= e.mtime_ms {
                        present.insert(id.clone(), (rel, None, mt));
                        continue;
                    }
                }
            }
            let text = match fs::read_to_string(&path) {
                Ok(t) => t,
                Err(e) => {
                    rep.errors.push(format!("读取 {rel} 失败：{e}"));
                    continue;
                }
            };
            match peek(&text) {
                Some((id, _)) => {
                    present.insert(id, (rel, Some(text), mt));
                }
                None => match split_frontmatter(&text) {
                    Some((fm, _)) if looks_labkit(fm) => {
                        rep.errors.push(format!("{rel} 的 frontmatter 无法解析，本次跳过（台账里的原记录未被改动）"));
                    }
                    _ => rep.skipped += 1,
                },
            }
        }
    }

    // 2. 逐条判定
    let mut changed: BTreeSet<String> = BTreeSet::new();
    for (id, (rel, text, mt)) in &present {
        let entry = idx.files.get(id).cloned();
        let Some(text) = text else {
            // 快筛命中：内容没变，只可能是用户重命名了文件
            if let Some(mut e) = entry {
                if e.path != *rel {
                    e.path = rel.clone();
                    e.mtime_ms = *mt;
                    idx.files.insert(id.clone(), e);
                    rep.renamed += 1;
                }
            }
            continue;
        };
        let fh = sha256(text);
        if let Some(e) = &entry {
            if e.file_hash == fh {
                // 内容未变（用户可能只是打开后原样保存），更新路径与 mtime
                let mut ne = e.clone();
                if ne.path != *rel {
                    rep.renamed += 1;
                }
                ne.path = rel.clone();
                ne.mtime_ms = *mt;
                idx.files.insert(id.clone(), ne);
                continue;
            }
        }
        let Some((_, slug)) = peek(text) else {
            rep.skipped += 1;
            continue;
        };
        let Some(k) = kind_by_slug(&slug) else { continue };
        let rec = match parse_md(k, text) {
            Ok(r) => r,
            Err(e) => {
                rep.errors.push(format!("解析 {rel} 失败：{e}"));
                continue;
            }
        };
        // 双改检测：本地记录的哈希也偏离了索引 → 两边都改过
        if let (Some(e), Some(cur)) = (&entry, find_rec(&data, k.key, id)) {
            if json_hash(cur) != e.json_hash {
                if let Err(err) = write_conflict(vault, id, &slug, cur, &rec) {
                    rep.errors.push(format!("留存冲突 {id} 失败：{err}"));
                }
                rep.conflicts.push(id.clone());
            }
        }
        upsert(&mut data, k.key, id, rec.clone());
        changed.insert(k.key.to_string());
        idx.files.insert(id.clone(), Entry {
            kind: slug.clone(),
            path: rel.clone(),
            label: (k.label)(&rec),
            file_hash: fh,
            json_hash: json_hash(&rec),
            mtime_ms: *mt,
        });
        rep.ingested += 1;
    }

    // 3. 外部删除传播：索引里有、扫描没见到、且文件确实不在了
    let gone: Vec<String> = idx.files.iter()
        .filter(|(id, e)| !present.contains_key(*id) && !vault.join(&e.path).exists())
        .map(|(id, _)| id.clone())
        .collect();
    for id in gone {
        if let Some(e) = idx.files.remove(&id) {
            if let Some(k) = kind_by_slug(&e.kind) {
                if remove_rec(&mut data, k.key, &id) {
                    changed.insert(k.key.to_string());
                    rep.removed += 1;
                }
            }
        }
    }

    // 4. 落盘：走正常 merge_save 路径，rev+1 并由命令层广播 db-changed，
    //    其它窗口经现有 dbOnRemote 排队机制采纳。
    rep.changed = changed.iter().cloned().collect();
    rep.rev = if changed.is_empty() {
        disk_rev(db)
    } else {
        store::merge_save_at(db, &data, Some(&rep.changed))?
    };
    idx.schema = SCHEMA;
    idx.last_sync = now_stamp();
    if let Err(e) = write_index(vault, &idx) {
        rep.errors.push(format!("写入 Vault 索引失败：{e}"));
    }
    Ok(rep)
}

/// 冲突裁决：keep="local" 把留存的本地版写回台账并重新投影（覆盖 md）；
/// 其余值表示接受 Vault 版，只清掉冲突记录。
pub fn resolve_at(db: &Path, vault: &Path, id: &str, keep: &str) -> Result<SyncReport> {
    let p = vault.join(CONFLICT_DIR).join(format!("{id}.json"));
    let text = fs::read_to_string(&p)
        .map_err(|_| AppError::Other(format!("没有这条冲突记录：{id}")))?;
    let v: Value = serde_json::from_str(&text)?;
    let mut rep = SyncReport::default();
    if keep == "local" {
        let local = v.get("local").ok_or_else(|| AppError::Other("冲突记录缺少本地版本".into()))?;
        let slug = v.get("kind").and_then(|x| x.as_str()).unwrap_or("");
        let key = kind_by_slug(slug)
            .map(|k| k.key)
            .ok_or_else(|| AppError::Other(format!("无法确定 {id} 属于哪类实体")))?;
        let mut data = store::load_at(db)?.unwrap_or_else(|| json!({}));
        upsert(&mut data, key, id, local.clone());
        rep.rev = store::merge_save_at(db, &data, Some(&[key.to_string()]))?;
        rep.projected = project_at(db, vault, Some(&[key.to_string()]))?;
    }
    let _ = fs::remove_file(&p);
    if rep.rev == 0 {
        rep.rev = disk_rev(db);
    }
    Ok(rep)
}

/// 列出待裁决的冲突，供设置页展示。
pub fn conflicts_at(vault: &Path) -> Vec<Value> {
    let Ok(rd) = fs::read_dir(vault.join(CONFLICT_DIR)) else { return vec![] };
    let mut out = Vec::new();
    for e in rd.filter_map(|e| e.ok()) {
        let p = e.path();
        if p.extension().map(|x| x != "json").unwrap_or(true) {
            continue;
        }
        if let Ok(t) = fs::read_to_string(&p) {
            if let Ok(mut v) = serde_json::from_str::<Value>(&t) {
                let id = p.file_stem().map(|x| x.to_string_lossy().into_owned()).unwrap_or_default();
                if let Some(o) = v.as_object_mut() {
                    o.insert("id".into(), json!(id));
                    // 给 UI 一个可读标签：优先 name/title/text/item
                    let label = ["name", "title", "text", "item", "id"].iter()
                        .find_map(|k| o.get("local").and_then(|l| l.get(*k)).and_then(|x| x.as_str()))
                        .unwrap_or(&id).to_string();
                    o.insert("label".into(), json!(label));
                }
                out.push(v);
            }
        }
    }
    out.sort_by(|a, b| a["id"].as_str().unwrap_or("").cmp(b["id"].as_str().unwrap_or("")));
    out
}

/* ===================== 对外入口 ===================== */

#[derive(Debug, Default, Clone, serde::Serialize)]
pub struct SyncReport {
    pub projected: ProjectReport,
    pub ingested: usize,
    pub conflicts: Vec<String>,
    pub removed: usize,
    /// 本次操作后的台账修订号，供命令层广播 db-changed
    pub rev: u64,
}

fn disk_rev(db: &Path) -> u64 {
    store::load_at(db)
        .ok()
        .flatten()
        .and_then(|v| v.get("_rev").and_then(|r| r.as_u64()))
        .unwrap_or(0)
}

/// 先摄入（外部编辑优先）后投影（把摄入结果与本地改动写回 md）。
/// 两步各自取放 VAULT_LOCK，中间不持锁；投影读的是摄入落盘后的最新 JSON。
pub fn sync_at(db: &Path, vault: &Path) -> Result<SyncReport> {
    let ing = ingest_at(db, vault)?;
    let projected = project_at(db, vault, None)?;
    Ok(SyncReport {
        projected,
        ingested: ing.ingested,
        conflicts: ing.conflicts,
        removed: ing.removed,
        rev: disk_rev(db),
    })
}

/// 启用/关闭 Vault。启用前强制备份（失败即中止，沿用 import 的语义），
/// 目标目录里已有的他人文件绝不触碰——只认带 labkit id 的 md。
pub fn configure_at(db: &Path, dir: &str, enable: bool) -> Result<SyncReport> {
    if enable && dir.trim().is_empty() {
        return Err(AppError::Other("请先选择 Vault 目录".into()));
    }
    let cfg = Cfg { enabled: enable, dir: dir.trim().to_string() };
    if enable {
        if store::load_at(db)?.is_some() {
            store::backup_at(db)?;
        }
        fs::create_dir_all(Path::new(&cfg.dir))?;
    }
    let rev = write_cfg(db, &cfg)?;
    if !enable {
        return Ok(SyncReport { rev, ..Default::default() });
    }
    let mut rep = sync_at(db, Path::new(&cfg.dir))?;
    rep.rev = rev;
    Ok(rep)
}

pub fn status_at(db: &Path) -> Result<Value> {
    let cfg = config_at(db)?;
    let Some(cfg) = cfg else {
        return Ok(json!({"enabled": false, "dir": "", "exists": false, "files": 0, "errors": [], "lastSync": "", "conflicts": 0, "conflictList": []}));
    };
    let vault = Path::new(&cfg.dir);
    let idx = read_index(vault);
    let list = conflicts_at(vault);
    Ok(json!({
        "enabled": cfg.enabled,
        "dir": cfg.dir,
        "exists": vault.exists(),
        "files": idx.files.len(),
        "errors": idx.errors,
        "lastSync": idx.last_sync,
        "conflicts": list.len(),
        "conflictList": list,
    }))
}

/// 供命令层与测试用的便捷包装。
pub fn project(kinds: Option<&[String]>) -> Result<ProjectReport> {
    let db = store::db_path()?;
    let vault = active_dir_at(&db)?.ok_or_else(|| AppError::Other("Vault 未启用".into()))?;
    project_at(&db, &vault, kinds)
}

pub fn kind_of_key(key: &str) -> Option<&'static str> {
    kind_by_key(key).map(|k| k.slug)
}

pub fn kind_dir(slug: &str) -> Option<&'static str> {
    kind_by_slug(slug).map(|k| k.dir)
}

/// 摄入与冲突处理需要遍历的目录清单。
pub fn kind_dirs() -> Vec<(&'static str, &'static str)> {
    KINDS.iter().map(|k| (k.slug, k.dir)).collect()
}

pub fn parse_record(slug: &str, text: &str) -> Result<Value> {
    let k = kind_by_slug(slug).ok_or_else(|| AppError::Other(format!("未知实体类型：{slug}")))?;
    parse_md(k, text)
}

pub fn render_record(slug: &str, rec: &Value) -> Result<String> {
    let k = kind_by_slug(slug).ok_or_else(|| AppError::Other(format!("未知实体类型：{slug}")))?;
    Ok(render_md(k, rec))
}