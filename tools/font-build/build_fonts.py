#!/usr/bin/env python3
"""LabKit 字体构建管线：下载上游原始字体 → fontTools 子集化 → frontend/fonts/。

为什么子集化：完整 Inter 变量字体 ~350KB、JetBrains Mono 每字重 ~270KB，
而界面只需要拉丁 + 希腊字母 + 数学符号（µ × ° ± ≤ ≥ α β χ Δ ℃ →）。
子集后合计约百 KB，且 CSP `font-src 'self'` 下完全离线可用。

中文**不打包**：继续走系统字体（Microsoft YaHei UI / PingFang SC），
避免几 MB 的 CJK 体积，也避开微软系统字体「不得单独再分发」的许可限制。

来源与许可（均为 SIL OFL 1.1，可再分发，须附许可原文）：
  Inter          rsms/inter，经 npm `inter-ui`（官方包）分发
  JetBrains Mono JetBrains/JetBrainsMono，经 jsDelivr 的 GitHub 镜像分发
原始文件只落在临时目录，不入库；入库的是子集 woff2 + OFL 原文 + manifest（含 sha256）。

跑法：python tools/font-build/build_fonts.py
依赖：pip install fonttools brotli
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import sys
import tempfile
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "frontend" / "fonts"

INTER_VER = "4.1.0"
JBM_VER = "2.304"
SOURCES = [
    # (本地名, URL, 许可 URL)
    ("InterVariable.woff2",
     f"https://cdn.jsdelivr.net/npm/inter-ui@{INTER_VER}/variable/InterVariable.woff2",
     f"https://cdn.jsdelivr.net/npm/inter-ui@{INTER_VER}/LICENSE.txt"),
    ("JetBrainsMono-Regular.ttf",
     f"https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v{JBM_VER}/fonts/ttf/JetBrainsMono-Regular.ttf",
     f"https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v{JBM_VER}/OFL.txt"),
    ("JetBrainsMono-Bold.ttf",
     f"https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v{JBM_VER}/fonts/ttf/JetBrainsMono-Bold.ttf",
     f"https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v{JBM_VER}/OFL.txt"),
]

# 界面真正用到的字符集：拉丁 + 拉丁扩展 + 希腊 + 标点 + 上下标 + 箭头 + 数学运算符。
# 不含 CJK —— 那些字形由系统字体提供，Inter/JBM 里本来也没有。
RANGES = [
    (0x0020, 0x007E),  # Basic Latin
    (0x00A0, 0x00FF),  # Latin-1：µ ° ± × ÷ ² ³ Å
    (0x0100, 0x017F),  # Latin Extended-A（作者名等）
    (0x0370, 0x03FF),  # Greek：α β χ Δ μ
    (0x2000, 0x206F),  # 标点：– — ‘ ’ “ ” … ‰ ′ ″
    (0x2070, 0x209F),  # 上下标
    (0x2100, 0x214F),  # 字母样符号：℃ ℓ №
    (0x2190, 0x21FF),  # 箭头：→ ← ↑ ↓（引物 5'→3'）
    (0x2200, 0x22FF),  # 数学：≤ ≥ ≈ ≠ ∑ √  −
]


def charset() -> str:
    chars: set[str] = set()
    for lo, hi in RANGES:
        chars.update(chr(c) for c in range(lo, hi + 1))
    return "".join(sorted(chars))


def sha256(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def fetch(url: str, dest: pathlib.Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "labkit-font-build"})
    with urllib.request.urlopen(req, timeout=60) as r:
        dest.write_bytes(r.read())


def subset_to(src: pathlib.Path, dest: pathlib.Path, text: str) -> None:
    font = TTFont(src)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]          # 保留 kern/liga/tnum 等排版特性
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.recalc_timestamp = False
    opts.drop_tables += ["DSIG"]
    sub = subset.Subsetter(options=opts)
    sub.populate(text=text)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(dest)
    font.close()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    text = charset()
    manifest = {"generator": "tools/font-build/build_fonts.py", "ranges": [f"U+{lo:04X}-{hi:04X}" for lo, hi in RANGES], "fonts": []}
    with tempfile.TemporaryDirectory(prefix="labkit-fonts-") as td:
        tmp = pathlib.Path(td)
        for name, url, lic_url in SOURCES:
            raw = tmp / name
            print(f"下载 {name} …")
            fetch(url, raw)
            lic = tmp / (name + ".LICENSE")
            fetch(lic_url, lic)
            out_name = name.replace(".ttf", ".woff2")
            dest = OUT / out_name
            subset_to(raw, dest, text)
            # 许可原文按家族落盘（OFL 要求随字体分发）
            fam = "Inter" if name.startswith("Inter") else "JetBrainsMono"
            (OUT / f"{fam}-OFL.txt").write_bytes(lic.read_bytes())
            manifest["fonts"].append({
                "file": out_name,
                "family": "Inter" if fam == "Inter" else "JetBrains Mono",
                "source": url,
                "sourceSha256": sha256(raw),
                "sha256": sha256(dest),
                "bytes": dest.stat().st_size,
                "license": "OFL-1.1",
                "licenseFile": f"{fam}-OFL.txt",
            })
            print(f"  → {out_name}  {dest.stat().st_size / 1024:.1f} KB")
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(f["bytes"] for f in manifest["fonts"])
    print(f"完成：{len(manifest['fonts'])} 个子集，合计 {total / 1024:.1f} KB")


if __name__ == "__main__":
    sys.exit(main())