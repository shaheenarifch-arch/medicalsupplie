#!/usr/bin/env python3
"""Create responsive WebP versions of every image in /images and a size manifest.

Usage:  python3 scripts/optimize-images.py
Needs:  pip install pillow
"""
import glob, json, os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images")
OUT = os.path.join(SRC, "opt")
os.makedirs(OUT, exist_ok=True)

manifest = {}
for path in sorted(glob.glob(os.path.join(SRC, "*"))):
    if not path.lower().endswith((".jpg", ".jpeg", ".png", ".webp")) or os.path.basename(path).startswith("og-"):
        continue
    name = os.path.splitext(os.path.basename(path))[0]
    if name in manifest:
        continue
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    widths = [640, 1280, 1920] if name.startswith("hero") else [480, 960]
    made = []
    for w in widths:
        if im.width < w and made:
            continue
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        out = os.path.join(OUT, f"{name}-{w}.webp")
        if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
            r.save(out, "WEBP", quality=78, method=6)
        made.append({"w": w, "file": f"{name}-{w}.webp", "width": r.width, "height": r.height})
    manifest[name] = {"src": os.path.basename(path), "width": im.width, "height": im.height, "variants": made}

with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=1)
print(f"Optimised {len(manifest)} images -> images/opt/")
