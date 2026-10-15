"""Render consistent studio product shots from the real store covers.

Run from the repository root after prepare-catalogue.py:
    python3 scripts/make-product-shots.py
Requires Pillow. Reads public/images/book-<id>.webp and writes
public/images/shot-<id>.webp (900x1100) for the homepage's featured and
bestseller products. Covers are only cropped, shaded and placed; no cover
artwork is altered or invented.
"""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageEnhance

W, H = 900, 1100
FLOOR = int(H * 0.83)
ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "public" / "images"

# Per-product handling. crop is (left, top, right, bottom) as fractions.
#   mockup: a flat cover, rendered as a standing hardcover.
#   render: the store image is already a 3D render on white; multiplied onto the set.
#   photo:  a photograph that cannot be flattened (e.g. a shelf of volumes); fills the frame.
CONFIG = {
    6078: {"mode": "mockup", "crop": (0.075, 0, 1, 1)},
    5966: {"mode": "render", "crop": (0.08, 0.02, 0.955, 0.925)},
    6537: {"mode": "photo"},
    253: {"mode": "mockup", "crop": (0.005, 0.005, 0.995, 0.995)},
    403: {"mode": "mockup", "crop": (0.075, 0.14, 0.88, 0.96)},
    5926: {"mode": "mockup", "crop": (0.125, 0.125, 0.86, 0.945)},
}


def backdrop():
    """Warm studio sweep: lit wall, soft horizon, slightly darker floor."""
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    top, wall, floor_near, floor_far = (247, 241, 230), (236, 225, 204), (226, 211, 184), (232, 220, 197)
    for y in range(H):
        if y < FLOOR:
            t = y / FLOOR
            c = tuple(round(top[i] + (wall[i] - top[i]) * t) for i in range(3))
        else:
            t = (y - FLOOR) / (H - FLOOR)
            c = tuple(round(floor_far[i] + (floor_near[i] - floor_far[i]) * t) for i in range(3))
        draw.line([(0, y), (W, y)], fill=c)
    img = img.filter(ImageFilter.GaussianBlur(6))  # soften the horizon
    # Key light pooled behind the product.
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((W * 0.12, H * 0.08, W * 0.88, H * 0.78), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.composite(Image.new("RGB", (W, H), (255, 252, 244)), img, glow)
    # Gentle vignette.
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).rectangle((0, 0, W, H), outline=60, width=90)
    vig = vig.filter(ImageFilter.GaussianBlur(90))
    return Image.composite(Image.new("RGB", (W, H), (190, 172, 140)), img, vig)


def solve(a, b):
    n = len(b)
    m = [row[:] + [b[i]] for i, row in enumerate(a)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(m[r][col]))
        m[col], m[pivot] = m[pivot], m[col]
        for r in range(n):
            if r != col:
                f = m[r][col] / m[col][col]
                m[r] = [x - f * y for x, y in zip(m[r], m[col])]
    return [m[i][n] / m[i][i] for i in range(n)]


def warp(src, quad, size):
    """Map src onto the quadrilateral quad (TL, TR, BR, BL) in a canvas of size."""
    w, h = src.size
    corners = [(0, 0), (w, 0), (w, h), (0, h)]
    rows, rhs = [], []
    for (x, y), (u, v) in zip(quad, corners):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); rhs.append(u)
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y]); rhs.append(v)
    coeffs = solve(rows, rhs)
    return src.transform(size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)


def shadow(canvas, box, blur, opacity):
    layer = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(layer).ellipse(box, fill=opacity)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.paste(Image.new("RGB", canvas.size, (58, 42, 18)), (0, 0), layer)


def mockup(cover):
    canvas = backdrop()
    cover = cover.convert("RGB")
    ch = int(H * 0.7)
    cw = int(cover.width * ch / cover.height)
    if cw > W * 0.6:
        cw = int(W * 0.6)
        ch = int(cover.height * cw / cover.width)
    sw = int(cw * 0.085)  # spine depth
    bx = (W - cw + sw) // 2
    by = FLOOR - ch
    tr = (bx + cw * 0.93, by + ch * 0.028)
    br = (bx + cw * 0.93, FLOOR - ch * 0.012)
    quad = [(bx, by), tr, br, (bx, FLOOR)]
    spine_quad = [(bx - sw, by + ch * 0.014), (bx, by), (bx, FLOOR), (bx - sw, FLOOR - ch * 0.006)]

    # Shadows: wide ambient, then a tight contact line along the base.
    shadow(canvas, (bx - sw - 40, FLOOR - 26, br[0] + 90, FLOOR + 34), 30, 120)
    shadow(canvas, (bx - sw, FLOOR - 7, br[0] + 10, FLOOR + 9), 7, 170)

    # Cover lighting: hinge crease near the spine and a soft falloff to the right.
    lit = cover.resize((cw, ch), Image.LANCZOS)
    lit = ImageEnhance.Contrast(lit).enhance(1.04)
    shade = Image.new("L", (cw, ch), 255)
    d = ImageDraw.Draw(shade)
    for x in range(cw):
        t = x / cw
        v = 255 - int(26 * t)  # falloff
        if t < 0.012:
            v = 175
        elif t < 0.035:
            v = 255
        d.line([(x, 0), (x, ch)], fill=v)
    lit = ImageChops.multiply(lit, Image.merge("RGB", (shade,) * 3))
    sheen = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(sheen).polygon([(cw * 0.05, 0), (cw * 0.28, 0), (cw * 0.02, ch * 0.55)], fill=34)
    sheen = sheen.filter(ImageFilter.GaussianBlur(40))
    lit = Image.composite(Image.new("RGB", lit.size, (255, 255, 255)), lit, sheen)

    # Spine: the cover's own leading edge, darkened, so wraparound printing continues.
    strip = cover.crop((0, 0, max(2, int(cover.width * 0.05)), cover.height)).resize((sw, ch))
    strip = ImageEnhance.Brightness(strip).enhance(0.62)
    grad = Image.new("L", (sw, ch))
    gd = ImageDraw.Draw(grad)
    for x in range(sw):
        gd.line([(x, 0), (x, ch)], fill=int(150 + 105 * x / sw))
    strip = ImageChops.multiply(strip, Image.merge("RGB", (grad,) * 3))

    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=5, fill=255)
    for src, q, m in ((strip, spine_quad, None), (lit, quad, mask)):
        rgba = src.convert("RGBA")
        if m is not None:
            rgba.putalpha(m)
        canvas.paste(warp(rgba, q, (W, H)), (0, 0), warp(rgba, q, (W, H)))
    # Thin board edge along the top catches the light.
    ImageDraw.Draw(canvas).line([(bx - sw, by + ch * 0.014), (bx, by), tr], fill=(250, 244, 230), width=2)
    return canvas


def render(image):
    canvas = backdrop()
    image = image.convert("RGB")
    # Normalise the render's grey studio backdrop to white so it vanishes when multiplied.
    corner = image.crop((0, 0, 12, 12)).resize((1, 1), Image.BOX).getpixel((0, 0))
    image = Image.merge("RGB", [
        band.point(lambda v, c=c: min(255, round(v * 255 / max(c, 1))))
        for band, c in zip(image.split(), corner)
    ])
    scale = min(W * 0.84 / image.width, (FLOOR + 40) * 0.86 / image.height)
    image = image.resize((int(image.width * scale), int(image.height * scale)), Image.LANCZOS)
    x = (W - image.width) // 2
    y = FLOOR + 30 - image.height
    shadow(canvas, (x + 30, FLOOR - 4, x + image.width - 10, FLOOR + 50), 30, 90)
    region = canvas.crop((x, y, x + image.width, y + image.height))
    canvas.paste(ImageChops.multiply(region, image), (x, y))
    return canvas


def photo(image):
    image = image.convert("RGB")
    scale = max(W / image.width, H / image.height)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left, top = (image.width - W) // 2, (image.height - H) // 2
    image = image.crop((left, top, left + W, top + H))
    image = ImageEnhance.Color(image).enhance(1.05)
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).rectangle((0, 0, W, H), outline=110, width=120)
    vig = vig.filter(ImageFilter.GaussianBlur(110))
    return Image.composite(Image.new("RGB", (W, H), (20, 14, 6)), image, vig)


def main():
    catalogue = json.loads((ROOT / "src" / "data" / "catalogue.json").read_text())
    books = catalogue["featured"][:4] + catalogue["bestsellers"]
    for book in books:
        cfg = CONFIG.get(book["id"], {"mode": "mockup"})
        source = Image.open(IMAGES / f"book-{book['id']}.webp")
        if "crop" in cfg:
            l, t, r, b = cfg["crop"]
            source = source.crop((int(l * source.width), int(t * source.height), int(r * source.width), int(b * source.height)))
        shot = {"mockup": mockup, "render": render, "photo": photo}[cfg["mode"]](source)
        out = IMAGES / f"shot-{book['id']}.webp"
        shot.save(out, "WEBP", quality=88, method=6)
        print(f"{out.relative_to(ROOT)}  ({cfg['mode']})")


if __name__ == "__main__":
    main()
