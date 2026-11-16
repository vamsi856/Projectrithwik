# Projectrithwik

Website for **Rithwik Bird Feeds** and **Rithwik Industries**, Kurnool.
Live: **https://rithwikbirdfeeds.com/** (Cloudflare). The old address https://vamsi856.github.io/Projectrithwik/ forwards there.

The site opens as a book. The cover turns to show two pages, Bird Feeds and Human Food, and each page opens a complete
site of its own: header, intro, products with photos, history, certifications, vision and mission with the India map,
how to order, contact form and footer.

| Page | Address |
| --- | --- |
| The book (both businesses) | `/` |
| Rithwik Bird Feeds | `/bird-feeds/` |
| Rithwik Industries (human food) | `/human-food/` |

Each page has its own title, description, canonical address and structured data, so Google can list the two businesses
separately. Switching between them happens in place, without a reload. Old `#bird-feeds` / `#human-food` links still work.

## Search engines and AI assistants

All generated at build time from the site data, so they never go stale:

- `sitemap.xml`: the three pages, with the product photos for Google Images.
- `robots.txt`: everything may be crawled, by search engines and AI crawlers alike.
- `llms.txt`: a plain summary for ChatGPT, Claude, Gemini, Perplexity and others: what the two businesses sell,
  every product and option, facts, certifications, locations and contact.
- Structured data (schema.org JSON-LD) on every page: the family organisation and each business as a LocalBusiness /
  WholesaleStore with address, map pin, phones, emails, GSTIN and its product catalogue.
- Titles and descriptions: `site/src/data/seo.ts`, aimed at what buyers search ("No. 1 foxtail millet supplier in
  India", "bulk millets, quinoa, chia, pulses").
- "Questions buyers ask" on both business pages (`site/src/data/faq.ts`): best foxtail millet supplier, prices, bulk
  buying, local names (korralu, kangni, thinai, navane...), delivery, certifications, contact. Also sent to Google as
  FAQ structured data and included in llms.txt.

Lighthouse (mobile): SEO 100, Accessibility 100, Best practices 100 on all three pages.

### After handover (needs the owner's Google account)

1. **Google Search Console**: done on 16 Nov 2026. `rithwikbirdfeeds.com` is a verified Domain property (owners:
   rithwikbirdfeeds@gmail.com and the developer), `sitemap.xml` is submitted (3 pages found) and indexing was requested
   for the three pages. Searches for "Rithwik Bird Feeds" or "Rithwik Industries Kurnool" usually show the site within
   days to a few weeks. Check Search Console > Pages now and then for problems.
2. **Google Business Profile** (https://business.google.com): one profile per business (or one for the office), with
   the same name, address and phone as the site, the site's address as the website, and photos. This is what puts the
   business on Google Maps and in "near me" results.
   Bing and the other IndexNow engines (Bing feeds ChatGPT search, Copilot and DuckDuckGo) were notified by IndexNow:
   the key file is `site/public/58e39489ee89a3cc49b430cdc34b6822.txt`. After a big change, ping them again with
   `curl -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json' -d '{"host":"rithwikbirdfeeds.com","key":"58e39489ee89a3cc49b430cdc34b6822","urlList":["https://rithwikbirdfeeds.com/","https://rithwikbirdfeeds.com/bird-feeds/","https://rithwikbirdfeeds.com/human-food/"]}'`.
3. **Listings that link back**: IndiaMART, TradeIndia, Justdial and similar directories, plus the company's WhatsApp
   Business profile and any social pages, all pointing to the site. Links from other sites are what lift it for
   general searches like "foxtail millet supplier".

## Hosting: rithwikbirdfeeds.com on Cloudflare

- **Domain**: `rithwikbirdfeeds.com`, registered at Hostinger on 16 Nov 2026, paid until **16 Nov 2029** (renew before
  then). Its nameservers point to Cloudflare (`lamar` / `suzanne.ns.cloudflare.com`), so DNS is managed in Cloudflare.
- **Cloudflare account**: Rithwikbirdfeeds@gmail.com (free plan). The website is the Worker **projectrithwik**
  (Workers & Pages), connected to this GitHub repository: every push to `main` deploys it in about a minute
  (`npx wrangler deploy`, settings in `wrangler.jsonc`). `.assetsignore` keeps the source (`site/`) and these notes
  off the website.
- **Addresses**: `rithwikbirdfeeds.com` is the Worker's custom domain (free HTTPS). `www.rithwikbirdfeeds.com` is sent
  to it by a Redirect Rule (Rules > Redirect Rules, 301). The old GitHub Pages address forwards to the domain,
  keeping the page (`/Projectrithwik/bird-feeds/` opens `/bird-feeds/`).
- **Email**: the domain has no mailboxes. Its DNS says so on purpose (SPF `-all`, DMARC `reject`, empty DKIM) so
  nobody can send mail pretending to be @rithwikbirdfeeds.com. If the business later wants email on the domain
  (Google Workspace, Zoho or Hostinger Mail), replace those three records with the ones the email provider gives.
- The site address lives in one place, `SITE_URL` in `site/astro.config.mjs`: every link, canonical tag, the
  sitemap, robots.txt, llms.txt, the structured data and the catalogue QR code follow it.

### Checking the SEO again

The site was checked with the open-source [Claude SEO](https://github.com/AgriciDaniel/claude-seo) plugin
(16 Nov 2026: no issues on the page checks). To rerun a full audit in Claude Code:

```
/plugin marketplace add AgriciDaniel/claude-seo
/plugin install claude-seo@agricidaniel-claude-seo
/seo setup
/seo audit https://rithwikbirdfeeds.com/
```

## Product catalogue (PDF)

`site/public/Rithwik-Catalogue.pdf` (the site's "Download catalogue" button) is generated from the same data as the
site: 7 A4 pages (cover, who we are, certifications and where we operate, the Rithwik Industries range, the Rithwik
Bird Feeds range, contact with WhatsApp and website QR codes). After changing products, photos or contact details:

```
cd site
npm run catalogue   # rebuilds the PDF (needs Playwright's Chromium)
npm run build
```

## Stack

- [Astro 5](https://astro.build) (static output, TypeScript)
- GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) and Lenis smooth scrolling, three.js for the 3D packs
- Native View Transitions API for switching between the book and the two sites
- Sound: recorded birdsong on Bird Feeds; generated calm music on Human Food (Web Audio, nothing to download)

## Layout

- `site/` is the Astro source. `site/src/components/Site.astro` is the whole page; `site/src/pages/` has one small
  file per address plus the sitemap, robots.txt, llms.txt and manifest.
- The repository root holds the built website (`index.html`, `bird-feeds/`, `human-food/`, `_astro/`, ...), which
  Cloudflare serves from `main` (GitHub Pages serves the same files only to forward the old address). Never edit
  those by hand.

## Editing

- Products, options, photos and contact details: `site/src/data/products.ts`. Photo registry: `site/src/data/commons.json`.
- Certifications: `site/src/data/registrations.ts`. Places on the India map: `site/src/data/network.ts`.
- Family timeline: `site/src/data/legacy.ts`. Search titles and descriptions: `site/src/data/seo.ts`.
- `CLAUDE.md` has the full working notes and the client's decisions.

## Commands

```
cd site
npm install
npm run dev       # local preview at http://localhost:4321/
npm run build     # builds and copies the site to the repository root
```

Commit and push after `npm run build`; Cloudflare puts it live in a minute or two (Workers & Pages > projectrithwik >
Deployments shows each build).
