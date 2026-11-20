//! IPC 参数名契约回归测试。
//!
//! 背景：Tauri v2 的命令宏默认 `rename_all = "camelCase"`，运行时用
//! `serde_json::Value::get(key)` **精确匹配**取参，没有 snake_case 回退
//! （见 tauri::ipc::command::CommandItem::deserialize_json）。
//! 因此前端 `invoke('export_rois', {output_dir: ...})` 会直接失败并报
//! "command export_rois missing required key outputDir" —— 这正是 ROI 导出
//! 一直失败、而其它命令都正常的原因：其它命令的参数恰好都是单个单词，
//! 两种命名法长得一样，掩盖了这个坑。
//!
//! 本测试扫描前端所有 invoke 调用的**顶层**参数名，禁止出现 snake_case。
//! 注意只查顶层：嵌套对象（如 ROI 的 slide_path / created_at）是 serde
//! 结构体字段，本来就该用 snake_case，不属于命令参数。

use std::fs;
use std::path::PathBuf;

/// 前端全部脚本源：index.html 壳 + js/ 模块（P0 拆分后 invoke 调用所在）+ tools/ 工具脚本。
/// 按文件名排序拼接，保证扫描结果稳定。
fn frontend_source() -> String {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("frontend");
    let mut paths = vec![root.join("index.html")];
    for dir in ["js", "tools"] {
        let d = root.join(dir);
        let mut entries: Vec<PathBuf> = fs::read_dir(&d)
            .unwrap_or_else(|e| panic!("读取前端目录失败 {}: {e}", d.display()))
            .filter_map(|e| e.ok().map(|e| e.path()))
            .filter(|p| p.extension().map(|x| x == "js").unwrap_or(false))
            .collect();
        entries.sort();
        paths.extend(entries);
    }
    let mut src = String::new();
    for p in paths {
        src.push_str(
            &fs::read_to_string(&p).unwrap_or_else(|e| panic!("读取前端失败 {}: {e}", p.display())),
        );
        src.push('\n');
    }
    src
}

/// 从 `start`（指向 '{'）开始做括号配对，返回对象字面量的结束下标（含 '}'）。
fn object_end(s: &[char], start: usize) -> Option<usize> {
    let mut depth = 0usize;
    let mut i = start;
    while i < s.len() {
        let c = s[i];
        if c == '\'' || c == '"' || c == '`' {
            let quote = c;
            i += 1;
            while i < s.len() {
                if s[i] == '\\' {
                    i += 2;
                    continue;
                }
                if s[i] == quote {
                    break;
                }
                i += 1;
            }
        } else if c == '{' || c == '[' || c == '(' {
            depth += 1;
        } else if c == '}' || c == ']' || c == ')' {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
        i += 1;
    }
    None
}

fn is_ident_start(c: char) -> bool {
    c.is_alphabetic() || c == '_' || c == '$'
}
fn is_ident_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// 取对象字面量最外层的键名。
fn top_level_keys(s: &[char], start: usize, end: usize) -> Vec<String> {
    let mut keys = Vec::new();
    let mut depth = 0usize;
    let mut i = start;
    while i < end {
        let c = s[i];
        if c == '\'' || c == '"' || c == '`' {
            let quote = c;
            i += 1;
            while i < end {
                if s[i] == '\\' {
                    i += 2;
                    continue;
                }
                if s[i] == quote {
                    break;
                }
                i += 1;
            }
        } else if c == '{' || c == '[' || c == '(' {
            depth += 1;
        } else if c == '}' || c == ']' || c == ')' {
            depth = depth.saturating_sub(1);
        } else if depth == 1 && is_ident_start(c) {
            let mut j = i + 1;
            while j < end && is_ident_char(s[j]) {
                j += 1;
            }
            let word: String = s[i..j].iter().collect();
            let mut k = j;
            while k < end && s[k].is_whitespace() {
                k += 1;
            }
            if k < end && s[k] == ':' {
                keys.push(word);
            }
            i = j;
            continue;
        }
        i += 1;
    }
    keys
}

/// 返回 (命令名, 顶层参数名列表)。
fn invoke_calls(src: &str) -> Vec<(String, Vec<String>)> {
    let chars: Vec<char> = src.chars().collect();
    let needle: Vec<char> = "invoke('".chars().collect();
    let mut out = Vec::new();
    let mut i = 0usize;
    while i + needle.len() < chars.len() {
        if chars[i..i + needle.len()] == needle[..] {
            let mut j = i + needle.len();
            let name_start = j;
            while j < chars.len() && chars[j] != '\'' {
                j += 1;
            }
            let name: String = chars[name_start..j].iter().collect();
            j += 1;
            while j < chars.len() && chars[j].is_whitespace() {
                j += 1;
            }
            if j < chars.len() && chars[j] == ',' {
                j += 1;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                if j < chars.len() && chars[j] == '{' {
                    if let Some(end) = object_end(&chars, j) {
                        out.push((name, top_level_keys(&chars, j, end)));
                    }
                }
            }
            i = j;
            continue;
        }
        i += 1;
    }
    out
}

#[test]
fn invoke_payload_keys_are_camel_case() {
    let src = frontend_source();
    let calls = invoke_calls(&src);
    assert!(
        calls.len() > 10,
        "只扫到 {} 个 invoke 调用，扫描逻辑可能失效",
        calls.len()
    );
    let mut bad = Vec::new();
    for (cmd, keys) in &calls {
        for k in keys {
            if k.contains('_') {
                bad.push(format!("{cmd}({k})"));
            }
        }
    }
    assert!(
        bad.is_empty(),
        "命令参数必须用 camelCase（Tauri 精确匹配、无 snake_case 回退），发现: {}",
        bad.join(", ")
    );
}

#[test]
fn export_rois_sends_required_keys() {
    let src = frontend_source();
    let calls = invoke_calls(&src);
    let exports: Vec<&Vec<String>> = calls
        .iter()
        .filter(|(c, _)| c == "export_rois")
        .map(|(_, k)| k)
        .collect();
    assert!(!exports.is_empty(), "前端没有调用 export_rois");
    for keys in exports {
        for need in ["rois", "outputDir", "magLabel"] {
            assert!(
                keys.iter().any(|k| k == need),
                "export_rois 缺少参数 {need}，实际发送: {keys:?}"
            );
        }
    }
}

/// P4 插件安装契约：Rust 命令必填参数与前端 invoke 顶层键一一对应。
#[test]
fn plugins_install_sends_contract_keys() {
    let src = frontend_source();
    let calls = invoke_calls(&src);
    let installs: Vec<&Vec<String>> = calls
        .iter()
        .filter(|(c, _)| c == "plugins_install")
        .map(|(_, k)| k)
        .collect();
    assert!(!installs.is_empty(), "前端没有调用 plugins_install");
    for keys in installs {
        for need in ["id", "repo", "version"] {
            assert!(
                keys.iter().any(|k| k == need),
                "plugins_install 缺少参数 {need}，实际发送: {keys:?}"
            );
        }
    }
}

#[test]
fn scanner_finds_nested_data_keys_are_ignored() {
    // 自检：嵌套的 serde 字段不能被误判成命令参数。
    let sample = "invoke('save_rois',{rois:[{id:'a',slide_path:'p',created_at:''}],gen:1})";
    let calls = invoke_calls(sample);
    assert_eq!(calls.len(), 1);
    assert_eq!(calls[0].0, "save_rois");
    assert_eq!(calls[0].1, vec!["rois".to_string(), "gen".to_string()]);
}

/// P1 合并写契约：前端每次 db_save 必须携带 data + changed + origin。
/// changed 缺省会退化为整库写——多窗口下互相抹改动，正是要防住的回归。
#[test]
fn db_save_sends_merge_contract_keys() {
    let src = frontend_source();
    let calls = invoke_calls(&src);
    let saves: Vec<&Vec<String>> = calls
        .iter()
        .filter(|(c, _)| c == "db_save")
        .map(|(_, k)| k)
        .collect();
    assert!(!saves.is_empty(), "前端没有调用 db_save");
    for keys in saves {
        for need in ["data", "changed", "origin"] {
            assert!(
                keys.iter().any(|k| k == need),
                "db_save 缺少参数 {need}（P1 合并写契约），实际发送: {keys:?}"
            );
        }
    }
}