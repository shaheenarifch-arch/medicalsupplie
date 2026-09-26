/* medicalsupplie.com - interactions v3 - WALK HERO FIXED SEPARATE FROM FINITEX */
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
  // WALK HERO - FIXED: SEPARATE MID FROM FINITEX, WITH DEEP LINK TO walkhero.com
  // IMPORTANT: Replace 18221 with your actual WalkHero Advertiser ID from Awin dashboard
  // Go to Awin > Advertiser Programs > WalkHero > Link Builder to get your MID
  "walkhero": {
    official: "https://walkhero.com",
    affiliate: "https://www.awin1.com/cread.php?awinmid=18221&awinaffid=3067297&ued=https%3A%2F%2Fwalkhero.com",
    affiliate_with_path: "https://www.awin1.com/cread.php?awinmid=18221&awinaffid=3067297&ued=",
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

window.MEDICALSUPPLIE_CONFIG = AFFILIATE_LINKS;

document.addEventListener('DOMContentLoaded', () => {
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

  // Vendor sliders - FIXED
  document.querySelectorAll('[data-slider-wrap]').forEach(wrap => {
    const row = wrap.querySelector('[data-slider]');
    const prev = wrap.querySelector('.slider-btn.prev');
    const next = wrap.querySelector('.slider-btn.next');
    if (!row) return;
    const scrollAmount = 320;
    if (prev) prev.addEventListener('click', () => row.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => row.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

    // drag
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

  // Outbound click tracking with vendor detection
  document.querySelectorAll('a[rel~="sponsored"]').forEach(a => {
    a.addEventListener('click', () => {
      try {
        const href = a.href;
        let vendor = 'unknown';
        if (href.includes('walkhero.com') || href.includes('walkhero')) vendor = 'walkhero';
        else if (href.includes('titansmedicare') || href.includes('finitex')) vendor = 'finitex';
        else if (href.includes('brookwoodmed')) vendor = 'brookwood-med';
        else if (href.includes('revomadic')) vendor = 'revo';
        else if (href.includes('eydology')) vendor = 'eydology';
        else if (href.includes('fullscopemd')) vendor = 'fullscopemd';
        else vendor = a.dataset.vendor || a.textContent.trim() || 'unknown';

        console.log('[affiliate_click]', { vendor, url: href, at: new Date().toISOString() });
        
        // Warning if WalkHero link still points to Finitex
        if (a.closest('#vendor-walkhero') && href.includes('titansmedicare')) {
          console.warn('WalkHero product still links to Finitex! Fix needed.');
        }
        
        const key = 'ms_clicks';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ vendor, ts: Date.now() });
        if (arr.length > 100) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
      } catch(e) {}
    });
  });

  // Verify WalkHero fix on load
  const walkheroLinks = document.querySelectorAll('#vendor-walkhero a[rel~="sponsored"]');
  let walkheroCorrect = 0;
  walkheroLinks.forEach(a => {
    if (a.href.includes('walkhero.com')) walkheroCorrect++;
  });
  console.log(`WalkHero fix check: ${walkheroCorrect}/${walkheroLinks.length} links correctly point to walkhero.com (not finitex)`);

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

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
