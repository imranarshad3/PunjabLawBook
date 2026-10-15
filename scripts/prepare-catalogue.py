"""Refresh the public PLBH catalogue snapshot and locally optimized cover assets.
Run from the repository root: python3 scripts/prepare-catalogue.py
Requires Pillow. No store writes or authenticated endpoints are used.
"""
import html
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen, Request
from PIL import Image

BASE = 'https://punjablawbookhouse.com'
def fetch(path):
    with urlopen(Request(path, headers={'User-Agent': 'PLBH-Homepage/1.0'}), timeout=40) as response:
        return response.read()

featured = json.loads(fetch(BASE + '/wp-json/wc/store/v1/products?include=5966,4661,6078,767,2557,5327&per_page=6'))
popular = json.loads(fetch(BASE + '/wp-json/wc/store/v1/products?per_page=5&orderby=popularity'))
Path('public/images').mkdir(parents=True, exist_ok=True)
def normalize(product):
    image = product['images'][0]['src']
    destination = f"/images/book-{product['id']}.webp"
    cover = Image.open(io.BytesIO(fetch(image))).convert('RGB')
    cover.thumbnail((720, 900))
    cover.save('public' + destination, 'WEBP', quality=86)
    return {
        'id': product['id'], 'name': html.unescape(product['name']),
        'url': product['permalink'], 'image': destination, 'sourceImage': image,
        'price': int(product['prices']['price']) / 10 ** product['prices']['currency_minor_unit'],
        'inStock': product['is_in_stock'],
        'purchasable': product['is_purchasable'] and product['type'] == 'simple',
    }
catalogue = {
    'verifiedAt': datetime.now(timezone.utc).date().isoformat(),
    'source': BASE + '/wp-json/wc/store/v1/products',
    'featured': [normalize(p) for p in featured],
    'bestsellers': [normalize(p) for p in popular],
}
Path('src/data/catalogue.json').write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + '\n')
print('Saved 6 featured products, 5 popularity-ordered products, and optimized covers.')
