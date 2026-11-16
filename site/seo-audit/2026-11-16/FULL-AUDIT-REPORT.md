# rithwikbirdfeeds.com: full SEO audit (16 Nov 2026)

Audited with the Claude SEO plugin 2.6.2: ten specialist passes over the live site (three pages) and the site's
source. Business type: B2B wholesale supplier with physical premises (Kurnool office, Duvvur warehouse).
No Google, Moz, Bing or analytics credentials were connected, so there is no Search Console, field speed or
backlink-tool data in this audit. Pages were rendered in Chromium without its sandbox (the audit machine runs as
root).

## Scores

These are the plugin's own heuristic scores, not Google's.

| Category | Weight | At audit | After the 16 Nov code changes (estimate) |
|---|---|---|---|
| Technical SEO | 22% | 88 | 93 |
| Content quality | 23% | 55 | 60 |
| On-page SEO | 20% | 78 | 80 |
| Schema / structured data | 10% | 74 | 90 |
| Performance | 10% | 72 | 90 |
| AI search readiness | 10% | 70 | 72 |
| Images | 5% | 85 | 85 |
| **SEO health** | | **74** | **about 80** |

Outside the weighted score, and the real limits on ranking: **local listings 31/100**, **link authority about
10/100** (a domain registered the day of the audit), **search-experience fit 49/100**.

## Top findings

1. **All three addresses served the same HTML** (99.4% the same text; only `hidden` differed). Found by the content,
   search-experience and AI-search passes, and confirmed by Google listing only `/bird-feeds/`. Fixed in code.
2. **Page type does not match what ranks.** For 9 of 11 generic buyer searches, page one is marketplace listings with
   one product per page and a spec line in the title. The client has chosen not to add pages.
3. **No Google Business Profile found**, and the existing IndiaMART listings contradict the site (Ramapuram, Kadapa;
   "founded 2025"; PIN 518003; misspelt products) and do not link to it.
4. **No commercial details on the site**: bag sizes, minimum order, purity, moisture, samples, lead time and payment
   terms each appear zero times.
5. **`http://` does not redirect to `https://`**; `http://www.` returns 522. One Cloudflare switch.
6. **Mobile main-thread time** was high (about 1.7 s total blocking time in a throttled lab run on the live site)
   because every page set up for 3,500 elements. Reduced by finding 1's fix.
7. **Structured data**: weak site name, undefined references between pages, founders and warehouse not modelled,
   an invalid `priceRange`. Fixed in code.
8. **Certifications** are shown without numbers and identically for two legal entities.

## What already worked

Distinct title, description, canonical and one h1 per page; full content in static HTML; valid robots.txt and
sitemap; hreflang and language; real 404; www to apex 301; IndexNow key; security headers; AI crawlers allowed and
served (18 user agents tested, all 200); llms.txt well formed; no layout shift; no overflow on phones; contact
reachable on the first phone screen; name, address and phone identical across text, structured data and links.

## Per-category findings

See `findings/`: `technical.md`, `content.md`, `schema.md`, `performance.md`, `visual.md`, `geo.md`, `agentic.md`,
`local.md`, `backlinks.md`, `sxo.md`. Screenshots are in `screenshots/`. The prioritised list is `ACTION-PLAN.md`.

## Limits of this audit

- Search positions are indicative: the search tool used is not a Google results API, and showed no local pack, ads
  or exact ranks. The site itself returned no results in it on the day.
- Speed figures are lab runs; there is no field data for a new site.
- Justdial, LinkedIn, Facebook and Instagram blocked automated reading, so listings there are unconfirmed.
- The Bird Feeds IndiaMART listing was read by two passes but could not be re-verified, so it is not linked from the
  site's structured data yet.
