// Static pages + redirects for retired URLs
export const redirects = {
  'blog/2026-09-24-best-medicalsupplie.html': '/blog/',
  'blog/2026-09-24-medicalsupplie-guide.html': '/guides/',
  'blog/2026-09-24-medicalsupplie-tips.html': '/blog/',
  'blog/2026-09-24-seo-keywords-for-medical-supplies.html': '/blog/',
};

export const pages = (site) => [
  {
    file: 'about.html',
    title: 'About Us',
    h1: 'About MedicalSupplie',
    active: 'About',
    description: `${site.name} is an independent buying guide to medical supplies, PPE, foot health, wellness devices and U.S. telehealth.`,
    body: `
<p class="lead">${site.name} helps people buy medical and health-at-home products with confidence. That includes clinic managers stocking gloves, parents buying kids' masks and anyone looking for a telehealth service.</p>
<h2>What we do</h2>
<p>We research products and services from established online retailers, explain the standards that matter (like ASTM glove ratings or NIOSH mask approval) in plain English, and link you to partners we trust. We are <strong>not</strong> a pharmacy, store or medical provider. Orders, shipping, returns and any medical care are handled by the partner you buy from.</p>
<h2>How we choose partners</h2>
<ul>
  <li>Clear product specifications and honest marketing</li>
  <li>Secure checkout and published return policies</li>
  <li>Reachable customer support and U.S. availability</li>
  <li>For telehealth: care delivered by licensed U.S. clinicians</li>
</ul>
<h2>How we make money</h2>
<p>Many links on this site are affiliate links. If you buy through them we may earn a commission, at no extra cost to you. Commissions never decide what we recommend. Read the full <a href="/affiliate-disclosure.html">affiliate disclosure</a>.</p>
<h2>Medical disclaimer</h2>
<p>Everything on ${site.name} is general information and is not medical advice. Always talk to a qualified healthcare professional about symptoms, medications or treatment.</p>
<h2>Contact</h2>
<p>Questions, corrections or partnership enquiries: <a href="mailto:${site.email}">${site.email}</a>.</p>`,
  },
  {
    file: 'affiliate-disclosure.html',
    title: 'Affiliate Disclosure',
    h1: 'Affiliate disclosure',
    description: `How ${site.name} earns money through affiliate partnerships, and how that affects (and doesn't affect) our recommendations.`,
    body: `
<p>${site.name} participates in affiliate programmes, including the Awin network. When you click certain links and make a purchase, we may receive a commission from the retailer. <strong>This never increases the price you pay.</strong></p>
<h2>Which links are affiliate links?</h2>
<p>Links to partner stores, including "View deal", "Shop" and banner links, are usually affiliate links and are marked with <code>rel="sponsored"</code> for search engines. Some partner links are ordinary links that earn us nothing.</p>
<h2>Our editorial independence</h2>
<p>We decide what to feature based on product quality, clear specifications and usefulness to readers. Partners do not review or approve our guides before publication.</p>
<h2>Prices and availability</h2>
<p>Prices, stock and promotions are set by retailers and can change at any time. Always check the final price on the retailer's site before buying.</p>
<p>This disclosure follows the U.S. Federal Trade Commission's guidance on endorsements. Questions? Email <a href="mailto:${site.email}">${site.email}</a>.</p>`,
  },
  {
    file: 'privacy.html',
    title: 'Privacy Policy',
    h1: 'Privacy policy',
    description: `How ${site.name} handles your information, including newsletter sign-ups and affiliate link cookies.`,
    body: `
<p><em>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>
<h2>Information we collect</h2>
<p>We don't require an account and we don't sell personal data. If you subscribe to our newsletter we store your email address with our email provider solely to send you the newsletter.</p>
<h2>Affiliate cookies</h2>
<p>When you click a partner link, the affiliate network (for example Awin) and the retailer may set cookies to record that you came from ${site.name}. These are governed by their own privacy policies.</p>
<h2>Hosting and logs</h2>
<p>This site is a static website. Our hosting provider may keep standard server logs (such as IP address and browser type) for security and performance.</p>
<h2>Your choices</h2>
<ul><li>Unsubscribe from emails using the link in any newsletter.</li><li>Block or delete cookies in your browser settings.</li><li>Email <a href="mailto:${site.email}">${site.email}</a> to ask about or delete your data.</li></ul>
<h2>Health information</h2>
<p>Please don't send us personal health information. We are not a healthcare provider and can't give medical advice.</p>`,
  },
];
