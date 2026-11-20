//! P4 GitHub 插件市场（Rust 侧单一信任边界）。
//!
//! 机制照搬 Obsidian 社区插件：索引仓库 `plugins.json` → 开发者仓库 GitHub Release
//! 资产（manifest.json + main.js + 可选 styles.css）→ 本地版本目录 + 启用指针。
//! 不自动更新；插件是受信 JS，与内置工具同权限（安全模型在 PLUGIN_DEV.md 明示）。
//!
//! 安全约束（全部可单测）：
//! * id / version / 资产文件名走白名单，路径只accept Component::Normal，拒绝 `..` / 绝对路径 / 反斜杠；
//! * manifest 必填字段校验，id 必须与索引条目一致；声明 sha256 时逐字节校验；
//! * 安装先写临时目录再原子改名，失败不留半包；
//! * 所有网络请求收敛在本模块，前端只读 IPC + 自定义协议。

use std::collections::HashMap;
use std::path::{Component, Path, PathBuf};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

const UA: &str = concat!("LabKit/", env!("CARGO_PKG_VERSION"));
/// 索引基址：工具与卡片两个市场共用同一目录，只靠文件名区分类型
/// （参考 HACS 的 category → 目录、Directus 的 extension type → 安装位置）。
pub const DEFAULT_INDEX_BASE: &str =
    "https://raw.githubusercontent.com/Funvvell/labkit-plugins/main";
/// 存量合并索引：新目录里找不到 tools.json / widgets.json 时回退到这里，按条目 kind 过滤。
/// 生态迁移期保留，两个版本后再移除。
pub const LEGACY_INDEX_FILE: &str = "plugins.json";
const CACHE_TTL: Duration = Duration::from_secs(30 * 60);

/* ---------------- 纯逻辑：白名单 / 路径 / 版本 / 哈希 ---------------- */

/// 插件 id：`[A-Za-z0-9][A-Za-z0-9_-]{0,63}`，禁止路径语义。
pub fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id.len() <= 64
        && id.as_bytes()[0].is_ascii_alphanumeric()
        && id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
}

/// 版本 tag：放行常见 `1.2.3` / `v1.2.3-beta.1` / `2026.11.20`，禁止路径语义。
pub fn valid_version(v: &str) -> bool {
    !v.is_empty()
        && v.len() <= 64
        && v
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'.' | b'_' | b'-' | b'+' | b'v' | b'V'))
}

/// 资产文件名白名单：插件包只允许这三个文件。
pub fn valid_asset(name: &str) -> bool {
    matches!(name, "manifest.json" | "main.js" | "styles.css")
}

/* ---------------- 市场拆分：类型语义（纯函数，可单测） ---------------- */

/// 市场类型文件名：tool → tools.json / widget → widgets.json。
pub fn index_file(kind: &str) -> Result<&'static str, String> {
    match kind.trim().to_ascii_lowercase().as_str() {
        "tool" => Ok("tools.json"),
        "widget" => Ok("widgets.json"),
        other => Err(format!("未知扩展类型：{other}（只允许 tool / widget）")),
    }
}

/// 索引候选 URL：
/// * 目录源（默认）→ [&lt;base&gt;/tools.json, &lt;base&gt;/plugins.json]
/// * 完整 .json   → 单元素（老用户手填 plugins.json 继续可用）
pub fn index_urls(kind: &str, source: Option<&str>) -> Result<Vec<String>, String> {
    let file = index_file(kind)?;
    let raw = source
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .unwrap_or(DEFAULT_INDEX_BASE);
    if !raw.starts_with("https://raw.githubusercontent.com/") && raw != DEFAULT_INDEX_BASE {
        return Err("索引源必须是 raw.githubusercontent.com 的 HTTPS 地址".into());
    }
    if raw.ends_with(".json") {
        return Ok(vec![raw.to_string()]);
    }
    let base = raw.trim_end_matches('/');
    Ok(vec![
        format!("{base}/{file}"),
        format!("{base}/{LEGACY_INDEX_FILE}"),
    ])
}

/// 精确的市场类型（both / 未声明 / 未知 → None）。
fn market_kind(kind: &str) -> Option<&'static str> {
    match kind.trim().to_ascii_lowercase().as_str() {
        "tool" => Some("tool"),
        "widget" => Some("widget"),
        _ => None,
    }
}

/// 索引条目是否属于该市场：both 两侧都收；条目未声明类型按 tool（与 IndexEntry::kind() 一致）。
pub fn entry_matches(kind: &str, e: &IndexEntry) -> bool {
    let want = match market_kind(kind) {
        Some(k) => k,
        None => return false,
    };
    let got = if e.kind.trim().is_empty() {
        "tool"
    } else {
        e.kind.trim()
    };
    got == "both" || got == want
}

/// 市场与包类型是否互斥。both / 未声明一律不拦（存量包要能装）。
pub fn kind_conflict(market: &str, declared: &str) -> bool {
    match (market_kind(market), market_kind(declared)) {
        (Some(m), Some(d)) => m != d,
        _ => false,
    }
}

/// 生效类型与 legacy 标记：包内声明优先，其次跟随市场，再次视为工具包。
/// legacy = 包内没有声明单一类型（老包 / both），扩展管理页据此提示迁移。
pub fn effective_kind(market: Option<&str>, declared: &str) -> (String, bool) {
    match declared.trim().to_ascii_lowercase().as_str() {
        "tool" => return ("tool".into(), false),
        "widget" => return ("widget".into(), false),
        "both" => return ("both".into(), true),
        _ => {}
    }
    let m = market.and_then(market_kind);
    (m.unwrap_or("tool").to_string(), true)
}

/// 安全拼接：base.join(rel) 且 rel 必须是纯相对 Normal 段。
pub fn safe_join(base: &Path, rel: &str) -> Result<PathBuf, String> {
    if rel.is_empty() || rel.contains('\\') || rel.contains('\0') {
        return Err(format!("非法相对路径：{rel}"));
    }
    let p = Path::new(rel);
    if p.is_absolute() {
        return Err(format!("路径必须是相对路径：{rel}"));
    }
    for c in p.components() {
        match c {
            Component::Normal(_) => {}
            _ => return Err(format!("路径含越界段：{rel}")),
        }
    }
    Ok(base.join(p))
}

/// 插件版本目录：`<base>/plugins/<id>/<version>`。
pub fn plugin_dir(base: &Path, id: &str, version: &str) -> Result<PathBuf, String> {
    if !valid_id(id) {
        return Err(format!("非法插件 id：{id}"));
    }
    if !valid_version(version) {
        return Err(format!("非法版本号：{version}"));
    }
    let root = safe_join(base, "plugins")?;
    let dir = safe_join(&root, id)?.join(version);
    // canonicalize 前目录可能不存在：仍按 Component 逐段确认没有逃出 root。
    let rel = dir.strip_prefix(&root).map_err(|_| "路径越界".to_string())?;
    if rel.components().count() != 2 {
        return Err("路径越界".into());
    }
    Ok(dir)
}

/// 版本比较：忽略前导 v/V 与后缀，逐段数字比较；无法解析时按字符串字典序兜底。
pub fn version_at_least(have: &str, need: &str) -> bool {
    let nums = |s: &str| -> Vec<u64> {
        let s = s.trim().trim_start_matches(['v', 'V']);
        s.split(|c: char| !c.is_ascii_digit())
            .filter(|x| !x.is_empty())
            .filter_map(|x| x.parse().ok())
            .collect()
    };
    let (a, b) = (nums(have), nums(need));
    if a.is_empty() || b.is_empty() {
        return have >= need;
    }
    let n = a.len().max(b.len());
    for i in 0..n {
        let x = *a.get(i).unwrap_or(&0);
        let y = *b.get(i).unwrap_or(&0);
        if x != y {
            return x > y;
        }
    }
    true
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    h.finalize()
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

/* ---------------- 数据契约 ---------------- */

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexEntry {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub author: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub repo: String,
    #[serde(default)]
    pub kind: String,
    #[serde(default)]
    pub min_app_version: String,
}

impl IndexEntry {
    /// 未声明按 tool（与前端 pluginEntryKind 保持一致）。
    pub fn kind(&self) -> &str {
        if self.kind.trim().is_empty() {
            "tool"
        } else {
            &self.kind
        }
    }
}

/// 一次索引请求的结果：实际命中的 URL + 是否走了存量合并索引 + 过滤后的条目。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexPayload {
    pub kind: String,
    pub url: String,
    pub legacy: bool,
    pub items: Vec<IndexEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Manifest {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub version: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub author: String,
    #[serde(default)]
    pub repo: String,
    #[serde(default)]
    pub min_app_version: String,
    /// 扩展类型：tool / widget（新包必填）；both 仅存量兼容；空 = 未声明。
    #[serde(default)]
    pub kind: String,
    #[serde(default = "default_main")]
    pub main: String,
    #[serde(default)]
    pub styles: Option<String>,
    #[serde(default)]
    pub sha256: Option<String>,
}

fn default_main() -> String {
    "main.js".into()
}

/// manifest 校验：必填字段 + id 白名单 + 资产文件名白名单 + kind 取值。
pub fn parse_manifest(bytes: &[u8], expected_id: Option<&str>) -> Result<Manifest, String> {
    let mut m: Manifest = serde_json::from_slice(bytes)
        .map_err(|e| format!("manifest.json 解析失败：{e}"))?;
    if !valid_id(&m.id) {
        return Err(format!("manifest id 非法：{}", m.id));
    }
    if m.name.trim().is_empty() {
        return Err("manifest 缺少 name".into());
    }
    if let Some(id) = expected_id {
        if id != m.id {
            return Err(format!("manifest id 与索引不一致：{} ≠ {}", m.id, id));
        }
    }
    if !valid_asset(&m.main) {
        return Err(format!("main 资产名非法：{}", m.main));
    }
    if let Some(s) = &m.styles {
        if !valid_asset(s) {
            return Err(format!("styles 资产名非法：{s}"));
        }
    }
    let k = m.kind.trim().to_ascii_lowercase();
    if !k.is_empty() && !matches!(k.as_str(), "tool" | "widget" | "both") {
        return Err(format!("manifest kind 非法：{}（只允许 tool / widget）", m.kind));
    }
    m.kind = k;
    Ok(m)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledPlugin {
    pub id: String,
    pub version: String,
    /// 生效类型（tool / widget / both，已按市场推断过）。
    pub kind: String,
    /// 包内未声明单一类型（存量合并包）。
    pub legacy: bool,
    pub manifest: Manifest,
    pub path: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedRelease {
    pub version: String,
    pub manifest: Manifest,
    pub assets: Vec<String>,
    pub compatible: bool,
}

/* ---------------- 本地安装（原子写 + 校验） ---------------- */

/// 把一组资产写入 `<base>/plugins/<id>/<version>/`：先临时目录，全部成功再原子改名。
/// 任何一步失败都清理临时目录，绝不留下半包。
pub fn install_at(
    base: &Path,
    id: &str,
    version: &str,
    manifest_bytes: &[u8],
    assets: &[(String, Vec<u8>)],
) -> Result<InstalledPlugin, String> {
    install_at_kind(base, id, version, None, manifest_bytes, assets)
}

/// 带市场类型的安装：market = Some("tool"|"widget") 时先做类型冲突校验（装错市场直接拒绝，
/// 而不是先落盘再拦截），并把生效类型写进返回值。落盘仍是原始 manifest，类型以安装记录为准。
pub fn install_at_kind(
    base: &Path,
    id: &str,
    version: &str,
    market: Option<&str>,
    manifest_bytes: &[u8],
    assets: &[(String, Vec<u8>)],
) -> Result<InstalledPlugin, String> {
    let mut m = parse_manifest(manifest_bytes, Some(id))?;
    if let Some(mk) = market {
        if kind_conflict(mk, &m.kind) {
            let declared = if m.kind.is_empty() { "未声明" } else { m.kind.as_str() };
            return Err(format!("包类型为 {declared}，不能安装到 {mk} 市场"));
        }
    }
    let (ek, legacy) = effective_kind(market, &m.kind);
    m.kind = ek.clone();
    if !m.version.is_empty() && m.version != version {
        return Err(format!("manifest 版本与目录版本不一致：{} ≠ {}", m.version, version));
    }
    // 声明 sha256 时校验 main.js（防止 Release 资产被替换）。
    if let Some(expected) = &m.sha256 {
        let main = assets
            .iter()
            .find(|(n, _)| n == &m.main)
            .map(|(_, b)| b.as_slice())
            .ok_or_else(|| format!("缺少 main 资产：{}", m.main))?;
        let actual = sha256_hex(main);
        if !expected.eq_ignore_ascii_case(&actual) {
            return Err(format!("main.js sha256 校验失败：期望 {expected}，实际 {actual}"));
        }
    }
    let dir = plugin_dir(base, id, version)?;
    let root = safe_join(base, "plugins")?;
    std::fs::create_dir_all(&root).map_err(|e| format!("创建插件目录失败：{e}"))?;
    // 版本父目录必须先存在，否则 rename(tmp, dir) 在 Windows 上报 os error 3。
    if let Some(parent) = dir.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("创建插件版本目录失败：{e}"))?;
    }
    let tmp = root.join(format!(".tmp-{id}-{version}-{}", std::process::id()));
    if tmp.exists() {
        std::fs::remove_dir_all(&tmp).map_err(|e| format!("清理临时目录失败：{e}"))?;
    }
    std::fs::create_dir_all(&tmp).map_err(|e| format!("创建临时目录失败：{e}"))?;
    let result = (|| -> Result<(), String> {
        std::fs::write(tmp.join("manifest.json"), manifest_bytes)
            .map_err(|e| format!("写入 manifest 失败：{e}"))?;
        for (name, bytes) in assets {
            if !valid_asset(name) {
                return Err(format!("非法资产名：{name}"));
            }
            std::fs::write(safe_join(&tmp, name)?, bytes)
                .map_err(|e| format!("写入资产 {name} 失败：{e}"))?;
        }
        if dir.exists() {
            // 同版本重装：先挪走旧目录，失败可回退。
            let old = root.join(format!(".old-{id}-{version}"));
            if old.exists() {
                std::fs::remove_dir_all(&old).map_err(|e| format!("清理旧版本失败：{e}"))?;
            }
            std::fs::rename(&dir, &old).map_err(|e| format!("备份旧版本失败：{e}"))?;
            if let Err(e) = std::fs::rename(&tmp, &dir) {
                let _ = std::fs::rename(&old, &dir);
                return Err(format!("原子替换失败：{e}"));
            }
            let _ = std::fs::remove_dir_all(&old);
        } else {
            std::fs::rename(&tmp, &dir).map_err(|e| format!("原子落盘失败：{e}"))?;
        }
        Ok(())
    })();
    if result.is_err() {
        let _ = std::fs::remove_dir_all(&tmp);
    }
    result?;
    Ok(InstalledPlugin {
        id: id.to_string(),
        version: version.to_string(),
        kind: ek,
        legacy,
        manifest: m,
        path: dir.to_string_lossy().into_owned(),
    })
}

pub fn uninstall_at(base: &Path, id: &str) -> Result<(), String> {
    if !valid_id(id) {
        return Err(format!("非法插件 id：{id}"));
    }
    let dir = safe_join(&safe_join(base, "plugins")?, id)?;
    if dir.exists() {
        std::fs::remove_dir_all(&dir).map_err(|e| format!("卸载失败：{e}"))?;
    }
    Ok(())
}

/// 回退前确认旧版本目录存在，避免启用指针指向已删除目录。
pub fn rollback_available(base: &Path, id: &str, version: &str) -> Result<PathBuf, String> {
    let dir = plugin_dir(base, id, version)?;
    if !dir.is_dir() {
        return Err(format!("旧版本 {version} 目录不存在，无法回退"));
    }
    Ok(dir)
}

/// 自定义协议读取插件资产（只读，路径越界直接拒绝）。
pub fn read_asset_at(base: &Path, id: &str, version: &str, file: &str) -> Result<Vec<u8>, String> {
    if !valid_asset(file) {
        return Err(format!("不允许读取的插件资产：{file}"));
    }
    let dir = plugin_dir(base, id, version)?;
    let path = safe_join(&dir, file)?;
    std::fs::read(&path).map_err(|e| format!("读取插件资产失败：{e}"))
}

pub fn plugin_root(base: &Path) -> Result<PathBuf, String> {
    safe_join(base, "plugins")
}

/* ---------------- 网络：索引 / Release 解析 / 下载 ---------------- */

fn http(secs: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(UA)
        .connect_timeout(Duration::from_secs(6))
        .timeout(Duration::from_secs(secs))
        .build()
        .map_err(|e| format!("HTTP 客户端初始化失败：{e}"))
}

fn cache() -> &'static Mutex<HashMap<String, (Instant, serde_json::Value)>> {
    static C: OnceLock<Mutex<HashMap<String, (Instant, serde_json::Value)>>> = OnceLock::new();
    C.get_or_init(|| Mutex::new(HashMap::new()))
}

fn cached(url: &str) -> Option<serde_json::Value> {
    cache()
        .lock()
        .ok()?
        .get(url)
        .and_then(|(t, v)| if t.elapsed() < CACHE_TTL { Some(v.clone()) } else { None })
}

fn remember(url: &str, v: &serde_json::Value) {
    if let Ok(mut m) = cache().lock() {
        m.insert(url.to_string(), (Instant::now(), v.clone()));
    }
}

async fn get_json(url: &str, token: Option<&str>, secs: u64) -> Result<serde_json::Value, String> {
    let cli = http(secs)?;
    let mut req = cli.get(url);
    if let Some(t) = token {
        if !t.is_empty() {
            req = req.header("Authorization", format!("Bearer {t}"));
        }
    }
    let r = req.send().await.map_err(|e| format!("请求失败：{e}"))?;
    let status = r.status();
    if !status.is_success() {
        return Err(format!("HTTP {status}（GitHub 未鉴权限流 60 次/时，可在设置页填 PAT）"));
    }
    r.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("响应解析失败：{e}"))
}

/// 拉一个索引文件；404 返回 Ok(None) 供上层回退，其余错误（网络/限流/解析）直接冒泡——
/// 静默降级会让市场看起来「空了」，比报错更难排查。
async fn load_index(url: &str, refresh: bool) -> Result<Option<serde_json::Value>, String> {
    if !refresh {
        if let Some(v) = cached(url) {
            return Ok(Some(v));
        }
    }
    let cli = http(20)?;
    let r = cli
        .get(url)
        .send()
        .await
        .map_err(|e| format!("请求失败：{e}"))?;
    let status = r.status();
    if status == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }
    if !status.is_success() {
        return Err(format!("HTTP {status}（GitHub 未鉴权限流 60 次/时，可在设置页填 PAT）"));
    }
    let v = r
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("响应解析失败：{e}"))?;
    remember(url, &v);
    Ok(Some(v))
}

/// 按市场取索引：先读 <base>/<tools|widgets>.json，404 才回退到存量 plugins.json。
/// 缓存按最终 URL 分槽（Rust 内存 30 分钟），两个市场天然不互相污染。
/// 校验条目 id 白名单与 repo 格式（owner/name），坏条目跳过而非让整个市场不可用。
pub async fn fetch_index(
    kind: &str,
    source: Option<&str>,
    refresh: bool,
) -> Result<IndexPayload, String> {
    let want = market_kind(kind)
        .ok_or_else(|| format!("未知扩展类型：{kind}（只允许 tool / widget）"))?;
    let urls = index_urls(want, source)?;
    let mut missing: Vec<String> = Vec::new();
    for url in urls {
        let v = match load_index(&url, refresh).await? {
            Some(v) => v,
            None => {
                missing.push(url);
                continue;
            }
        };
        let arr = v.as_array().ok_or("索引文件必须是 JSON 数组")?;
        let mut items = Vec::new();
        for raw in arr {
            match serde_json::from_value::<IndexEntry>(raw.clone()) {
                Ok(e)
                    if valid_id(&e.id)
                        && e.repo.split('/').count() == 2
                        && !e.repo.contains(' ')
                        && entry_matches(want, &e) =>
                {
                    items.push(e)
                }
                _ => continue,
            }
        }
        let legacy = url.ends_with(LEGACY_INDEX_FILE);
        return Ok(IndexPayload {
            kind: want.to_string(),
            url,
            legacy,
            items,
        });
    }
    Err(format!("索引不存在：{}", missing.join(" 或 ")))
}

/// 解析某个仓库的最新 Release：选兼容 minAppVersion 的版本 + 三个资产 URL。
pub async fn resolve(repo: &str, min_app_version: Option<&str>, token: Option<&str>) -> Result<ResolvedRelease, String> {
    let parts: Vec<&str> = repo.split('/').collect();
    if parts.len() != 2 || parts.iter().any(|p| p.is_empty() || !p.bytes().all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.'))) {
        return Err(format!("非法仓库名：{repo}"));
    }
    let url = format!("https://api.github.com/repos/{repo}/releases/latest");
    let v = match cached(&url) {
        Some(v) => v,
        None => {
            let v = get_json(&url, token, 20).await?;
            remember(&url, &v);
            v
        }
    };
    let version = v
        .get("tag_name")
        .and_then(|x| x.as_str())
        .or_else(|| v.get("name").and_then(|x| x.as_str()))
        .ok_or("Release 缺少 tag_name")?
        .trim()
        .to_string();
    if !valid_version(&version) {
        return Err(format!("Release 版本号非法：{version}"));
    }
    let mut assets: Vec<String> = Vec::new();
    if let Some(arr) = v.get("assets").and_then(|x| x.as_array()) {
        for a in arr {
            if let Some(name) = a.get("name").and_then(|x| x.as_str()) {
                if valid_asset(name) {
                    if let Some(u) = a.get("browser_download_url").and_then(|x| x.as_str()) {
                        if u.starts_with("https://github.com/") {
                            assets.push(u.to_string());
                        }
                    }
                }
            }
        }
    }
    // manifest 可能作为 Release 资产发布；否则回退到 raw 的仓库默认分支。
    let manifest_url = assets
        .iter()
        .find(|u| u.ends_with("/manifest.json"))
        .cloned()
        .unwrap_or_else(|| format!("https://raw.githubusercontent.com/{repo}/main/manifest.json"));
    let cli = http(30)?;
    let r = cli
        .get(&manifest_url)
        .header("Accept", "application/octet-stream")
        .send()
        .await
        .map_err(|e| format!("下载 manifest 失败：{e}"))?;
    if !r.status().is_success() {
        return Err(format!("下载 manifest 失败：HTTP {}", r.status()));
    }
    let bytes = r.bytes().await.map_err(|e| format!("读取 manifest 失败：{e}"))?;
    let m = parse_manifest(&bytes, None)?;
    let compatible = min_app_version
        .map(|min| version_at_least(env!("CARGO_PKG_VERSION"), min))
        .unwrap_or(true);
    Ok(ResolvedRelease { version, manifest: m, assets, compatible })
}

/// 下载 Release 的三个资产并原子安装。token 用于提升 GitHub API 限额（资产下载本身公开）。
pub async fn install_from_release(
    base: &Path,
    id: &str,
    repo: &str,
    version: &str,
    market: Option<&str>,
    min_app_version: Option<&str>,
    token: Option<&str>,
) -> Result<InstalledPlugin, String> {
    if !valid_id(id) || !valid_version(version) {
        return Err("非法插件 id / 版本".into());
    }
    let resolved = resolve(repo, min_app_version, token).await?;
    if !resolved.compatible {
        return Err(format!("插件要求 LabKit >= {}，当前版本过低", resolved.manifest.min_app_version));
    }
    // 必须显式指定版本（前端来自 resolve 结果），防止抢跑安装到不同版本。
    if resolved.version != version {
        return Err(format!("Release 最新版本 {} 与请求版本 {version} 不一致", resolved.version));
    }
    if resolved.manifest.id != id {
        return Err(format!("插件 id 不匹配：{} ≠ {id}", resolved.manifest.id));
    }
    if let Some(mk) = market {
        if kind_conflict(mk, &resolved.manifest.kind) {
            let declared = if resolved.manifest.kind.is_empty() {
                "未声明"
            } else {
                resolved.manifest.kind.as_str()
            };
            return Err(format!("包类型为 {declared}，不能安装到 {mk} 市场"));
        }
    }
    let cli = http(120)?;
    let mut manifest_bytes: Option<Vec<u8>> = None;
    let mut assets: Vec<(String, Vec<u8>)> = Vec::new();
    for name in ["manifest.json", &resolved.manifest.main, resolved.manifest.styles.as_deref().unwrap_or("__none__")] {
        if name == "__none__" {
            continue;
        }
        let url = format!(
            "https://github.com/{repo}/releases/download/{version}/{name}"
        );
        let r = cli
            .get(&url)
            .header("Accept", "application/octet-stream")
            .send()
            .await
            .map_err(|e| format!("下载资产 {name} 失败：{e}"))?;
        if !r.status().is_success() {
            return Err(format!("下载资产 {name} 失败：HTTP {}", r.status()));
        }
        let bytes = r.bytes().await.map_err(|e| format!("读取资产 {name} 失败：{e}"))?.to_vec();
        if name == "manifest.json" {
            manifest_bytes = Some(bytes);
        } else {
            assets.push((name.to_string(), bytes));
        }
    }
    let mb = manifest_bytes.ok_or("Release 缺少 manifest.json 资产")?;
    // 远程安装强制完整性声明：sha256 防 Release 资产在传输/存储侧被替换。
    // 本地开发载入（install_local_kind）免除此要求，便于改一行装一次。
    let m = parse_manifest(&mb, Some(id))?;
    if m.sha256.is_none() {
        return Err("远程安装要求 manifest 声明 main.js 的 sha256；本地开发载入可免".into());
    }
    install_at_kind(base, id, version, market, &mb, &assets)
}

/// 本地开发载入：从用户选择的目录读取 manifest/main/styles（免发布调试）。
pub fn install_local(base: &Path, dir: &str) -> Result<InstalledPlugin, String> {
    install_local_kind(base, dir, None)
}

/// 带市场类型的本地载入：开发载入时必须声明这是工具扩展还是卡片扩展。
pub fn install_local_kind(base: &Path, dir: &str, market: Option<&str>) -> Result<InstalledPlugin, String> {
    let src = Path::new(dir);
    if !src.is_dir() {
        return Err("所选路径不是插件目录".into());
    }
    let mb = std::fs::read(src.join("manifest.json")).map_err(|e| format!("读取 manifest 失败：{e}"))?;
    let m = parse_manifest(&mb, None)?;
    let version = if m.version.is_empty() { "dev".into() } else { m.version.clone() };
    let mut assets = Vec::new();
    for name in [&m.main, m.styles.as_deref().unwrap_or("__none__")] {
        if name == "__none__" {
            continue;
        }
        let bytes = std::fs::read(safe_join(src, name)?)
            .map_err(|e| format!("读取资产 {name} 失败：{e}"))?;
        assets.push((name.to_string(), bytes));
    }
    install_at_kind(base, &m.id, &version, market, &mb, &assets)
}

/* ---------------- Tauri 命令层 ---------------- */

/// 与台账同目录：`~/.liver_portal_crop/plugins/<id>/<version>/`（LABKIT_DB_DIR 可覆盖）。
pub fn data_base() -> Result<PathBuf, String> {
    let dir = match std::env::var_os("LABKIT_DB_DIR") {
        Some(d) => PathBuf::from(d),
        None => dirs::home_dir()
            .ok_or("无法确定用户主目录")?
            .join(crate::constants::SESSION_DIR_NAME),
    };
    Ok(dir)
}

#[tauri::command]
pub async fn plugins_index(
    kind: String,
    source: Option<String>,
    refresh: Option<bool>,
) -> Result<IndexPayload, String> {
    fetch_index(&kind, source.as_deref(), refresh.unwrap_or(false)).await
}

#[tauri::command]
pub async fn plugins_resolve(
    repo: String,
    min_app_version: Option<String>,
    token: Option<String>,
) -> Result<ResolvedRelease, String> {
    resolve(&repo, min_app_version.as_deref(), token.as_deref()).await
}

#[tauri::command]
pub async fn plugins_install(
    id: String,
    repo: String,
    version: String,
    kind: Option<String>,
    min_app_version: Option<String>,
    token: Option<String>,
) -> Result<InstalledPlugin, String> {
    let base = data_base()?;
    install_from_release(
        &base,
        &id,
        &repo,
        &version,
        kind.as_deref(),
        min_app_version.as_deref(),
        token.as_deref(),
    )
    .await
}

#[tauri::command]
pub fn plugins_install_local(dir: String, kind: Option<String>) -> Result<InstalledPlugin, String> {
    let base = data_base()?;
    install_local_kind(&base, &dir, kind.as_deref())
}

#[tauri::command]
pub fn plugins_uninstall(id: String) -> Result<(), String> {
    let base = data_base()?;
    uninstall_at(&base, &id)
}

/// 自定义协议失败时的后备：IPC 读文本 + eval（现有 CSP 已含 unsafe-eval）。
#[tauri::command]
pub fn plugins_read_asset(id: String, version: String, file: String) -> Result<String, String> {
    let base = data_base()?;
    let bytes = read_asset_at(&base, &id, &version, &file)?;
    String::from_utf8(bytes).map_err(|e| format!("插件资产不是 UTF-8：{e}"))
}

#[tauri::command]
pub fn plugins_rollback_available(id: String, version: String) -> Result<bool, String> {
    let base = data_base()?;
    Ok(rollback_available(&base, &id, &version).is_ok())
}
