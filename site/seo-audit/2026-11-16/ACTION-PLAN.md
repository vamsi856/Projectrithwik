# rithwikbirdfeeds.com: SEO action plan (16 Nov 2026)

Constraint from the client: the three pages keep their design and wording, and no extra pages are added.

## Done in code on 16 Nov (invisible to visitors; live once merged to `main`)

| # | Change | Why it matters | Verified by |
|---|---|---|---|
| 1 | Each address sends only its own view (`/` the book, `/bird-feeds/`, `/human-food/`); the other business is fetched when the visitor switches | All three addresses used to send the same 540 KB of HTML, so Google treated them as copies and listed only `/bird-feeds/` | 40 browser checks (desktop and phone), pixel-identical screenshots old vs new, 39 layout checks |
| 2 | Site name and organisation named "Rithwik Bird Feeds & Rithwik Industries" (was "Rithwik, Kurnool") | The name Google shows above results; nobody searches "Rithwik, Kurnool" | Built JSON-LD inspected on all three pages |
| 3 | Structured data: founders, 1925 on the family organisation only, office and Duvvur warehouse as locations, Home > business breadcrumb, image object, no undefined references, invalid `priceRange` removed, product category on each offer | Clear, consistent facts for Google and AI assistants | Same |
| 4 | Bird Feeds hero photo loads eagerly with a static preload | It is the largest element on that page | Lighthouse |
| 5 | Human Food heading names the business and what it supplies for screen readers | The heading matched none of the page title's words | Built HTML |
| 6 | One week of browser caching for the bird animation sheets and the birdsong | 650 to 800 KB re-checked on every visit | `_headers` |

Lab result on one machine, mobile Lighthouse, old build vs new: 85 to 100 (home), 76 to 95 (Bird Feeds), 73 to 94
(Human Food). DOM size 3,504 to 183 / 1,626 / 2,209 elements.

## For the owner, in order of effect

1. **Cloudflare: turn on "Always Use HTTPS"** (SSL/TLS > Edge Certificates). `http://rithwikbirdfeeds.com` serves the
   page without redirecting and `http://www.rithwikbirdfeeds.com` returns error 522.
2. **Search Console: Request indexing** for `/`, `/bird-feeds/` and `/human-food/` once the new build is live.
3. **Settle the PIN code.** Site: 518002. IndiaMART Bird Feeds and a company record: 518003. Use the GST
   certificate's, everywhere.
4. **Google Business Profile** for Rithwik Bird Feeds (category "Grain wholesaler"; website
   `https://rithwikbirdfeeds.com/bird-feeds/`), and for Rithwik Industries if Google allows two at one address.
   Photos of grain, sacks and the warehouse. Ask about ten buyers for reviews and reply to each.
5. **IndiaMART.** Rithwik Industries shows Ramapuram, Kadapa 516175 and "founded 2025", with no website. Rithwik Bird
   Feeds shows PIN 518003 and misspelt products ("Foxtile Millet", "Ragi Milet"), with no website. Correct both and
   add the website.
6. **Justdial** "Rithwik Bird Feeds, Ballary Road, Kurnool": claim it, check the phone (no 83097 82770), add the
   website.
7. **Three or four more free listings** (TradeIndia, ExportersIndia), Facebook / Instagram / YouTube pages with the
   website, and links from customers' own websites.
8. **Send the developer**: opening hours; certificate numbers (FSSAI, APEDA, the ISO standard and issuer); which firm
   holds which certificate. The same eight seals are shown for both firms today.

## Needs the client's decision (visible changes, not made)

- Commercial details buyers search for and competitors show: bag sizes, minimum order, purity and moisture, samples,
  delivery time, payment terms. None appear on the site. They could go into the existing "Questions buyers ask".
- Text inconsistencies: "seven millets" in Who we are but eight millet lines; "20+" and "40+" in the facts rows
  against 12 and 31 products counted on the book.
- Phones: the floating sound and WhatsApp buttons sit over part of the hero paragraph, and the main hero button
  starts just below the first screen.
- Evidence for "No. 1 foxtail millet supplier in India" (a figure, a customer quote, a rating).

## What to expect

- Brand searches ("Rithwik Bird Feeds", "Rithwik Industries Kurnool"): days to a few weeks. The domain was
  registered on 16 Nov 2026 and Google indexed `/bird-feeds/` the same day.
- Local-name and place searches (korralu wholesale, millet supplier Kurnool) and Google Maps: one to six months,
  mostly through the Business Profile and listings.
- "Foxtail millet supplier in India", "bird feed wholesale", "bulk millets supplier India": page one is IndiaMART,
  TradeIndia, GlobalLinker and Alibaba, each with one page per product. A three-page site on a new domain will not
  displace them soon, if at all. The way in is to be well listed on those marketplaces, with the website on each.
- Only Google Ads places a site at the top immediately. Organic ranking cannot be bought or guaranteed.
