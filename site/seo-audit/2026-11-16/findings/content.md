# Content quality and E-E-A-T: rithwikbirdfeeds.com (16 Nov 2026)

Scores: **Content quality 55/100** · E-E-A-T 49/100 (Experience 55, Expertise 45, Authority 35, Trust 60; this skill's weighting 20/25/25/30, not Google's) · AI citation readiness 65/100.

Method: raw HTML from pages/*.json parsed per view container (`#book-view`, `#bird-feeds`, `#human-food`), aria-hidden/script excluded; 5-word shingle Jaccard for duplication; source read in site/src (read-only). No Search Console/analytics data was available.

## Works already
- Titles/descriptions are unique and keyword-led; metadata_template.py site-wide: site_risk low, templated_ratio 0.0, no shared CTA.
- One h1 per URL, good canonical, logical h2/h3 outline, FAQ in short quotable Q&A (grade ~8-9 readability), real office + warehouse addresses, GSTINs, named family timeline 1925-2022 with named founders, descriptive alt text on all content images (empty alt only on decorative/aria-hidden ones).

## Findings

### 1. High: all three URLs serve the same text (99.4% identical) - class A
Evidence: every page's HTML contains all three views; the inactive ones carry only `hidden`. Shingle Jaccard of full page text: / vs /bird-feeds/ 0.994, /bird-feeds/ vs /human-food/ 0.994. Per page: ~1,865 words Bird view + ~1,866 words Food view + 97 words book + ~590 words credits dialog. The extracted main text of /human-food/ starts with the book h1 and the Bird Feeds h1 text; on /human-food/ the h1 is heading no. 74 in DOM order (after the whole Bird site). Risk: Google folds the three into one canonical cluster or ranks the wrong URL for "foxtail millet" vs "bulk millets".
Fix: in `site/src/components/Site.astro`, server-render only the open view's markup; wrap the other two views in `<template id="tpl-bird">`/`<template id="tpl-food">` (template content is not part of the rendered document) and have `site/src/scripts/main.ts` clone the template into place before the in-place switch. Same pixels, same wording. Re-check with `scripts/check-sizes.cjs`.

### 2. High: certification claims without numbers, and copied onto a second legal entity - class B (+C)
Evidence: 8 seals (Spices Board, HACCP, FSSAI, APEDA, Halal, ISO, BRCGS, US FDA) on both sites, every one "copy available on request"; `registrations.ts` has no `number` for any. The note there says BRCGS/US FDA/APEDA came from Rithwik Industries' earlier site, yet the same eight show on Bird Feeds, a different GSTIN/PAN (37CCDPV9154P1ZK, proprietorship vs 37ABKFR7391G1ZM, firm). Spices Board registration for a bird-feed business is implausible on its face. BRCGS and FDA are publicly checkable directories; an unverifiable claim hurts Trust (QRG: trust is most important).
Fix: owner confirms which entity holds each; show FSSAI licence no., APEDA RCMC no., ISO standard + certifying body, BRCGS site code, FDA registration (or remove those not held by Bird Feeds). Then add `hasCredential` in the JSON-LD (A) mirroring the visible numbers.

### 3. High: product content is name-only; buyer questions unanswered - class B
Evidence: each card = name + options + "Ask price"/"Order". Active-view counts: "MOQ/minimum" 0, "sample" 0, "purity" 0, "moisture" 0, "25 kg"/"50 kg" 0, "days" (lead time) 0, "payment" 0, "organic" 0. Grades are not explained (what is "Summer crop" vs "Winter crop" foxtail, "Mahendra/Nidhi" jowar, processed vs unprocessed).
Searches with no answer on the site: "foxtail millet MOQ / minimum order", "bird seed 25 kg / 50 kg bag", "foxtail millet specification / purity / moisture", "sample of foxtail millet", "delivery time / freight", "payment terms", "export foxtail millet / quinoa exporter India" (word "exporter" 0), "organic millets", "budgie/parrot seed mix wholesale", "millet manufacturer" (0).
Fix: a per-product spec block or one new "Grades and specifications" section + 5-6 new FAQ entries (`src/data/faq.ts`) covering MOQ, bag sizes, specs, samples, lead time, payment, export. Ideally dedicated pages: /bird-feeds/foxtail-millet/ (flagship query) and /human-food/quinoa/.

### 4. Medium: Human Food copy never says "supplier" or "wholesale" - class B (and A for h1)
Evidence: active Food view: "supplier" 0, "wholesale" 0, "bulk millets" 0, "quinoa supplier" 0, "millets supplier" 0 (title says "Bulk Millets, Quinoa & Chia Supplier"). Visible h1 is the slogan "Nature's grain, nurtured for you" (sr text adds only "Rithwik Industries, Kurnool:"). Bird view is fine (supplier 4, wholesaler 1).
Fix: A: in Site.astro line 397 extend the sr-only span to "Rithwik Industries, Kurnool, bulk millets, quinoa and chia supplier:" (accurate, mirrors Bird h1 pattern). B: a new FAQ "Are you a wholesale millet supplier?" Also note: CLAUDE.md says the Food title includes "& Pulses" but `seo.ts` has "Bulk Millets, Quinoa & Chia Supplier" (pick one).

### 5. Medium: "No. 1 foxtail millet supplier in India" is unsubstantiated - class B
Evidence: the claim appears in title, h1, description, schema slogan, FAQ answer and rank figure; the only support is 20,000MT+ / 3,000+ customers, which are the same figures on both businesses (so not foxtail-specific). Unsupported superlatives weaken Trust and AI engines tend not to repeat them as fact.
Fix: add a foxtail-specific proof line (foxtail tonnes/year, number of states, years as main supplier, a named buyer testimonial or IndiaMART rating).

### 6. Medium: thin Experience/Authority signals - class B / C
Evidence: 36 of 74 photos are the client's own, the rest Wikimedia stock (credited); no testimonials, reviews, buyer names, case examples, press, trade-body memberships, or plant/Sortex photo (removed on purpose). Founders appear only in an alt text and timeline names, no bio. Contact emails are Gmail. Only one external profile (IndiaMART, Industries only; Bird Feeds `profiles: []`).
Fix: B: short founders note (role, years in trade), 2-3 buyer quotes, one real Sortex/cleaning photo. C: Google Business Profile for office and warehouse, IndiaMART/TradeIndia for Bird Feeds, reviews; then add URLs to `BRANDS.bird.profiles` in `products.ts` (A).

### 7. Low: internal inconsistencies a buyer or AI may notice - class B (client to confirm)
- Bird "Who we are": "seven millets" but 8 millet lines are listed (incl. pearl and finger millet).
- Bird facts "20+ range of products" vs hero "12 types of feeds in 18 grades"; book page says Food "31 products · 42 grades" vs "40+".
- Vision says "From Kurnool to the world" / "Where we're heading next: the Gulf, Europe..." while llms.txt says "across India and for export".

### 8. Low: home page "/" is 97 visible words - class B
Below the 500-word floor; fine for brand searches, but it is the canonical for "Rithwik" and gives no reason to rank. Optional: a 150-250 word intro of both businesses under the book (or rely on fix 1 so its 97 words are at least its own).

### 9. Low: FAQ schema expectations
- FAQPage rich results are limited to gov/health sites since 2023; keep the markup (AI engines read it) but don't expect FAQ snippets.

## AI citation readiness (65)
Good: FAQ answers are self-contained, name the entity, place and numbers; llms.txt is complete (1,289 words) with addresses, GSTINs, ranges. Weak: no specs or numbers per product to quote, duplicated hidden text dilutes each URL, superlative unsupported.
