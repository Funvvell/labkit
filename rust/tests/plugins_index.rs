//! P5 市场拆分：索引 URL 推导 / 条目归类 / 类型冲突 / 生效类型。
//! 全部是纯函数，不联网、不碰磁盘。

use labkit::plugins as p;

fn entry(id: &str, kind: &str) -> p::IndexEntry {
    p::IndexEntry {
        id: id.into(),
        name: id.into(),
        author: String::new(),
        description: String::new(),
        repo: "u/r".into(),
        kind: kind.into(),
        min_app_version: String::new(),
    }
}

#[test]
fn net_hint_explains_proxy_certificate_and_dns() {
    assert!(p::net_hint_text("invalid peer certificate: UnknownIssuer").contains("TLS"));
    assert!(p::net_hint_text("error trying to connect: dns error").contains("DNS"));
    assert!(p::net_hint_text("operation timed out").contains("超时"));
    assert!(p::net_hint_text("error sending request for url (...)").contains("网络"));
}

#[test]
fn index_file_maps_kind_to_filename() {
    assert_eq!(p::index_file("tool").unwrap(), "tools.json");
    assert_eq!(p::index_file("widget").unwrap(), "widgets.json");
    assert_eq!(p::index_file(" TOOL ").unwrap(), "tools.json");
    assert!(p::index_file("both").is_err(), "both 不是市场类型");
    assert!(p::index_file("").is_err());
    assert!(p::index_file("hack").is_err());
}

#[test]
fn index_urls_prefers_kind_file_then_legacy() {
    let tools = p::index_urls("tool", None).unwrap();
    assert_eq!(
        tools,
        vec![
            format!("{}/tools.json", p::DEFAULT_INDEX_BASE),
            format!("{}/plugins.json", p::DEFAULT_INDEX_BASE),
        ]
    );
    let widgets = p::index_urls("widget", None).unwrap();
    assert_eq!(widgets[0], format!("{}/widgets.json", p::DEFAULT_INDEX_BASE));

    // 目录源：结尾斜杠可有可无
    let base = "https://raw.githubusercontent.com/me/labkit-plugins/main";
    let want = vec![format!("{base}/tools.json"), format!("{base}/plugins.json")];
    assert_eq!(p::index_urls("tool", Some(base)).unwrap(), want);
    assert_eq!(p::index_urls("tool", Some(&format!("{base}/"))).unwrap(), want);
    // 空白源等同未填
    assert_eq!(p::index_urls("tool", Some("   ")).unwrap(), tools);
}

#[test]
fn index_urls_accepts_full_json_and_rejects_foreign_hosts() {
    let full = "https://raw.githubusercontent.com/me/x/main/plugins.json";
    assert_eq!(p::index_urls("tool", Some(full)).unwrap(), vec![full.to_string()]);
    assert!(p::index_urls("tool", Some("https://example.com/tools.json")).is_err());
    assert!(p::index_urls("tool", Some("http://raw.githubusercontent.com/a/b.json")).is_err());
    assert!(p::index_urls("widget", Some("javascript:alert(1)")).is_err());
}

#[test]
fn entry_matches_by_market() {
    assert!(p::entry_matches("tool", &entry("a", "tool")));
    assert!(!p::entry_matches("widget", &entry("a", "tool")));
    assert!(p::entry_matches("widget", &entry("b", "widget")));
    // both 两侧都收
    assert!(p::entry_matches("tool", &entry("c", "both")));
    assert!(p::entry_matches("widget", &entry("c", "both")));
    // 未声明按 tool（与 IndexEntry::kind() 一致）
    assert!(p::entry_matches("tool", &entry("d", "")));
    assert!(!p::entry_matches("widget", &entry("d", "")));
    // 未知市场一律不收
    assert!(!p::entry_matches("hack", &entry("a", "tool")));
    // 未知条目类型不收
    assert!(!p::entry_matches("tool", &entry("e", "hack")));
}

#[test]
fn kind_conflict_only_blocks_single_against_single() {
    assert!(!p::kind_conflict("tool", "tool"));
    assert!(p::kind_conflict("tool", "widget"));
    assert!(p::kind_conflict("widget", "tool"));
    assert!(!p::kind_conflict("widget", "widget"));
    // both / 未声明 / 未知都不拦——存量包必须还能装
    assert!(!p::kind_conflict("tool", "both"));
    assert!(!p::kind_conflict("widget", "both"));
    assert!(!p::kind_conflict("tool", ""));
    assert!(!p::kind_conflict("", "tool"));
    assert!(!p::kind_conflict("hack", "tool"));
}

#[test]
fn effective_kind_prefers_manifest_then_market() {
    assert_eq!(p::effective_kind(Some("widget"), "tool"), ("tool".into(), false));
    assert_eq!(p::effective_kind(Some("tool"), "widget"), ("widget".into(), false));
    assert_eq!(p::effective_kind(None, "widget"), ("widget".into(), false));
    assert_eq!(p::effective_kind(None, "both"), ("both".into(), true));
    // 未声明 → 跟随市场，且标 legacy
    assert_eq!(p::effective_kind(Some("widget"), ""), ("widget".into(), true));
    assert_eq!(p::effective_kind(None, ""), ("tool".into(), true));
    assert_eq!(p::effective_kind(Some("tool"), "  "), ("tool".into(), true));
}

#[test]
fn parse_manifest_kind_is_normalized_and_validated() {
    let with = |k: &str| {
        serde_json::json!({ "id": "x-demo", "name": "n", "version": "1.0.0", "kind": k })
            .to_string()
            .into_bytes()
    };
    assert_eq!(p::parse_manifest(&with("WIDGET"), None).unwrap().kind, "widget");
    assert_eq!(p::parse_manifest(&with("both"), None).unwrap().kind, "both");
    assert_eq!(p::parse_manifest(&with(""), None).unwrap().kind, "");
    assert!(p::parse_manifest(&with("hack"), None).is_err());

    let no_kind = serde_json::json!({ "id": "x-demo", "name": "n", "version": "1.0.0" })
        .to_string()
        .into_bytes();
    assert_eq!(p::parse_manifest(&no_kind, None).unwrap().kind, "");
}

#[test]
fn install_into_wrong_market_is_rejected_before_writing() {
    let dir = tempfile::TempDir::new().unwrap();
    let base = dir.path();
    let mb = serde_json::json!({
        "id": "x-w", "name": "卡片包", "version": "1.0.0", "kind": "widget", "main": "main.js"
    })
    .to_string()
    .into_bytes();
    let assets = vec![("main.js".to_string(), b"1".to_vec())];
    let err = p::install_at_kind(base, "x-w", "1.0.0", Some("tool"), &mb, &assets).unwrap_err();
    assert!(err.contains("不能安装到 tool"), "实际错误：{err}");
    assert!(!p::plugin_dir(base, "x-w", "1.0.0").unwrap().exists(), "拒绝时不得落盘");

    let inst = p::install_at_kind(base, "x-w", "1.0.0", Some("widget"), &mb, &assets).unwrap();
    assert_eq!(inst.kind, "widget");
    assert!(!inst.legacy);
}

#[test]
fn install_without_declared_kind_follows_market_and_marks_legacy() {
    let dir = tempfile::TempDir::new().unwrap();
    let base = dir.path();
    let mb = serde_json::json!({
        "id": "x-old", "name": "老包", "version": "1.0.0", "main": "main.js"
    })
    .to_string()
    .into_bytes();
    let assets = vec![("main.js".to_string(), b"1".to_vec())];
    let inst = p::install_at_kind(base, "x-old", "1.0.0", Some("widget"), &mb, &assets).unwrap();
    assert_eq!(inst.kind, "widget");
    assert!(inst.legacy, "未声明类型的包必须标 legacy");

    // both 包照样能装进任一市场
    let both = serde_json::json!({
        "id": "x-both", "name": "双包", "version": "1.0.0", "kind": "both", "main": "main.js"
    })
    .to_string()
    .into_bytes();
    let inst = p::install_at_kind(base, "x-both", "1.0.0", Some("tool"), &both, &assets).unwrap();
    assert_eq!(inst.kind, "both");
    assert!(inst.legacy);
}
