#!/usr/bin/env python3
"""Build the bottom-of-home-page carousel from an Awin product feed CSV (Comenii scrubs).

Usage:  python3 scripts/import-home-bottom-feed.py path/to/feed.csv [count] [dead-images.txt]

dead-images.txt (optional): whitespace-separated image file-name prefixes whose
merchant image no longer loads; those colour pages are skipped.
Then:   node scripts/build.mjs

Writes src/data/home-bottom.json. The feed lists every size as its own row, so rows are
grouped by product page (one page per colour) and picked round-robin across product
names to give a varied set of `count` cards (default 50).
"""
import csv, html, json, os, re, sys
from collections import OrderedDict
from datetime import date
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "home-bottom.json")

PARTNER = {
    "id": "comenii",
    "name": "Comenii",
    "domain": "comenii.com",
    "category": "Medical Scrubs",
    "kicker": "New partner · Medical apparel",
    "title": "Comenii medical scrubs",
    "tagline": "Stretch scrub tops, pants, joggers and jackets for nurses and healthcare teams, including plus-size and maternity fits.",
    "url": "https://www.awin1.com/cread.php?awinmid=57145&awinaffid=3067297",
    "cta": "Shop Comenii",
}

# Colour words in the merchant SKU (Chinese) -> English label
COLOURS = [
    ("勃艮第红", "Burgundy"), ("石墨灰", "Graphite Grey"), ("橄榄绿", "Olive Green"), ("苔藓绿", "Moss Green"),
    ("藏青", "Navy"), ("湖绿", "Teal"), ("酒红", "Wine"), ("浅蓝", "Ceil Blue"), ("宝蓝", "Royal Blue"),
    ("粉色", "Pink"), ("紫色", "Purple"), ("橘色", "Orange"), ("卡其", "Khaki"), ("青色", "Aqua"),
    ("棕色", "Brown"), ("白色", "White"), ("黑", "Black"),
]


def colour(sku):
    for zh, en in COLOURS:
        if zh in sku:
            return en
    return ""


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()


def first_sentence(d, limit=120):
    d = clean(d)
    m = re.match(r"(.{30,%d}?[.!?])(\s|$)" % limit, d)
    if m:
        return m.group(1)
    return d[:limit].rsplit(" ", 1)[0] + "…" if len(d) > limit else d


def sized(u, w=500):
    p = urlsplit(u)
    q = dict(parse_qsl(p.query)); q["width"] = str(w)
    return urlunsplit((p.scheme, p.netloc, p.path, urlencode(q), ""))


def main():
    path = sys.argv[1]
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    dead = open(sys.argv[3]).read().split() if len(sys.argv) > 3 else []
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig", newline="")))
    rows = [r for r in rows if not any(f"/files/{d}" in r.get("merchant_image_url", "") for d in dead)]
    pages = OrderedDict()
    for r in rows:
        if r.get("aw_deep_link") and r.get("merchant_image_url"):
            pages.setdefault(r["merchant_deep_link"], []).append(r)

    by_name = OrderedDict()
    for page, variants in pages.items():
        by_name.setdefault(clean(variants[0]["product_name"]), []).append(variants)

    picked, seen_img = [], set()
    # rotate each style's colour list so neighbouring cards show different colours
    lists = [l[j % len(l):] + l[:j % len(l)] for j, l in enumerate(by_name.values())]
    for i in range(max(len(l) for l in lists)):
        for l in lists:
            if i < len(l) and len(picked) < count:
                v = l[i]
                if v[0]["merchant_image_url"] in seen_img:
                    continue
                seen_img.add(v[0]["merchant_image_url"])
                picked.append(v)
        if len(picked) >= count:
            break

    products = []
    for v in picked:
        r = v[0]
        prices = sorted(float(x["search_price"]) for x in v if x.get("search_price"))
        name = clean(r["product_name"])
        col = colour(r["merchant_product_id"])
        products.append({
            "id": r["aw_product_id"],
            "name": f"{name} – {col}" if col else name,
            "url": r["aw_deep_link"],
            "image": sized(r["merchant_image_url"]),
            "imageFallback": r.get("aw_image_url", ""),
            "category": "Scrub top" if re.search(r"Top|Jacket", name) else "Scrub pant",
            "description": first_sentence(r["description"]),
            "price": prices[0] if prices else None,
            "currency": r.get("currency") or "USD",
        })

    out = {"partner": PARTNER, "merchant_id": rows[0]["merchant_id"], "imported": date.today().isoformat(), "products": products}
    with open(OUT, "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    print(f"{len(products)} products from {len(by_name)} styles -> src/data/home-bottom.json")


if __name__ == "__main__":
    main()
