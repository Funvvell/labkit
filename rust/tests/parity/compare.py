"""Compare the two implementations' RGB manifests by ROI geometry.

    python tests/parity/compare.py ref/manifest.json rust/manifest.json
"""

from __future__ import annotations

import json
import pathlib
import sys


def load(path: str) -> dict[str, tuple[int, int, str]]:
    data = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    out = {}
    for item in data["items"]:
        # Ignore the slide path string (Rust and Python render `/` differently);
        # the geometry is the stable key.
        geom = item["roi_key"].split("|", 1)[-1]
        out[geom] = (item["w"], item["h"], item["sha256_rgb"])
    return out


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: compare.py <reference.json> <rust.json>")
    a, b = load(sys.argv[1]), load(sys.argv[2])
    if set(a) != set(b):
        print("FAIL: ROI sets differ")
        print("  only reference:", sorted(set(a) - set(b)))
        print("  only rust:     ", sorted(set(b) - set(a)))
        raise SystemExit(1)

    failed = 0
    for key in sorted(a):
        if a[key] != b[key]:
            failed += 1
            print(f"FAIL {key}\n  python: {a[key]}\n  rust:   {b[key]}")
        else:
            print(f"OK   {key}  {a[key][0]}x{a[key][1]}  {a[key][2][:12]}…")
    print(f"\n{len(a) - failed}/{len(a)} ROIs pixel-identical")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
