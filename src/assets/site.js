/* MedicalSupplie — tiny progressive-enhancement script (no dependencies) */
(function () {
  'use strict';
  var d = document;

  // Mobile menu
  var menuBtn = d.querySelector('[data-menu-btn]');
  var nav = d.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
    });
  }

  // Carousels: native scroll-snap + buttons + progress bar
  d.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.track');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var bar = root.querySelector('.car-progress span');
    if (!track) return;
    function step() { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300; }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (bar) {
        var ratio = track.clientWidth / track.scrollWidth;
        bar.style.width = Math.max(ratio * 100, 10) + '%';
        bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * ((1 / Math.max(ratio, .1)) - 1) * 100 : 0) + '%)';
      }
      if (root.querySelector('.car-controls')) root.querySelector('.car-controls').hidden = max <= 4;
      if (prev && next) { prev.hidden = next.hidden = max <= 4; }
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    window.addEventListener('resize', update);
    update();
  });

  // Newsletter
  d.querySelectorAll('[data-newsletter]').forEach(function (form) {
    var msg = form.parentNode.querySelector('.nl-msg');
    form.addEventListener('submit', function (e) {
      var email = form.querySelector('input[type=email]');
      if (form.querySelector('.hp input') && form.querySelector('.hp input').value) { e.preventDefault(); return; }
      if (!email || !email.checkValidity()) { e.preventDefault(); if (msg) msg.textContent = 'Please enter a valid email address.'; email && email.focus(); return; }
      var action = form.getAttribute('action');
      if (!action || action.indexOf('mailto:') === 0) {
        e.preventDefault();
        var to = form.getAttribute('data-fallback');
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Newsletter signup') + '&body=' + encodeURIComponent('Please add ' + email.value + ' to the MedicalSupplie newsletter.');
        if (msg) msg.textContent = 'Thanks! Your email app will open to confirm.';
        return;
      }
      if (window.fetch && form.hasAttribute('data-ajax')) {
        e.preventDefault();
        fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, mode: 'cors' })
          .then(function () { if (msg) msg.textContent = 'Thanks for subscribing! Check your inbox to confirm.'; form.reset(); })
          .catch(function () { form.removeAttribute('data-ajax'); form.submit(); });
      }
    });
  });

  // Back to top
  var top = d.querySelector('[data-top]');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 900); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // Site search (client-side, loads /search.json on first focus)
  var box = d.querySelector('[data-search]');
  if (box) {
    var input = box.querySelector('input'), out = box.querySelector('.search-results'), index = null, sel = -1;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var load = function () { if (index) return Promise.resolve(index); return fetch('/search.json').then(function (r) { return r.json(); }).then(function (j) { index = j; return j; }).catch(function () { index = []; return index; }); };
    var close = function () { out.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; };
    var render = function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      load().then(function (list) {
        var words = q.split(/\s+/);
        var hits = list.filter(function (it) { var h = (it.t + ' ' + it.k).toLowerCase(); return words.every(function (w) { return h.indexOf(w) > -1; }); }).slice(0, 8);
        out.innerHTML = hits.length ? hits.map(function (it) {
          var ext = /^https?:/.test(it.u);
          return '<a role="option" href="' + esc(it.u) + '"' + (ext ? ' target="_blank" rel="sponsored noopener"' : '') + '>' + (it.i ? '<img src="' + esc(it.i) + '" alt="" loading="lazy">' : '') + '<span>' + esc(it.t) + '<small>' + esc(it.s) + '</small></span></a>';
        }).join('') : '<p class="empty">No matches. Try "gloves", "KN95" or "insoles".</p>';
        out.hidden = false; input.setAttribute('aria-expanded', 'true'); sel = -1;
      });
    };
    input.addEventListener('focus', load, { once: true });
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var links = out.querySelectorAll('a');
      if (e.key === 'Escape') { close(); return; }
      if (!links.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === sel)); });
      }
      if (e.key === 'Enter') { e.preventDefault(); links[Math.max(sel, 0)].click(); }
    });
    d.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
  }

  // Year
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
