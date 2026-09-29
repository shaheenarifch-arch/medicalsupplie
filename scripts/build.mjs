#!/usr/bin/env node
/**
 * MedicalSupplie static site builder (zero dependencies, Node 18+).
 *
 *   node scripts/build.mjs
 *
 * Reads:  src/data/site.json, src/data/products.json, src/content/articles.mjs,
 *         images/opt/manifest.json (from scripts/optimize-images.py)
 * Writes: index.html, guides/, blog/, about.html, affiliate-disclosure.html,
 *         privacy.html, 404.html, sitemap.xml, robots.txt, llms.txt, assets/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const write = (p, s) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

const site = json('src/data/site.json');
const feed = json('src/data/products.json');
const imgs = fs.existsSync(path.join(ROOT, 'images/opt/manifest.json')) ? json('images/opt/manifest.json') : {};
const { articles } = await import(pathToFileURL(path.join(ROOT, 'src/content/articles.mjs')).href);
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = esc;
const abs = (p) => site.url + (p.startsWith('/') ? p : '/' + p);
const partners = Object.fromEntries(feed.partners.map((p) => [p.id, p]));
const products = feed.products.map((p) => {
  const partner = partners[p.partner];
  const url = p.url || partner.url;
  return { ...p, partnerObj: partner, url, affiliate: p.url ? /awin1\.com|affiliate|ref=|aff/i.test(p.url) : partner.affiliate };
});
const byPartner = (id) => products.filter((p) => p.partner === id);

// Awin feed products (src/data/feeds/<partner>.json, from scripts/import-awin-feed.py)
const FEED_DIR = path.join(ROOT, 'src/data/feeds');
const feeds = fs.existsSync(FEED_DIR)
  ? Object.fromEntries(fs.readdirSync(FEED_DIR).filter((f) => f.endsWith('.json')).map((f) => { const d = JSON.parse(fs.readFileSync(path.join(FEED_DIR, f), 'utf8')); return [d.partner, d]; }))
  : {};
const feedItems = (id) => (feeds[id]?.products || []).map((p) => ({ ...p, partnerObj: partners[id] }));
// Pick n items round-robin across categories so a carousel shows variety
function mixed(items, n) {
  const groups = {};
  for (const it of items) (groups[it.category] ||= []).push(it);
  const lists = Object.values(groups);
  const out = [];
  for (let i = 0; out.length < n && lists.some((l) => l[i]); i++) for (const l of lists) if (l[i] && out.length < n) out.push(l[i]);
  return out;
}
const money = (v, c = 'USD') => (v == null ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(v));
const catalogPath = (id) => `/shop/${id}.html`;
const isRx = (id) => partners[id]?.category === 'Telehealth';
const noun = (id) => (isRx(id) ? 'treatments' : 'products');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// Hand-picked cards first, then store/feed items (deduped), capped at n
function partnerItems(id, n = 14) {
  const picks = byPartner(id).map((p) => ({ html: productCard(p), key: norm(p.name) }));
  const seen = new Set(picks.map((p) => p.key));
  const extra = feedItems(id).filter((p) => { const k = norm(p.name); if (seen.has(k)) return false; seen.add(k); return true; });
  return [...picks.map((p) => p.html), ...mixed(extra, Math.max(0, n - picks.length)).map(feedCard)].slice(0, n);
}
const rel = (aff) => (aff ? 'sponsored noopener' : 'noopener');

function img(file, { alt = '', sizes = '(max-width:520px) 78vw, (max-width:1100px) 33vw, 290px', eager = false, cls = '' } = {}) {
  const name = file.replace(/\.[a-z]+$/i, '');
  const m = imgs[name];
  if (!m) return `<img src="/images/${attr(file)}" alt="${attr(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${cls ? ` class="${cls}"` : ''}>`;
  const v = m.variants;
  const first = v[0];
  const srcset = v.map((x) => `/images/opt/${x.file} ${x.width}w`).join(', ');
  return `<img src="/images/opt/${first.file}" srcset="${srcset}" sizes="${sizes}" width="${first.width}" height="${first.height}" alt="${attr(alt)}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async"${cls ? ` class="${cls}"` : ''}>`;
}

// ---------- icons (inline SVG, stroke style) ----------
const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const icon = {
  check: I('<path d="M20 6 9 17l-5-5"/>'),
  shield: I('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  truck: I('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38A1 1 0 0 0 17.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'),
  steth: I('<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'),
  video: I('<path d="m16 13 5.2 3.1a.5.5 0 0 0 .8-.4V8.3a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>'),
  mask: I('<path d="M3 8c3-2 6-2 9 0s6 2 9 0v5c0 4-4 7-9 7s-9-3-9-7z"/><path d="M8 12h8M9 15h6"/>'),
  glove: I('<path d="M18 11V6a2 2 0 0 0-4 0v0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'),
  foot: I('<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>'),
  spark: I('<path d="M9.94 14.06 4 20M14 4l.5 2.5L17 7l-2.5.5L14 10l-.5-2.5L11 7l2.5-.5zM19 11l.3 1.2 1.2.3-1.2.3L19 14l-.3-1.2-1.2-.3 1.2-.3z"/><path d="m4 20 2-2"/>'),
  glasses: I('<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-4 0M2.5 13 5 7c.7-1.3 1.4-2 3-2M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>'),
  book: I('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  heart: I('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>'),
  left: I('<path d="m15 18-6-6 6-6"/>'),
  right: I('<path d="m9 18 6-6-6-6"/>'),
  arrow: I('<path d="M5 12h14M12 5l7 7-7 7"/>'),
  ext: I('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  menu: I('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  up: I('<path d="m18 15-6-6-6 6"/>'),
  mail: I('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
  bolt: I('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
  star: I('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
};
const catIcon = { 'Telehealth': icon.video, 'Masks & PPE': icon.mask, 'Gloves': icon.glove, 'Foot Health': icon.foot, 'Wellness Devices': icon.spark, 'Eyewear': icon.glasses };
const social = {
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.5c-4 0-4.9 3-4.9 4.9v2.1H6.5v4h2.6V22.5H14V12.5h3.3l.4-4z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 2.5h3.3l-7.2 8.2 8.5 11.3h-6.6l-5.2-6.8-6 6.8H1.3l7.7-8.8L.9 2.5h6.8l4.7 6.2zm-1.2 17.5h1.8L6.6 4.4H4.7z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.4 2.7 8.2 6.6 9.8-.1-.8-.2-2.1 0-3l1.2-5.2s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.2 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.3c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.8-2.4-4.5 0-3.7 2.7-7.1 7.7-7.1 4 0 7.2 2.9 7.2 6.7 0 4-2.5 7.2-6 7.2-1.2 0-2.3-.6-2.7-1.3l-.7 2.8c-.3 1-1 2.3-1.5 3.1 1.1.3 2.3.5 3.5.5 5.8 0 10.5-4.7 10.5-10.5S17.8 1.5 12 1.5z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-4.8.5-4.8s0-3.2-.5-4.8zM9.7 15V9l5.9 3z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/></svg>',
};
const socialLabel = { facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', pinterest: 'Pinterest', youtube: 'YouTube', linkedin: 'LinkedIn' };
const logo = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0e7c78"/><path d="M16.5 9h7v7.5H31v7h-7.5V31h-7v-7.5H9v-7h7.5z" fill="#fff"/><circle cx="31" cy="9" r="4" fill="#2fb3aa" stroke="#fff" stroke-width="2"/></svg>`;

// ---------- layout ----------
const NAV = [
  ['/#shop', 'Shop'],
  ['/#partners', 'Partners'],
  ['/guides/', 'Guides'],
  ['/blog/', 'Blog'],
  ['/about.html', 'About'],
];

function head({ title, description, canonical, image = '/images/og-image.jpg', type = 'website', schema = [], preload = '', noindex = false }) {
  const graph = { '@context': 'https://schema.org', '@graph': [orgSchema(), websiteSchema(), ...schema] };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${abs(canonical)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<meta name="theme-color" content="#0e7c78">
<meta property="og:site_name" content="${site.name}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${abs(canonical)}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${abs(image)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${site.name} blog" href="/feed.xml">
${preload}
<link rel="stylesheet" href="/assets/site.css?v=${BUILD_DATE}">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>`;
}

function header(active = '') {
  return `<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${site.name} home">${logo}<span>Medical<b>Supplie</b></span></a>
    <button class="menu-btn" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu" data-menu-btn>${icon.menu}</button>
    <nav class="nav" id="site-nav" aria-label="Main">
      ${NAV.map(([h, t]) => `<a href="${h}"${active === t ? ' aria-current="page"' : ''}>${t}</a>`).join('\n      ')}
      <a class="btn btn-primary btn-sm" href="/#newsletter">Get deals</a>
    </nav>
  </div>
</header>`;
}

function newsletter() {
  const n = site.newsletter || {};
  const action = n.action || `mailto:${site.email}`;
  return `<section class="section" id="newsletter" aria-labelledby="nl-title">
  <div class="container">
    <div class="newsletter">
      <div>
        <span class="kicker" style="color:#a7e3dd">Newsletter</span>
        <h2 id="nl-title">Deals & plain-English health-gear guides</h2>
        <p>One short email a month: new partner offers, restocks and our latest buying guides. No spam, unsubscribe anytime.</p>
      </div>
      <div>
        <form class="nl-form" action="${attr(action)}" method="${n.method || 'post'}" data-newsletter data-fallback="${attr(site.email)}"${n.action ? ' target="_blank"' : ''}>
          <label class="sr-only" for="nl-email">Email address</label>
          <input id="nl-email" type="email" name="${attr(n.emailField || 'email')}" placeholder="you@example.com" autocomplete="email" required>
          <div class="hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
          <button class="btn" type="submit">${icon.mail} Subscribe</button>
        </form>
        <p class="nl-note">By subscribing you agree to our <a href="/privacy.html" style="color:#fff">privacy policy</a>.</p>
        <p class="nl-msg" role="status" aria-live="polite"></p>
      </div>
    </div>
  </div>
</section>`;
}

function footer() {
  const soc = Object.entries(site.social || {}).filter(([k, v]) => social[k] && v);
  return `<footer class="site-footer">
  <div class="container footer-top">
    <div class="footer-brand">
      <a class="brand" href="/">${logo}<span>Medical<b>Supplie</b></span></a>
      <p style="margin-top:14px;max-width:38ch">${esc(site.description)}</p>
      <div class="social" aria-label="Follow us">
        ${soc.map(([k, v]) => `<a href="${attr(v)}" target="_blank" rel="noopener me" aria-label="${socialLabel[k]}">${social[k]}</a>`).join('\n        ')}
      </div>
    </div>
    <div>
      <h4>Shop by category</h4>
      <ul>${Object.keys(feeds).filter((id) => partners[id]).map((id) => `<li><a href="${catalogPath(id)}">${esc(partners[id].category)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h4>Guides</h4>
      <ul>${articles.filter((a) => a.type === 'guide').slice(0, 5).map((a) => `<li><a href="${a.path}">${esc(a.short || a.title)}</a></li>`).join('')}<li><a href="/blog/">Blog</a></li></ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul>
        <li><a href="/about.html">About us</a></li>
        <li><a href="/affiliate-disclosure.html">Affiliate disclosure</a></li>
        <li><a href="/privacy.html">Privacy policy</a></li>
        <li><a href="mailto:${site.email}">Contact</a></li>
        <li><a href="/sitemap.xml">Sitemap</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© <span data-year>${new Date().getFullYear()}</span> ${site.name}. All rights reserved.</span>
    <p class="disclaimer" style="margin:0">Content is for general information only and is not medical advice. Always consult a qualified healthcare professional. Some links are affiliate links; we may earn a commission at no extra cost to you.</p>
  </div>
</footer>
<button class="to-top" type="button" aria-label="Back to top" data-top>${icon.up}</button>
<script src="/assets/site.js?v=${BUILD_DATE}" defer></script>
</body>
</html>
`;
}

// ---------- components ----------
function productCard(p, { eager = false } = {}) {
  return `<article class="card">
  <a class="card-media" href="${attr(p.url)}" target="_blank" rel="${rel(p.affiliate)}" tabindex="-1" aria-hidden="true">
    ${img(p.image, { alt: `${p.name} from ${p.partnerObj.name}`, eager })}
    ${p.badge ? `<span class="badge${p.badge === 'Featured' || p.badge === 'Best seller' ? ' hot' : ''}">${esc(p.badge)}</span>` : ''}
  </a>
  <div class="card-body">
    <span class="card-partner">${esc(p.partnerObj.name)}</span>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.blurb || '')}</p>
    <a class="btn btn-primary btn-sm" href="${attr(p.url)}" target="_blank" rel="${rel(p.affiliate)}">View deal ${icon.ext}</a>
  </div>
</article>`;
}

function feedCard(p) {
  const short = p.description.length > 110 ? p.description.slice(0, 107).replace(/\s+\S*$/, '') + '…' : p.description;
  return `<article class="card feed">
  <a class="card-media" href="${attr(p.url)}" target="_blank" rel="${rel(p.affiliate !== false)}" tabindex="-1" aria-hidden="true">
    <img src="${attr(p.image)}" alt="${attr(p.name)}" width="400" height="400" loading="lazy" decoding="async"${p.imageFallback ? ` onerror="this.onerror=null;this.src='${attr(p.imageFallback)}'"` : ''}>
    <span class="badge">${esc(p.category)}</span>
  </a>
  <div class="card-body">
    <span class="card-partner">${esc(p.partnerObj.name)}</span>
    <h3>${esc(p.name)}</h3>
    ${short ? `<p>${esc(short)}</p>` : '<p></p>'}
    <div class="price-row">${p.price != null ? `<span class="price"><small>From</small> ${money(p.price, p.currency)}</span>` : ''}${isRx(p.partner || p.partnerObj.id) ? '<span class="rx">Clinician review</span>' : ''}</div>
    <a class="btn btn-primary btn-sm" href="${attr(p.url)}" target="_blank" rel="${rel(p.affiliate !== false)}">${isRx(p.partner || p.partnerObj.id) ? 'View details' : 'View deal'} ${icon.ext}</a>
  </div>
</article>`;
}

function carousel(items, label, id) {
  return `<div class="carousel" data-carousel>
  <div class="section-head" style="margin-bottom:12px;justify-content:flex-end">
    <div class="car-controls"><button class="car-btn" type="button" data-prev aria-label="Previous ${attr(label)}" aria-controls="${id}">${icon.left}</button><button class="car-btn" type="button" data-next aria-label="Next ${attr(label)}" aria-controls="${id}">${icon.right}</button></div>
  </div>
  <div class="track" id="${id}" role="region" aria-roledescription="carousel" aria-label="${attr(label)}" tabindex="0">
    ${items.join('\n    ')}
  </div>
  <div class="car-progress" aria-hidden="true"><span></span></div>
</div>`;
}

function banners(partnerId, limit = 99) {
  const list = (feed.banners || []).filter((b) => !partnerId || b.partner === partnerId).slice(0, limit);
  if (!list.length) return '';
  const pname = partners[partnerId]?.name || 'Partner';
  return `<div class="banners">${list.map((b) => `<a rel="sponsored noopener" target="_blank" href="${attr(b.href)}"><img src="${attr(b.img)}" alt="${attr(pname)} offer" loading="lazy" decoding="async" referrerpolicy="no-referrer-when-downgrade"></a>`).join('')}</div>`;
}

function postCard(a) {
  const hero = a.image ? img(a.image, { alt: a.title, sizes: '(max-width:600px) 100vw, 380px' }) : (catIcon[a.category] || icon.book);
  return `<a class="post-card" href="${a.path}">
  <div class="post-thumb">${hero}</div>
  <div class="post-body">
    <div class="post-meta"><span class="chip">${a.type === 'guide' ? 'Guide' : 'Blog'}</span><span>${esc(a.category)}</span><span>· ${a.readMins} min read</span></div>
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.description)}</p>
  </div>
</a>`;
}

function crumbs(list) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map(([h, t], i) => `<li>${i < list.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
}
const crumbSchema = (list) => ({ '@type': 'BreadcrumbList', itemListElement: list.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: abs(h) })) });
function faqBlock(faqs, heading = 'Frequently asked questions') {
  return `<div class="faq">
  <h2 class="center" id="faq">${esc(heading)}</h2>
  ${faqs.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="answer"><p>${f.a}</p></div></details>`).join('\n  ')}
</div>`;
}
const strip = (h) => h.replace(/<[^>]+>/g, '');
const faqSchema = (faqs) => ({ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: strip(f.a) } })) });
function orgSchema() {
  return { '@type': 'Organization', '@id': site.url + '/#org', name: site.name, url: site.url + '/', logo: abs('/apple-touch-icon.png'), email: site.email, sameAs: Object.values(site.social || {}).filter((v) => v && !/^https:\/\/(www\.)?[a-z]+\.com\/?$/.test(v) && !/^https:\/\/x\.com\/?$/.test(v)) };
}
function websiteSchema() {
  return { '@type': 'WebSite', '@id': site.url + '/#website', url: site.url + '/', name: site.name, description: site.description, publisher: { '@id': site.url + '/#org' }, inLanguage: 'en-US' };
}

// ---------- content ----------
const HOME_FAQS = [
  { q: 'What is MedicalSupplie?', a: 'MedicalSupplie is an independent buying guide. We research medical supplies, PPE, foot-health products, wellness devices, eyewear and U.S. telehealth services, then link you to trusted partner stores. We don\'t sell or ship products ourselves.' },
  { q: 'Do you earn money from the links?', a: 'Yes. Most partner links are affiliate links, so we may earn a small commission if you buy, at no extra cost to you. It never changes the price you pay. Read our <a href="/affiliate-disclosure.html">affiliate disclosure</a>.' },
  { q: 'Which gloves are best for everyday clinical use?', a: 'For most clinics and home carers, powder-free nitrile exam gloves around 3–4 mil thick are the best all-rounder: latex-free, puncture-resistant and comfortable. Choose 6–8 mil textured nitrile for cleaning or heavy-duty work. See our <a href="/guides/how-to-choose-medical-gloves.html">glove guide</a>.' },
  { q: 'What is the difference between N95, KN95 and KF94 masks?', a: 'All three are filtering respirators rated for about 94–95% filtration of small particles. N95 is the U.S. NIOSH standard, KN95 is China\'s GB2626 standard and KF94 is South Korea\'s standard. Fit matters most. Details are in our <a href="/guides/n95-vs-kn95-vs-kf94-masks.html">mask guide</a>.' },
  { q: 'Is telehealth safe for weight loss or hormone therapy?', a: 'Reputable telehealth services use licensed U.S. clinicians who review your history, may order labs and decide whether a treatment is appropriate. Ask about clinician licensing, follow-up and total costs before you start. Read <a href="/guides/telehealth-weight-loss-what-to-expect.html">what to expect</a>.' },
  { q: 'Can arch-support insoles help plantar fasciitis?', a: 'Supportive footwear and orthotic insoles are among the first-line self-care options for heel pain, alongside stretching and rest. Persistent pain should be checked by a clinician. See our <a href="/guides/arch-support-insoles-plantar-fasciitis.html">insole guide</a>.' },
];

// ---------- pages ----------
function homePage() {
  const featured = feed.partners.find((p) => p.featured) || feed.partners[0];
  const rest = feed.partners.filter((p) => p !== featured);
  const heroPic = imgs['hero-fullscopemd'];
  const heroSrcset = heroPic ? heroPic.variants.map((v) => `/images/opt/${v.file} ${v.width}w`).join(', ') : '';
  const preload = heroPic ? `<link rel="preload" as="image" imagesrcset="${heroSrcset}" imagesizes="(max-width:900px) 100vw, 560px" fetchpriority="high">` : '';
  const guides = articles.filter((a) => a.type === 'guide');
  const posts = articles.filter((a) => a.type === 'blog');
  const itemList = { '@type': 'ItemList', name: 'Featured medical supplies and telehealth services', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: p.url })) };

  return head({
    title: 'MedicalSupplie — Medical Supplies, PPE & Telehealth Buying Guide',
    description: 'Compare trusted medical supplies: nitrile gloves, KN95 & KF94 masks, arch-support insoles, wellness devices, eyewear and U.S. telehealth. Plain-English guides and hand-picked partner deals.',
    canonical: '/',
    preload,
    schema: [itemList, faqSchema(HOME_FAQS)],
  }) + header('') + `
<main id="main">
<section class="hero">
  <div class="container hero-inner">
    <div>
      <span class="eyebrow"><span class="dot"></span>Clinician-informed · Updated ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
      <h1>Medical supplies & telehealth, <em>made simple.</em></h1>
      <p class="lead">Compare trusted gloves, masks, foot-health gear and wellness devices, or see a licensed U.S. clinician online. Honest guides, hand-picked partners, zero jargon.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#shop">Shop top picks ${icon.arrow}</a>
        <a class="btn btn-ghost" href="/guides/">Read buying guides</a>
      </div>
      <ul class="hero-trust">
        <li>${icon.shield} Vetted partner stores</li>
        <li>${icon.steth} Clinician-informed guides</li>
        <li>${icon.truck} U.S.-focused partners</li>
      </ul>
    </div>
    <div class="hero-media">
      <picture>
        <img src="/images/opt/hero-fullscopemd-1280.webp" srcset="${heroSrcset}" sizes="(max-width:900px) 100vw, 560px" width="1280" height="720" alt="Clinician smiling during a telehealth video visit on a tablet" fetchpriority="high" decoding="async">
      </picture>
      <div class="hero-card c1"><span class="ic">${icon.video}</span><div><strong>See a clinician online</strong><small>Telehealth via ${esc(featured.name)}</small></div></div>
      <div class="hero-card c2"><span class="ic">${icon.shield}</span><div><strong>${products.length}+ vetted picks</strong><small>${feed.partners.length} trusted partners</small></div></div>
    </div>
  </div>
</section>

<section class="cats" aria-label="Shop by category">
  <div class="container cat-row">
    ${feed.partners.map((p) => `<a class="cat" href="${feeds[p.id] ? catalogPath(p.id) : '#partner-' + p.id}"><span class="ic">${catIcon[p.category] || icon.heart}</span>${esc(p.category)}</a>`).join('\n    ')}
  </div>
</section>

<section class="section" id="shop" aria-labelledby="shop-title">
  <div class="container">
    <div class="section-head">
      <div><span class="kicker">Top picks</span><h2 id="shop-title">Trending across every category</h2><p>A quick look at our most-clicked products this month. Tap any card to see today's price at the partner store.</p></div>
    </div>
    ${carousel(feed.partners.flatMap((pt) => partnerItems(pt.id, 4)), 'Top picks', 'car-top')}
  </div>
</section>

<section class="section soft" id="partners" aria-labelledby="partners-title">
  <div class="container">
    <div class="section-head"><div><span class="kicker">Our partners</span><h2 id="partners-title">Shop by trusted partner</h2><p>Every partner is checked for clear product information, secure checkout and U.S. availability.</p></div></div>

    <div class="featured-band partner" id="partner-${featured.id}">
      <div class="partner-head">
        <div><h3>${esc(featured.name)} <span class="chip">★ Featured · ${esc(featured.category)}</span></h3><p>${esc(featured.tagline)}</p></div>
        <div class="partner-actions"><a class="btn btn-ghost btn-sm" href="/guides/telehealth-weight-loss-what-to-expect.html">How telehealth works</a><a class="btn btn-primary btn-sm" style="background:#fff;color:var(--teal-900)" href="${attr(featured.url)}" target="_blank" rel="${rel(featured.affiliate)}">${esc(featured.cta)} ${icon.ext}</a></div>
      </div>
      ${feedItems(featured.id).length
        ? carousel(mixed(feedItems(featured.id), 30).map(feedCard), `${featured.name}: 30 popular treatments`, 'car-' + featured.id) +
          `<p class="center" style="margin:18px 0 0"><a class="btn btn-ghost btn-sm" href="${catalogPath(featured.id)}">Browse all ${feedItems(featured.id).length} ${esc(featured.name)} treatments ${icon.arrow}</a></p>`
        : carousel(byPartner(featured.id).map((p) => productCard(p)), featured.name + ' services', 'car-' + featured.id)}
      ${banners(featured.id) ? `<p class="banners-label">Current ${esc(featured.name)} offers</p>${banners(featured.id)}` : ''}
    </div>

    ${rest.map((pt) => `<div class="partner" id="partner-${pt.id}">
      <div class="partner-head">
        <div><h3>${esc(pt.name)} <span class="chip">${esc(pt.category)}</span></h3><p>${esc(pt.tagline)}</p></div>
        <div class="partner-actions"><a class="btn btn-ghost btn-sm" href="${attr(pt.url)}" target="_blank" rel="${rel(pt.affiliate)}">${esc(pt.cta)} ${icon.ext}</a></div>
      </div>
      ${carousel(partnerItems(pt.id, 14), pt.name + ' products', 'car-' + pt.id)}
      ${feedItems(pt.id).length ? `<p class="center" style="margin:18px 0 0"><a class="btn btn-ghost btn-sm" href="${catalogPath(pt.id)}">Browse all ${esc(pt.name)} products ${icon.arrow}</a></p>` : ''}
      ${banners(pt.id)}
    </div>`).join('\n    ')}
  </div>
</section>

<section class="section" aria-labelledby="why-title">
  <div class="container">
    <div class="section-head"><div><span class="kicker">Why MedicalSupplie</span><h2 id="why-title">Buy with confidence</h2></div></div>
    <div class="carousel props-car" data-carousel>
    <div class="section-head" style="margin-bottom:12px;justify-content:flex-end"><div class="car-controls"><button class="car-btn" type="button" data-prev aria-label="Previous" aria-controls="car-props">${icon.left}</button><button class="car-btn" type="button" data-next aria-label="Next" aria-controls="car-props">${icon.right}</button></div></div>
    <div class="track props" id="car-props" role="region" aria-roledescription="carousel" aria-label="Why MedicalSupplie" tabindex="0">
      <div class="prop"><span class="ic">${icon.shield}</span><h3>Vetted partners</h3><p>We only list stores with clear specs, secure checkout and real customer support.</p></div>
      <div class="prop"><span class="ic">${icon.book}</span><h3>Plain-English guides</h3><p>Standards like ASTM, NIOSH and mil thickness, explained simply.</p></div>
      <div class="prop"><span class="ic">${icon.heart}</span><h3>Independent picks</h3><p>Commissions never change our recommendations or your price.</p></div>
      <div class="prop"><span class="ic">${icon.bolt}</span><h3>Fast & private</h3><p>No account, no tracking pop-ups. Just pick and go.</p></div>
      <div class="prop"><span class="ic">${icon.steth}</span><h3>Licensed telehealth</h3><p>Online care partners use licensed U.S. clinicians.</p></div>
      <div class="prop"><span class="ic">${icon.star}</span><h3>Real prices</h3><p>Starting prices pulled from partner stores and refreshed often.</p></div>
    </div>
    <div class="car-progress" aria-hidden="true"><span></span></div>
    </div>
  </div>
</section>

<section class="section soft" id="guides" aria-labelledby="guides-title">
  <div class="container">
    <div class="section-head"><div><span class="kicker">Buying guides</span><h2 id="guides-title">Know exactly what to buy</h2><p>Short, practical guides that answer the questions people actually ask.</p></div><a class="btn btn-ghost btn-sm" href="/guides/">All guides ${icon.arrow}</a></div>
    ${carousel(guides.map((a) => postCard(a)), 'Buying guides', 'car-guides')}
  </div>
</section>

<section class="section" aria-labelledby="blog-title">
  <div class="container">
    <div class="section-head"><div><span class="kicker">From the blog</span><h2 id="blog-title">Health-at-home tips</h2></div><a class="btn btn-ghost btn-sm" href="/blog/">All articles ${icon.arrow}</a></div>
    ${carousel(posts.map(postCard), 'Blog articles', 'car-blog')}
  </div>
</section>

<section class="section soft" aria-label="FAQ">
  <div class="container">${faqBlock(HOME_FAQS)}</div>
</section>

${newsletter()}
</main>
` + footer();
}

function articlePage(a) {
  const section = a.type === 'guide' ? ['/guides/', 'Guides'] : ['/blog/', 'Blog'];
  const list = [['/', 'Home'], section, [a.path, a.short || a.title]];
  const related = (a.partners || []).flatMap((id) => [...byPartner(id), ...feedItems(id).filter((f) => !byPartner(id).some((b) => norm(b.name) === norm(f.name))).map((f) => ({ ...f, affiliate: f.affiliate !== false, remote: true }))]).slice(0, 5);
  const toc = [...a.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map((m) => [m[1], m[2]]);
  const more = articles.filter((x) => x !== a).sort((x, y) => (y.type === a.type) - (x.type === a.type)).slice(0, 3);
  const articleSchema = {
    '@type': a.type === 'guide' ? 'Article' : 'BlogPosting', headline: a.title, description: a.description,
    datePublished: a.date, dateModified: a.updated || a.date, mainEntityOfPage: abs(a.path), inLanguage: 'en-US',
    image: abs(a.image ? `/images/${a.image}` : '/images/og-image.jpg'),
    author: { '@type': 'Organization', name: `${site.name} Editorial Team`, url: abs('/about.html') }, publisher: { '@id': site.url + '/#org' },
  };
  const schema = [articleSchema, crumbSchema(list)];
  if (a.faqs?.length) schema.push(faqSchema(a.faqs));
  const bannerPartner = (a.partners || []).find((id) => (feed.banners || []).some((b) => b.partner === id));
  const fsBanners = bannerPartner ? banners(bannerPartner, 2) : '';
  return head({ title: `${a.title} | ${site.name}`, description: a.description, canonical: a.path, type: 'article', schema }) + header(section[1]) + `
<main id="main">
<header class="page-hero">
  <div class="container">
    ${crumbs(list)}
    <span class="kicker">${esc(a.category)} ${a.type === 'guide' ? 'guide' : ''}</span>
    <h1>${esc(a.title)}</h1>
    <p class="lead">${esc(a.description)}</p>
    <div class="byline"><span>By the ${site.name} Editorial Team</span><span>Updated <time datetime="${a.updated || a.date}">${new Date(a.updated || a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time></span><span>${a.readMins} min read</span></div>
  </div>
</header>
<div class="container article-wrap">
  <article class="prose">
    ${a.quick ? `<div class="quick-answer"><strong>${icon.bolt.replace('<svg', '<svg width="16" height="16"')} Quick answer</strong><p>${a.quick}</p></div>` : ''}
    ${a.body}
    ${a.faqs?.length ? `<section style="margin-top:40px">${faqBlock(a.faqs, 'FAQs').replace('class="center"', '')}</section>` : ''}
    <p class="med-note"><strong>Medical disclaimer:</strong> This article is for general information and isn't a substitute for professional medical advice, diagnosis or treatment. Ask a qualified clinician about your situation. Some links are affiliate links; see our <a href="/affiliate-disclosure.html">disclosure</a>.</p>
  </article>
  <aside>
    <div class="aside-box">
      ${toc.length ? `<h4>On this page</h4><ol class="toc">${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>` : ''}
      ${related.length ? `<div class="aside-products"><h4 style="margin:0">Recommended</h4>${related.map((p) => `<a class="mini" href="${attr(p.url)}" target="_blank" rel="${rel(p.affiliate)}">${p.remote ? `<img src="${attr(p.image)}" alt="" width="56" height="56" loading="lazy" decoding="async">` : img(p.image, { alt: '', sizes: '56px' })}<span><small>${esc(p.partnerObj.name)}</small>${esc(p.name)}</span></a>`).join('')}</div>` : ''}
      ${fsBanners}
    </div>
  </aside>
</div>
<section class="section">
  <div class="container">
    <div class="section-head"><div><span class="kicker">Keep reading</span><h2>Related articles</h2></div></div>
    ${carousel(articles.filter((x) => x !== a).map(postCard), 'Related articles', 'car-related')}
  </div>
</section>
${newsletter()}
</main>
` + footer();
}

function listPage(type) {
  const isGuide = type === 'guide';
  const pathName = isGuide ? '/guides/' : '/blog/';
  const title = isGuide ? 'Medical Supply Buying Guides' : 'Health-at-Home Blog';
  const desc = isGuide
    ? 'Plain-English buying guides for exam gloves, N95/KN95/KF94 masks, arch-support insoles and U.S. telehealth, with quick answers and FAQs.'
    : 'Practical articles on first-aid kits, wound care, mobility aids, at-home wellness devices and choosing eyewear.';
  const items = articles.filter((a) => a.type === type);
  const list = [['/', 'Home'], [pathName, isGuide ? 'Guides' : 'Blog']];
  const schema = [crumbSchema(list), { '@type': 'CollectionPage', name: title, url: abs(pathName), hasPart: items.map((a) => ({ '@type': 'Article', headline: a.title, url: abs(a.path) })) }];
  const other = articles.filter((a) => a.type !== type);
  return head({ title: `${title} | ${site.name}`, description: desc, canonical: pathName, schema }) + header(isGuide ? 'Guides' : 'Blog') + `
<main id="main">
<header class="page-hero"><div class="container">${crumbs(list)}<h1>${title}</h1><p class="lead">${desc}</p></div></header>
<section class="section"><div class="container">${carousel(items.map(postCard), isGuide ? 'Guides' : 'Articles', 'car-list')}</div></section>
<section class="section soft"><div class="container">
  <div class="section-head"><div><span class="kicker">${isGuide ? 'From the blog' : 'Buying guides'}</span><h2>${isGuide ? 'More reading' : 'Know what to buy'}</h2></div><a class="btn btn-ghost btn-sm" href="${isGuide ? '/blog/' : '/guides/'}">View all ${icon.arrow}</a></div>
  ${carousel(other.map(postCard), isGuide ? 'Blog posts' : 'Guides', 'car-more')}
</div></section>
${newsletter()}
</main>
` + footer();
}

function simplePage({ file, title, description, h1, body, active = '' }) {
  const list = [['/', 'Home'], ['/' + file, h1]];
  return head({ title: `${title} | ${site.name}`, description, canonical: '/' + file, schema: [crumbSchema(list)] }) + header(active) + `
<main id="main">
<header class="page-hero"><div class="container">${crumbs(list)}<h1>${esc(h1)}</h1></div></header>
<div class="container"><div class="legal prose">${body}</div></div>
${newsletter()}
</main>
` + footer();
}

function catalogPage(id) {
  const pt = partners[id];
  const items = feedItems(id);
  const groups = {};
  for (const it of items) (groups[it.category] ||= []).push(it);
  const cats = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const list = [['/', 'Home'], ['/#partners', 'Partners'], [catalogPath(id), pt.name]];
  const prices = items.map((i) => i.price).filter((v) => v != null);
  const title = isRx(id) ? `${pt.name} Treatments & Prices (${items.length} options)` : `${pt.name} ${pt.category}: ${items.length} Products & Prices`;
  const description = isRx(id) ? `Browse ${items.length} ${pt.name} telehealth treatments: ${cats.slice(0, 4).join(', ').toLowerCase()} and more, with prices from ${money(Math.min(...prices))}. Every treatment requires a licensed clinician review.` : `Shop ${items.length} ${pt.name} products: ${cats.slice(0, 4).join(', ').toLowerCase()} and more, from ${money(Math.min(...prices))}. Compare and buy at ${pt.domain}.`;
  const schema = [crumbSchema(list), { '@type': 'ItemList', name: title, numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: p.url })) }];
  const bannersHtml = banners(id);
  return head({ title: `${title} | ${site.name}`, description, canonical: catalogPath(id), schema }) + header('Shop') + `
<main id="main">
<header class="page-hero"><div class="container">${crumbs(list)}
  <span class="kicker">${esc(pt.category)} · ${items.length} ${noun(id)}</span>
  <h1>${esc(pt.name)} ${noun(id)}</h1>
  <p class="lead">${esc(pt.tagline)} Prices shown are the starting price listed by ${esc(pt.name)} and may change.${isRx(id) ? ' Every prescription is subject to review by a licensed U.S. clinician.' : ''}</p>
  <ul class="pill-list" style="margin-top:18px">${cats.map((c) => `<li><a href="#${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${esc(c)} (${groups[c].length})</a></li>`).join('')}</ul>
</div></header>
${cats.map((c, i) => `<section class="section${i % 2 ? ' soft' : ''}" id="${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" style="padding:44px 0">
  <div class="container">
    <div class="section-head" style="margin-bottom:0"><div><h2 style="font-size:1.5rem">${esc(c)}</h2><p>${groups[c].length} options</p></div></div>
    ${carousel(groups[c].map(feedCard), c, 'car-' + id + '-' + i)}
  </div>
</section>`).join('\n')}
${bannersHtml ? `<section class="section"><div class="container"><p class="banners-label" style="color:var(--muted)">Current ${esc(pt.name)} offers</p>${bannersHtml}</div></section>` : ''}
${isRx(id) ? `<section class="section soft"><div class="container">
  <p class="med-note" style="border:0;margin:0 auto;max-width:80ch;text-align:center"><strong>Important:</strong> ${site.name} is not a pharmacy or medical provider. Treatment eligibility, prescriptions and pricing are decided by ${esc(pt.name)} and its licensed clinicians. Read <a href="/guides/telehealth-weight-loss-what-to-expect.html">what to expect from telehealth</a>.</p>
</div></section>` : ''}
${newsletter()}
</main>
` + footer();
}

// ---------- write ----------
fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/assets/site.css'), path.join(ROOT, 'assets/site.css'));
fs.copyFileSync(path.join(ROOT, 'src/assets/site.js'), path.join(ROOT, 'assets/site.js'));

write('index.html', homePage());
write('guides/index.html', listPage('guide'));
write('blog/index.html', listPage('blog'));
for (const a of articles) write(a.path.replace(/^\//, ''), articlePage(a));
const catalogs = Object.keys(feeds).filter((id) => partners[id] && feedItems(id).length);
for (const id of catalogs) write(catalogPath(id).slice(1), catalogPage(id));

const pages = (await import(pathToFileURL(path.join(ROOT, 'src/content/pages.mjs')).href)).pages(site);
for (const p of pages) write(p.file, simplePage(p));

write('404.html', head({ title: `Page not found | ${site.name}`, description: 'The page you were looking for could not be found.', canonical: '/404.html', noindex: true }) + header() + `
<main id="main"><section class="section"><div class="container center" style="max-width:640px">
<span class="kicker">Error 404</span><h1>We couldn't find that page</h1><p class="lead" style="margin:0 auto 24px">It may have moved. Try one of these instead:</p>
<ul class="pill-list" style="justify-content:center"><li><a href="/">Home</a></li><li><a href="/#shop">Top picks</a></li><li><a href="/guides/">Guides</a></li><li><a href="/blog/">Blog</a></li></ul>
</div></section></main>` + footer());

// Redirect stubs for retired URLs (GitHub Pages has no server redirects)
for (const [from, to] of Object.entries(await (async () => (await import(pathToFileURL(path.join(ROOT, 'src/content/pages.mjs')).href)).redirects)())) {
  write(from, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | ${site.name}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${abs(to)}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page has moved to <a href="${to}">${abs(to)}</a>.</p></body></html>\n`);
}

// sitemap
const urls = [
  ['/', 1.0, 'weekly', BUILD_DATE, ['/images/og-image.jpg', ...products.map((p) => '/images/' + p.image)]],
  ['/guides/', 0.9, 'weekly', BUILD_DATE],
  ['/blog/', 0.8, 'weekly', BUILD_DATE],
  ...catalogs.map((id) => [catalogPath(id), 0.9, 'weekly', feeds[id].imported || BUILD_DATE]),
  ...articles.map((a) => [a.path, a.type === 'guide' ? 0.8 : 0.7, 'monthly', a.updated || a.date]),
  ...pages.map((p) => ['/' + p.file, 0.4, 'yearly', BUILD_DATE]),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(([u, pr, cf, lm, im]) => `  <url><loc>${abs(u)}</loc><lastmod>${lm}</lastmod><changefreq>${cf}</changefreq><priority>${pr.toFixed(1)}</priority>${(im || []).map((i) => `<image:image><image:loc>${abs(i)}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);

write('robots.txt', `# ${site.domain}
User-agent: *
Allow: /

# AI answer engines are welcome to cite our guides
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);

// RSS
const rss = [...articles].sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date));
write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${site.name}</title><link>${site.url}/</link><description>${esc(site.description)}</description><language>en-us</language>
<atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
${rss.map((a) => `<item><title>${esc(a.title)}</title><link>${abs(a.path)}</link><guid>${abs(a.path)}</guid><pubDate>${new Date(a.updated || a.date).toUTCString()}</pubDate><description>${esc(a.description)}</description></item>`).join('\n')}
</channel></rss>
`);

// llms.txt (AEO: concise map of the site for AI assistants)
write('llms.txt', `# ${site.name}

> ${site.description}

${site.name} is an independent affiliate buying guide (not a store or medical provider). Content is general information, not medical advice.

## Buying guides
${articles.filter((a) => a.type === 'guide').map((a) => `- [${a.title}](${abs(a.path)}): ${a.quick ? strip(a.quick) : a.description}`).join('\n')}

## Blog
${articles.filter((a) => a.type === 'blog').map((a) => `- [${a.title}](${abs(a.path)}): ${a.description}`).join('\n')}

## Catalogs
${Object.keys(feeds).filter((id) => partners[id]).map((id) => `- [All ${partners[id].name} ${noun(id)}](${abs(catalogPath(id))}): ${feeds[id].products.length} ${partners[id].category.toLowerCase()} options with starting prices`).join('\n')}

## Partners
${feed.partners.map((p) => `- ${p.name} (${p.domain}), ${p.category}: ${p.tagline}`).join('\n')}

## About
- [About](${abs('/about.html')})
- [Affiliate disclosure](${abs('/affiliate-disclosure.html')})
`);

write('site.webmanifest', JSON.stringify({ name: site.name, short_name: site.name, start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0e7c78', icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }, null, 2));
write('favicon.svg', logo.replace('class="brand-mark" ', 'xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));

console.log(`Built ${4 + articles.length + pages.length} pages · ${products.length} products · ${(feed.banners || []).length} banners`);
