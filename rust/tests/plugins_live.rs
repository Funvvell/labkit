//! 手动网络冒烟：验证本机到 raw.githubusercontent.com 的 TLS / 索引解析链路。
//! 默认跳过（CI 不依赖外网）；本地排障时运行：
//! `cargo test --test plugins_live -- --ignored --nocapture`

use std::sync::mpsc;
use std::time::Duration;

#[test]
#[ignore = "需要访问 raw.githubusercontent.com"]
fn live_tool_and_widget_index() {
    let tools = tauri::async_runtime::block_on(labkit::plugins::fetch_index("tool", None, true))
        .expect("工具索引应能加载");
    assert!(
        tools.items.iter().any(|e| e.id == "starter"),
        "工具索引缺少 starter：{:?}",
        tools.items
    );

    let widgets = tauri::async_runtime::block_on(labkit::plugins::fetch_index("widget", None, true))
        .expect("卡片索引应能加载");
    assert!(
        widgets.items.iter().any(|e| e.id == "starter-card"),
        "卡片索引缺少 starter-card：{:?}",
        widgets.items
    );

    println!(
        "tool index: {} items from {}; widget index: {} items from {}",
        tools.items.len(),
        tools.url,
        widgets.items.len(),
        widgets.url
    );
}

#[test]
#[ignore = "需要访问 raw.githubusercontent.com"]
fn live_parallel_tool_and_widget_index() {
    let (tx, rx) = mpsc::channel();
    for kind in ["tool", "widget"] {
        let tx = tx.clone();
        tauri::async_runtime::spawn(async move {
            let r = labkit::plugins::fetch_index(kind, None, true).await;
            let _ = tx.send((kind, r));
        });
    }
    drop(tx);

    let mut seen = Vec::new();
    for _ in 0..2 {
        let (kind, r) = rx
            .recv_timeout(Duration::from_secs(45))
            .expect("并发请求超时");
        let payload = r.unwrap_or_else(|e| panic!("{kind} 并发索引失败：{e}"));
        assert!(payload.items.iter().any(|e| e.id == "starter" || e.id == "starter-card"));
        seen.push(kind);
    }
    seen.sort();
    assert_eq!(seen, vec!["tool", "widget"]);
    println!("parallel index ok: {seen:?}");
}
