/* Deals & promo codes — renders promos.json (updated daily from Awin promo emails).
   Strip: <section data-gs-promos></section>   Full page: <section data-gs-promos-page></section> */
(function () {
  var script = document.currentScript;
  var base = script && script.src ? script.src.replace(/[^\/]*$/, '') : '';
  var strips = document.querySelectorAll('[data-gs-promos]');
  var pages = document.querySelectorAll('[data-gs-promos-page]');
  if (!strips.length && !pages.length) return;

  var css =
    '.gsp{margin:32px auto;padding:0 16px;max-width:1200px;font:inherit;color:inherit}' +
    '.gsp-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}' +
    '.gsp-head h2{margin:0;font-size:1.5rem;line-height:1.2}' +
    '.gsp-head a{color:var(--gsp-accent);font-weight:600;text-decoration:none}' +
    '.gsp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}' +
    '.gsp-card{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid rgba(127,127,127,.28);border-radius:12px;background:rgba(127,127,127,.05)}' +
    '.gsp-brand{font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.7}' +
    '.gsp-title{margin:0;font-size:1.05rem;font-weight:700;line-height:1.35}' +
    '.gsp-details{margin:0;font-size:.9rem;opacity:.8;line-height:1.45}' +
    '.gsp-code{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.gsp-code code{padding:5px 10px;border:1.5px dashed var(--gsp-accent);border-radius:8px;font:700 .95rem/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em}' +
    '.gsp-copy{padding:5px 10px;border:1px solid rgba(127,127,127,.4);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:.82rem;cursor:pointer}' +
    '.gsp-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:6px}' +
    '.gsp-ends{font-size:.8rem;opacity:.7}' +
    '.gsp-go{display:inline-block;padding:9px 14px;border-radius:9px;background:var(--gsp-accent);color:#fff!important;font-weight:700;font-size:.9rem;text-decoration:none;white-space:nowrap}' +
    '.gsp-empty{opacity:.75}' +
    '.gsp-note{margin-top:14px;font-size:.78rem;opacity:.6}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function accent() {
    var a = document.querySelector('header a, nav a, a');
    var c = a ? getComputedStyle(a).color : '';
    return c && c !== 'rgb(0, 0, 0)' && c !== 'rgb(255, 255, 255)' ? c : '#c2410c';
  }
  var acc = accent();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fmt(iso) {
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) { return iso; }
  }
  function card(p) {
    var code = p.code
      ? '<div class="gsp-code"><code>' + esc(p.code) + '</code><button type="button" class="gsp-copy" data-code="' + esc(p.code) + '">Copy code</button></div>'
      : '';
    return '<article class="gsp-card">' +
      '<div class="gsp-brand">' + esc(p.brand) + '</div>' +
      '<h3 class="gsp-title">' + esc(p.headline) + '</h3>' +
      (p.details ? '<p class="gsp-details">' + esc(p.details) + '</p>' : '') +
      code +
      '<div class="gsp-foot"><span class="gsp-ends">' + (p.ends ? 'Ends ' + esc(fmt(p.ends)) : '') + '</span>' +
      '<a class="gsp-go" href="' + esc(p.url) + '" target="_blank" rel="sponsored nofollow noopener">Get deal</a></div>' +
      '</article>';
  }
  function render(el, list, full) {
    el.classList.add('gsp');
    el.style.setProperty('--gsp-accent', acc);
    var head = '<div class="gsp-head"><h2>' + (full ? 'Deals &amp; promo codes' : 'Today&#39;s deals &amp; promo codes') + '</h2>' +
      (full ? '' : '<a href="' + base + 'promos.html">See all deals &rarr;</a>') + '</div>';
    if (!list.length) {
      if (!full) { el.hidden = true; return; }
      el.innerHTML = head + '<p class="gsp-empty">No live promotions right now. New deals from our partner stores are added here every day, so check back soon.</p>';
      return;
    }
    el.hidden = false;
    el.innerHTML = head + '<div class="gsp-grid">' + list.map(card).join('') + '</div>' +
      '<p class="gsp-note">We may earn a commission when you shop through these links, at no extra cost to you. Codes and dates are set by each store and can change.</p>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.gsp-copy');
    if (!b) return;
    var code = b.getAttribute('data-code');
    var done = function () { b.textContent = 'Copied!'; setTimeout(function () { b.textContent = 'Copy code'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
  });

  fetch(base + 'promos.json?d=' + today(), { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : { promos: [] }; })
    .catch(function () { return { promos: [] }; })
    .then(function (data) {
      var t = today();
      var live = (data.promos || []).filter(function (p) {
        return p && p.url && p.headline && (!p.ends || p.ends >= t) && (!p.starts || p.starts <= t);
      }).sort(function (a, b) { return (a.ends || '9999') < (b.ends || '9999') ? -1 : 1; });
      strips.forEach(function (el) { render(el, live.slice(0, 6), false); });
      pages.forEach(function (el) { render(el, live, true); });
    });
})();
