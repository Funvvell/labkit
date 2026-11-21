//! 互操作夹具生成：把 11 类实体的 markdown 投影写到 `target/vault-interop/`，
//! 供 `tests/vault_interop.py` 用**独立 YAML 解析器（PyYAML）**校验。
//!
//! 为什么需要它：vault_roundtrip.rs 的读写两端都用 yaml-rust2，若我们的输出
//! 恰好只有它自己认（转义、类型推断上的怪癖），自家人往返会全绿而 Obsidian
//! 打不开。用户要的就是「换个软件还能用」，所以必须让第三方解析器验一遍。
//!
//! 跑法：cargo test --test vault_interop && python tests/vault_interop.py

use labkit::vault::render_record;
use serde_json::json;
use std::fs;
use std::path::PathBuf;

fn out_dir() -> PathBuf {
    let d = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("target").join("vault-interop");
    fs::create_dir_all(&d).unwrap();
    d
}

#[test]
fn emit_fixtures_for_third_party_parser() {
    let d = out_dir();
    let fixtures = vec![
        ("task", json!({"id":"t1","name":"缓冲液配制与分装","pri":"urgent","state":"doing","done":false,
            "due":"今天 18:00","dueDate":"2026-11-21","proj":"p1","exp":"EXP-1","key":true,"tags":["试剂","WB"]})),
        ("project", json!({"id":"p1","name":"方法学验证","code":"DEMO-01","owner":"示例用户","start":"2026-03",
            "end":"2027-03","stage":"实验","progress":42,"risk":"设备排期待定",
            "milestones":[["开题",1],["样本采集",0],["检测",0]]})),
        ("exp", json!({"id":"EXP-1","proj":"方法学验证","type":"qPCR","date":"11-17","who":"示例用户",
            "status":"进行中","note":"第 4 周给药，体重记录正常"})),
        ("lit", json!({"id":"l1","title":"方法学验证设计综述","meta":"示例期刊 · 2026","status":"待精读",
            "doi":"10.1000/example","zoteroKey":"ABCD1234","note":"样本量计算依据见第 3 节。"})),
        ("reagent", json!({"id":"r1","name":"示例一抗（Anti-Target）","no":"DEMO-AB1","lot":"007","loc":"4°C 冰箱 B",
            "open":"10-02","exp":"2026-12-02","category":"抗体","spec":"100µL","quantity":80,"unit":"%",
            "min_stock":20,"supplier":"示例供应商","left":"80%",
            "movements":[{"date":"2026-11-01","delta":-5,"note":"WB 实验"},{"date":"2026-11-03","delta":100,"note":"入库"}],
            "notes":"分装保存，避免反复冻融。"})),
        ("reagent-free", json!({"id":"r2","name":"自由文本余量","lot":"0012","quantity":null,"unit":"",
            "min_stock":null,"left":"2 支","exp":"2027-09-20"})),
        ("instrument", json!({"id":"i1","name":"荧光定量 PCR 仪","cal":"2026-10-12","next":"2027-04-12","note":"运行正常"})),
        ("booking", json!({"id":"k1","inst":"荧光定量 PCR 仪","date":"2026-11-19","slot":"09:00-11:00",
            "who":"示例用户","proj":"论文写作与投稿"})),
        ("budget", json!({"id":"b1","item":"耗材采购","cat":"耗材","amount":4860,"date":"2026-11-05","note":"含示例一抗"})),
        ("budget-float", json!({"id":"b2","item":"机时费","cat":"测试费","amount":3200.75,"date":"2026-11-12"})),
        ("note", json!({"id":"n1","at":"2026-11-16T21:10","text":"逆转录 Ct 漂移排查：先换新的 RT 酶 aliquot。"})),
        ("reminder", json!({"id":"m1","text":"设备校准到期","date":"2026-12-15","color":"var(--orange)"})),
        ("reminder-urgent", json!({"id":"m2","text":"基金结题","date":"2026-12-01","color":"var(--red)"})),
        ("focus", json!({"id":"f1","project":"数据分析流程","type":"数据分析","minutes":75,"at":"2026-11-20T09:00"})),
        ("unknown", json!({"id":"x1","name":"带扩展字段","left":"1 盒","customField":"自定义值",
            "nested":{"a":1,"b":["x","y"]},"flag":true})),
        ("empty-note", json!({"id":"e1","proj":"未指定","type":"其他","date":"11-20","who":"—","status":"待开展","note":""})),
    ];
    for (name, rec) in &fixtures {
        // unknown / empty-note 用 reagent / exp 的 schema 渲染
        let slug = match *name {
            "unknown" | "reagent-free" => "reagent",
            "empty-note" => "exp",
            "budget-float" => "budget",
            "reminder-urgent" => "reminder",
            other => other,
        };
        let md = render_record(slug, rec).unwrap();
        fs::write(d.join(format!("{name}.md")), md).unwrap();
    }
    assert!(d.join("reagent.md").exists());
}