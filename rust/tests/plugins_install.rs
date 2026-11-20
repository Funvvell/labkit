//! P4 插件安装链路的确定性验证：白名单 / 路径越界 / manifest 校验 /
//! sha256 / 原子安装与回退。不依赖网络与 GitHub。

use std::path::Path;

use labkit::plugins as p;
use tempfile::TempDir;

fn manifest(id: &str, hash: Option<&str>) -> Vec<u8> {
    serde_json::json!({
        "id": id,
        "name": "示例工具",
        "version": "1.0.0",
        "description": "测试插件",
        "author": "tester",
        "repo": "Funvvell/labkit-plugin-template",
        "minAppVersion": "0.3.0",
        "kind": "tool",
        "main": "main.js",
        "sha256": hash,
    })
    .to_string()
    .into_bytes()
}

#[test]
fn id_version_asset_whitelist() {
    assert!(p::valid_id("x-demo"));
    assert!(p::valid_id("abc_123"));
    assert!(!p::valid_id("../evil"));
    assert!(!p::valid_id("a/b"));
    assert!(!p::valid_id(""));
    assert!(p::valid_version("v1.2.3-beta.1"));
    assert!(!p::valid_version("1.0.0/../../x"));
    assert!(p::valid_asset("main.js"));
    assert!(!p::valid_asset("../main.js"));
    assert!(!p::valid_asset("evil.exe"));
}

#[test]
fn safe_join_rejects_traversal() {
    let base = Path::new("/tmp/labkit-plugins");
    assert!(p::safe_join(base, "x-demo/1.0.0/main.js").is_ok());
    assert!(p::safe_join(base, "../evil").is_err());
    assert!(p::safe_join(base, "x/../../evil").is_err());
    assert!(p::safe_join(base, "/etc/passwd").is_err());
    assert!(p::safe_join(base, "x\\..\\evil").is_err());
    assert!(p::plugin_dir(base, "../evil", "1.0.0").is_err());
    assert!(p::plugin_dir(base, "x-demo", "1/../../2").is_err());
}

#[test]
fn manifest_validation() {
    let mb = manifest("x-demo", None);
    let m = p::parse_manifest(&mb, Some("x-demo")).unwrap();
    assert_eq!(m.main, "main.js");
    assert!(p::parse_manifest(&mb, Some("other")).is_err(), "id 必须与索引一致");
    let bad = serde_json::json!({"id":"x","name":"n","version":"1","main":"../../evil.js"})
        .to_string().into_bytes();
    assert!(p::parse_manifest(&bad, None).is_err(), "资产名必须走白名单");
    assert!(p::parse_manifest(b"not json", None).is_err());
}

#[test]
fn sha256_and_version_compare() {
    // echo -n "abc" | sha256sum
    let h = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
    assert_eq!(p::sha256_hex(b"abc"), h);
    assert!(p::version_at_least("0.3.0", "0.3.0"));
    assert!(p::version_at_least("0.10.0", "0.3.0"));
    assert!(p::version_at_least("v1.2.3-beta.1", "1.2.0"));
    assert!(!p::version_at_least("0.2.9", "0.3.0"));
}

#[test]
fn install_is_atomic_and_readable() {
    let dir = TempDir::new().unwrap();
    let base = dir.path();
    let mb = manifest("x-demo", None);
    let assets = vec![
        ("main.js".to_string(), b"window.LabKit.registerTool({id:'demo'});".to_vec()),
        ("styles.css".to_string(), b".demo{color:red}".to_vec()),
    ];
    let inst = p::install_at(base, "x-demo", "1.0.0", &mb, &assets).unwrap();
    assert_eq!(inst.id, "x-demo");
    assert!(Path::new(&inst.path).join("main.js").exists());
    assert!(p::read_asset_at(base, "x-demo", "1.0.0", "main.js").unwrap().starts_with(b"window."));
    assert!(p::read_asset_at(base, "x-demo", "1.0.0", "styles.css").is_ok());
    assert!(p::read_asset_at(base, "x-demo", "1.0.0", "../../secret").is_err());
    // 同版本重装不留下临时目录
    p::install_at(base, "x-demo", "1.0.0", &mb, &assets).unwrap();
    assert!(!p::plugin_root(base).unwrap().join(".tmp-x-demo-1.0.0-1").exists());
}

#[test]
fn hash_mismatch_leaves_no_partial_package() {
    let dir = TempDir::new().unwrap();
    let base = dir.path();
    let mb = manifest("x-bad", Some("deadbeef"));
    let assets = vec![("main.js".to_string(), b"alert(1)".to_vec())];
    assert!(p::install_at(base, "x-bad", "1.0.0", &mb, &assets).is_err());
    assert!(!p::plugin_dir(base, "x-bad", "1.0.0").unwrap().exists(), "失败不得留下半包");
}

#[test]
fn uninstall_and_rollback() {
    let dir = TempDir::new().unwrap();
    let base = dir.path();
    let mb_old = manifest("x-roll", None);
    let mb_new = serde_json::json!({
        "id":"x-roll","name":"示例","version":"2.0.0","main":"main.js"
    }).to_string().into_bytes();
    let assets = vec![("main.js".to_string(), b"1".to_vec())];
    p::install_at(base, "x-roll", "1.0.0", &mb_old, &assets).unwrap();
    p::install_at(base, "x-roll", "2.0.0", &mb_new, &assets).unwrap();
    assert!(p::rollback_available(base, "x-roll", "1.0.0").is_ok());
    assert!(p::rollback_available(base, "x-roll", "9.9.9").is_err());
    p::uninstall_at(base, "x-roll").unwrap();
    assert!(!p::plugin_dir(base, "x-roll", "1.0.0").unwrap().exists());
    assert!(!p::plugin_dir(base, "x-roll", "2.0.0").unwrap().exists());
    assert!(p::uninstall_at(base, "../evil").is_err());
}

#[test]
fn local_dev_install_from_fixture() {
    let dir = TempDir::new().unwrap();
    let base = dir.path().join("data");
    let src = dir.path().join("fixture");
    std::fs::create_dir_all(&src).unwrap();
    std::fs::write(src.join("manifest.json"), manifest("x-local", None)).unwrap();
    std::fs::write(src.join("main.js"), "window.LabKit.registerTool({id:'local'});").unwrap();
    let inst = p::install_local(&base, src.to_str().unwrap()).unwrap();
    assert_eq!(inst.id, "x-local");
    assert_eq!(inst.version, "1.0.0");
    assert!(p::read_asset_at(&base, "x-local", "1.0.0", "main.js").is_ok());
    assert!(p::install_local(&base, dir.path().join("missing").to_str().unwrap()).is_err());
}
