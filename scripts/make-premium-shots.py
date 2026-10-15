"""Build 9:11 product shots from the PLBH premium concept book images.

Each source PNG is a 900x690 landscape scene with a printed caption strip at the
bottom. We drop the caption, crop around the centred book, then extend the
frame to the 9:11 card ratio with a blurred copy of the scene.

Run: python3 scripts/make-premium-shots.py
"""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/images/PLBH_20_Premium_Law_Book_Images"
OUTPUT = ROOT / "public/images"

# Store product id -> concept image chosen by subject.
SHOTS = {
    6078: "14_Service_Laws.png",
    5966: "16_Judicial_Service_Exam_Guide.png",
    5327: "03_Criminal_Major_Acts.png",
    4661: "02_Civil_Procedure_Code.png",
    2557: "12_Family_Laws.png",
    767: "18_Bare_Acts.png",
    3712: "01_Constitution_of_Pakistan.png",
    6537: "17_Pakistan_Annual_Law_Digest.png",
    253: "08_Pakistan_Penal_Code_1860.png",
    403: "09_Qanun_e_Shahadat_Order_1984.png",
    5926: "05_Sales_Tax_Law.png",
}

CROP_WIDTH = 760
WIDTH, HEIGHT = 900, 1100


def caption_top(image: Image.Image) -> int:
    """First row of the light caption strip (it varies between crops)."""
    gray = image.convert("L")
    for y in range(500, gray.height):
        row = [gray.getpixel((x, y)) for x in range(0, gray.width, 15)]
        if sum(row) / len(row) > 200:
            return y - 4
    return gray.height


def make_shot(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    left = (image.width - CROP_WIDTH) // 2
    scene = image.crop((left, 0, left + CROP_WIDTH, caption_top(image)))

    # Blurred, dimmed backdrop filling the full portrait frame.
    cover = max(WIDTH / scene.width, HEIGHT / scene.height)
    backdrop = scene.resize(
        (round(scene.width * cover), round(scene.height * cover)), Image.LANCZOS
    )
    backdrop = backdrop.crop(
        (
            (backdrop.width - WIDTH) // 2,
            (backdrop.height - HEIGHT) // 2,
            (backdrop.width - WIDTH) // 2 + WIDTH,
            (backdrop.height - HEIGHT) // 2 + HEIGHT,
        )
    ).filter(ImageFilter.GaussianBlur(40))
    backdrop = ImageEnhance.Brightness(backdrop).enhance(0.38)

    # Sharp scene scaled to the frame width, centred, edges faded into the blur.
    scale = WIDTH / scene.width
    sharp = scene.resize((WIDTH, round(scene.height * scale)), Image.LANCZOS)
    top = (HEIGHT - sharp.height) // 2
    mask = Image.new("L", sharp.size, 255)
    # Short fade at the top keeps cover titles crisp; a long one dissolves the desk.
    for fade, from_bottom in ((36, False), (140, True)):
        for y in range(fade):
            t = y / fade
            alpha = round(255 * t * t * (3 - 2 * t))  # smoothstep
            row = sharp.height - 1 - y if from_bottom else y
            mask.paste(alpha, (0, row, sharp.width, row + 1))
    backdrop.paste(sharp, (0, top), mask)

    # Studio vignette: darken the frame edges so the light falls on the book.
    vignette = Image.radial_gradient("L").resize((WIDTH, HEIGHT), Image.BILINEAR)
    vignette = vignette.point(lambda v: min(255, max(0, (v - 70) * 1.6)))
    dark = Image.new("RGB", (WIDTH, HEIGHT), (6, 18, 14))
    return Image.composite(dark, backdrop, vignette.point(lambda v: v * 0.75))


def main() -> None:
    for product_id, name in SHOTS.items():
        target = OUTPUT / f"premium-{product_id}.webp"
        make_shot(SOURCE / name).save(target, "WEBP", quality=82, method=6)
        print(f"{name} -> {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
