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
/// 必须同时认 `key: value`、ES6 简写 `{key}` 与引号键 `{'key': v}`——
/// 前端大量用简写（如 `{requestId,ok,label:WIN_LABEL}`），只认冒号会把它们整片漏掉，
/// 既造成「缺必填参数」假阳性，也让 snake_case 简写键逃过 camelCase 检查。
/// 用「键位置」状态机而非逐字符找冒号，避免把值里的标识符（三元分支等）误当成键。
fn top_level_keys(s: &[char], start: usize, end: usize) -> Vec<String> {
    let mut keys = Vec::new();
    let mut i = start + 1;
    let mut depth = 0i32; // 相对对象内部：0 = 顶层
    let mut expect_key = true;
    while i < end {
        let c = s[i];
        if depth == 0 && expect_key {
            if c.is_whitespace() {
                i += 1;
                continue;
            }
            // 展开语法：键集不可静态得知，标记后由调用方放宽必填校验。
            if c == '.' && i + 2 < end && s[i + 1] == '.' && s[i + 2] == '.' {
                keys.push("...".to_string());
                expect_key = false;
                i += 3;
                continue;
            }
            if c == '\'' || c == '"' || c == '`' {
                let q = c;
                let ks = i + 1;
                let mut j = ks;
                while j < end {
                    if s[j] == '\\' {
                        j += 2;
                        continue;
                    }
                    if s[j] == q {
                        break;
                    }
                    j += 1;
                }
                keys.push(s[ks..j.min(end)].iter().collect());
                expect_key = false;
                i = j + 1;
                continue;
            }
            if is_ident_start(c) {
                let mut j = i + 1;
                while j < end && is_ident_char(s[j]) {
                    j += 1;
                }
                let word: String = s[i..j].iter().collect();
                let mut k = j;
                while k < end && s[k].is_whitespace() {
                    k += 1;
                }
                // ':' → 普通键；',' / '}' / 结尾 → 简写键。
                if k >= end || s[k] == ':' || s[k] == ',' || s[k] == '}' {
                    keys.push(word);
                }
                expect_key = false;
                i = j;
                continue;
            }
            expect_key = false;
            i += 1;
            continue;
        }
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
            i += 1;
            continue;
        }
        if c == '{' || c == '[' || c == '(' {
            depth += 1;
        } else if c == '}' || c == ']' || c == ')' {
            depth -= 1;
        } else if depth == 0 && c == ',' {
            expect_key = true;
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
            } else if j < chars.len() && chars[j] == ')' {
                // 无 payload 调用：记为空键集，才能校验「该命令是否有必填参数」。
                out.push((name, Vec::new()));
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
/// P5 起还要求 kind —— 装错市场必须在前端就带上类型，Rust 侧据此拒绝。
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
        for need in ["id", "repo", "version", "kind"] {
            assert!(
                keys.iter().any(|k| k == need),
                "plugins_install 缺少参数 {need}，实际发送: {keys:?}"
            );
        }
    }
}

/// P5 双市场：索引请求必须带 kind（tool / widget），否则 Rust 无法判断读哪份索引。
#[test]
fn plugins_index_sends_market_kind() {
    let src = frontend_source();
    let calls = invoke_calls(&src);
    let idx: Vec<&Vec<String>> = calls
        .iter()
        .filter(|(c, _)| c == "plugins_index")
        .map(|(_, k)| k)
        .collect();
    assert!(!idx.is_empty(), "前端没有调用 plugins_index");
    for keys in idx {
        assert!(
            keys.iter().any(|k| k == "kind"),
            "plugins_index 缺少参数 kind，实际发送: {keys:?}"
        );
    }
    // 本地开发载入也要声明类型
    let local: Vec<&Vec<String>> = calls
        .iter()
        .filter(|(c, _)| c == "plugins_install_local")
        .map(|(_, k)| k)
        .collect();
    assert!(!local.is_empty(), "前端没有调用 plugins_install_local");
    for keys in local {
        for need in ["dir", "kind"] {
            assert!(
                keys.iter().any(|k| k == need),
                "plugins_install_local 缺少参数 {need}，实际发送: {keys:?}"
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
/* ---------------- 通用契约：invoke 键名必须与 Rust 形参一一对应 ----------------
   背景：zotero_tag 的 Rust 形参是 tag_name（Tauri 默认 camelCase → tagName），前端却发 tag。
   运行时精确匹配取不到键，功能上线即失效，还被 .catch 吞成 toast。
   上面的 camelCase 检查与逐命令硬编码断言都抓不到这种「键名合法但不是那个参数」的错配。 */

fn rust_source_files() -> Vec<PathBuf> {
    fn walk(d: &std::path::Path, out: &mut Vec<PathBuf>) {
        let Ok(rd) = fs::read_dir(d) else { return };
        let mut entries: Vec<PathBuf> = rd.filter_map(|e| e.ok().map(|e| e.path())).collect();
        entries.sort();
        for p in entries {
            if p.is_dir() {
                walk(&p, out);
            } else if p.extension().map(|x| x == "rs").unwrap_or(false) {
                out.push(p);
            }
        }
    }
    let mut out = Vec::new();
    walk(
        &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("src"),
        &mut out,
    );
    out
}

/// snake_case → camelCase（Tauri v2 命令宏默认 rename_all = "camelCase"）。
fn camel(s: &str) -> String {
    let mut it = s.split('_');
    let mut out = String::from(it.next().unwrap_or(""));
    for p in it {
        let mut c = p.chars();
        if let Some(f) = c.next() {
            out.extend(f.to_uppercase());
            out.push_str(c.as_str());
        }
    }
    out
}

/// 按顶层逗号切分形参，尊重 <> () [] 嵌套（lifetime 的 '_' 不当字符串处理）。
fn split_top_level(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut depth = 0i32;
    let mut cur = String::new();
    for c in s.chars() {
        match c {
            '<' | '(' | '[' => {
                depth += 1;
                cur.push(c);
            }
            '>' | ')' | ']' => {
                depth -= 1;
                cur.push(c);
            }
            ',' if depth == 0 => {
                out.push(cur.trim().to_string());
                cur.clear();
            }
            _ => cur.push(c),
        }
    }
    if !cur.trim().is_empty() {
        out.push(cur.trim().to_string());
    }
    out
}

fn paren_end(chars: &[char], start: usize) -> Option<usize> {
    let mut depth = 0i32;
    for (i, c) in chars.iter().enumerate().skip(start) {
        match c {
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// 命令名 → [(camelCase 形参名, 是否必填)]；tauri:: 注入型参数（State / AppHandle）不算。
fn rust_commands() -> Vec<(String, Vec<(String, bool)>)> {
    let mut out = Vec::new();
    for p in rust_source_files() {
        let Ok(src) = fs::read_to_string(&p) else { continue };
        let chars: Vec<char> = src.chars().collect();
        let needle: Vec<char> = "#[tauri::command".chars().collect();
        let mut i = 0usize;
        while i + needle.len() < chars.len() {
            if chars[i..i + needle.len()] != needle[..] {
                i += 1;
                continue;
            }
            let rest: String = chars[i..].iter().collect();
            let Some(fpos) = rest.find("fn ") else { break };
            let after = &rest[fpos + 3..];
            let name: String = after
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_')
                .collect();
            let ach: Vec<char> = after.chars().collect();
            let Some(open) = after.find('(') else { break };
            let Some(close) = paren_end(&ach, open) else { break };
            let inner: String = ach[open + 1..close].iter().collect();
            let mut params = Vec::new();
            for prm in split_top_level(&inner) {
                let Some(colon) = prm.find(':') else { continue };
                let pname = prm[..colon].trim();
                let ptype = prm[colon + 1..].trim();
                if pname.is_empty() || ptype.starts_with("tauri::") {
                    continue;
                }
                params.push((camel(pname), !ptype.starts_with("Option<")));
            }
            if !name.is_empty() {
                out.push((name, params));
            }
            i += fpos + 3;
        }
    }
    out
}

#[test]
fn command_parser_reads_camel_case_params() {
    let cmds = rust_commands();
    let tag = cmds
        .iter()
        .find(|(n, _)| n == "zotero_tag")
        .expect("应解析到 zotero_tag");
    assert!(
        tag.1.iter().any(|(p, req)| p == "tagName" && *req),
        "tag_name 应转成必填 tagName，实际 {:?}",
        tag.1
    );
    assert!(
        tag.1.iter().any(|(p, req)| p == "port" && !*req),
        "Option<u16> 应为选填"
    );
    let open = cmds
        .iter()
        .find(|(n, _)| n == "zotero_open")
        .expect("应解析到 zotero_open");
    assert!(
        !open.1.iter().any(|(p, _)| p == "app"),
        "注入型 AppHandle 不该被当成前端参数"
    );
}

#[test]
fn invoke_keys_match_rust_command_params() {
    let cmds = rust_commands();
    assert!(
        cmds.len() > 40,
        "只解析到 {} 个命令，扫描逻辑可能失效",
        cmds.len()
    );
    let map: std::collections::HashMap<&str, &Vec<(String, bool)>> =
        cmds.iter().map(|(n, p)| (n.as_str(), p)).collect();
    let calls = invoke_calls(&frontend_source());
    let mut bad = Vec::new();
    for (cmd, keys) in &calls {
        // 官方插件命令（dialog / notification / opener / window-state）不在本 crate。
        if cmd.starts_with("plugin:") {
            continue;
        }
        let Some(params) = map.get(cmd.as_str()) else {
            bad.push(format!("{cmd}：Rust 侧未定义该命令"));
            continue;
        };
        for k in keys {
            if k == "..." {
                continue; // 展开语法：键集不可静态得知
            }
            if !params.iter().any(|(p, _)| p == k) {
                let want: Vec<&str> = params.iter().map(|(p, _)| p.as_str()).collect();
                bad.push(format!("{cmd}({k})：不是该命令的参数，可选 {want:?}"));
            }
        }
        if keys.iter().any(|k| k == "...") {
            continue;
        }
        for (p, required) in params.iter() {
            if *required && !keys.iter().any(|k| k == p) {
                bad.push(format!("{cmd}：缺必填参数 {p}，实际发送 {keys:?}"));
            }
        }
    }
    assert!(
        bad.is_empty(),
        "IPC 键名契约不符：\n{}",
        bad.join("\n")
    );
}

/// 前端调用的命令必须真的注册进 generate_handler，否则运行时必然失败。
/// 只查「被调用的」：error_probe 这类故意保留的错误路径探针不注册也不调用，属正常。
#[test]
fn invoked_commands_are_registered() {
    let main = fs::read_to_string(
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("main.rs"),
    )
    .expect("读取 main.rs 失败");
    let mut missing: Vec<String> = invoke_calls(&frontend_source())
        .into_iter()
        .map(|(n, _)| n)
        .filter(|n| !n.starts_with("plugin:"))
        .filter(|n| !main.contains(&format!("::{n},")))
        .collect();
    missing.sort();
    missing.dedup();
    assert!(
        missing.is_empty(),
        "前端调用了这些命令，但 main.rs 的 generate_handler 里没有：{missing:?}"
    );
}

#[test]
fn scanner_reads_shorthand_and_quoted_keys() {
    let calls = invoke_calls("invoke('flush_ack',{requestId,ok,label:WIN_LABEL})");
    assert_eq!(calls[0].1, vec!["requestId", "ok", "label"]);
    let q = invoke_calls("invoke('x',{'a_b':1,c:2})");
    assert_eq!(q[0].1, vec!["a_b", "c"]);
    let spread = invoke_calls("invoke('x',{...base,extra:1})");
    assert_eq!(spread[0].1, vec!["...", "extra"]);
    // 值位置的标识符（三元分支）不能被误当成键
    let tern = invoke_calls("invoke('x',{a:f?g:h,b:2})");
    assert_eq!(tern[0].1, vec!["a", "b"]);
}
