// P3 Zotero 状态机与写回重试的确定性验证：本地 mock HTTP 服务器按脚本应答，
// 从模块公开函数（probe/list/tag/bbt/open 的纯逻辑部分）观察状态与请求序列。
// 不依赖真实 Zotero；真实 Zotero 9 的只读路径另行真机冒烟。
//
// 覆盖：offline/disabled/readonly/writable 四态、翻页与 limit、非法输入拒绝（无副作用）、
// 只读拒绝写回（证明 PATCH 未发生）、写回 happy path 头部契约、401 重授权重试、412 重建重试。

use std::collections::VecDeque;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};

use labkit::zotero;

#[derive(Debug, Clone)]
struct Req {
    method: String,
    path: String,
    headers: Vec<(String, String)>,
    body: String,
}

struct Step {
    method: &'static str,
    path_prefix: &'static str,
    status: u16,
    headers: Vec<(&'static str, String)>,
    body: String,
}

fn step(method: &'static str, path_prefix: &'static str, status: u16, body: &str) -> Step {
    Step { method, path_prefix, status, headers: vec![], body: body.to_string() }
}

fn with_headers(mut s: Step, headers: Vec<(&'static str, String)>) -> Step {
    s.headers = headers;
    s
}

/// 脚本化 mock：每个请求必须命中下一个 Step（方法 + 路径前缀），否则 500 并记录。
/// 返回 (端口, 请求日志)。
fn mock(script: Vec<Step>) -> (u16, Arc<Mutex<Vec<Req>>>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let port = listener.local_addr().unwrap().port();
    let log: Arc<Mutex<Vec<Req>>> = Arc::new(Mutex::new(vec![]));
    let log2 = log.clone();
    let script = Arc::new(Mutex::new(script.into_iter().collect::<VecDeque<_>>()));
    std::thread::spawn(move || {
        for stream in listener.incoming() {
            let mut stream = match stream { Ok(s) => s, Err(_) => break };
            let _ = stream.set_read_timeout(Some(std::time::Duration::from_secs(5)));
            let script = script.clone();
            let log = log2.clone();
            // 一个连接上可能复用多个请求；客户端断开后必须回到 accept 循环，
            // 否则下一个 reqwest Client 的新连接会被拒绝（表现为「Zotero 未运行」）。
            'conn: loop {
                let mut buf = Vec::new();
                let mut tmp = [0u8; 4096];
                let header_end;
                loop {
                    match stream.read(&mut tmp) {
                        Ok(0) => break 'conn,
                        Ok(n) => buf.extend_from_slice(&tmp[..n]),
                        Err(_) => break 'conn,
                    }
                    if let Some(p) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
                        header_end = p + 4;
                        break;
                    }
                }
                let head = String::from_utf8_lossy(&buf[..header_end]).to_string();
                let mut lines = head.lines();
                let first = lines.next().unwrap_or("").to_string();
                let mut parts = first.split_whitespace();
                let method = parts.next().unwrap_or("").to_string();
                let path = parts.next().unwrap_or("").to_string();
                let mut headers = vec![];
                let mut clen = 0usize;
                for l in lines {
                    if let Some((k, v)) = l.split_once(':') {
                        let k = k.trim().to_ascii_lowercase();
                        let v = v.trim().to_string();
                        if k == "content-length" { clen = v.parse().unwrap_or(0); }
                        headers.push((k, v));
                    }
                }
                while buf.len() < header_end + clen {
                    match stream.read(&mut tmp) {
                        Ok(0) => break 'conn,
                        Ok(n) => buf.extend_from_slice(&tmp[..n]),
                        Err(_) => break 'conn,
                    }
                }
                let body = String::from_utf8_lossy(&buf[header_end..header_end + clen]).to_string();
                let req = Req { method: method.clone(), path: path.clone(), headers, body };
                log.lock().unwrap().push(req.clone());
                let next = script.lock().unwrap().pop_front();
                let resp = match next {
                    Some(s) if s.method == method && path.starts_with(s.path_prefix) => s,
                    Some(s) => {
                        eprintln!("mock 脚本失配：期望 {} {}，实际 {} {}", s.method, s.path_prefix, method, path);
                        step("X", "X", 500, "script mismatch")
                    }
                    None => step("X", "X", 500, "script exhausted"),
                };
                let reason = match resp.status { 200 => "OK", 204 => "No Content", 300 => "Multiple Choices", 401 => "Unauthorized", 403 => "Forbidden", 404 => "Not Found", 412 => "Precondition Failed", _ => "Status" };
                let mut out = format!("HTTP/1.1 {} {}\r\nContent-Length: {}\r\nConnection: keep-alive\r\n", resp.status, reason, resp.body.len());
                for (k, v) in &resp.headers { out.push_str(&format!("{k}: {v}\r\n")); }
                out.push_str("\r\n");
                out.push_str(&resp.body);
                if stream.write_all(out.as_bytes()).is_err() { break 'conn; }
                if resp.status == 204 { /* 无 body */ }
            }
        }
    });
    (port, log)
}

fn probe_step(status: u16, server_id: Option<&str>) -> Step {
    let mut headers = vec![("Zotero-API-Version", "3".to_string())];
    if let Some(id) = server_id { headers.push(("Zotero-Server-ID", id.to_string())); }
    with_headers(step("GET", "/api/", status, ""), headers)
}

const ITEM: &str = r#"{"key":"ABCD1234","version":7,"data":{"key":"ABCD1234","title":"T","tags":[{"tag":"old"}]}}"#;

/* 写回测试共享全局授权缓存 → 串行化 */
static SERIAL: Mutex<()> = Mutex::new(());

fn block_on<F: std::future::Future>(f: F) -> F::Output {
    tauri::async_runtime::block_on(f)
}

#[test]
fn probe_offline_when_no_listener() {
    // 找一个确定没人监听的端口：bind 后立刻 drop
    let l = TcpListener::bind("127.0.0.1:0").unwrap();
    let port = l.local_addr().unwrap().port();
    drop(l);
    let p = block_on(zotero::probe(Some(port)));
    assert_eq!(p.state, "offline");
    assert!(p.detail.contains("Zotero"));
}

#[test]
fn probe_disabled_on_403() {
    let (port, _log) = mock(vec![probe_step(403, None)]);
    let p = block_on(zotero::probe(Some(port)));
    assert_eq!(p.state, "disabled");
    assert!(p.detail.contains("允许本机其他应用"));
}

#[test]
fn probe_readonly_without_server_id() {
    let (port, _log) = mock(vec![probe_step(200, None)]);
    let p = block_on(zotero::probe(Some(port)));
    assert_eq!(p.state, "readonly");
    assert_eq!(p.api_version.as_deref(), Some("3"));
    assert!(p.server_id.is_none());
}

#[test]
fn probe_writable_with_server_id() {
    let (port, _log) = mock(vec![probe_step(200, Some("SRV-1"))]);
    let p = block_on(zotero::probe(Some(port)));
    assert_eq!(p.state, "writable");
    assert_eq!(p.server_id.as_deref(), Some("SRV-1"));
}

#[test]
fn list_paginates_and_truncates() {
    // 第一页 100 条，第二页 30 条 → 共 130；limit=120 截断
    let page1 = serde_json::to_string(&(0..100).map(|i| serde_json::json!({"key": format!("K{i:07}")})).collect::<Vec<_>>()).unwrap();
    let page2 = serde_json::to_string(&(0..30).map(|i| serde_json::json!({"key": format!("P{i:07}")})).collect::<Vec<_>>()).unwrap();
    let (port, log) = mock(vec![
        step("GET", "/api/users/0/items", 200, &page1),
        step("GET", "/api/users/0/items", 200, &page2),
    ]);
    let items = block_on(zotero::list(Some(port), "items".into(), None, None, Some(120))).unwrap();
    assert_eq!(items.len(), 120);
    let reqs = log.lock().unwrap();
    assert_eq!(reqs.len(), 2);
    assert!(reqs[0].path.contains("start=0"));
    assert!(reqs[1].path.contains("start=100"));
    assert!(reqs[0].path.contains("itemType=-attachment"));
}

#[test]
fn list_rejects_bad_input_without_request() {
    let (port, log) = mock(vec![]);
    assert!(block_on(zotero::list(Some(port), "ghost".into(), None, None, None)).is_err());
    assert!(block_on(zotero::list(Some(port), "quicksearch".into(), Some("  ".into()), None, None)).is_err());
    assert!(block_on(zotero::list(Some(port), "search-items".into(), None, Some("bad-key!".into()), None)).is_err());
    assert_eq!(log.lock().unwrap().len(), 0, "非法输入不得发出请求");
}

#[test]
fn quicksearch_encodes_query() {
    let (port, log) = mock(vec![step("GET", "/api/users/0/items", 200, "[]")]);
    block_on(zotero::list(Some(port), "quicksearch".into(), Some("尿酸 炎症".into()), None, Some(25))).unwrap();
    let reqs = log.lock().unwrap();
    assert!(reqs[0].path.contains("qmode=titleCreatorYear"));
    assert!(reqs[0].path.contains("q=%E5%B0%BF%E9%85%B8%20%E7%82%8E%E7%97%87"));
}

#[test]
fn key_validation() {
    assert!(zotero::valid_key("ABCD1234"));
    assert!(zotero::valid_key("abcd1234"));
    assert!(!zotero::valid_key("ABC"));
    assert!(!zotero::valid_key("ABCD12345"));
    assert!(!zotero::valid_key("ABCD-123"));
    assert!(!zotero::valid_key("ABCD123 "));
}

#[test]
fn tag_refused_on_readonly_no_patch() {
    let _g = SERIAL.lock().unwrap();
    let (port, log) = mock(vec![probe_step(200, None)]);
    let err = block_on(zotero::tag(Some(port), "ABCD1234".into(), "labkit/已读".into(), None)).unwrap_err();
    assert!(err.contains("10+"));
    let reqs = log.lock().unwrap();
    assert_eq!(reqs.len(), 1, "只读探测后不得发出任何写请求");
    assert_eq!(reqs[0].method, "GET");
}

#[test]
fn tag_happy_path_headers_and_body() {
    let _g = SERIAL.lock().unwrap();
    let (port, log) = mock(vec![
        probe_step(200, Some("SRV-H")),
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-H","serverId":"SRV-H"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
        step("PATCH", "/api/users/0/items/ABCD1234", 204, ""),
    ]);
    let out = block_on(zotero::tag(Some(port), "ABCD1234".into(), "labkit/已读".into(), None)).unwrap();
    assert_eq!(out["ok"], true);
    let reqs = log.lock().unwrap();
    assert_eq!(reqs.len(), 4);
    let patch = &reqs[3];
    let hdr = |k: &str| patch.headers.iter().find(|(a, _)| a == k).map(|(_, v)| v.clone());
    assert_eq!(hdr("zotero-api-key").as_deref(), Some("KEY-H"));
    assert_eq!(hdr("zotero-server-id").as_deref(), Some("SRV-H"));
    assert_eq!(hdr("if-unmodified-since-version").as_deref(), Some("7"));
    let body: serde_json::Value = serde_json::from_str(&patch.body).unwrap();
    let tags = body["tags"].as_array().unwrap();
    assert!(tags.iter().any(|t| t["tag"] == "old"));
    assert!(tags.iter().any(|t| t["tag"] == "labkit/已读"));
}

#[test]
fn tag_401_reauthorizes_once() {
    let _g = SERIAL.lock().unwrap();
    let (port, log) = mock(vec![
        probe_step(200, Some("SRV-401")),
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-OLD","serverId":"SRV-401"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
        step("PATCH", "/api/users/0/items/ABCD1234", 401, ""),
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-NEW","serverId":"SRV-401"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
        step("PATCH", "/api/users/0/items/ABCD1234", 204, ""),
    ]);
    let out = block_on(zotero::tag(Some(port), "ABCD1234".into(), "labkit/待精读".into(), None)).unwrap();
    assert_eq!(out["ok"], true);
    let reqs = log.lock().unwrap();
    assert_eq!(reqs.len(), 7);
    assert_eq!(reqs.iter().filter(|r| r.method == "POST").count(), 2, "401 后必须重新授权一次");
    let last_patch = reqs.last().unwrap();
    assert!(last_patch.headers.iter().any(|(k, v)| k == "zotero-api-key" && v == "KEY-NEW"));
}

#[test]
fn tag_412_rebuilds_server_id() {
    let _g = SERIAL.lock().unwrap();
    let (port, log) = mock(vec![
        probe_step(200, Some("SRV-OLD")),
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-1","serverId":"SRV-OLD"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
        step("PATCH", "/api/users/0/items/ABCD1234", 412, ""),
        probe_step(200, Some("SRV-NEW")), // 412 后重新 probe
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-2","serverId":"SRV-NEW"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
        step("PATCH", "/api/users/0/items/ABCD1234", 204, ""),
    ]);
    let out = block_on(zotero::tag(Some(port), "ABCD1234".into(), "labkit/已读".into(), None)).unwrap();
    assert_eq!(out["ok"], true);
    let reqs = log.lock().unwrap();
    let last_patch = reqs.last().unwrap();
    assert!(last_patch.headers.iter().any(|(k, v)| k == "zotero-server-id" && v == "SRV-NEW"), "412 后必须按新 Server-ID 写");
}

#[test]
fn tag_remove_missing_is_noop() {
    let _g = SERIAL.lock().unwrap();
    let (port, log) = mock(vec![
        probe_step(200, Some("SRV-RM")),
        step("POST", "/api/local/authorize", 200, r#"{"apiKey":"KEY-R","serverId":"SRV-RM"}"#),
        step("GET", "/api/users/0/items/ABCD1234", 200, ITEM),
    ]);
    let out = block_on(zotero::tag(Some(port), "ABCD1234".into(), "不存在的tag".into(), Some(true))).unwrap();
    assert_eq!(out["unchanged"], true);
    assert_eq!(log.lock().unwrap().len(), 3, "删除不存在的 tag 不得发 PATCH");
}

#[test]
fn bbt_probe_404_and_format_whitelist() {
    let (port, _log) = mock(vec![step("GET", "/better-bibtex/cayw", 404, "")]);
    let err = block_on(zotero::bbt(Some(port), "probe".into(), None)).unwrap_err();
    assert!(err.contains("Better BibTeX"));
    // 白名单外的格式直接拒绝，不发请求
    let (port2, log2) = mock(vec![]);
    assert!(block_on(zotero::bbt(Some(port2), "cite".into(), Some("exe".into()))).is_err());
    assert!(block_on(zotero::bbt(Some(port2), "export".into(), Some("rm -rf".into()))).is_err());
    assert_eq!(log2.lock().unwrap().len(), 0);
}

#[test]
fn bbt_cite_returns_body() {
    let (port, log) = mock(vec![step("GET", "/better-bibtex/cayw", 200, "[{\"citationkey\":\"smith2026\"}]")]);
    let out = block_on(zotero::bbt(Some(port), "cite".into(), Some("json".into()))).unwrap();
    assert!(out.contains("smith2026"));
    assert!(log.lock().unwrap()[0].path.contains("format=json"));
}