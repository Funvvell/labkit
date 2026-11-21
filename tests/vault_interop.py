#!/usr/bin/env python3
"""用独立 YAML 解析器（PyYAML）校验 LabKit Markdown Vault 的互操作性。

为什么需要它：Rust 侧的往返测试读写两端都用 yaml-rust2，若输出恰好只有它自己认，
自家人测试会全绿而 Obsidian 打不开。本脚本用第三方解析器验类型漂移——
PyYAML 走 YAML 1.1，会把不带引号的 `007` 当八进制整数、`2026-12-02` 当 date、
`2026-11-20T09:00` 当 timestamp。这些正是台账字段最容易静默变形的地方。

跑法：
    cd rust && cargo test --test vault_interop
    cd .. && python tests/vault_interop.py
"""
import sys
import pathlib
import datetime

# Windows 控制台默认 GBK，中文失败信息会被编码错误吞掉
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

try:
    import yaml
except ImportError:
    print("需要 PyYAML：pip install pyyaml")
    sys.exit(2)

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIR = ROOT / "rust" / "target" / "vault-interop"

fails = []
checked = 0


def check(cond, msg):
    global checked
    checked += 1
    if not cond:
        fails.append(msg)


def load(name):
    """拆 frontmatter 与正文，用 PyYAML 独立解析。"""
    p = DIR / f"{name}.md"
    if not p.exists():
        fails.append(f"缺少夹具 {name}.md（先跑 cargo test --test vault_interop）")
        return None, None
    text = p.read_text(encoding="utf-8")
    check(text.startswith("---\n"), f"{name}: 必须以 --- 开头")
    end = text.find("\n---\n", 4)
    check(end > 0, f"{name}: frontmatter 未正确闭合")
    if end < 0:
        return None, None
    fm_text = text[4:end]
    body = text[end + 5:]
    try:
        fm = yaml.safe_load(fm_text)
    except Exception as e:
        fails.append(f"{name}: PyYAML 解析失败 → {e}")
        return None, body
    check(isinstance(fm, dict), f"{name}: frontmatter 应为映射")
    return fm, body


def is_str(v):
    return isinstance(v, str)


# ---- 通用头 ----
for name in ["task", "project", "exp", "lit", "reagent", "instrument", "booking",
             "budget", "note", "reminder", "focus"]:
    fm, _ = load(name)
    if fm is None:
        continue
    check(is_str(fm.get("id")), f"{name}: id 必须是字符串")
    check(is_str(fm.get("kind")), f"{name}: kind 必须是字符串")
    check(fm.get("labkit_schema") == 1, f"{name}: labkit_schema 应为 1")

# ---- 试剂：前导零 / 日期样字符串 / 数值 / 嵌套流水 ----
fm, body = load("reagent")
if fm:
    check(fm.get("lot") == "007" and is_str(fm["lot"]),
          f"reagent: 批号 007 必须保持字符串，实际 {fm.get('lot')!r} ({type(fm.get('lot')).__name__})")
    check(fm.get("no") == "DEMO-AB1", "reagent: 货号丢失")
    check(is_str(fm.get("exp")) and fm["exp"] == "2026-12-02",
          f"reagent: 效期必须是字符串而非 date，实际 {type(fm.get('exp')).__name__}")
    check(isinstance(fm.get("quantity"), int) and fm["quantity"] == 80,
          f"reagent: quantity 应为整数 80，实际 {fm.get('quantity')!r}")
    check(isinstance(fm.get("min_stock"), int) and fm["min_stock"] == 20, "reagent: min_stock 类型错")
    check(fm.get("unit") == "%", f"reagent: 百分号单位丢失 → {fm.get('unit')!r}")
    check("left" not in fm, "reagent: 计量态不应冗余写派生的 left")
    mv = fm.get("movements")
    check(isinstance(mv, list) and len(mv) == 2, "reagent: movements 应为 2 条流水")
    if isinstance(mv, list) and len(mv) == 2:
        check(isinstance(mv[0].get("delta"), int) and mv[0]["delta"] == -5,
              f"reagent: 出库负数必须保真 → {mv[0].get('delta')!r}")
        check(mv[1]["delta"] == 100, "reagent: 入库数量错")
        check(is_str(mv[0].get("date")), "reagent: 流水日期应为字符串")
    check("分装保存" in (body or ""), "reagent: 备注正文丢失")
    check("µL" in (fm.get("spec") or ""), "reagent: 微米符号丢失")

fm, _ = load("reagent-free")
if fm:
    check(fm.get("lot") == "0012" and is_str(fm["lot"]), "reagent-free: 前导零货号变形")
    check(fm.get("quantity") is None, "reagent-free: 不计量应为 null")
    check(fm.get("left") == "2 支", f"reagent-free: 自由文本余量丢失 → {fm.get('left')!r}")

# ---- 任务：布尔与列表 ----
fm, _ = load("task")
if fm:
    check(fm.get("done") is False, f"task: done 应为布尔 false → {fm.get('done')!r}")
    check(fm.get("key") is True, f"task: key 应为布尔 true → {fm.get('key')!r}")
    check(fm.get("tags") == ["试剂", "WB"], f"task: tags 应为字符串列表 → {fm.get('tags')!r}")
    check(is_str(fm.get("dueDate")) and fm["dueDate"] == "2026-11-21", "task: dueDate 被当成 date")
    check(fm.get("due") == "今天 18:00", "task: 中文相对截止丢失")

# ---- 项目：里程碑正文可被 Obsidian 勾选 ----
fm, body = load("project")
if fm:
    check(isinstance(fm.get("progress"), int) and fm["progress"] == 42, "project: progress 类型错")
    check(is_str(fm.get("start")) and fm["start"] == "2026-03", "project: 年月被当成 date")
    check("- [x] 开题" in (body or ""), "project: 已完成里程碑应为勾选态")
    check("- [ ] 样本采集" in (body or ""), "project: 未完成里程碑应为未勾选态")
    check("milestones" not in fm, "project: 里程碑应在正文而非 frontmatter")

# ---- 经费：整数与浮点 ----
fm, _ = load("budget")
if fm:
    check(isinstance(fm.get("amount"), int) and fm["amount"] == 4860, "budget: 金额应为整数")
    check(is_str(fm.get("date")), "budget: 日期被当成 date")
fm, _ = load("budget-float")
if fm:
    check(isinstance(fm.get("amount"), float) and abs(fm["amount"] - 3200.75) < 1e-9,
          f"budget-float: 浮点金额失真 → {fm.get('amount')!r}")

# ---- 提醒：语义脱耦 ----
fm, _ = load("reminder")
if fm:
    check(fm.get("priority") == "warn", f"reminder: var(--orange) 应映射为 warn → {fm.get('priority')!r}")
    check("color" not in fm, "reminder: 标准色不应冗余写 CSS 变量")
fm, _ = load("reminder-urgent")
if fm:
    check(fm.get("priority") == "urgent", "reminder-urgent: 应急映射为 urgent")

# ---- 专注：时间戳不得被解析成 datetime ----
fm, _ = load("focus")
if fm:
    check(isinstance(fm.get("minutes"), int) and fm["minutes"] == 75, "focus: minutes 类型错")
    check(is_str(fm.get("at")) and fm["at"] == "2026-11-20T09:00",
          f"focus: at 必须保持字符串，实际 {type(fm.get('at')).__name__}")
    check(not isinstance(fm.get("at"), (datetime.date, datetime.datetime)), "focus: at 变成了时间对象")

# ---- 速记 / 实验：正文即内容 ----
fm, body = load("note")
if fm:
    check("逆转录 Ct 漂移排查" in (body or ""), "note: 正文丢失")
    check(is_str(fm.get("at")), "note: at 被当成 timestamp")
fm, body = load("exp")
if fm:
    check("第 4 周给药" in (body or ""), "exp: 摘要正文丢失")
    check(fm.get("id") == "EXP-1", "exp: 实验 ID 丢失")
fm, body = load("empty-note")
if fm:
    check(fm.get("note") == "", f"empty-note: 空字符串必须保留为字段（UI 直接 esc，缺省会显示 undefined）→ {fm.get('note')!r}")

# ---- 未知字段向前兼容 ----
fm, _ = load("unknown")
if fm:
    check(fm.get("customField") == "自定义值", "unknown: 自定义字段丢失")
    check(fm.get("nested") == {"a": 1, "b": ["x", "y"]}, f"unknown: 嵌套结构失真 → {fm.get('nested')!r}")
    check(fm.get("flag") is True, "unknown: 布尔扩展字段失真")

# ---- 文献 / 仪器 / 预约 ----
fm, body = load("lit")
if fm:
    check(fm.get("doi") == "10.1000/example", "lit: DOI 丢失")
    check(fm.get("zoteroKey") == "ABCD1234", "lit: Zotero key 丢失")
    check("样本量计算依据" in (body or ""), "lit: 读书笔记正文丢失")
fm, _ = load("instrument")
if fm:
    check(is_str(fm.get("cal")) and is_str(fm.get("next")), "instrument: 校准日期被当成 date")
fm, _ = load("booking")
if fm:
    check(fm.get("slot") == "09:00-11:00", f"booking: 时段失真 → {fm.get('slot')!r}")
    check(is_str(fm.get("date")), "booking: 日期被当成 date")

print(f"PyYAML {yaml.__version__} 独立解析校验：{checked} 项断言，{len(fails)} 项失败")
for f in fails:
    print("  [FAIL]", f)
sys.exit(1 if fails else 0)