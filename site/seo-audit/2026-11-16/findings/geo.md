# GEO / AI Search Readiness: rithwikbirdfeeds.com (16 Nov 2026)

## GEO Readiness Score: 63 / 100

| Dimension | Weight | Score | Notes |
|---|---|---|---|
| Citability | 25% | 68 | FAQ answers are short, direct and name the entity. Some are not self-contained; the "No. 1" claim has no outside source |
| Structural readability | 20% | 65 | Question H3s, one h1. But every URL ships all three views (two hidden), so the three URLs carry almost the same text |
| Multi-modal | 15% | 65 | Many photos with alt text, a text-layer PDF catalogue (title set). No video anywhere |
| Authority & brand | 20% | 25 | Domain is new today. No Wikipedia/Wikidata/YouTube/GBP. Two IndiaMART listings that disagree with the site |
| Technical accessibility | 20% | 92 | Static HTML, every AI/search UA gets 200 with no challenge, robots open, llms.txt good |

Platform estimates (my judgement, no visibility tools were configured): Google AI Overviews 40, ChatGPT search 35,
Perplexity 50, Bing Copilot 40. All four are held back by off-site entity signals and a domain one day old, not by access.

## AI crawler access (verified with live requests, 16 Nov 2026)
robots.txt: `User-agent: *` Allow: / plus an explicit group (OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot,
Claude-User, ClaudeBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended), Content-Signal
search/ai-input/ai-train = yes, Sitemap line.

Live GET of /, /bird-feeds/ and /llms.txt with each of these UAs: OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot,
Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, bingbot, Applebot, CCBot, YandexBot,
meta-externalagent, Bytespider, DuckAssistBot, MistralAI-User, cohere-ai. Every one got 200 with the full body (540 KB / 537 KB / 8.7 KB)
and no Cloudflare challenge markup. So Cloudflare's "Block AI bots" / AI Labyrinth matching on user agent is off.
Caveat: the requests came from a non-bot IP. A verified-bot rule based on IP can't be tested from here, so check
Security > Bots in the dashboard once.

What each bot controls:
- Search citation: OAI-SearchBot (ChatGPT search), Claude-SearchBot (Claude), PerplexityBot (Perplexity): allowed.
- Google AI Overviews follow Googlebot (allowed), not Google-Extended. Bing Copilot follows bingbot (allowed through `*`).
- Training only: GPTBot, ClaudeBot, CCBot, Applebot-Extended (Apple Intelligence training); Google-Extended (Gemini
  training and grounding): all allowed. That is the client's choice, and it fits a business that wants to be known.

## llms.txt: present, well-formed
H1, blockquote summary, key facts, Pages, Contact, certifications, both ranges, the full FAQ. Served as text/plain, ASCII only.
Gaps: lists only the Industries IndiaMART page (the Bird Feeds one is missing), and says "since 2022" while the JSON-LD says 1925 (see E1).
/llms-full.txt and /.well-known/llms.txt return 404. That is fine, because llms.txt already holds everything.

## Findings

### E1 High: founding date conflicts between sources (A, with client confirmation)
- JSON-LD: `foundingDate: '1925'` sits on both LocalBusiness entities (Site.astro `business()`), and the family
  Organization has no foundingDate.
- llms.txt: "Rithwik Bird Feeds and Rithwik Industries since 2022".
- IndiaMART: Bird Feeds GST registration 2022; Industries "founded in 2025", GST registration 2025.
- Fix (Site.astro): move `foundingDate: '1925'` to the `family` Organization. On `birdBiz` use '2022'; on `foodBiz` use
  the year the client confirms (IndiaMART says 2025). The "since 1925" heritage stays true through `parentOrganization`.

### E2 High: the parent entity name "Rithwik, Kurnool" is not a real name (A)
- The WebSite and Organization `name` is "Rithwik, Kurnool". AI engines quote names as given.
- Fix (Site.astro `family` and the WebSite node): name "Rithwik Bird Feeds & Rithwik Industries", alternateName
  ["Rithwik, Kurnool", "Rithwik group"]. Add `founder` (Person: Bysani Vasavi, Bysani Sudheer, which the page already
  shows in the founders' photo alt text) and `foundingDate: '1925'`.

### E3 High: the Bird Feeds IndiaMART listing exists but is not linked (A)
- https://www.indiamart.com/rithwik-bird-feeds/ is live: "Rithwik Bird Feeds, Kurnool", GSTIN 37CCDPV9154P1ZK (same as
  the site), 7 yrs. `BRANDS.bird.profiles` in data/products.ts is `[]`, so the Bird Feeds sameAs is only wa.me.
- Fix: products.ts `bird.profiles: ['https://www.indiamart.com/rithwik-bird-feeds/']`. llms.txt.ts then lists it too.

### E4 High: NAP on IndiaMART disagrees with the site (C)
- Industries listing: "Ramapuram, Kadapa, Andhra Pradesh", PIN 516175, "B VASAVI (Proprietor)" but "Partnership".
- Bird Feeds listing: Kurnool PIN 518003 (the site says 518002), contact "Billakanti Vasavi" (the site says Bysani Vasavi).
- Neither listing links rithwikbirdfeeds.com.
- Product names are misspelled or wrong: "Foxtile Millet", "Faxtile Millet", "Ragi Milet", "Ragi cotton fabric", "Kuttu cotton fabric".
- Owner: make the address and PIN match the website office (or name the Duvvur warehouse clearly), add the website URL
  to both listings, and fix the product names. IndiaMART is the main third-party page an AI engine finds for this brand.

### C1 Medium: every URL serves all three views (A)
- /bird-feeds/ contains the book view and the whole Human Food view (`hidden`), including the Industries FAQ. Text
  extracted from /bird-feeds/ (9.0 KB) and /human-food/ (9.0 KB) is nearly the same. Crawlers that don't render, which is most AI
  fetchers, read all of it. Passages get attributed to the wrong URL, and the three URLs look like near-duplicates.
- Fix (Site.astro + main.ts): render the inactive views inside `<template>` and clone them in on the first switch.
  Users see nothing change, and crawlers ignore template content. Run check-sizes.cjs and test view switching afterwards.

### C2 Medium: some FAQ answers can't be lifted out on their own (B)
- "Where can I buy foxtail millet and bird seed in bulk?" starts "Direct from us." and never names the business or Andhra Pradesh.
- "Do you supply quinoa and chia seeds in bulk?" starts "Yes." with no entity, place or "India".
- Lifted out alone, these answers lose who and where. Wording stays, so add new Q&A (client sign-off), for example:
  "Where can I buy bird feed millet in bulk in Andhra Pradesh?" and "Who supplies quinoa and chia seeds in bulk in India?",
  each answer opening with "Rithwik Bird Feeds / Rithwik Industries, Kurnool, Andhra Pradesh ...".

### C3 Medium: the "No. 1" superlative has no evidence (B / C)
- The claim appears only as self-assertion. AI engines rarely repeat a superlative without a third-party source.
- Add, on a new section or page: verifiable support (APEDA or export volumes, named customer regions, a trade-press or
  association mention). Off-site: get the claim stated by someone else (trade directory feature, news).

### B1 Medium: no video, no YouTube presence (C)
- A YouTube search for "Rithwik Bird Feeds" returns no brand videos. The top match is an unrelated channel, "Rithwik Varma
  Gunturi" (pet bird videos), so the name collides.
- Owner: open a "Rithwik Bird Feeds Kurnool" channel with short videos (colour sorter, grading, the Duvvur warehouse), link the site.

### B2 Medium: no Google Business Profile found (C)
- CLAUDE.md lists GBP as still open. Create profiles for the Kurnool office (and the Duvvur warehouse if staffed), with
  NAP exactly as the site, then add the GBP URL to products.ts `profiles`.

### B3 Low: Wikidata / Wikipedia: nothing exists
- Wikidata search "Rithwik": only an unrelated researcher. Wikipedia: 0 hits for "Rithwik Kurnool".
- A Wikipedia article would not meet notability now. A Wikidata item is possible once GBP, IndiaMART and a press
  mention exist as references (C, later).

### S1 Low: more structured-data additions (A)
- Site.astro `business()`: add `location` / a second `Place` for the Duvvur warehouse (14.829389, 78.652194).
- Add `hasCertification` (or `hasCredential`) for FSSAI, APEDA, Spices Board, etc., matching the seals.
- Add `knowsAbout` (foxtail millet, korralu, kangni, bird seed...).
- WebPage `dateModified` from the build time.

## Fine as is
SSR/static HTML (no JS needed for text); sitemap; canonical; single h1; FAQPage matches the visible FAQ; catalogue PDF
has a text layer and Title; security headers don't block bots.

## Not verifiable here
General web search: DuckDuckGo showed a bot challenge, Bing returned unrelated results, Mojeek returned 403. Reddit returned 403.
Justdial and LinkedIn returned 403. Facebook and Instagram are behind login walls. No DataForSEO or visibility tools are configured, so there is no live
ChatGPT/Perplexity citation check.

## audit-data.json (AI Search Readiness)
```json
{"category":"AI Search Readiness","score":63,
 "dimensions":{"citability":68,"structure":65,"multimodal":65,"authority":25,"technical":92},
 "crawlers":{"all_tested_user_agents":"200, no challenge","robots":"all allowed"},
 "llms_txt":"present, well-formed",
 "findings":[
  {"id":"E1","severity":"High","class":"A","title":"foundingDate conflict (1925 on businesses vs 2022/2025)","file":"site/src/components/Site.astro"},
  {"id":"E2","severity":"High","class":"A","title":"Organization name 'Rithwik, Kurnool'; no founder","file":"site/src/components/Site.astro"},
  {"id":"E3","severity":"High","class":"A","title":"Bird Feeds IndiaMART not in sameAs","file":"site/src/data/products.ts"},
  {"id":"E4","severity":"High","class":"C","title":"IndiaMART NAP/name/website mismatches"},
  {"id":"C1","severity":"Medium","class":"A","title":"All three views in every URL's HTML","file":"site/src/components/Site.astro, site/src/scripts/main.ts"},
  {"id":"C2","severity":"Medium","class":"B","title":"Add self-contained FAQ entries for AP bird feed and India quinoa/chia queries"},
  {"id":"C3","severity":"Medium","class":"B","title":"No evidence for No. 1 claim"},
  {"id":"B1","severity":"Medium","class":"C","title":"No YouTube presence; name collision"},
  {"id":"B2","severity":"Medium","class":"C","title":"No Google Business Profile"},
  {"id":"B3","severity":"Low","class":"C","title":"No Wikidata entity"},
  {"id":"S1","severity":"Low","class":"A","title":"Warehouse Place, certifications, knowsAbout, dateModified","file":"site/src/components/Site.astro"}]}
```
