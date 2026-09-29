#!/usr/bin/env python3
"""Add Awin banner creatives to src/data/products.json by pasting the Awin HTML snippet.

Usage:  python3 scripts/add-banner.py < snippet.html     (or paste, then Ctrl-D)
The partner is matched on the Awin advertiser id (v=...) against each partner's awinmid.
Duplicates are skipped. Then run: node scripts/build.mjs
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "products.json")
text = sys.stdin.read()
feed = json.load(open(DATA))
mids = {}
for p in feed["partners"]:
    m = re.search(r"awinmid=(\d+)", p.get("url", ""))
    if m:
        mids[m.group(1)] = p["id"]
feed.setdefault("banners", [])
seen = {b["href"] for b in feed["banners"]}
added = 0
for href, img in re.findall(r'<a[^>]+href="([^"]+cread\.php[^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"', text):
    href = href.replace("&amp;", "&"); img = img.replace("&amp;", "&")
    v = re.search(r"[?&]v=(\d+)", href)
    partner = mids.get(v.group(1)) if v else None
    if not partner:
        print(f"! No partner with awinmid={v.group(1) if v else '?'}: add it to partners first"); continue
    if href in seen:
        continue
    feed["banners"].append({"partner": partner, "href": href, "img": img}); seen.add(href); added += 1
json.dump(feed, open(DATA, "w"), indent=2, ensure_ascii=False)
print(f"Added {added} banner(s). Total: {len(feed['banners'])}")
