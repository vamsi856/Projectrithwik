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

Each page has its own title, description and canonical address, so Google can list the two businesses
separately. Switching between them happens in place, without a reload. Old `#bird-feeds` / `#human-food` links still work.
Each address sends only its own content (the other business is fetched when the visitor switches to it), so Google
reads three different pages. Before 16 Nov every address held all three, and Google listed only `/bird-feeds/`.

## Search engines

**The SEO was removed on 17 Nov 2026 at the client's request.** The site stays in Google and Bing, but nothing is
tuned for buyer searches any more:

- Titles and descriptions (`site/src/data/seo.ts`) are just the business names and the town: "Rithwik Bird Feeds",
  "Rithwik Industries", "Rithwik Bird Feeds & Rithwik Industries".
- No structured data (schema.org JSON-LD) and no `llms.txt`. Both were taken out; they are in git history before
  17 Nov if they are ever wanted again.

Still in place, because the site stays listed: `sitemap.xml` (the three pages and their photos), `robots.txt`
(everything may be crawled), the canonical address of each page, and the "Questions buyers ask" section on both
business pages (`site/src/data/faq.ts`), which is page content.

Performance in a local mobile Lighthouse test on 16 Nov: 100 (home), 95 (Bird Feeds), 94 (Human Food).

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

### SEO audit, 16 Nov 2026

(On 17 Nov the client had the keyword titles, the structured data and `llms.txt` removed; see "Search engines"
above. The owner's list below still applies to being found on Google Maps and in directories.)

A full audit with the Claude SEO plugin (technical, content, structured data, speed, mobile, AI search, local
listings, links, and what Google ranks today). What it changed in the code, all invisible to visitors: each address
sends only its own content; the site name, founders, founding year, office and warehouse and a Home > business path
in the structured data; the Bird Feeds hero photo loads first; a week of browser caching for the bird animation and
the birdsong. The full report, the action plan and each specialist's findings are in `site/seo-audit/2026-11-16/`.

What is left is outside the code. In order of effect:

1. **Cloudflare > SSL/TLS > Edge Certificates > Always Use HTTPS: turn it on.** Today `http://rithwikbirdfeeds.com`
   shows the page without moving to `https://`, and `http://www.rithwikbirdfeeds.com` gives an error.
2. **Search Console > URL Inspection > Request indexing** for `/`, `/bird-feeds/` and `/human-food/` after each
   deploy that changes them, so Google reads the new pages soon.
3. **One PIN code everywhere.** The site says 518002. The IndiaMART Bird Feeds listing and a company record say
   518003. Use the one on the GST certificate; if it is 518003 the site changes too (`CONTACT.office` in
   `products.ts` and `officeAddress` in `Site.astro`).
4. **Google Business Profile** for Rithwik Bird Feeds (category "Grain wholesaler", website
   `https://rithwikbirdfeeds.com/bird-feeds/`) and, if Google allows two at one address, Rithwik Industries
   (`/human-food/`). Same name, address and 92455 55556 as the site, photos of the grain and the warehouse, and
   reviews from about ten existing buyers. None could be found on 16 Nov.
5. **Correct the IndiaMART listings and add the website to them.** Rithwik Industries
   (https://www.indiamart.com/rithwikindustries/) shows Ramapuram, Kadapa 516175 and "founded 2025". The Bird Feeds
   listing (https://www.indiamart.com/rithwik-bird-feeds/, if it is the owner's) has PIN 518003 and misspelt products
   ("Foxtile Millet", "Ragi Milet").
6. **Justdial** lists "Rithwik Bird Feeds, Ballary Road, Kurnool": claim it, check the phone (the removed number
   83097 82770 must not be there) and add the website.
7. **Three or four more free listings** (TradeIndia, ExportersIndia), a Facebook / Instagram / YouTube page with the
   website in it, and a link from the websites of customers who have one.
8. **For the developer, from the owner:** opening hours, certificate numbers (FSSAI, APEDA, the ISO standard and who
   issued it) and which of the two firms holds each certificate. (They were meant for the structured data, which
   was removed on 17 Nov; they are still worth showing on the certifications.)

General searches such as "foxtail millet supplier in India" are held by IndiaMART, TradeIndia and similar marketplaces
with one page per product. With three pages and no extra pages (the client's choice), the site can lead for the brand
names, for local-name and place searches (korralu wholesale, millet supplier Kurnool) and on Google Maps; the listings
above are how it reaches the general searches. Only Google Ads puts a site at the top at once.

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
  sitemap, robots.txt and the catalogue QR code follow it.

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
  file per address plus the sitemap, robots.txt and manifest.
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
