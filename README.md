# medicalsupplie.com

Static site (GitHub Pages) for MedicalSupplie, an independent buying guide to medical supplies, PPE and U.S. telehealth.

The HTML in the repo root, `guides/`, `blog/` and `shop/` is **generated**. Edit the files in `src/` and rebuild.

## Update the site

```bash
python3 scripts/optimize-images.py   # only after adding/replacing images in /images (needs Pillow)
node scripts/build.mjs               # regenerates every page, sitemap.xml, robots.txt, feed.xml, llms.txt
```

Then commit and push. GitHub Pages publishes automatically.

| What | Where |
|---|---|
| Site name, email, **newsletter form URL**, **social profile links** | `src/data/site.json` |
| Partners and hand-picked products (affiliate links) | `src/data/products.json` |
| Awin product feed (e.g. all FullScopeMD treatments) | `python3 scripts/import-awin-feed.py feed.csv`, which writes to `src/data/feeds/` |
| Extra partner-store products (Shopify stores, Awin deep links) | `src/data/feeds/<partner>.json` (`source: store`) |
| Awin banner creatives | `python3 scripts/add-banner.py < banner-snippet.html` |
| Guides and blog posts | `src/content/articles.mjs` |
| About / disclosure / privacy pages, old-URL redirects | `src/content/pages.mjs` |
| Styles / scripts | `src/assets/site.css`, `src/assets/site.js` |
