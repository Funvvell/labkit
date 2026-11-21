//! Markdown Vault 往返保真测试：DB 记录 → md → DB 记录必须深相等。
//!
//! 这是 Vault 的核心契约。一旦某个字段在投影/摄入之间漂移（YAML 把 `007` 解析成
//! 整数、把 `2026-11-05` 当日期、把 `80` 变成 `80.0`），用户的台账就会被静默改写。
//! 投影/摄入的编排与冲突见 vault_project.rs / vault_sync.rs。

use labkit::vault::{parse_record, render_record};
use serde_json::{json, Value};

/// 往返并断言深相等；失败时把生成的 md 打出来，便于定位是哪个字段漂移。
fn rt(slug: &str, rec: Value) {
    let md = render_record(slug, &rec).unwrap();
    let back = parse_record(slug, &md).unwrap();
    assert_eq!(back, rec, "[{slug}] 往返不深相等\n--- md ---\n{md}\n--- back ---\n{back:#?}");
}

#[test]
fn task_roundtrip_with_tags_and_bools() {
    rt("task", json!({
        "id": "t1", "name": "示例任务：缓冲液配制与分装", "pri": "urgent", "state": "doing",
        "done": false, "due": "今天 18:00", "dueDate": "2026-11-21", "proj": "p1",
        "exp": "EXP-DEMO-01", "key": true, "tags": ["试剂", "WB"]
    }));
}

#[test]
fn task_empty_tags_and_absent_optionals() {
    rt("task", json!({"id": "t2", "name": "无标签任务", "tags": []}));
    rt("task", json!({"id": "t3", "name": "只有名字"}));
}

#[test]
fn project_milestones_survive_as_task_list() {
    let rec = json!({
        "id": "p1", "name": "示例项目：方法学验证", "code": "DEMO-01", "owner": "示例用户",
        "start": "2026-03", "end": "2027-03", "stage": "实验", "progress": 42, "risk": "设备排期待定",
        "milestones": [["开题", 1], ["预实验", 1], ["样本采集", 0], ["检测", 0]]
    });
    let md = render_record("project", &rec).unwrap();
    assert!(md.contains("- [x] 开题"), "已完成里程碑应是勾选态\n{md}");
    assert!(md.contains("- [ ] 样本采集"), "未完成里程碑应是未勾选态\n{md}");
    rt("project", rec);
}

#[test]
fn project_progress_float_and_empty_milestones() {
    rt("project", json!({"id": "p2", "name": "浮点进度", "progress": 42.5, "milestones": []}));
    rt("project", json!({"id": "p3", "name": "无里程碑"}));
}

#[test]
fn experiment_note_body_roundtrip() {
    rt("exp", json!({
        "id": "EXP-DEMO-01", "proj": "示例项目：方法学验证", "type": "动物", "date": "11-17",
        "who": "示例用户", "status": "进行中", "note": "第 4 周给药，体重记录正常"
    }));
    rt("exp", json!({"id": "EXP-2", "proj": "未指定", "type": "qPCR", "date": "2026-11-16",
        "who": "—", "status": "失败", "note": "Ct 值漂移\n疑似逆转录效率低\n需重做"}));
}

#[test]
fn literature_with_doi_and_zotero_keys() {
    rt("lit", json!({
        "id": "l1", "title": "示例文献：方法学验证设计综述", "meta": "示例期刊 · 2026",
        "status": "待精读", "doi": "10.1000/example", "zoteroKey": "ABCD1234",
        "zoteroUrl": "http://127.0.0.1:23119/api/users/0/items/ABCD1234",
        "note": "读书笔记：样本量计算依据见第 3 节。"
    }));
}

#[test]
fn reagent_tracked_quantity_derives_left() {
    // 计量态：left 是 quantity+unit 的派生值，不单独存进 frontmatter
    let rec = json!({
        "id": "r1", "name": "示例一抗（Anti-Target）", "no": "DEMO-AB1", "lot": "LOT-001",
        "loc": "4°C 冰箱 B", "open": "10-02", "exp": "2026-12-02",
        "category": "抗体", "spec": "100µL", "quantity": 80, "unit": "%",
        "min_stock": 20, "supplier": "示例供应商", "left": "80%",
        "movements": [{"date": "2026-11-01", "delta": -5, "note": "WB 实验"},
                      {"date": "2026-11-03", "delta": 100, "note": "入库"}],
        "notes": "分装保存，避免反复冻融。"
    });
    let md = render_record("reagent", &rec).unwrap();
    assert!(!md.contains("left:"), "计量态不应把派生的 left 写进 frontmatter\n{md}");
    assert!(md.contains("delta: -5"), "负数出入库必须保真\n{md}");
    rt("reagent", rec);
}

#[test]
fn reagent_untracked_keeps_free_text_left() {
    rt("reagent", json!({
        "id": "r2", "name": "示例 RNA 提取试剂", "no": "DEMO-R1", "lot": "LOT-002",
        "loc": "试剂柜 2", "open": "09-20", "exp": "2027-09-20",
        "quantity": null, "unit": "", "min_stock": null, "left": "2 支"
    }));
    rt("reagent", json!({"id": "r3", "name": "占位试剂", "no": "—", "lot": "—", "loc": "—",
        "open": "—", "exp": "—", "left": "—"}));
}

#[test]
fn reagent_zero_quantity_is_tracked_not_empty() {
    rt("reagent", json!({"id": "r4", "name": "用尽的试剂", "quantity": 0, "unit": "mL", "left": "0mL"}));
    rt("reagent", json!({"id": "r5", "name": "浮点存量", "quantity": 12.5, "unit": "mL", "left": "12.5mL"}));
}

#[test]
fn leading_zeros_and_date_like_strings_stay_strings() {
    // YAML 1.2 会把不带引号的 007 解析成整数 7、把日期样标量当成别的类型。
    // 投影强制引号 + 摄入按 schema 收敛，两道防线都要在。
    let rec = json!({"id": "r6", "name": "前导零批号", "lot": "007", "no": "0012",
        "exp": "2026-12-02", "open": "10-02", "left": "80%"});
    let md = render_record("reagent", &rec).unwrap();
    assert!(md.contains("lot: \"007\""), "批号必须带引号\n{md}");
    rt("reagent", rec);
}

#[test]
fn instrument_and_booking_and_budget() {
    rt("instrument", json!({"id": "i1", "name": "荧光定量 PCR 仪", "cal": "2026-10-12",
        "next": "2027-04-12", "note": "运行正常"}));
    rt("instrument", json!({"id": "i2", "name": "化学发光成像仪", "cal": "—", "next": "—", "note": "—"}));
    rt("booking", json!({"id": "k1", "inst": "荧光定量 PCR 仪", "date": "2026-11-19",
        "slot": "09:00-11:00", "who": "示例用户", "proj": "示例项目：论文写作与投稿"}));
    rt("budget", json!({"id": "b1", "item": "耗材采购", "cat": "耗材", "amount": 4860,
        "date": "2026-11-05", "note": "含示例一抗"}));
    rt("budget", json!({"id": "b2", "item": "机时费", "cat": "测试费", "amount": 3200.75, "date": "2026-11-12"}));
}

#[test]
fn note_body_is_the_whole_text() {
    rt("note", json!({"id": "n1", "at": "2026-11-16T21:10",
        "text": "逆转录 Ct 漂移排查：先换新的 RT 酶 aliquot，再做 RNA 完整性电泳。"}));
    rt("note", json!({"id": "n2", "at": "2026-11-16T21:10", "text": "多行\n速记\n内容"}));
}

#[test]
fn reminder_priority_decouples_from_css_color() {
    for (color, prio) in [("var(--red)", "urgent"), ("var(--orange)", "warn"), ("var(--accent)", "normal")] {
        let rec = json!({"id": "m1", "text": "设备校准到期", "date": "2026-12-15", "color": color});
        let md = render_record("reminder", &rec).unwrap();
        assert!(md.contains(&format!("priority: \"{prio}\"")), "{color} 应映射为 {prio}\n{md}");
        assert!(!md.contains("color:"), "标准色不必冗余写 color\n{md}");
        rt("reminder", rec);
    }
}

#[test]
fn reminder_unknown_color_is_preserved_verbatim() {
    // 老数据可能带非标准色值，不能静默丢成 normal
    rt("reminder", json!({"id": "m2", "text": "自定义提醒", "date": "2026-12-15", "color": "var(--purple)"}));
}

#[test]
fn focus_record_roundtrip() {
    rt("focus", json!({"id": "f1", "project": "示例项目：数据分析流程", "type": "数据分析",
        "minutes": 75, "at": "2026-11-20T09:00"}));
}

#[test]
fn unknown_fields_are_preserved() {
    // 向前兼容：别的软件或未来版本加的字段不能在往返中被抹掉
    rt("reagent", json!({"id": "r7", "name": "带扩展字段", "left": "1 盒",
        "customField": "自定义值", "nested": {"a": 1, "b": ["x", "y"]}, "flag": true}));
    rt("task", json!({"id": "t9", "name": "带扩展字段的任务", "obsidianTag": "project/alpha"}));
}

#[test]
fn empty_string_body_field_is_not_dropped() {
    // 关键回归：home.js 直接 esc(e.note)，字段缺省会渲染成字面量 "undefined"。
    // 所以「空字符串」与「字段缺省」必须严格区分，不能归一化。
    rt("exp", json!({"id": "E1", "note": ""}));
    rt("instrument", json!({"id": "i9", "name": "空备注仪器", "note": ""}));
    rt("budget", json!({"id": "b9", "item": "空备注", "amount": 0, "note": ""}));
    rt("note", json!({"id": "n9", "at": "2026-11-20T10:00", "text": ""}));
    // 缺省仍然保持缺省，不能凭空长出字段
    let md = render_record("exp", &json!({"id": "E2"})).unwrap();
    assert_eq!(parse_record("exp", &md).unwrap(), json!({"id": "E2"}));
}

#[test]
fn body_text_wins_over_stale_empty_marker() {
    // 用户在 Obsidian 里给原本空备注的记录写了正文：正文优先，
    // frontmatter 里遗留的空标记不得把新内容吞掉。
    let md = "---\nid: \"E3\"\nkind: \"exp\"\nlabkit_schema: 1\nnote: \"\"\n---\n\n用户补写的实验结论\n";
    assert_eq!(parse_record("exp", md).unwrap()["note"], json!("用户补写的实验结论"));
}

#[test]
fn render_is_deterministic_and_timestamp_free() {
    let rec = json!({"id": "r8", "name": "确定性", "quantity": 5, "unit": "支", "left": "5支",
        "movements": [{"date": "2026-11-01", "delta": 5, "note": "入库"}]});
    let a = render_record("reagent", &rec).unwrap();
    let b = render_record("reagent", &rec).unwrap();
    assert_eq!(a, b, "同一记录必须渲染出同样字节，否则 hash 跳过失效");
    assert!(!a.contains("updated:"), "不得含时间戳派生字段，否则每次投影都改写文件");
}

#[test]
fn frontmatter_required_and_id_checked() {
    assert!(parse_record("task", "# 没有 frontmatter 的普通笔记").is_err());
    assert!(parse_record("task", "---\nname: \"缺 id\"\n---\n").is_err());
    assert!(parse_record("不存在的类型", "---\nid: \"x\"\n---\n").is_err());
}

#[test]
fn body_with_horizontal_rule_and_task_list_text() {
    // 非 project 类型的正文里出现 --- 或 - [x] 都只是普通文本，不能被误解析
    rt("note", json!({"id": "n3", "at": "2026-11-20T10:00",
        "text": "排查记录\n\n---\n\n- [x] 这不是里程碑\n- [ ] 只是笔记"}));
}

#[test]
fn yaml11_boolean_like_keys_are_quoted() {
    // 试剂货号字段叫 no —— YAML 1.1 会把它当布尔字面量，PyYAML 读成键 False，
    // 字段直接消失。yaml-rust2 走 1.2 不踩，所以必须显式断言输出带引号。
    let md = render_record("reagent", &json!({"id":"r9","name":"货号试剂","no":"DEMO-AB1","lot":"007","left":"1 盒"})).unwrap();
    assert!(md.contains("\"no\": \"DEMO-AB1\""), "no 键必须加引号\n{md}");
    assert!(!md.contains("\nno: "), "不得输出裸 no 键\n{md}");
    rt("reagent", json!({"id":"r9","name":"货号试剂","no":"DEMO-AB1","lot":"007","left":"1 盒"}));
    // 其它歧义键同样处理
    let md2 = render_record("task", &json!({"id":"t9","name":"歧义键","yes":"a","on":"b","null":"c","Y":"d"})).unwrap();
    for k in ["yes", "on", "null", "Y"] {
        assert!(md2.contains(&format!("\"{k}\": ")), "{k} 键必须加引号\n{md2}");
    }
}

#[test]
fn every_kind_is_covered() {
    // 防漏：新增实体类型时必须同时补往返 fixture
    let slugs: Vec<&str> = labkit::vault::kind_dirs().iter().map(|(s, _)| *s).collect();
    assert_eq!(slugs.len(), 11, "11 类台账实体");
    for s in ["task", "project", "exp", "lit", "reagent", "instrument", "booking", "budget", "note", "reminder", "focus"] {
        assert!(slugs.contains(&s), "缺少 {s}");
    }
}