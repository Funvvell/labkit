//! P3 Zotero 本地 API 桥接（reqwest，单一信任边界）。
//!
//! 决定性事实：Zotero 本地服务器丢弃浏览器形态请求（Mozilla UA / Origin 头），
//! WebView2 前端 fetch 必然被拦 → 所有 Zotero / Better BibTeX 请求收敛在本模块，
//! UA 自定 `LabKit/x.y`，前端只经 IPC 调用。
//!
//! 状态机（probe）：offline（未运行）/ disabled（403，未允许本机通信）/
//! readonly（7/8/9，无 Zotero-Server-ID）/ writable（10+，有 Server-ID）。
//! 写回仅 writable 开放：POST /api/local/authorize 用户弹窗授权，
//! 之后写请求带 Zotero-API-Key + Zotero-Server-ID；401 重新授权重试一次，
//! 412（Server-ID 变更）丢弃缓存重建后再试一次。授权密钥只存进程内存，不落盘。
//!
//! 参考（仅机制，不复制代码，Zotero 本体 AGPL 不触碰）：
//! https://www.zotero.org/support/dev/web_api/v3/local_api
//! https://www.zotero.org/support/dev/zotero_10_for_developers
//! https://retorque.re/zotero-better-bibtex/citing/cayw/

use std::sync::Mutex;
use std::sync::OnceLock;
use std::time::Duration;

use serde::Serialize;
use tauri_plugin_opener::OpenerExt;

const DEFAULT_PORT: u16 = 23119;
const UA: &str = concat!("LabKit/", env!("CARGO_PKG_VERSION"));
/// Zotero Web API 单页上限 100；同步按 start 翻页直到取满 limit。
const PAGE: u32 = 100;

fn port_or_default(port: Option<u16>) -> u16 {
    port.unwrap_or(DEFAULT_PORT)
}

fn base(port: Option<u16>) -> String {
    format!("http://127.0.0.1:{}", port_or_default(port))
}

fn client(secs: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(UA)
        // 本地 API 绝不能走系统代理：Windows 上 HTTP_PROXY 会把 127.0.0.1 请求
        // 转发到代理并拿到 403，误判为「未开启本机通信」。
        .no_proxy()
        .connect_timeout(Duration::from_secs(4))
        .timeout(Duration::from_secs(secs))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| format!("HTTP 客户端初始化失败：{e}"))
}

/// Zotero 条目 key：8 位字母数字。所有拼 URL 的 key 必须先过这里。
pub fn valid_key(key: &str) -> bool {
    key.len() == 8 && key.chars().all(|c| c.is_ascii_alphanumeric())
}

/* ---------------- 授权缓存（进程内存，按 Server-ID 分区） ---------------- */

struct Auth {
    server_id: String,
    api_key: String,
}

fn auth_cache() -> &'static Mutex<Option<Auth>> {
    static CACHE: OnceLock<Mutex<Option<Auth>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(None))
}

/* ---------------- probe：连接状态机 ---------------- */

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Probe {
    /// offline | disabled | readonly | writable
    pub state: String,
    pub port: u16,
    pub api_version: Option<String>,
    pub server_id: Option<String>,
    pub detail: String,
}

pub async fn probe(port: Option<u16>) -> Probe {
    let p = port_or_default(port);
    let url = format!("{}/api/", base(port));
    let cli = match client(6) {
        Ok(c) => c,
        Err(e) => {
            return Probe { state: "offline".into(), port: p, api_version: None, server_id: None, detail: e };
        }
    };
    match cli.get(&url).send().await {
        Err(e) => {
            let detail = if e.is_connect() {
                "Zotero 未运行：启动 Zotero 后重试（设置 → 高级 → 允许本机其他应用与 Zotero 通信）".to_string()
            } else if e.is_timeout() {
                "连接 Zotero 本地 API 超时".to_string()
            } else {
                format!("无法连接 Zotero 本地 API：{e}")
            };
            Probe { state: "offline".into(), port: p, api_version: None, server_id: None, detail }
        }
        Ok(r) => {
            let status = r.status();
            let hdr = |name: &str| {
                r.headers().get(name).and_then(|v| v.to_str().ok()).map(|s| s.to_string())
            };
            let api_version = hdr("Zotero-API-Version");
            let server_id = hdr("Zotero-Server-ID");
            if status == reqwest::StatusCode::FORBIDDEN {
                Probe {
                    state: "disabled".into(), port: p, api_version, server_id,
                    detail: "Zotero 拒绝了请求：请在 Zotero 设置 → 高级 → 勾选「允许本机其他应用与 Zotero 通信」".into(),
                }
            } else if status.is_success() {
                // 10+ 才返回 Zotero-Server-ID → 可写；7/8/9 只读。
                let writable = server_id.is_some();
                Probe {
                    state: if writable { "writable".into() } else { "readonly".into() },
                    port: p, api_version, server_id,
                    detail: if writable { "已连接，支持状态回写".into() } else { "已连接（只读：阅读状态与笔记保存在 LabKit 本地）".into() },
                }
            } else {
                Probe {
                    state: "disabled".into(), port: p, api_version, server_id,
                    detail: format!("本地 API 返回 HTTP {status}"),
                }
            }
        }
    }
}

/* ---------------- 读取：条目 / 分类 /  saved search ---------------- */

fn net_err(e: reqwest::Error) -> String {
    if e.is_connect() {
        "Zotero 未运行或本地 API 未开启".to_string()
    } else if e.is_timeout() {
        "Zotero 本地 API 响应超时".to_string()
    } else {
        format!("Zotero 请求失败：{e}")
    }
}

async fn get_json(url: &str, secs: u64) -> Result<serde_json::Value, String> {
    let cli = client(secs)?;
    let r = cli.get(url).send().await.map_err(net_err)?;
    let status = r.status();
    if status == reqwest::StatusCode::FORBIDDEN {
        return Err("Zotero 拒绝了请求：设置 → 高级 → 允许本机其他应用与 Zotero 通信".into());
    }
    if !status.is_success() {
        return Err(format!("Zotero 本地 API 返回 HTTP {status}"));
    }
    r.json::<serde_json::Value>().await.map_err(|e| format!("Zotero 响应解析失败：{e}"))
}

/// 翻页拉满 limit（单页 100）。scope：items / quicksearch / collections / searches / search-items。
/// 返回原始 API JSON（data 载荷），视图模型映射在前端 zoteroMapItem（node 可测）。
pub async fn list(
    port: Option<u16>,
    scope: String,
    query: Option<String>,
    key: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<serde_json::Value>, String> {
    let total = limit.unwrap_or(200).clamp(1, 2000);
    let path = match scope.as_str() {
        "items" | "quicksearch" => "/api/users/0/items".to_string(),
        "collections" => "/api/users/0/collections".to_string(),
        "searches" => "/api/users/0/searches".to_string(),
        "search-items" => {
            let k = key.as_deref().unwrap_or("");
            if !valid_key(k) {
                return Err("非法的 Zotero key".into());
            }
            format!("/api/users/0/searches/{k}/items")
        }
        _ => return Err(format!("未知的 Zotero 列表范围：{scope}")),
    };
    let mut out: Vec<serde_json::Value> = Vec::new();
    let mut start: u32 = 0;
    loop {
        let mut url = format!("{}{path}?format=json&limit={PAGE}&start={start}", base(port));
        if scope == "items" || scope == "quicksearch" || scope == "search-items" {
            url.push_str("&itemType=-attachment");
        }
        if scope == "quicksearch" {
            let q = query.as_deref().unwrap_or("").trim();
            if q.is_empty() {
                return Err("搜索词为空".into());
            }
            url.push_str(&format!("&qmode=titleCreatorYear&q={}", urlencode(q)));
        }
        let v = get_json(&url, 20).await?;
        let arr = v.as_array().ok_or("Zotero 列表响应不是数组")?;
        let n = arr.len() as u32;
        out.extend(arr.iter().cloned());
        if n < PAGE || out.len() as u32 >= total {
            break;
        }
        start += PAGE;
    }
    out.truncate(total as usize);
    Ok(out)
}

/// 最小百分号编码（query 参数用）：保留 unreserved，其余按 UTF-8 字节编码。
fn urlencode(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => out.push(b as char),
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

/* ---------------- 打开条目 / PDF ---------------- */

/// file=false：zotero://select 定位条目；file=true：解析 /items/<key>/file 的
/// file:// 重定向，路径必须落在 Zotero 存储目录内，再交系统阅读器。
pub async fn open(app: tauri::AppHandle, port: Option<u16>, key: String, file: Option<bool>) -> Result<String, String> {
    if !valid_key(&key) {
        return Err("非法的 Zotero key".into());
    }
    if !file.unwrap_or(false) {
        let url = format!("zotero://select/library/items/{key}");
        app.opener().open_url(&url, None::<&str>).map_err(|e| format!("打开 Zotero 失败：{e}"))?;
        return Ok(url);
    }
    let url = format!("{}/api/users/0/items/{key}/file", base(port));
    let cli = client(15)?;
    let r = cli.get(&url).send().await.map_err(net_err)?;
    let status = r.status();
    if status == reqwest::StatusCode::NOT_FOUND {
        return Err("该条目没有可打开的 PDF 附件".into());
    }
    if !status.is_redirection() {
        return Err(format!("Zotero 附件接口返回 HTTP {status}"));
    }
    let loc = r
        .headers()
        .get(reqwest::header::LOCATION)
        .and_then(|v| v.to_str().ok())
        .ok_or("Zotero 附件重定向缺少 Location")?;
    let parsed = url::Url::parse(loc).map_err(|e| format!("附件地址解析失败：{e}"))?;
    if parsed.scheme() != "file" {
        return Err("附件地址不是本地文件".into());
    }
    let path = parsed.to_file_path().map_err(|_| "附件地址无法转换为本地路径".to_string())?;
    // scope 限定：只允许 Zotero 存储目录内的文件（防重定向到任意路径）。
    let storage = dirs::home_dir().ok_or("无法定位用户目录")?.join("Zotero").join("storage");
    let canon = path.canonicalize().map_err(|_| "附件文件不存在或不可访问".to_string())?;
    let storage_canon = storage.canonicalize().unwrap_or(storage);
    if !canon.starts_with(&storage_canon) {
        return Err("附件路径不在 Zotero 存储目录内，已拒绝打开".into());
    }
    app.opener()
        .open_path(canon.to_string_lossy().into_owned(), None::<&str>)
        .map_err(|e| format!("打开 PDF 失败：{e}"))?;
    Ok(canon.to_string_lossy().into_owned())
}

/* ---------------- 写回（仅 10+） ---------------- */

async fn authorize(port: Option<u16>) -> Result<Auth, String> {
    let url = format!("{}/api/local/authorize", base(port));
    // 用户在 Zotero 弹窗里点确认，给足 120s。
    let cli = client(120)?;
    let r = cli
        .post(&url)
        .json(&serde_json::json!({"appName": "LabKit"}))
        .send()
        .await
        .map_err(net_err)?;
    let status = r.status();
    if status == reqwest::StatusCode::FORBIDDEN {
        return Err("Zotero 拒绝了授权请求".into());
    }
    if !status.is_success() {
        return Err(format!("授权失败：HTTP {status}（写回需要 Zotero 10+）"));
    }
    let v = r.json::<serde_json::Value>().await.map_err(|e| format!("授权响应解析失败：{e}"))?;
    let api_key = v
        .get("apiKey")
        .or_else(|| v.get("api_key"))
        .and_then(|x| x.as_str())
        .ok_or("授权响应缺少 apiKey")?
        .to_string();
    let server_id = v
        .get("serverId")
        .or_else(|| v.get("server_id"))
        .and_then(|x| x.as_str())
        .map(|s| s.to_string())
        .unwrap_or_default();
    let auth = Auth { server_id, api_key };
    *auth_cache().lock().unwrap() = Some(Auth { server_id: auth.server_id.clone(), api_key: auth.api_key.clone() });
    Ok(auth)
}

/// 确保有与当前 Server-ID 匹配的授权；没有就弹 Zotero 授权。
async fn ensure_auth(port: Option<u16>, server_id: &str) -> Result<Auth, String> {
    if let Some(a) = auth_cache().lock().unwrap().as_ref() {
        if a.server_id == server_id {
            return Ok(Auth { server_id: a.server_id.clone(), api_key: a.api_key.clone() });
        }
    }
    authorize(port).await
}

/// 给条目加 / 删一个 tag（阅读状态镜像）。本地台账为准，这里失败不影响本地状态。
/// 401 → 重新授权重试一次；412 → Server-ID 已变，丢弃缓存重建后再试一次。
pub async fn tag(port: Option<u16>, key: String, tag: String, remove: Option<bool>) -> Result<serde_json::Value, String> {
    if !valid_key(&key) {
        return Err("非法的 Zotero key".into());
    }
    let tag = tag.trim().to_string();
    if tag.is_empty() || tag.len() > 256 {
        return Err("tag 为空或过长".into());
    }
    let p = probe(port).await;
    if p.state != "writable" {
        return Err(format!("当前 Zotero 不支持写回（{}）：需要 Zotero 10+ 并开启本地 API", p.state));
    }
    let server_id = p.server_id.clone().unwrap_or_default();
    let mut attempt = 0u8;
    loop {
        attempt += 1;
        let auth = ensure_auth(port, &server_id).await?;
        let item_url = format!("{}/api/users/0/items/{key}", base(port));
        let cli = client(20)?;
        let r = cli.get(&item_url).send().await.map_err(net_err)?;
        if !r.status().is_success() {
            return Err(format!("读取条目失败：HTTP {}", r.status()));
        }
        let item = r.json::<serde_json::Value>().await.map_err(|e| format!("条目解析失败：{e}"))?;
        let version = item.get("version").and_then(|v| v.as_u64()).unwrap_or(0);
        let mut tags: Vec<serde_json::Value> = item
            .get("data")
            .and_then(|d| d.get("tags"))
            .and_then(|t| t.as_array())
            .cloned()
            .unwrap_or_default();
        let before = tags.len();
        tags.retain(|t| t.get("tag").and_then(|x| x.as_str()) != Some(tag.as_str()));
        if !remove.unwrap_or(false) {
            tags.push(serde_json::json!({"tag": tag}));
        }
        if remove.unwrap_or(false) && tags.len() == before {
            return Ok(serde_json::json!({"ok": true, "unchanged": true}));
        }
        let r = cli
            .patch(&item_url)
            .header("Zotero-API-Key", &auth.api_key)
            .header("Zotero-Server-ID", &auth.server_id)
            .header("If-Unmodified-Since-Version", version.to_string())
            .json(&serde_json::json!({"tags": tags}))
            .send()
            .await
            .map_err(net_err)?;
        let status = r.status();
        if status.is_success() {
            return Ok(serde_json::json!({"ok": true, "key": key, "tag": tag}));
        }
        if attempt >= 2 {
            return Err(format!("写回失败：HTTP {status}"));
        }
        if status == reqwest::StatusCode::UNAUTHORIZED {
            *auth_cache().lock().unwrap() = None; // 401：密钥失效，重新授权
            continue;
        }
        if status == reqwest::StatusCode::PRECONDITION_FAILED {
            *auth_cache().lock().unwrap() = None; // 412：Server-ID 变更，整体重建
            let fresh = probe(port).await;
            if fresh.state != "writable" {
                return Err("Zotero 重启后不再支持写回".into());
            }
            continue;
        }
        return Err(format!("写回失败：HTTP {status}"));
    }
}

/* ---------------- Better BibTeX（可选增强） ---------------- */

/// action：probe（探测）/ cite（CAYW 引用选择器）/ export（pull export）。
pub async fn bbt(port: Option<u16>, action: String, format: Option<String>) -> Result<String, String> {
    let fmt = format.unwrap_or_else(|| "json".into());
    let (url, secs) = match action.as_str() {
        "probe" => (format!("{}/better-bibtex/cayw?probe=1", base(port)), 6u64),
        "cite" => {
            const OK: &[&str] = &["json", "bibtex", "biblatex", "latex", "pandoc", "formatted-citation", "citekeys"];
            if !OK.contains(&fmt.as_str()) {
                return Err(format!("不支持的引用格式：{fmt}"));
            }
            (format!("{}/better-bibtex/cayw?format={}", base(port), urlencode(&fmt)), 120)
        }
        "export" => {
            const OK: &[&str] = &["BibTeX", "BibLaTeX", "Better CSL JSON", "CSL JSON"];
            if !OK.contains(&fmt.as_str()) {
                return Err(format!("不支持的导出翻译器：{fmt}"));
            }
            (format!("{}/better-bibtex/export/library?/1/{}", base(port), urlencode(&fmt)), 60)
        }
        _ => return Err(format!("未知的 BBT 动作：{action}")),
    };
    let cli = client(secs)?;
    let r = cli.get(&url).send().await.map_err(|e| {
        if e.is_connect() { "Zotero 未运行或 Better BibTeX 未安装".to_string() } else { net_err(e) }
    })?;
    let status = r.status();
    if status == reqwest::StatusCode::NOT_FOUND {
        return Err("Better BibTeX 未安装或未启用（Zotero 插件管理器里检查）".into());
    }
    if !status.is_success() {
        return Err(format!("Better BibTeX 返回 HTTP {status}"));
    }
    r.text().await.map_err(|e| format!("BBT 响应读取失败：{e}"))
}

/* ---------------- Tauri 命令层（参数一律单词，camelCase 安全） ---------------- */

#[tauri::command]
pub async fn zotero_probe(port: Option<u16>) -> Result<Probe, String> {
    Ok(probe(port).await)
}

#[tauri::command]
pub async fn zotero_list(
    port: Option<u16>,
    scope: String,
    query: Option<String>,
    key: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<serde_json::Value>, String> {
    list(port, scope, query, key, limit).await
}

#[tauri::command]
pub async fn zotero_open(app: tauri::AppHandle, port: Option<u16>, key: String, file: Option<bool>) -> Result<String, String> {
    open(app, port, key, file).await
}

#[tauri::command]
pub async fn zotero_tag(port: Option<u16>, key: String, tag_name: String, remove: Option<bool>) -> Result<serde_json::Value, String> {
    tag(port, key, tag_name, remove).await
}

#[tauri::command]
pub async fn zotero_bbt(port: Option<u16>, action: String, format: Option<String>) -> Result<String, String> {
    bbt(port, action, format).await
}