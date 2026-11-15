# Projectrithwik

Website for **Rithwik Bird Feeds** and **Rithwik Industries**, Kurnool.
Live: https://vamsi856.github.io/Projectrithwik/

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
- Titles and descriptions: `site/src/data/seo.ts`.

Lighthouse (mobile): SEO 100, Accessibility 100, Best practices 100 on all three pages.

### To do after handover (needs the owner's Google account)

1. **Google Search Console** (https://search.google.com/search-console): add the site, choose the "HTML tag" method,
   paste the code into `GOOGLE_SITE_VERIFICATION` in `site/src/data/seo.ts`, build and push, press Verify.
   Then submit `sitemap.xml` and use "URL inspection" > "Request indexing" for the three pages.
   Searches for "Rithwik Bird Feeds" or "Rithwik Industries Kurnool" usually show the site within days to a few weeks.
2. **Google Business Profile** (https://business.google.com): one profile per business (or one for the office), with
   the same name, address and phone as the site, the site's address as the website, and photos. This is what puts the
   business on Google Maps and in "near me" results.
3. **Own domain** (recommended): a domain such as `rithwikindustries.com` ranks better than a `github.io` address and
   lets `robots.txt` and `llms.txt` work (crawlers only read them at the root of a domain). See below.
4. **Listings that link back**: IndiaMART, TradeIndia, Justdial and similar directories, plus the company's WhatsApp
   Business profile and any social pages, all pointing to the site. Links from other sites are what lift it for
   general searches like "foxtail millet supplier".

### Moving to its own domain

1. Change `SITE_URL` at the top of `site/astro.config.mjs` to the new address, for example `https://rithwikindustries.com/`.
   Every link, canonical tag, the sitemap, robots.txt, llms.txt and the structured data follow it.
2. For GitHub Pages: add a file `site/public/CNAME` containing just the domain, set the domain in the repository's
   Settings > Pages, and point the domain's DNS at GitHub Pages. HTTPS is free.
3. Build, commit and push. Add the new address in Search Console and submit its sitemap again.

## Product catalogue (PDF)

`site/public/Rithwik-Catalogue.pdf` (the site's "Download catalogue" button) is generated from the same data as the
site: 7 A4 pages (cover, who we are, certifications and where we operate, the Rithwik Industries range, the Rithwik
Bird Feeds range, contact with WhatsApp and website QR codes). After changing products, photos or contact details:

```
cd site
npm run catalogue   # rebuilds the PDF (needs Playwright's Chromium)
npm run build
```

When the site moves to its own domain, run it with `SITE_URL=https://the-domain/ npm run catalogue` so the QR code points there.

## Stack

- [Astro 5](https://astro.build) (static output, TypeScript)
- GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) and Lenis smooth scrolling, three.js for the 3D packs
- Native View Transitions API for switching between the book and the two sites
- Sound: recorded birdsong on Bird Feeds; generated calm music on Human Food (Web Audio, nothing to download)

## Layout

- `site/` is the Astro source. `site/src/components/Site.astro` is the whole page; `site/src/pages/` has one small
  file per address plus the sitemap, robots.txt, llms.txt and manifest.
- The repository root holds the built website (`index.html`, `bird-feeds/`, `human-food/`, `_astro/`, ...), which
  GitHub Pages serves from `main`. Never edit those by hand.

## Editing

- Products, options, photos and contact details: `site/src/data/products.ts`. Photo registry: `site/src/data/commons.json`.
- Certifications: `site/src/data/registrations.ts`. Places on the India map: `site/src/data/network.ts`.
- Family timeline: `site/src/data/legacy.ts`. Search titles and descriptions: `site/src/data/seo.ts`.
- `CLAUDE.md` has the full working notes and the client's decisions.

## Commands

```
cd site
npm install
npm run dev       # local preview at http://localhost:4321/Projectrithwik/
npm run build     # builds and copies the site to the repository root
```

Commit and push after `npm run build`; GitHub Pages picks it up in a minute or two.
