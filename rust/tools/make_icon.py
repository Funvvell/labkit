"""Generate the application icon PNG (rounded square + microscope crop marks)."""

from __future__ import annotations

import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "icon.png"
ICO = ROOT / "assets" / "icon.ico"

SIZE = 256
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Soft blue rounded background
d.rounded_rectangle((8, 8, SIZE - 8, SIZE - 8), radius=56, fill=(0, 113, 227, 255))
# Microscope lens ring
d.ellipse((70, 62, 186, 178), outline=(255, 255, 255, 240), width=12)
d.ellipse((96, 88, 160, 152), fill=(255, 255, 255, 60), outline=(255, 255, 255, 220), width=6)
# Crop corner marks
accent = (255, 255, 255, 255)
for x0, y0, x1, y1 in [
    (30, 30, 62, 30), (30, 30, 30, 62),
    (226, 30, 194, 30), (226, 30, 226, 62),
    (30, 226, 62, 226), (30, 226, 30, 194),
    (226, 226, 194, 226), (226, 226, 226, 194),
]:
    d.line((x0, y0, x1, y1), fill=accent, width=7)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT)
img.save(ICO, sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(f"wrote {OUT} and {ICO}")
