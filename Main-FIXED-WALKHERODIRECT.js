/* medicalsupplie.com - FIXED: images relative path + WalkHero direct links */
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
  // WALK HERO FIXED: Direct walkhero.com links so they WORK. Replace with your real Awin MID later from Awin dashboard.
  // Go to Awin > Advertiser Programs > Search WalkHero > Get Link > Copy MID
  "walkhero": {
    official: "https://walkhero.com",
    affiliate: "https://walkhero.com",
    cta: "Shop at WalkHero",
    products: {
      "mens": "https://walkhero.com/collections/mens-arch-support-shoes",
      "womens": "https://walkhero.com/collections/womens-arch-support-shoes",
      "heavy-duty-insoles": "https://walkhero.com/products/heavy-duty-orthotic-insoles",
      "canvas-slippers": "https://walkhero.com/products/canvas-slippers",
      "all-purpose": "https://walkhero.com/products/plantar-fasciitis-insoles"
    }
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
  // FAQ
  document.querySelectorAll('[data-faq-item]').forEach(item => {
    const btn = item.querySelector('[data-faq-q]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Sliders
  document.querySelectorAll('[data-slider-wrap]').forEach(wrap => {
    const row = wrap.querySelector('[data-slider]');
    const prev = wrap.querySelector('.slider-btn.prev');
    const next = wrap.querySelector('.slider-btn.next');
    if (!row) return;
    const scrollAmount = 320;
    if (prev) prev.addEventListener('click', () => row.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => row.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
  });

  // Image error fallback - try relative path fix
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      const src = this.getAttribute('src');
      if (src.startsWith('/images/')) {
        this.src = src.substring(1); // remove leading slash -> images/...
      } else if (src.startsWith('images/') && !src.includes('hero')) {
        console.warn('Image failed to load:', src);
      }
    });
  });

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
