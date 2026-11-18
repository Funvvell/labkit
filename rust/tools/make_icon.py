"""Generate the 科研工具箱 LabKit application icon (all PNG sizes + ICO).

Design: macOS-style rounded square, Apple-blue diagonal gradient, white
Erlenmeyer flask (research) with a teal→green sample liquid and bubbles.
The vector source of the same mark lives at `<repo>/icon.svg`.

Run:  py -3.12 rust/tools/make_icon.py
"""

from __future__ import annotations

import pathlib

from PIL import Image, ImageDraw

TOOLS = pathlib.Path(__file__).resolve().parent
RUST = TOOLS.parent
REPO = RUST.parent

BASE = 256          # design coordinate space (matches icon.svg viewBox)
SS = 4              # supersampling factor -> render at 1024
S = BASE * SS


def k(v: float) -> float:
    return v * SS


def qbez(p0, p1, p2, n: int = 24):
    """Sample a quadratic Bézier so PIL polygons get smooth rounded corners."""
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((
            k(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]),
            k(u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]),
        ))
    return out


def flask_points():
    pts = [(k(112), k(64)), (k(112), k(110)), (k(70), k(182))]
    pts += qbez((70, 182), (60, 200), (78, 200))
    pts += [(k(178), k(200))]
    pts += qbez((178, 200), (196, 200), (186, 182))
    pts += [(k(144), k(110)), (k(144), k(64))]
    return pts


def liquid_points():
    pts = [(k(88.7), k(150)), (k(167.3), k(150)), (k(186), k(182))]
    pts += qbez((186, 182), (196, 200), (178, 200))
    pts += [(k(78), k(200))]
    pts += qbez((78, 200), (60, 200), (70, 182))
    return pts


def vertical_gradient(top, bottom, size: int) -> Image.Image:
    strip = Image.new("RGB", (1, 2))
    strip.putpixel((0, 0), top)
    strip.putpixel((0, 1), bottom)
    return strip.resize((size, size), Image.BILINEAR)


def build() -> Image.Image:
    # Diagonal background gradient from the four corner colours.
    corners = Image.new("RGB", (2, 2))
    corners.putpixel((0, 0), (0x4D, 0xA6, 0xFF))
    corners.putpixel((1, 0), (0x0A, 0x84, 0xFF))
    corners.putpixel((0, 1), (0x0A, 0x6C, 0xFF))
    corners.putpixel((1, 1), (0x00, 0x40, 0xB8))
    bg = corners.resize((S, S), Image.BICUBIC).convert("RGBA")

    plate = Image.new("L", (S, S), 0)
    ImageDraw.Draw(plate).rounded_rectangle(
        [k(8), k(8), k(248) - 1, k(248) - 1], radius=k(56), fill=255
    )
    bg.putalpha(plate)

    # Top gloss, clipped to the plate so it never leaks outside the corners.
    ramp = Image.linear_gradient("L").resize((S, S))
    gloss_a = ramp.point(lambda v: max(0, int(56 * (1 - 2 * v / 255))))
    gloss_a = Image.composite(gloss_a, Image.new("L", (S, S), 0), plate)
    gloss = Image.new("RGBA", (S, S), (255, 255, 255, 0))
    gloss.putalpha(gloss_a)
    img = Image.alpha_composite(bg, gloss)

    # Flask body + lip.
    body = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    d.polygon(flask_points(), fill=(255, 255, 255, 255))
    d.rounded_rectangle([k(102), k(50), k(154), k(66)], radius=k(8), fill=(255, 255, 255, 255))
    img = Image.alpha_composite(img, body)

    # Sample liquid, masked by the lower flask polygon.
    lmask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(lmask).polygon(liquid_points(), fill=255)
    liquid = vertical_gradient((0x7F, 0xE7, 0xD0), (0x30, 0xD1, 0x58), S).convert("RGBA")
    liquid.putalpha(lmask)
    img = Image.alpha_composite(img, liquid)

    # Bubbles.
    bub = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    db = ImageDraw.Draw(bub)
    for cx, cy, r, a in [(112, 174, 7, 217), (137, 185, 5, 179), (151, 169, 3.5, 153)]:
        db.ellipse([k(cx - r), k(cy - r), k(cx + r), k(cy + r)], fill=(255, 255, 255, a))
    return Image.alpha_composite(img, bub)


def main() -> None:
    master = build()

    def at(size: int) -> Image.Image:
        return master.resize((size, size), Image.LANCZOS)

    targets = {
        RUST / "assets" / "icon.png": 256,
        RUST / "icons" / "32x32.png": 32,
        RUST / "icons" / "128x128.png": 128,
        RUST / "icons" / "128x128@2x.png": 256,
        RUST / "icons" / "icon.png": 512,
    }
    for path, size in targets.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        at(size).save(path)
        print(f"wrote {path} ({size}x{size})")

    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    for path in [REPO / "icon.ico", RUST / "assets" / "icon.ico", RUST / "icons" / "icon.ico",
                 RUST / "dist" / "app.ico"]:
        path.parent.mkdir(parents=True, exist_ok=True)
        master.resize((256, 256), Image.LANCZOS).save(path, sizes=ico_sizes)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()