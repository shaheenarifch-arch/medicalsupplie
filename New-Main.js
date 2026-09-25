/* medicalsupplie.com - interactions v2 + sliders */
const AFFILIATE_LINKS = {
  "brookwood-med": { official: "https://brookwoodmed.com", affiliate: "https://www.awin1.com/cread.php?awinmid=124250&awinaffid=3067297", cta: "Shop at Brookwood Med" },
  "revo": { official: "https://revomadic.com", affiliate: "https://www.awin1.com/cread.php?awinmid=127003&awinaffid=3067297", cta: "Shop at Revo" },
  "finitex": { official: "https://www.titansmedicare.com", affiliate: "https://www.awin1.com/cread.php?awinmid=117741&awinaffid=3067297", cta: "Shop at Finitex" },
  "walkhero": { official: "https://walkhero.com", affiliate: "https://www.awin1.com/cread.php?awinmid=117741&awinaffid=3067297", cta: "Shop at WalkHero" },
  "eydology": { official: "https://eydology.com", affiliate: "https://www.awin1.com/cread.php?awinmid=124966&awinaffid=3067297", cta: "Shop at Eydology" },
  "fullscopemd": { official: "https://www.fullscopemd.com", affiliate: "https://www.awin1.com/cread.php?awinmid=130233&awinaffid=3067297", cta: "Visit FullscopeMD" }
};
window.MEDICALSUPPLIE_CONFIG = AFFILIATE_LINKS;

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // FAQ accordion
  document.querySelectorAll('[data-faq-item]').forEach(item => {
    const btn = item.querySelector('[data-faq-q]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Vendor sliders
  document.querySelectorAll('[data-slider-wrap]').forEach(wrap => {
    const row = wrap.querySelector('[data-slider]');
    const prev = wrap.querySelector('.slider-btn.prev');
    const next = wrap.querySelector('.slider-btn.next');
    if (!row) return;
    const scrollAmount = 320;
    if (prev) prev.addEventListener('click', () => row.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => row.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

    // drag to scroll
    let isDown = false, startX, scrollLeft;
    row.addEventListener('mousedown', (e) => { isDown = true; row.classList.add('dragging'); startX = e.pageX - row.offsetLeft; scrollLeft = row.scrollLeft; });
    row.addEventListener('mouseleave', () => { isDown = false; row.classList.remove('dragging'); });
    row.addEventListener('mouseup', () => { isDown = false; row.classList.remove('dragging'); });
    row.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - row.offsetLeft;
      const walk = (x - startX) * 1.5;
      row.scrollLeft = scrollLeft - walk;
    });
  });

  // Product/vendor filtering (for categories section if needed)
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filterBtn;
        filterBtns.forEach(b => b.classList.toggle('active', b===btn));
        // Could filter vendor sections - for now just scroll to relevant
        if (filter !== 'all') {
          const target = document.querySelector(`[id*="${filter}"]`);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Outbound click tracking
  document.querySelectorAll('a[rel~="sponsored"]').forEach(a => {
    a.addEventListener('click', () => {
      try {
        const vendor = a.dataset.vendor || a.textContent.trim() || 'unknown';
        const url = a.href;
        if (window.gtag) gtag('event', 'affiliate_click', { vendor, link: url });
        console.log('[affiliate_click]', { vendor, url, at: new Date().toISOString() });
        const key = 'ms_clicks';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ vendor, ts: Date.now() });
        if (arr.length > 100) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
      } catch(e) {}
    });
  });

  // Year
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

// FAQ render from faqs.json
async function loadFAQs() {
  try {
    const res = await fetch('/faqs.json');
    if (!res.ok) return;
    const data = await res.json();
    const container = document.querySelector('[data-faqs-render]');
    if (!container || !data.faqs) return;
    container.innerHTML = '';
    data.faqs.forEach((group) => {
      const h = document.createElement('h3');
      h.textContent = group.topic;
      h.style.cssText = 'font-size:15px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);margin:24px 0 12px';
      container.appendChild(h);
      group.items.forEach(faq => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.setAttribute('data-faq-item','');
        item.innerHTML = `
          <button class="faq-q" data-faq-q aria-expanded="false">
            <span>${faq.q}</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M5 7.5L10 12.5L15 7.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="faq-a">${faq.a}</div>
        `;
        container.appendChild(item);
        const btn = item.querySelector('[data-faq-q]');
        btn.addEventListener('click', ()=>{
          const open = item.classList.toggle('open');
          btn.setAttribute('aria-expanded', String(open));
        });
      });
    });
  } catch(e){}
}
loadFAQs();
