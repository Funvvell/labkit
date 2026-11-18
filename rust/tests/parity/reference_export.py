"""Generate reference TIFFs + RGB manifest with the original Python app.

    python tests/parity/reference_export.py --slide S --session rois.json --out ref/

Only decoded RGB pixels are compared downstream: TIFF container bytes may
differ because `tifffile` and the `tiff` crate emit different tag orderings.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT.parent))

import tifffile  # noqa: E402

from liver_portal_crop.reader import SDPCReader  # noqa: E402
from liver_portal_crop.utils import center_crop_rect  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--slide", required=True)
    ap.add_argument("--session", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--mag", default="")
    args = ap.parse_args()

    out = pathlib.Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    reader = SDPCReader(args.slide)
    rois = json.loads(pathlib.Path(args.session).read_text(encoding="utf-8"))["rois"]
    stem = pathlib.Path(args.slide).stem

    items = []
    for i, roi in enumerate(rois):
        x, y, w, h = roi["x"], roi["y"], roi["w"], roi["h"]
        crop = center_crop_rect(
            x + w // 2, y + h // 2, w, h,
            reader.full_width, reader.full_height,
        )
        region = reader.extract_region(*crop, level=0)
        name = f"{stem}_ROI_{i:04d}" + (f"_{args.mag}" if args.mag else "") + ".tiff"
        tifffile.imwrite(str(out / name), region, compression="zlib")
        items.append({
            "roi_key": f"{args.slide}|{x},{y},{w},{h}",
            "w": int(region.shape[1]),
            "h": int(region.shape[0]),
            "sha256_rgb": hashlib.sha256(region.tobytes()).hexdigest(),
        })

    manifest = {"items": items}
    (out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"reference export complete: {len(items)} ROIs -> {out}")


if __name__ == "__main__":
    main()
