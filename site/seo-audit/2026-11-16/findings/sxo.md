# SXO findings: rithwikbirdfeeds.com (16 Nov 2026)

**SXO Gap Score: 49/100** (this is separate from the SEO Health Score). It was scored for /bird-feeds/ against "foxtail millet supplier in India". /human-food/ against "bulk millets / quinoa / chia supplier" scores about the same.

## Method and limitations
- Page data came from the pre-fetched render_page JSON (pages/*.json), plus read-only source (`site/src/data/products.ts`, `faq.ts`, `seo.ts`).
- SERPs came from the session's WebSearch tool, which is **not a Google SERP API**. It returns organic-style result lists but no local pack, PAA, ads, AI Overview or exact positions. Positions below are indicative. GlobalLinker is probably over-represented by this backend. No Google, DataForSEO or GSC data was available.
- IndiaMART pages returned HTTP 429, so details of the Rithwik Industries IndiaMART listing come from a search snippet and were not fetched.
- The domain was registered today. No result for `rithwikbirdfeeds.com` or "Rithwik Bird Feeds" appeared in any search, so the site is **not indexed yet**. The owner's "page 10" observation could not be reproduced.

## What already works
- Each URL has its own buyer-keyword title, meta description, canonical and h1. There is a buyer FAQ with local names (korralu, kangni...). Real client grain photos are used. WhatsApp CTAs and an "Ask price" button sit on every product card. JSON-LD Organization, FAQPage and OfferCatalog are present.

## SERP map (what ranks for each search, and the verdict)

| Search | What ranks (observed) | Dominant page type | Best existing page | Verdict |
|---|---|---|---|---|
| foxtail millet supplier in India | ~20 GlobalLinker single-product listings (Majji Export Import Visakhapatnam, Gar Exim, Sri Bairavar, Radha Agro, Cosmique...). Titles follow "Foxtail Millet - 99% Purity, 12-18 Months Shelf Life, 25kg/50kg Packaging, Origin India" | Marketplace single-product page (100%) | /bird-feeds/ | **HIGH mismatch**: a multi-product brand page against single-product spec listings |
| foxtail millet for birds wholesale | GlobalLinker (Danodia Zoolulu 900 g), IndiaMART seller page (Vaishya Foods Nashik, Rs 60/kg, 50 kg PP bag, since 1972), Alibaba/Accio, plus retail (zooplus, PetSmart, Walmart) | Marketplace product page plus retail product page | /bird-feeds/ | **HIGH mismatch**: wants a foxtail-for-birds product page with price/packing |
| bird feed supplier India / bird feed wholesale | GlobalLinker (Yembroos, Danodia, BV Business "yellow millet for bird feed" MOQ 1 MT), globy, IndiaMART storefronts (Bird Food Point Agra, Garva sunflower bird seed Rs 90/kg), Meesho, Alibaba | Marketplace product pages and supplier storefronts | /bird-feeds/ | **MEDIUM**: /bird-feeds/ is a supplier storefront, which partly fits, but the SERP rewards per-product listings |
| bulk millets supplier India | GlobalLinker "millets" listings, indianbusinessportal, freshdi, eximnext | Marketplace product/category | /human-food/ | **MEDIUM-HIGH**: category intent fits /human-food/, but competitors are marketplaces |
| quinoa supplier India bulk | GlobalLinker (white/red/tricolor quinoa), **girirajpsyllium.in** (own-site B2B guide: varieties table, 8-parameter spec table, 7 packing formats, MOQ tiers from 500 kg, 9 certifications, 11 export docs, 7-Q FAQ), Tridge, freshdi | Marketplace product page plus one **supplier own-site product guide** | /human-food/ | **HIGH mismatch**: quinoa is one card among 40+ |
| chia seeds bulk supplier India | GlobalLinker, bestsuppliers, freshdi, girirajpsyllium.in (bulk chia guide) | Same as quinoa | /human-food/ | **HIGH mismatch** |
| korralu wholesale (price) | Nothing relevant (Faire honey, Shopify guides) | No result serves the intent | /bird-feeds/ (FAQ has "korralu") | **Opportunity**: nobody serves this query. A foxtail page with "korralu" in title/h1 can win it |
| kangni wholesale price | IndiaMART category "impcat/foxtail-millet" (Rs 40-68/kg listings), unrelated noise | Marketplace category with price range | /bird-feeds/ | **HIGH mismatch**: wants prices per kg |
| millet suppliers in Kurnool | Deccan Chronicle news, ExportersIndia Kurnool food-grains, IndianYellowPages Kurnool (Sri Balaji Traders, Kodumur), indiastat, NaPanta mandi prices | Local directory plus news (local pack likely, not visible here) | / or /human-food/ | **MEDIUM**: needs GBP and directory listings, not a page |
| millet suppliers Andhra Pradesh wholesale | GlobalLinker (Majji, Visakhapatnam), TradeIndia (Niruvapathy Agro), IndiaMART (Aswartha Traders Anantapur: foxtail Rs 60/kg, browntop Rs 100/kg), NaPanta | Directory/marketplace storefronts | /human-food/ | **MEDIUM** |
| "Rithwik Bird Feeds" | No Rithwik result at all (generic bird-feeding pages) | n/a | / | **ALIGNED** once indexed: no competition |
| Rithwik Industries Kurnool | **m.indiamart.com/rithwikindustries** ranks (snippet: Ramapuram, "founded in 2025", trader of edible seeds and dried millets, partnership). Also Rizwi Industries, Rithwik Projects, Rithwik FMS | Brand plus namesakes | / and /human-food/ | **ALIGNED** page type, but the IndiaMART NAP conflicts with the site (Kurnool, since 1925) |

**SERP consensus:** for 9 of 11 generic searches, >80% of results are marketplace or directory pages (GlobalLinker, IndiaMART, TradeIndia, ExportersIndia, Alibaba, freshdi). The winning *own-site* format is one product per URL with a spec table, packing, MOQ and FAQ (girirajpsyllium.in).

## Findings

### 1. Page-type mismatch: three multi-product views compete against single-product pages (HIGH, class B)
Evidence: page one for every product search is one product per URL. Titles carry specs and packing: "Foxtail Millet - 99% Purity... 25kg/50kg Packaging, Origin India". The site has 3 URLs for 12 bird feeds and ~40 food lines.
Fix: add one product page per priority line (list below). The three existing pages stay as they are. Each product card can link to its page (that link is the one visible addition, so the client must sign off).

### 2. All three URLs serve the same HTML body (HIGH, class A)
Evidence: the body is 420,756 bytes on /, /bird-feeds/ and /human-food/ (420,758 on /), with a quick_ratio of 1.0. Only `data-view` and the `hidden` attribute differ (`#book-view hidden`, `#human-food hidden` on /bird-feeds/). Every URL therefore contains both brands' products and both FAQ lists. Google may cluster them as duplicates and override the canonicals, and each page's topical focus is diluted.
Fix (in `site/src/components/Site.astro` and `src/scripts/main.ts`): server-render only the active view's content per page. Load the other view on switch, or make the switch a normal link. The visible result stays the same. This needs dev effort and a check that the in-place switch still looks identical.

### 3. No commercial specs anywhere: no MOQ, packing, purity, moisture or price (HIGH, class B)
Evidence: the extracted text of /bird-feeds/ has 0 matches each for "kg", "MOQ", "minimum", "moisture", "purity" and "Rs". Competitors show 25/50 kg PP bags, 99% purity, 12-18 months shelf life, MOQ (1 kg to 1 MT) and IndiaMART prices (Rs 40-68/kg kangni, Rs 60/kg foxtail bird seed).
Fix: put these blocks on the new product pages, not on the existing pages. Price can be "indicative range, updated monthly", or "rate on WhatsApp" if the client refuses to publish one.

### 4. Offers in the JSON-LD carry no price and there is no Product type (MEDIUM, class A after B)
Evidence: `{"@type":"Offer","name":"Foxtail millet",...,"availability":"InStock"}` has no price, priceCurrency or eligibleQuantity, and no Product entity exists.
Fix: on each new product page, emit Product with `additionalProperty` (purity, moisture, packing) and Offer with `eligibleQuantity` (MOQ). Add `priceSpecification` only if the client publishes a price; without a price there is no merchant rich result, and that is acceptable. Also add BreadcrumbList. Generate it from `products.ts`.

### 5. The IndiaMART listing contradicts the site (HIGH, class C)
Evidence: the search snippet for m.indiamart.com/rithwikindustries says "Ramapuram", "founded in 2025". The site and the JSON-LD say Kurnool, since 1925. This listing is already what ranks for "Rithwik Industries Kurnool".
Fix: the owner edits the IndiaMART profile to the same address and phone (92455 55556), adds the website URL, and uses "family trade since 1925 (firm est. 2025)" if both are true. Add a matching Rithwik Bird Feeds storefront on IndiaMART, TradeIndia and GlobalLinker.

### 6. Local intent goes to directories and the map pack (MEDIUM, class C)
Evidence: "millet suppliers in Kurnool" returns IndianYellowPages, ExportersIndia and news; Kurnool sellers (Sri Balaji Traders, Sri Pavan Enterprises) are directory listings.
Fix: a Google Business Profile for the office and the Duvvur warehouse ("Wholesale grain supplier", "Bird seed supplier"), plus ExportersIndia and IndianYellowPages Kurnool listings with the same NAP. See `/seo local`.

## Pages to add (class B, content sign-off needed). Priority order

All pages share these blocks, taken from what ranks:
- **H1** with the local name
- **Spec table:** scientific name, purity %, moisture %, foreign matter %, processing (cleaned, sieved, Sortex colour-sorted, from the site's "Seed to sack"), shelf life
- **Variants/grades** from products.ts
- **Packing:** bag sizes (client to confirm, competitors show 25/50 kg PP)
- **MOQ** and lead time
- **Price:** indicative range or "today's rate on WhatsApp"
- **Origin and season:** Andhra Pradesh, harvest months from the season clock
- **GST** from products.ts, and **HSN** (client to confirm)
- **Client photos:** one per variant
- **FAQ:** 4-6 questions
- **Certifications** (existing seals)
- **CTA:** prefilled WhatsApp "Ask price for <product> <variant>"
- **Links:** to the hub view and 3 related products

| # | Target search | URL | Title | H1 | Product-specific content (products.ts) |
|---|---|---|---|---|---|
| 1 | foxtail millet for birds wholesale; korralu / kangni wholesale; foxtail millet supplier in India | /bird-feeds/foxtail-millet/ | Foxtail Millet for Birds, Wholesale (Korralu / Kangni) \| Rithwik Bird Feeds | Foxtail millet (korralu) for birds, wholesale from Kurnool | Summer crop vs Winter crop (photos `foxtail-summer-rithwik`, `foxtail-winter-rithwik`), processed or unprocessed, GST 0%, local names (thinai, navane), "No. 1 foxtail millet supplier" claim with the 20,000MT+ and 3,000+ figures, Setaria italica |
| 2 | proso millet for birds bulk | /bird-feeds/proso-millet/ | Proso Millet for Birds in Bulk: Green & Yellow \| Rithwik Bird Feeds | Proso millet (varigalu) for birds | Green and Yellow variants, GST 0%, budgie/finch use (from "Birds we feed") |
| 3 | sunflower seeds for parrots wholesale; safflower seeds for birds | /bird-feeds/sunflower-seeds/, /bird-feeds/safflower-seeds/ | Striped Sunflower Seeds for Parrots, Wholesale \| Rithwik Bird Feeds | Striped sunflower seeds for birds | Striped grade, GST 5%, macaw/cockatoo use. Safflower: GST 5% |
| 4 | jowar for birds / pigeon feed bulk | /bird-feeds/jowar/ | Jowar for Birds: Mahendra, Milky White, Nidhi, Red, Yellow \| Rithwik | Jowar (jonnalu) bird feed in 5 kinds | 5 variant photos |
| 5 | browntop / kodo / little / barnyard millet bulk (low competition) | /bird-feeds/browntop-millet/ etc. | "<Millet> for Birds, Wholesale (<Telugu name>)" | same | GST 0%, one photo each |
| 6 | quinoa supplier India bulk | /human-food/quinoa/ | Bulk Quinoa Supplier in India: White, Bold, Red, Black, Tricolor \| Rithwik Industries | Quinoa in bulk: five kinds | Regular, Bold, Red, Black (client photos), Tricolor. Spec table like girirajpsyllium (saponin, moisture, purity). Origin stated honestly |
| 7 | chia seeds bulk supplier India | /human-food/chia-seeds/ | Bulk Chia Seeds Supplier: Black & White \| Rithwik Industries | Chia seeds in bulk, black and white | Black and White (`chia-white-rithwik`). Origin (grown vs processed) is a buyer question competitors answer |
| 8 | bulk millets supplier India | /human-food/millets/ (hub) plus /human-food/foxtail-millet/ (hulled) | Bulk Millets Supplier in India: 8 Millets, Hulled \| Rithwik Industries | Millets in bulk, hulled and cleaned | 8 millets (`*-hulled-rithwik` photos; confirm the proso photo first), table of Telugu/Hindi names, links to each millet |
| 9 | basil (sabja) seeds bulk; pumpkin / flax / sesame bulk | /human-food/basil-seeds/ etc. | "<Product> in Bulk \| Rithwik Industries" | same | Sabja; sesame Black / Z-black / White |
| 10 | foxtail millet price today / kangni price per kg | /foxtail-millet-price/ (only if the client publishes rates) | Foxtail Millet Price Today (per kg / quintal), Kurnool \| Rithwik | Foxtail millet price this week | Dated rate table by crop and grade, monthly history, NaPanta-style mandi context. Skip this page if no price is published |

Keep it to roughly 8-10 pages at first, generated from `products.ts` so they cannot drift from the cards. No location doorway pages ("supplier in Delhi" and so on).

## User stories (each cites a signal)
1. *Awareness:* "As a pet-shop owner I search kangni wholesale price to compare per-kg rates." The SERP shows an IndiaMART Rs 40-68/kg range.
2. *Consideration:* "As a trader I need purity, moisture and bag size before I call." GlobalLinker titles put "99% Purity... 25kg/50kg Packaging" in the title itself.
3. *Consideration:* "As a retail packer buying quinoa I want the grade, saponin level and MOQ tiers." The girirajpsyllium spec and MOQ tables rank.
4. *Decision:* "As an export house I need certifications, HSN and documents." The quinoa guide ranks with 9 certs and 11 docs.
5. *Decision, local:* "As a Kurnool buyer I want an address, a map and someone to visit." The SERP is local directories (IndianYellowPages Kurnool).

## Persona scoring (current best page; R/C/T/A out of 25 each)
| Persona | Score | Weakest point and fix |
|---|---|---|
| Price-checking pet shop (kangni price) | R12 C6 T14 A16 → **48** | No price signal. Product page with an indicative range or a dated rate (B) |
| Export house (specs/certs) | R12 C8 T15 A15 → **50** | No specs, HSN or documents. Spec table on product pages (B); certificate PDFs on request already exist |
| Retail packer, quinoa/chia | R10 C10 T15 A16 → **51** | One card among 40+. Dedicated quinoa/chia pages (B) |
| Bulk trader, foxtail | R18 C11 T16 A20 → **65** | No MOQ or packing. Foxtail page (B) |
| Local Kurnool buyer | R16 C15 T12 A18 → **61** | No GBP or reviews. GBP plus directories (C) |
| Brand searcher | R22 C20 T16 A22 → **80** | IndiaMART NAP conflict (C) |

## Gap score breakdown (/bird-feeds/ vs "foxtail millet supplier in India")
- Page type 5/15: single-product SERP against a multi-product page
- Content depth 6/15: FAQ and local names are present; 0 specs, MOQ, packing or price
- UX 10/15: clear WhatsApp/Ask-price CTAs; very long animated page, the product is deep in the page
- Schema 8/15: Organization, FAQPage, OfferCatalog; no Product, Offers without price, no Breadcrumb
- Media 12/15: 127 images, real client grain photos per variant
- Authority 2/15: domain is 0 days old, not indexed, no listings link to it, IndiaMART conflict
- Freshness 6/10: new site; htmldate reads 2026-01-01 (a guess, there is no dated content)

## Realistic timeline
- **Weeks 1-6:** "Rithwik Bird Feeds" #1 once indexed (no competition). "Rithwik Industries Kurnool" top 3 next to the IndiaMART listing once its NAP matches. "korralu wholesale" and Telugu-name long tail ("andu korralu", "varigalu for birds") are winnable quickly with product pages, because nothing relevant ranks.
- **Months 2-6:** long tail with a product, use and place: "foxtail millet for birds wholesale Kurnool", "summer crop foxtail millet", "browntop millet for birds bulk", "striped sunflower seeds for parrots wholesale", Kurnool local-pack terms via GBP.
- **6-12+ months, maybe never:** "foxtail millet supplier in India", "bird feed supplier India", "bulk millets supplier India", "quinoa / chia bulk supplier India". Page one is wall-to-wall GlobalLinker, IndiaMART, TradeIndia and Alibaba listings with huge domain authority. A new small site will not displace them. The practical route is to *be* on those marketplaces with matching NAP and a link to the site (C), and let the own site win long tail, brand and AI-answer citations.
