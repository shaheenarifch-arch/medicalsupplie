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

  // Year
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
