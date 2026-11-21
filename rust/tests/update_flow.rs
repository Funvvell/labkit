//! 应用内更新：清单解析 / 版本比较 / 下载地址白名单 / 版本号单一来源。

use labkit::update::{
    file_sha256_matches, is_newer, normalize_version, parse_manifest, platform_asset, valid_version,
    validate_url,
};

const SHA: &str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

fn manifest(version: &str, url: &str, sha: &str) -> String {
    format!(
        r#"{{
          "version": "{version}",
          "notes": "更新内容",
          "pubDate": "2026-11-21T00:00:00Z",
          "platforms": {{ "windows-x86_64": {{ "url": "{url}", "sha256": "{sha}", "size": 123 }} }}
        }}"#
    )
}

#[test]
fn parses_manifest_and_normalizes_version() {
    let m = parse_manifest(
        manifest(
            "v0.4.1",
            "https://github.com/Funvvell/labkit/releases/download/v0.4.1/LabKit-win-x64.exe",
            SHA,
        )
        .as_bytes(),
    )
    .expect("manifest should parse");
    assert_eq!(m.version, "0.4.1");
    assert_eq!(m.notes, "更新内容");
    let a = platform_asset(&m).expect("asset should validate");
    assert_eq!(a.size, 123);
}

#[test]
fn rejects_bad_sha_and_bad_urls() {
    let bad_sha = parse_manifest(
        manifest(
            "0.4.1",
            "https://github.com/Funvvell/labkit/releases/download/v0.4.1/LabKit-win-x64.exe",
            "not-a-sha",
        )
        .as_bytes(),
    )
    .expect("manifest shape is fine");
    assert!(platform_asset(&bad_sha).is_err());

    let http_url = parse_manifest(
        manifest(
            "0.4.1",
            "http://github.com/Funvvell/labkit/releases/download/v0.4.1/LabKit-win-x64.exe",
            SHA,
        )
        .as_bytes(),
    )
    .expect("manifest shape is fine");
    assert!(platform_asset(&http_url).is_err());

    let foreign = parse_manifest(
        manifest("0.4.1", "https://example.com/LabKit.exe", SHA).as_bytes(),
    )
    .expect("manifest shape is fine");
    assert!(platform_asset(&foreign).is_err());
}

#[test]
fn loopback_is_debug_only() {
    let r = validate_url("http://127.0.0.1:8000/latest.json");
    assert_eq!(r.is_ok(), cfg!(debug_assertions));
    let r = validate_url("http://localhost:8000/latest.json");
    assert_eq!(r.is_ok(), cfg!(debug_assertions));
}

#[test]
fn validates_versions() {
    assert!(valid_version("0.4.1"));
    assert!(valid_version("v0.4.1"));
    assert!(valid_version("0.4.0-beta.1"));
    assert!(!valid_version(""));
    assert!(!valid_version("../evil"));
    assert!(!valid_version("C:\\evil"));
    assert_eq!(normalize_version(" V0.4.1 "), "0.4.1");
}

#[test]
fn compares_versions() {
    assert!(is_newer("0.4.1", "0.4.0"));
    assert!(is_newer("0.10.0", "0.9.9"));
    assert!(!is_newer("0.4.0", "0.4.0"));
    assert!(!is_newer("0.4.0", "0.4.1"));
    assert!(!is_newer("v0.4.0", "0.4.0"));
}

/// CHANGELOG 声明版本单一来源；这里把 Cargo.toml 与 tauri.conf.json 锁死。
#[test]
fn tauri_conf_version_matches_cargo() {
    let raw = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/tauri.conf.json"));
    let v: serde_json::Value = serde_json::from_str(raw).expect("tauri.conf.json is valid JSON");
    assert_eq!(
        v["version"].as_str().expect("version string"),
        env!("CARGO_PKG_VERSION")
    );
}

/// helper 替换前的 TOCTOU 复核：哈希一致放行，不一致 / 文件缺失拒绝。
#[test]
fn helper_rehash_guards_swap() {
    let dir = std::env::temp_dir().join(format!("labkit-update-test-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("mkdir");
    let f = dir.join("pkg.exe.new");
    std::fs::write(&f, b"MZ-fake-payload").expect("write");
    let want = {
        use sha2::{Digest, Sha256};
        let d: String = Sha256::digest(b"MZ-fake-payload")
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect();
        d
    };
    assert!(file_sha256_matches(&f, &want));
    assert!(file_sha256_matches(&f, &want.to_uppercase()));
    assert!(!file_sha256_matches(&f, SHA));
    std::fs::write(&f, b"swapped").expect("rewrite");
    assert!(!file_sha256_matches(&f, &want), "换包后必须复核失败");
    assert!(!file_sha256_matches(&dir.join("missing.exe"), &want));
    let _ = std::fs::remove_dir_all(&dir);
}
