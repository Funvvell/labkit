<div align="center">

<img src="icon.svg" width="96" height="96" alt="LabKit Logo" />

# LabKit · Research Toolbox

**A local-first research workbench** — lab notebook, 20 research tools, SDPC whole-slide browsing & ROI cropping, qPCR ΔΔCt analysis.

[![Release](https://img.shields.io/github/v/release/Funvvell/pathology-crop-tool?style=flat-square&label=Latest)](https://github.com/Funvvell/pathology-crop-tool/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows)](#-quick-start)
[![Web Demo](https://img.shields.io/badge/Web%20Demo-GitHub%20Pages-2ea44f?style=flat-square)](https://funvvell.github.io/pathology-crop-tool/)

[Quick start](#-quick-start) · [Features](#-features) · [Shortcuts](#-shortcuts) · [Development](#-development) · [中文](README.md)

</div>

> **Disclaimer**: all computations and image outputs are **for research use only, not for clinical diagnostic use**.
> **Privacy**: everything runs locally. No telemetry, no accounts, no uploads — your notebook lives on your own machine.

![LabKit home](docs/readme-home.png)

---

## ✨ Features

### Workbench (research notebook)

- Eleven record types: tasks, projects, experiments, literature, instruments, reagents, bookings, budget, quick notes, reminders — board + table views
- **Editable dashboard** (gridstack-style drag/resize), layout persisted with the notebook
- Focus timer with 7-day trends and completion reports
- **Notification center**: task deadlines, reagent expiry, instrument calibration due, export completion
- Disk-backed notebook at `~/.liver_portal_crop/labkit_db.json` with atomic writes, rolling backups and corruption self-healing; browser mode falls back to localStorage

### Tool library (20 tools / workspaces)

| Group | Tools |
| --- | --- |
| Statistics & data | 2×2 table analysis (OpenEpi) · sample size & power (OpenEpi) · hypothesis tests (t/χ²/Fisher/Mann-Whitney/Wilcoxon/variance/correlation) · Table 1 baseline · randomization & blinding · data cleaning & crosstabs · APA-7 report strings |
| Lab calculations | bench calculator (dilution/centrifugation/plating/MOI) · primer workbench (nearest-neighbor Tm) · **qPCR workspace** (ΔΔCt/Pfaffl/geNorm) · plate layout editor · protocol timer · experiment record → Markdown · reagent/inventory ledger |
| Writing & figures | publication plotter (300/600 dpi) · figure assembler · batch image processing (Rust, parallel) · **image cropping workspace** (SDPC WSI + ROI + TIFF) · reporting checklists (PRISMA/STROBE/CONSORT/MIQE) · table format converter |

Every tool shares one chrome: **load example / reset / help & provenance drawer / export bar**. Inputs and configs **persist automatically** across page switches and restarts. **Cross-tool data flow**: cleaning → tests / plotter / Table 1; test results → APA strings (reloadable across restarts).

### Interaction (patterns borrowed from IT-Tools / DevToys / Rubick)

- **Ctrl+K command palette** over tools, pages and global actions, with pinyin-initial fuzzy matching
- **Persistent sidebar** (workbench / tool groups / favorites / settings) — every page reachable even if all home cards are removed
- **Hash deep links** (`#/tool/tests`), refresh-restore, back/forward
- Favorites & recents, global shortcut registry with `?` help overlay
- **Dark mode** (light / dark / system); charts and crop canvas stay paper-white for journal submission
- First-run welcome: start blank or load sample data; customizable display name

### Pathology workspace

- SDPC whole-slide pyramid browsing (LRU tile cache, navigator thumbnail, wheel level switching) for 120,000×80,000+ px slides
- ROI selection, tissue-detection assist, full-resolution batch TIFF export with DPI tags
- Plain images (png/jpg/tif) need **no** extra component

## 🚀 Quick start

### 1. Installer (recommended)

Download `LabKit_*.exe` (NSIS) or `LabKit-portable-win-x64.zip` from [Releases](https://github.com/Funvvell/pathology-crop-tool/releases).

**Optional SDPC decoder**: for licensing reasons the installer does **not** bundle the vendor's closed-source `DecodeSdpcDll.dll`. To browse `.sdpc` slides:

```bash
pip install sdpc-for-python
```

The app auto-detects the decoder directory (bundled dir → `SDPC_DLL_DIR` env var → Python site-packages). If missing, the crop page shows acquisition guidance; the other 19 tools and the notebook are unaffected.

### 2. Web demo (zero install)

<https://funvvell.github.io/pathology-crop-tool/> — browser fallback mode: notebook in localStorage, all statistics/plotting/writing tools fully functional; SDPC decoding and disk backups require the desktop app.

### 3. From source

```bash
git clone https://github.com/Funvvell/pathology-crop-tool.git
cd pathology-crop-tool/rust
cargo install tauri-cli --locked   # first time only
cargo tauri dev
cargo tauri build
```

The frontend is **zero-build**: plain HTML/CSS/JS (classic scripts, ordered loading). Opening `frontend/index.html` in a browser works out of the box — no Node/Vite required.

## ⌨️ Shortcuts

| Key | Action |
| --- | --- |
| `Ctrl+K` | command palette (tools / pages / actions) |
| `Ctrl+,` | settings |
| `Alt+←` / `Alt+→` | back / forward |
| `?` | shortcut help overlay |
| `Esc` | close panels / drawers |

## 🔒 Data & privacy

- Notebook: `~/.liver_portal_crop/labkit_db.json` (path / backups / import / export / reset in Settings)
- Tool input snapshots, favorites, recents, theme and display name persist with the notebook
- **No telemetry, no network calls** except DOI links you open and the optional InvenTree API integration
- Web demo data stays in your browser's localStorage

## 🧱 Architecture

```
frontend/            zero-build UI (index.html shell + css/ + js/ modules + tools/ + vendor/)
rust/                Tauri 2 + Rust: SDPC FFI decode, TIFF export, qPCR parsing, disk notebook, 96 tests
tests/js/            node:test parity tests (vs OpenEpi/scipy/tableone) + shell unit tests
rust/tests/          IPC naming-contract tests
liver_portal_crop/   legacy Python/PySide6 implementation (algorithm reference only)
```

## 🛠️ Development

```bash
cd rust && cargo test                 # Rust suite
node --test tests/js/*.test.mjs       # frontend parity / shell tests (Node 18+)
```

Adding a tool takes three steps (registry entry + script + parity test) — see [CONTRIBUTING.md](CONTRIBUTING.md).
Interaction patterns reference [IT-Tools](https://github.com/CorentinTh/it-tools), [DevToys](https://github.com/DevToys-app/DevToys), [Rubick](https://github.com/rubickCenter/rubick) (ideas only, no code copied); the pathology workspace uses [QuPath](https://github.com/qupath/qupath) as its domain baseline.

## 📦 Legacy Python version

`liver_portal_crop/` (PySide6) is the older, functionally equivalent implementation, kept **only as an algorithm reference**. It is no longer released on tags; a manual workflow (`Legacy Python Build`) can still produce its exe. Use the Rust LabKit for desktop work.

## 📄 License & attribution

- This project: [MIT](LICENSE)
- Third-party attributions: [NOTICE.md](NOTICE.md) and [frontend/vendor/LICENSES.md](frontend/vendor/LICENSES.md) (OpenEpi MIT, stdlib-js Apache-2.0, SciPy/Biopython BSD-3, Plotly/fabric MIT, …)
- PRISMA 2020 checklist CC-BY 4.0; the SDPC decoder DLL is vendor-proprietary and **not redistributed** in this repository or its installers
- Community: [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Changelog](CHANGELOG.md)

> **Research use only; not for clinical diagnostic use.** 仅供科研使用，不用于临床诊断。