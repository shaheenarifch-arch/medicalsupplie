#!/usr/bin/env python3
"""Import an Awin product feed CSV into src/data/feeds/<merchant_id>.json.

Usage:  python3 scripts/import-awin-feed.py path/to/feed.csv [more.csv ...]
Then:   node scripts/build.mjs

Each merchant's file is replaced on re-import, so just re-run with a fresh CSV to update prices.
The merchant is matched to a partner in src/data/products.json by awinmid.
"""
import csv, json, os, re, sys, html
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "feeds")
os.makedirs(OUT, exist_ok=True)
partners = json.load(open(os.path.join(ROOT, "src", "data", "products.json")))["partners"]
mid_to_partner = {re.search(r"awinmid=(\d+)", p["url"]).group(1): p["id"] for p in partners if "awinmid=" in p.get("url", "")}

def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()

by_merchant = {}
for path in sys.argv[1:]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            mid = r.get("merchant_id", "").strip()
            link = r.get("aw_deep_link", "").strip()
            name = clean(r.get("product_name"))
            if not (mid and link and name):
                continue
            price = r.get("search_price") or r.get("store_price") or ""
            try:
                price = round(float(price), 2)
            except ValueError:
                price = None
            by_merchant.setdefault(mid, []).append({
                "id": r.get("aw_product_id") or r.get("merchant_product_id"),
                "sku": r.get("merchant_product_id", ""),
                "name": name,
                "url": link,
                "image": (r.get("merchant_image_url") or r.get("aw_image_url") or "").strip(),
                "imageFallback": (r.get("aw_image_url") or "").strip(),
                "category": clean(r.get("merchant_category")) or clean(r.get("category_name")) or "Other",
                "description": clean(r.get("description")),
                "price": price,
                "currency": r.get("currency") or "USD",
            })

for mid, items in by_merchant.items():
    partner = mid_to_partner.get(mid)
    if not partner:
        print(f"! merchant {mid} has no matching partner (awinmid) in products.json; skipped")
        continue
    seen, uniq = set(), []
    for it in items:
        if it["id"] in seen:
            continue
        seen.add(it["id"]); uniq.append(it)
    out = {"partner": partner, "merchant_id": mid, "imported": date.today().isoformat(), "products": uniq}
    with open(os.path.join(OUT, f"{partner}.json"), "w") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    print(f"{partner}: {len(uniq)} products -> src/data/feeds/{partner}.json")
