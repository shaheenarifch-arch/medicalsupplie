/* medicalsupplie.com - interactions
   Central affiliate config + navigation + filters + FAQ + analytics
*/
const AFFILIATE_LINKS = {
  "brookwood-med": {
    official: "https://brookwoodmed.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=124250&awinaffid=3067297",
    cta: "Shop at Brookwood Med"
  },
  "revo": {
    official: "https://revomadic.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=127003&awinaffid=3067297",
    cta: "Shop at Revo"
  },
  "finitex": {
    official: "https://www.titansmedicare.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=117741&awinaffid=3067297",
    cta: "Shop at Finitex"
  },
  "walkhero": {
    official: "https://walkhero.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=117741&awinaffid=3067297",
    cta: "Shop at WalkHero"
  },
  "eydology": {
    official: "https://eydology.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=124966&awinaffid=3067297",
    cta: "Shop at Eydology"
  },
  "fullscopemd": {
    official: "https://www.fullscopemd.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=130233&awinaffid=3067297",
    cta: "Visit FullscopeMD"
  }
};

// expose for debugging / handoff
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
      // close others in same list if you want single-open; keep multi for now
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Product/vendor filtering
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const filterItems = document.querySelectorAll('[data-filter-item]');
  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filterBtn;
        filterBtns.forEach(b => b.classList.toggle('active', b===btn));
        filterItems.forEach(item => {
          const cats = (item.dataset.filterItem || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Search (simple client-side)
  const searchInput = document.querySelector('[data-search-input]');
  const searchItems = document.querySelectorAll('[data-search-item]');
  if (searchInput && searchItems.length) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      let visible = 0;
      searchItems.forEach(item => {
        const text = (item.dataset.searchItem || '').toLowerCase();
        const show = !q || text.includes(q);
        item.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const empty = document.querySelector('[data-search-empty]');
      if (empty) empty.style.display = visible ? 'none' : 'block';
    });
  }

  // Outbound click tracking (privacy-conscious, no PII)
  document.querySelectorAll('a[rel~="sponsored"]').forEach(a => {
    a.addEventListener('click', () => {
      try {
        const vendor = a.dataset.vendor || 'unknown';
        const url = a.href;
        // privacy: only vendor + timestamp, no personal data
        if (window.gtag) {
          gtag('event', 'affiliate_click', { vendor, link: url });
        }
        // also local console for verification
        console.log('[affiliate_click]', { vendor, url, at: new Date().toISOString() });
        // storage for owner to audit (last 100 clicks, local only)
        const key = 'ms_clicks';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ vendor, ts: Date.now() });
        if (arr.length > 100) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
      } catch(e) {}
    });
  });

  // Replace placeholder affiliate hrefs from config (if data-vendor present but no href)
  document.querySelectorAll('a[data-vendor-link]').forEach(a => {
    const v = a.dataset.vendorLink;
    if (AFFILIATE_LINKS[v] && !a.getAttribute('href')) {
      a.href = AFFILIATE_LINKS[v].affiliate;
    }
    if (AFFILIATE_LINKS[v] && !a.textContent.trim()) {
      a.textContent = AFFILIATE_LINKS[v].cta;
    }
  });

  // Contact form validation (frontend)
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = String(fd.get('name')||'').trim();
      const email = String(fd.get('email')||'').trim();
      const message = String(fd.get('message')||'').trim();
      const status = contactForm.querySelector('[data-form-status]');
      if (name.length < 2 || !email.includes('@') || message.length < 10) {
        if (status) {
          status.textContent = 'Please provide a valid name, email, and a message of at least 10 characters.';
          status.style.color = '#B91C1C';
        }
        return;
      }
      // Simulated success - in production wire to server endpoint with spam protection
      if (status) {
        status.textContent = 'Thank you — your message has been received. We will respond within 1-2 business days. For medical concerns, please contact your healthcare provider or vendor support.';
        status.style.color = '#0F8A8A';
      }
      contactForm.reset();
    });
  }

  // Inject current year
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

// FAQ render from faqs.json (progressive enhancement)
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
