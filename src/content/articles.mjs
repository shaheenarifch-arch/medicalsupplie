// Guides and blog posts. Each h2 gets an id automatically (used for the table of contents).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const legacy = (f) => fs.readFileSync(path.join(here, 'legacy', f), 'utf8');
const slug = (s) => s.toLowerCase().replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const withIds = (html) => html.replace(/<h2>([^<]+)<\/h2>/g, (_, t) => `<h2 id="${slug(t)}">${t}</h2>`);
const minutes = (html) => Math.max(3, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 220));

const raw = [
  // ------------------------------------------------------------------ GUIDES
  {
    type: 'guide',
    path: '/guides/how-to-choose-medical-gloves.html',
    title: 'Nitrile vs Latex vs Vinyl: How to Choose Medical Gloves',
    short: 'How to choose medical gloves',
    category: 'Gloves',
    date: '2026-09-29',
    partners: ['finitex'],
    image: 'finitex-blue.jpg',
    description: 'Compare nitrile, latex and vinyl exam gloves, what mil thickness and ASTM ratings mean, and how to pick the right size and grade for clinics, home care and cleaning.',
    quick: 'For most clinical and home-care tasks, choose <strong>powder-free nitrile exam gloves about 3–4 mil thick</strong> that meet ASTM D6319. They\'re latex-free, puncture-resistant and comfortable. Use 6–8 mil textured nitrile for cleaning or heavy-duty work, and keep vinyl for brief, low-risk tasks like food prep.',
    body: `
<p>Disposable gloves look alike, but the material, thickness and certification make a big difference to protection, comfort and cost. Here\'s how to choose the right box the first time.</p>
<h2>Nitrile, latex or vinyl?</h2>
<table>
<thead><tr><th>Material</th><th>Best for</th><th>Pros</th><th>Watch-outs</th></tr></thead>
<tbody>
<tr><td><strong>Nitrile</strong></td><td>Exams, home care, labs, cleaning</td><td>Latex-free, strong puncture and chemical resistance, good fit</td><td>Slightly pricier than vinyl</td></tr>
<tr><td><strong>Latex</strong></td><td>Tasks needing high dexterity</td><td>Very elastic, excellent touch sensitivity</td><td>Latex allergies affect both wearers and patients</td></tr>
<tr><td><strong>Vinyl</strong></td><td>Food handling, quick low-risk tasks</td><td>Cheapest, latex-free</td><td>Looser fit, tears more easily, weaker barrier</td></tr>
</tbody>
</table>
<p>Because of latex allergy risk, many clinics have switched to nitrile as their default glove.</p>
<h2>What does "mil" thickness mean?</h2>
<p>A mil is one-thousandth of an inch, measured at the fingertip or palm. As a rule of thumb:</p>
<ul>
<li><strong>2.5–3.5 mil:</strong> everyday exam and care gloves; best touch sensitivity.</li>
<li><strong>4–5 mil:</strong> a tougher all-rounder for longer tasks, tattoo, salon and lab use.</li>
<li><strong>6–8+ mil:</strong> heavy-duty cleaning, automotive, janitorial and industrial work. Textured "diamond" grips help with wet or oily surfaces.</li>
</ul>
<h2>Certifications that matter</h2>
<ul>
<li><strong>ASTM D6319</strong>: the U.S. standard for nitrile examination gloves (ASTM D3578 is for latex, D5250 for vinyl).</li>
<li><strong>"Medical" or "exam grade" with FDA 510(k) clearance</strong>: required for gloves sold for patient examination in the U.S.</li>
<li><strong>AQL (Acceptable Quality Level)</strong>: a lower number means fewer pinholes per batch. Exam gloves are typically AQL 2.5 or better; 1.5 is stricter.</li>
<li><strong>ASTM D6978</strong>: tested for handling chemotherapy drugs. You only need this for hazardous-drug work.</li>
</ul>
<div class="callout">Buying for a clinic? Ask the seller for the 510(k) number and AQL on the spec sheet. Reputable suppliers list both.</div>
<h2>Getting the size right</h2>
<p>Measure around your palm at its widest point (excluding the thumb). Roughly: under 7" = S, 7–8" = M, 8–9" = L, 9"+ = XL. Gloves that are too tight tear; too loose and you lose grip and dexterity.</p>
<h2>How many do you need?</h2>
<p>Change gloves between patients and tasks, and whenever they\'re torn or contaminated. A small clinic can easily use several hundred gloves a week, which is why cases of 600–1,000 usually work out cheapest per glove.</p>
<h2>Our picks</h2>
<ul>
<li><strong>Everyday exam and care:</strong> Finitex blue nitrile 3.2 mil.</li>
<li><strong>Cleaning and heavy-duty:</strong> Finitex black 8 mil diamond-grip nitrile.</li>
<li><strong>Salons and colour-coding:</strong> Finitex rose red nitrile 3 mil.</li>
</ul>
<p>Pair gloves with the right mask for full protection. See our <a href="/guides/n95-vs-kn95-vs-kf94-masks.html">N95 vs KN95 vs KF94 guide</a>.</p>`,
    faqs: [
      { q: 'Are nitrile gloves better than latex?', a: 'For most people, yes. Nitrile is latex-free, more puncture-resistant and resists many chemicals. Latex offers slightly better stretch and feel but can trigger allergies.' },
      { q: 'What thickness of nitrile glove should I buy?', a: 'Around 3–4 mil for exams and home care, 4–5 mil for longer or messier tasks, and 6–8 mil for heavy-duty cleaning or industrial work.' },
      { q: 'Can I reuse disposable gloves?', a: 'No. Disposable gloves are single-use. Change them between patients or tasks and whenever they tear, and wash your hands after removing them.' },
    ],
  },
  {
    type: 'guide',
    path: '/guides/n95-vs-kn95-vs-kf94-masks.html',
    title: 'N95 vs KN95 vs KF94 vs Surgical Masks: What\'s the Difference?',
    short: 'N95 vs KN95 vs KF94 masks',
    category: 'Masks & PPE',
    date: '2026-09-29',
    partners: ['brookwood-med'],
    image: 'brookwood-kn95.jpg',
    description: 'A clear comparison of N95, KN95, KF94 and surgical masks: filtration standards, fit, which to choose for kids, and how to spot counterfeits.',
    quick: 'N95, KN95 and KF94 are all <strong>respirators that filter about 94–95% of small airborne particles</strong>. N95 is the U.S. NIOSH standard, KN95 is China\'s GB2626 and KF94 is South Korea\'s. Surgical masks protect against splashes but fit loosely. <strong>The best mask is a certified one that seals well on your face.</strong>',
    body: `
<p>Mask labels are confusing: N95, KN95, KF94, FFP2, "3-ply surgical". Here\'s what each one means and how to choose.</p>
<h2>The quick comparison</h2>
<table>
<thead><tr><th>Mask</th><th>Standard</th><th>Filtration</th><th>Style</th></tr></thead>
<tbody>
<tr><td><strong>N95</strong></td><td>U.S. NIOSH (42 CFR 84)</td><td>≥95%</td><td>Usually head straps, tight seal</td></tr>
<tr><td><strong>KN95</strong></td><td>China GB2626</td><td>≥95%</td><td>Usually ear loops, fold-flat</td></tr>
<tr><td><strong>KF94</strong></td><td>South Korea MFDS</td><td>≥94%</td><td>Ear loops, 3D "boat" shape</td></tr>
<tr><td><strong>FFP2</strong></td><td>EU EN 149</td><td>≥94%</td><td>Varies</td></tr>
<tr><td><strong>Surgical mask</strong></td><td>ASTM F2100 (Levels 1–3)</td><td>Splash/fluid barrier; loose fit</td><td>Pleated, ear loops</td></tr>
</tbody>
</table>
<h2>Fit matters more than the label</h2>
<p>A respirator only works if air goes <em>through</em> the filter rather than around the edges. Pinch the nose wire, check for gaps at the cheeks and chin, and do a quick seal check: breathe out sharply and feel for leaks. Ear-loop styles (KN95, KF94) are more comfortable but usually seal less tightly than head-strap N95s.</p>
<h2>When a surgical mask is enough</h2>
<p>Surgical and 3-ply masks are designed to block splashes and your own respiratory droplets. They\'re good for short errands, patient-facing reception work and general hygiene, and they\'re cheaper for daily use. For crowded indoor spaces or caring for someone who\'s sick, a well-fitted respirator gives more protection.</p>
<h2>Masks for kids</h2>
<p>Choose masks sized for children. An adult mask gaps badly on a small face. Kids' KF94 and KN95 masks come in smaller sizes and fun prints that make them more likely to stay on. Masks aren\'t recommended for children under 2.</p>
<h2>How to spot a counterfeit</h2>
<ul>
<li>A genuine N95 is printed with the manufacturer, a <strong>TC-84A-xxxx approval number</strong> and "NIOSH". You can check it on the CDC\'s certified equipment list.</li>
<li>Be wary of claims like "FDA approved KN95" or "N95 equivalent" with no standard number.</li>
<li>Buy from established medical suppliers that publish test reports or certificates.</li>
</ul>
<h2>Our picks</h2>
<ul>
<li><strong>Everyday respirator:</strong> Brookwood Med KN95 5-ply white.</li>
<li><strong>Daily disposable:</strong> FuturePPE 3-ply surgical masks.</li>
<li><strong>Kids:</strong> Brookwood kids' KF94 in a rainbow panda print.</li>
</ul>`,
    faqs: [
      { q: 'Is KN95 as good as N95?', a: 'Both standards require about 95% filtration. A genuine, well-fitting KN95 performs similarly, but N95s usually seal better thanks to head straps and are the only type approved by NIOSH in the U.S.' },
      { q: 'How long can I wear a KN95 or KF94 mask?', a: 'Follow the maker\'s guidance. For personal use, replace a respirator when it\'s visibly dirty, damaged, damp, harder to breathe through, or the straps no longer hold a seal.' },
      { q: 'What does 5-ply mean?', a: 'It means the mask has five layers, typically outer non-woven layers, melt-blown filter layers and a soft inner layer. More layers don\'t guarantee better protection. Certification and fit matter most.' },
    ],
  },
  {
    type: 'guide',
    path: '/guides/arch-support-insoles-plantar-fasciitis.html',
    title: 'Arch Support Insoles & Shoes for Plantar Fasciitis: A Buyer\'s Guide',
    short: 'Insoles for plantar fasciitis',
    category: 'Foot Health',
    date: '2026-09-29',
    partners: ['walkhero'],
    image: 'walkhero-shoes.jpg',
    description: 'How supportive shoes and orthotic insoles can help heel and arch pain, what to look for (arch height, heel cup, firmness), and when to see a clinician.',
    quick: 'For heel and arch pain, look for <strong>firm arch support, a deep heel cup and cushioning under the heel</strong>, in shoes with a stiff heel counter. Over-the-counter orthotic insoles, daily calf and foot stretches, and avoiding flat unsupportive footwear are common first steps. See a clinician if pain lasts more than a few weeks.',
    body: `
<p>Plantar fasciitis, irritation of the thick band of tissue under your foot, is one of the most common causes of heel pain. It\'s often worst with the first steps in the morning. Supportive footwear is one of the simplest things you can change.</p>
<h2>What to look for in an insole</h2>
<ul>
<li><strong>Arch support that matches your foot:</strong> firm enough not to collapse under your weight. Heavier users (220 lbs+) need a sturdier shell.</li>
<li><strong>Deep heel cup:</strong> cradles the fat pad under the heel for shock absorption.</li>
<li><strong>Cushioning plus structure:</strong> soft foam alone feels nice but doesn\'t support the arch.</li>
<li><strong>Fit:</strong> trim-to-fit or sized insoles should sit flat with no bunching. Remove the shoe\'s original insole first.</li>
</ul>
<h2>What to look for in a shoe</h2>
<ul>
<li>A firm heel counter (squeeze the back; it shouldn\'t fold).</li>
<li>Built-in arch support and a slightly raised heel.</li>
<li>A sole that bends at the ball of the foot, not in the middle.</li>
<li>Supportive house shoes too. Walking barefoot on hard floors can aggravate heel pain.</li>
</ul>
<h2>Other self-care that helps</h2>
<p>Common self-care includes calf and plantar fascia stretches (especially before getting out of bed), rolling the arch over a bottle or ball, resting from high-impact activity, and managing body weight. Most cases improve over several months with these measures.</p>
<div class="callout"><strong>See a clinician</strong> if pain persists beyond a few weeks despite self-care, or if you notice numbness, tingling, swelling, or pain after an injury. If you have diabetes, get any foot pain checked promptly.</div>
<h2>Our picks</h2>
<ul>
<li><strong>Everyday shoes:</strong> WalkHero Ultimate Arch Support shoes (men\'s and women\'s).</li>
<li><strong>Heavier users or work boots:</strong> WalkHero Heavy Duty Orthotic Insoles (220+ lbs).</li>
<li><strong>For any shoe:</strong> WalkHero All-Purpose Plantar Fasciitis Insoles.</li>
<li><strong>At home:</strong> WalkHero Canvas Arch Support Slippers.</li>
</ul>`,
    faqs: [
      { q: 'Do insoles really help plantar fasciitis?', a: 'Supportive insoles and shoes are a common first-line self-care option and many people find they reduce heel pain, especially combined with stretching. They support the arch and reduce strain on the plantar fascia.' },
      { q: 'How long do orthotic insoles last?', a: 'Typically 6–12 months with daily use, depending on your weight and activity. Replace them when the arch flattens, the heel cup compresses or pain returns.' },
      { q: 'Should I wear supportive slippers at home?', a: 'Yes, if you have heel pain. Walking barefoot on hard floors removes arch support, so a supportive slipper keeps up the benefit indoors.' },
    ],
  },
  {
    type: 'guide',
    path: '/guides/telehealth-weight-loss-what-to-expect.html',
    title: 'Telehealth for Weight Loss & Hormone Therapy: What to Expect',
    short: 'Telehealth: what to expect',
    category: 'Telehealth',
    date: '2026-09-29',
    partners: ['fullscopemd'],
    image: 'fullscopemd-telehealth.jpg',
    description: 'How online weight-management and hormone therapy programs work, who GLP-1 medications are approved for, costs and questions to ask before you sign up.',
    quick: 'A reputable telehealth program starts with an <strong>online intake and a visit with a licensed U.S. clinician</strong>, may require lab work, and includes regular follow-ups. Prescription weight-loss medicines like GLP-1s are FDA-approved for adults with a BMI of 30+, or 27+ with a weight-related condition. <strong>Your clinician decides</strong> whether they\'re right for you.',
    body: `
<p>Telehealth makes it possible to see a licensed clinician from home for weight management, hormone therapy and everyday acute concerns. Here\'s how the process usually works and how to choose a trustworthy service.</p>
<h2>How a typical telehealth program works</h2>
<ol>
<li><strong>Online intake:</strong> you share your medical history, current medications and goals.</li>
<li><strong>Clinician review or video visit:</strong> a licensed provider in your state assesses whether treatment is appropriate.</li>
<li><strong>Labs if needed:</strong> some treatments (especially hormones) require blood tests first.</li>
<li><strong>Treatment plan:</strong> this may include lifestyle support, prescriptions sent to a pharmacy, or a referral to in-person care.</li>
<li><strong>Follow-ups:</strong> regular check-ins to monitor progress and side effects and adjust dosing.</li>
</ol>
<h2>GLP-1 weight-loss medications: the basics</h2>
<p>GLP-1 medicines such as semaglutide (Wegovy) and tirzepatide (Zepbound) are FDA-approved for chronic weight management in adults with a BMI of 30 or higher, or 27 or higher with at least one weight-related condition (such as high blood pressure or type 2 diabetes), alongside diet and exercise.</p>
<ul>
<li><strong>Common side effects</strong> include nausea, diarrhoea, constipation and reduced appetite, which are often worse when starting or increasing the dose.</li>
<li><strong>They aren\'t suitable for everyone</strong>, including people with a personal or family history of certain thyroid cancers (MTC or MEN2) and people who are pregnant.</li>
<li><strong>Branded vs compounded:</strong> compounded versions are not FDA-approved products, and the FDA has warned about dosing errors and unregulated sources. Ask exactly what you\'d be prescribed.</li>
</ul>
<h2>Hormone therapy via telehealth</h2>
<p>Hormone therapy, for example for menopause symptoms or low testosterone, generally needs a proper assessment and lab testing before starting, plus ongoing monitoring. A good service will explain risks and benefits and follow up regularly rather than simply shipping a prescription.</p>
<h2>Questions to ask before you sign up</h2>
<ul>
<li>Are clinicians licensed in <em>my</em> state, and will I speak with one?</li>
<li>What\'s included: visits, labs, medication, follow-ups? What\'s the total monthly cost?</li>
<li>Is the medication branded and FDA-approved, and which pharmacy fills it?</li>
<li>Can I use insurance, HSA or FSA funds?</li>
<li>How do I reach a clinician about side effects, and how quickly?</li>
</ul>
<div class="callout">Telehealth is for non-emergency care. For chest pain, trouble breathing, severe allergic reactions or other emergencies, call 911.</div>
<h2>Our pick</h2>
<p><strong>FullScopeMD</strong> offers U.S. telehealth patient support for medical weight management, a branded GLP-1 program, hormone therapy and acute care, with eligibility decided by licensed clinicians.</p>`,
    faqs: [
      { q: 'Who qualifies for GLP-1 weight-loss medication?', a: 'FDA labeling covers adults with a BMI of 30 or more, or 27 or more with a weight-related condition. A licensed clinician must decide whether it\'s safe and appropriate for you.' },
      { q: 'Is online weight-loss treatment legitimate?', a: 'It can be, if care is provided by licensed clinicians who review your history, order labs when needed, prescribe FDA-approved medicines through licensed pharmacies and provide follow-up.' },
      { q: 'Do I need lab work for telehealth hormone therapy?', a: 'Usually, yes. Most hormone treatments require baseline blood tests and ongoing monitoring to dose safely.' },
    ],
  },

  // ------------------------------------------------------------------ BLOG
  {
    type: 'blog',
    path: '/blog/home-first-aid-kit-checklist.html',
    title: 'The Complete Home First Aid Kit Checklist (2026)',
    short: 'Home first aid kit checklist',
    category: 'First Aid',
    date: '2026-09-29',
    partners: ['finitex', 'brookwood-med'],
    description: 'Everything a well-stocked home first aid kit should contain, plus how to store it and when to restock. Printable checklist included.',
    quick: 'A home first aid kit should include <strong>adhesive bandages in several sizes, sterile gauze, tape, a roller bandage, antiseptic wipes, antibiotic ointment, disposable nitrile gloves, tweezers, scissors, an instant cold pack, a thermometer, pain relievers and an emergency blanket</strong>. Check it twice a year for expired items.',
    body: `
<p>Most household injuries are minor cuts, burns, sprains and splinters. A well-stocked kit means you can deal with them calmly. Use this checklist to build or restock yours.</p>
<h2>Wound care</h2>
<ul>
<li>Adhesive bandages in assorted sizes (including knuckle and fingertip)</li>
<li>Sterile gauze pads (2"×2" and 4"×4")</li>
<li>Roller bandage and elastic (compression) bandage</li>
<li>Medical tape</li>
<li>Antiseptic wipes and antibiotic ointment</li>
<li>Hydrogel burn dressing or burn gel</li>
</ul>
<h2>Tools</h2>
<ul>
<li>Disposable nitrile gloves (several pairs)</li>
<li>Tweezers and blunt-tip scissors</li>
<li>Digital thermometer</li>
<li>Instant cold packs</li>
<li>Emergency (foil) blanket</li>
<li>CPR face shield or breathing barrier</li>
<li>Flashlight and spare batteries</li>
</ul>
<h2>Medicines</h2>
<ul>
<li>Pain and fever relievers suitable for everyone in the household (including children\'s formulas)</li>
<li>Antihistamine for allergic reactions</li>
<li>Hydrocortisone cream</li>
<li>Oral rehydration salts</li>
<li>Any personal prescriptions (e.g. an epinephrine auto-injector)</li>
</ul>
<h2>Extras worth adding</h2>
<ul>
<li>A few KN95 or surgical masks</li>
<li>Hand sanitiser</li>
<li>A printed list of emergency contacts, allergies and medications</li>
<li>A basic first aid manual</li>
</ul>
<h2>Storage and upkeep</h2>
<p>Keep the kit somewhere cool, dry and easy to reach, but out of children\'s reach. The kitchen or a hallway cupboard is better than a steamy bathroom. Keep a smaller kit in the car. Twice a year (for example when the clocks change), replace anything expired or used.</p>
<div class="callout">A first aid kit is for minor injuries. Call 911 for serious bleeding, breathing difficulty, chest pain, severe burns or loss of consciousness.</div>`,
    faqs: [
      { q: 'What are the 10 most important first aid items?', a: 'Adhesive bandages, sterile gauze, medical tape, antiseptic wipes, antibiotic ointment, disposable gloves, tweezers, scissors, an instant cold pack and pain relievers.' },
      { q: 'How often should I check my first aid kit?', a: 'At least twice a year, and after every use. Replace expired medicines and restock anything you\'ve used.' },
    ],
  },
  {
    type: 'blog',
    path: '/blog/2026-09-24-wound-care-supplies-online.html',
    title: 'Buying Wound Care Supplies Online: A Practical Guide',
    short: 'Wound care supplies online',
    category: 'First Aid',
    date: '2026-09-24',
    updated: '2026-09-29',
    partners: ['finitex'],
    description: 'Which wound care supplies you actually need, from bandages and gauze to hydrocolloid and foam dressings, and how to buy them safely online.',
    quick: 'For most home wound care you need <strong>sterile gauze, non-stick pads, medical tape, adhesive bandages, saline or gentle cleanser and disposable gloves</strong>. Advanced dressings (hydrocolloid, foam, alginate) are for specific wounds, so follow your clinician\'s instructions. Buy sterile, sealed products from reputable sellers.',
    body: `
<p>Whether you\'re caring for a post-surgical incision, a slow-healing wound or everyday cuts and scrapes, buying supplies online can save time and money. This guide explains the main product types and how to shop safely.</p>
<h2>The essentials</h2>
<ul>
<li><strong>Sterile gauze pads and rolls:</strong> for cleaning, covering and padding wounds.</li>
<li><strong>Non-adherent (non-stick) pads:</strong> won\'t stick to healing tissue, so changes hurt less.</li>
<li><strong>Medical tape:</strong> paper tape for sensitive skin, cloth or silicone tape for better hold.</li>
<li><strong>Adhesive bandages</strong> in assorted sizes.</li>
<li><strong>Sterile saline or a gentle wound cleanser.</strong></li>
<li><strong>Disposable nitrile gloves</strong> to keep dressing changes clean.</li>
</ul>
<h2>Advanced dressings explained</h2>
<table>
<thead><tr><th>Dressing</th><th>Typically used for</th></tr></thead>
<tbody>
<tr><td>Hydrocolloid</td><td>Light-to-moderate exudate; blisters and some pressure areas</td></tr>
<tr><td>Foam</td><td>Moderate-to-heavy exudate; cushioning over bony areas</td></tr>
<tr><td>Alginate</td><td>Heavily draining wounds</td></tr>
<tr><td>Transparent film</td><td>Covering IV sites and superficial wounds</td></tr>
<tr><td>Hydrogel</td><td>Dry wounds and minor burns</td></tr>
</tbody>
</table>
<p>For chronic, diabetic or post-surgical wounds, use the dressings your clinician recommends. The wrong dressing can slow healing.</p>
<h2>How to buy wound care supplies safely online</h2>
<ul>
<li>Choose <strong>sterile, individually sealed</strong> products for open wounds.</li>
<li>Check the manufacturer, lot number and expiry date on the listing or packaging.</li>
<li>Buy from established medical retailers with clear return policies.</li>
<li>Order enough for 2–4 weeks of changes so you don\'t run short.</li>
<li>Check whether your insurance, HSA or FSA covers the supplies.</li>
</ul>
<h2>Dressing-change basics</h2>
<ol>
<li>Wash your hands and put on clean gloves.</li>
<li>Remove the old dressing gently. Moisten it with saline if it sticks.</li>
<li>Clean the wound as instructed and pat the surrounding skin dry.</li>
<li>Apply the new dressing without touching the side that faces the wound.</li>
<li>Dispose of used materials and wash your hands again.</li>
</ol>
<div class="callout"><strong>Get medical help</strong> if a wound shows increasing redness, warmth, swelling, pus, a bad smell, fever, or isn\'t improving after a few days.</div>`,
    faqs: [
      { q: 'What supplies do I need for basic wound care at home?', a: 'Sterile gauze, non-stick pads, medical tape, adhesive bandages, saline or a gentle cleanser and disposable gloves cover most minor wounds.' },
      { q: 'When should I use a hydrocolloid dressing?', a: 'Hydrocolloid dressings suit shallow wounds with light-to-moderate drainage, like blisters. Don\'t use them on infected wounds, and follow clinical advice for chronic wounds.' },
    ],
  },
  {
    type: 'blog',
    path: '/blog/2026-09-24-mobility-aids-for-seniors.html',
    title: 'Mobility Aids for Seniors: Complete Guide to Independence and Safety',
    short: 'Mobility aids for seniors',
    category: 'Mobility',
    date: '2026-09-24',
    updated: '2026-09-29',
    partners: ['walkhero'],
    description: 'Canes, walkers, rollators and wheelchairs compared, plus how to choose the right mobility aid, set the correct height and stay safe at home.',
    quick: '<strong>Canes</strong> suit mild balance issues, <strong>walkers</strong> give the most stability, <strong>rollators</strong> suit people who can walk further but need rests, and <strong>wheelchairs or scooters</strong> help with longer distances. A physical therapist can recommend the right aid and set the correct height.',
    body: legacy('2026-09-24-mobility-aids-for-seniors.html'),
    faqs: [
      { q: 'How do I know what height my cane or walker should be?', a: 'Standing upright with arms relaxed, the handle should line up with the crease of your wrist, giving a slight 15–20° bend in the elbow when you hold it.' },
      { q: 'What is the difference between a walker and a rollator?', a: 'A standard walker has no wheels (or two front wheels) and is lifted as you walk, giving maximum stability. A rollator has three or four wheels, hand brakes and usually a seat, making it better for longer walks.' },
    ],
  },
  {
    type: 'blog',
    path: '/blog/smart-cupping-at-home.html',
    title: 'Smart Cupping at Home: How It Works and How to Use It Safely',
    short: 'Smart cupping at home',
    category: 'Wellness Devices',
    date: '2026-09-29',
    partners: ['revo'],
    image: 'revo-kit.jpg',
    description: 'What rechargeable smart cupping devices do, what the evidence says, and simple safety tips for using them on sore muscles at home.',
    quick: 'Smart cupping devices use <strong>gentle suction, often with heat and vibration</strong>, to create a massage-like sensation on muscles. Many people use them for relaxation after exercise, though research evidence is limited. Keep sessions short, avoid broken or irritated skin, and check with a clinician if you take blood thinners, are pregnant or have a bleeding disorder.',
    body: `
<p>Cupping has been used for centuries in several traditional medicine systems. Modern "smart cups" make it easy to try at home, with no flames and no pump, just a rechargeable device with adjustable suction.</p>
<h2>How smart cupping devices work</h2>
<p>A motor creates suction that lifts the skin and underlying tissue. Many devices add <strong>heat</strong> (for a warming feel) and <strong>vibration or pulsing suction</strong> (for a massage-like effect), with several intensity levels controlled by a button or app.</p>
<h2>What the evidence says</h2>
<p>Studies on cupping are generally small and of mixed quality. Some people report short-term relief of muscle tightness and a sense of relaxation, similar to massage. It is not a treatment for any disease and shouldn\'t replace medical care for ongoing pain.</p>
<h2>How to use a smart cup safely</h2>
<ol>
<li>Start on the <strong>lowest suction and heat</strong> setting.</li>
<li>Use on fleshy, muscular areas: shoulders, upper back, thighs, calves.</li>
<li>Keep each session short. A few minutes per area is plenty to start.</li>
<li>Circular or round marks are common and usually fade within days. Stop if you feel pain, tingling or numbness.</li>
<li>Clean the cup rim after every use.</li>
</ol>
<h2>Who should avoid it or check first</h2>
<ul>
<li>People taking blood thinners or with bleeding or clotting disorders</li>
<li>Pregnancy (especially on the abdomen and lower back)</li>
<li>Over broken skin, rashes, sunburn, varicose veins, recent injuries or areas of reduced sensation</li>
<li>People with pacemakers or implanted devices (check the manufacturer\'s guidance)</li>
</ul>
<h2>Our picks</h2>
<ul>
<li><strong>Full kit:</strong> REVO Smart Cup 4-in-1 Relief Bundle.</li>
<li><strong>For couples or back and shoulders:</strong> REVO Kit 2-Pack with case.</li>
</ul>`,
    faqs: [
      { q: 'Do cupping marks hurt?', a: 'Usually not. The round marks come from suction drawing blood toward the skin surface and typically fade in a few days. Pain during or after use means the suction is too strong. Stop and lower the setting.' },
      { q: 'How often can I use a smart cupping device?', a: 'Follow the manufacturer\'s instructions. Many people use short sessions a few times a week, leaving marked areas alone until they fade.' },
    ],
  },
  {
    type: 'blog',
    path: '/blog/how-to-choose-glasses-frames.html',
    title: 'How to Choose Glasses Frames (and Are Smart Glasses Worth It?)',
    short: 'Choosing glasses frames',
    category: 'Eyewear',
    date: '2026-09-29',
    partners: ['eydology'],
    image: 'eydology-cateye.jpg',
    description: 'Read the numbers on your frame arm, match frames to your face shape, understand blue-light lenses, and decide whether smart glasses suit you.',
    quick: 'Start with <strong>fit</strong>: use the three numbers on a current frame\'s arm (lens width, bridge, temple length) to find frames that fit, then choose a shape that contrasts with your face shape. You\'ll need an up-to-date prescription and your <strong>pupillary distance (PD)</strong> to order prescription lenses online.',
    body: `
<p>Buying glasses online is easy once you know your measurements. Here\'s how to get a comfortable fit and a style you\'ll love.</p>
<h2>Read the numbers on your frames</h2>
<p>Look inside the arm of glasses that fit you well. You\'ll see something like <strong>52□18-140</strong>:</p>
<ul>
<li><strong>52</strong>: lens width in mm</li>
<li><strong>18</strong>: bridge width (the gap between lenses)</li>
<li><strong>140</strong>: temple (arm) length</li>
</ul>
<p>Choose new frames within about 2 mm on lens and bridge width, and 5 mm on temple length, and they\'ll likely fit similarly.</p>
<h2>Match frames to your face shape</h2>
<ul>
<li><strong>Round face:</strong> angular or rectangular frames add definition.</li>
<li><strong>Square face:</strong> round, oval or cat-eye frames soften strong angles.</li>
<li><strong>Oval face:</strong> most shapes work, so experiment.</li>
<li><strong>Heart-shaped face:</strong> bottom-heavy, rimless or cat-eye styles balance a wider forehead.</li>
</ul>
<h2>What you need to order prescription lenses</h2>
<ul>
<li>A current prescription (most are valid for 1–2 years)</li>
<li>Your pupillary distance (PD), which is sometimes on the prescription. Otherwise ask your optician or measure it carefully.</li>
<li>Lens options: anti-reflective coating is worth it for most people. Consider high-index lenses for strong prescriptions.</li>
</ul>
<h2>Do blue-light glasses work?</h2>
<p>The American Academy of Ophthalmology doesn\'t recommend blue-light-blocking glasses for digital eye strain, because screens aren\'t shown to damage eyes. Eye strain is better helped by the <strong>20-20-20 rule</strong>: every 20 minutes, look at something 20 feet away for 20 seconds. Some people still like the tint for comfort.</p>
<h2>Are smart glasses worth it?</h2>
<p>Smart glasses add cameras, open-ear audio and voice assistants to a normal-looking frame. They\'re great for hands-free calls, music and quick photos. Check battery life, whether prescription lenses can be fitted, and be considerate about recording people in public.</p>
<div class="callout">Online glasses don\'t replace eye exams. Regular exams check eye health, not just your prescription.</div>`,
    faqs: [
      { q: 'What do the three numbers on glasses mean?', a: 'Lens width, bridge width and temple length in millimetres. For example, 52-18-140 means 52 mm lenses, an 18 mm bridge and 140 mm arms.' },
      { q: 'Can I buy prescription glasses online?', a: 'Yes. You\'ll need a valid prescription and your pupillary distance. Choose frames close to the measurements of a pair that already fits you.' },
    ],
  },
];

export const articles = raw.map((a) => {
  const body = withIds(a.body);
  return { ...a, body, readMins: minutes(body + (a.quick || '')) };
});
