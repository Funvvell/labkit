//! InvenTree REST API 只读对接（可选，用户自备服务器）。
//!
//! 为什么走 Rust 而不是前端 fetch：桌面 CSP 的 `connect-src` 只放行 `'self'` 与 `ipc:`，
//! 前端直接 fetch 外部服务器会被拦死（该功能曾因此在桌面版完全不可用，只在无 CSP 的
//! 浏览器演示里能用）。走 IPC 既修好功能，又不必为它放宽 `connect-src` —— 那会给
//! 同权限的扩展开一条任意联网通道。
//!
//! 约束：只读 GET、只允许 `/api/` 下的路径、不跟随重定向、响应体有上限。

use std::time::Duration;

use serde::Serialize;

const UA: &str = concat!("LabKit/", env!("CARGO_PKG_VERSION"));
/// part 列表 limit=500 远小于此；上限只为防异常服务器把内存吃满。
const MAX_BODY: usize = 8 * 1024 * 1024;

#[derive(Debug, Serialize)]
pub struct ApiResponse {
    pub status: u16,
    pub body: String,
}

/// 只允许 http(s) 且必须解析出主机名，拒绝 file: / data: 等本地 scheme。
pub fn valid_base(base: &str) -> bool {
    match url::Url::parse(base) {
        Ok(u) => {
            matches!(u.scheme(), "http" | "https")
                && u.host_str().map(|h| !h.is_empty()).unwrap_or(false)
        }
        Err(_) => false,
    }
}

/// 只允许 `/api/` 下的路径；拒绝越界段、反斜杠与控制字符。
pub fn valid_path(path: &str) -> bool {
    path.starts_with("/api/")
        && !path.contains("..")
        && !path.contains('\\')
        && !path.chars().any(|c| c.is_control())
}

/// Token 走 Authorization 头，必须是可打印 ASCII，避免头注入。
pub fn valid_token(token: &str) -> bool {
    token.len() <= 512 && token.chars().all(|c| c.is_ascii_graphic() || c == ' ')
}

pub async fn get(base: &str, path: &str, token: &str) -> Result<ApiResponse, String> {
    if !valid_base(base) {
        return Err("服务器地址需为 http(s):// 且含主机名".into());
    }
    if !valid_path(path) {
        return Err("只允许读取 /api/ 下的路径".into());
    }
    if !valid_token(token) {
        return Err("Token 含非法字符".into());
    }
    let url = format!("{}{}", base.trim_end_matches('/'), path);
    let client = reqwest::Client::builder()
        .user_agent(UA)
        .connect_timeout(Duration::from_secs(6))
        .timeout(Duration::from_secs(20))
        // 不跟随重定向：避免被指向内网其它主机或降级到 http。
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| format!("HTTP 客户端初始化失败：{e}"))?;
    let mut req = client.get(&url);
    if !token.is_empty() {
        req = req.header("Authorization", format!("Token {token}"));
    }
    let resp = req.send().await.map_err(|e| format!("请求失败：{e}"))?;
    let status = resp.status().as_u16();
    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("读取响应失败：{e}"))?;
    if bytes.len() > MAX_BODY {
        return Err("响应体过大，已拒绝".into());
    }
    Ok(ApiResponse {
        status,
        body: String::from_utf8_lossy(&bytes).into_owned(),
    })
}

#[tauri::command]
pub async fn inventree_get(
    base: String,
    path: String,
    token: String,
) -> Result<ApiResponse, String> {
    get(&base, &path, &token).await
}