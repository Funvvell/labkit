//! InvenTree 只读 IPC 的输入校验契约（纯函数，不发网络请求）。
//!
//! 该命令存在的理由：桌面 CSP 的 connect-src 不含外部 https，前端 fetch 会被拦死。
//! 走 Rust 就必须自己把边界守住：只读 GET、只允许 /api/ 下路径、Token 不能带头注入。

use labkit::inventree::{valid_base, valid_path, valid_token};

#[test]
fn base_must_be_http_with_host() {
    assert!(valid_base("https://inventree.example.org"));
    assert!(valid_base("http://127.0.0.1:8000"));
    assert!(!valid_base("file:///C:/Windows/win.ini"));
    assert!(!valid_base("data:text/html,hi"));
    assert!(!valid_base("ftp://x/y"));
    assert!(!valid_base("not a url"));
    assert!(!valid_base("https://"));
    assert!(!valid_base(""));
}

#[test]
fn path_must_stay_under_api() {
    assert!(valid_path("/api/"));
    assert!(valid_path("/api/part/?limit=500"));
    assert!(!valid_path("/admin/"));
    assert!(!valid_path("/api/../secret"));
    assert!(!valid_path(r"/api\part"));
    assert!(!valid_path("/api/\r\nX"));
    assert!(!valid_path("api/part"));
}

#[test]
fn token_rejects_header_injection() {
    assert!(valid_token("abc123"));
    assert!(valid_token(""));
    assert!(!valid_token("abc\r\nX-Evil: 1"));
    assert!(!valid_token("abc\n"));
    assert!(!valid_token(&"x".repeat(513)));
}
