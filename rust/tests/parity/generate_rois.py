"""Generate the ROI set used by both implementations' parity runs.

    python tools/parity/generate_rois.py --slide "D:/.../slide.sdpc" --out out/rois.json
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT.parent))  # repository root (Python app lives here)

from liver_portal_crop.reader import SDPCReader  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slide", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    reader = SDPCReader(args.slide)
    w, h = reader.full_width, reader.full_height
    boxes = [
        (w // 2 - 512, h // 2 - 512, 1024, 1024),  # normal
        (10, h // 2, 200, 200),                     # left edge -> clamp
        (w - 100, h // 2, 200, 200),                # right edge -> clamp
        (w // 2, 10, 200, 200),                     # top edge -> clamp
        (w // 2, h - 100, 200, 200),                # bottom edge -> clamp
        (w // 2, h // 2, 101, 101),                 # odd size
    ]
    rois = [
        {
            "id": f"p{i:04d}",
            "slide_path": args.slide,
            "x": x,
            "y": y,
            "w": rw,
            "h": rh,
            "angle": 0.0,
            "created_at": "2026-01-01T00:00:00",
        }
        for i, (x, y, rw, rh) in enumerate(boxes)
    ]
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"rois": rois}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out} ({len(rois)} ROIs, slide {w}x{h})")


if __name__ == "__main__":
    main()
