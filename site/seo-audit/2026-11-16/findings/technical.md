# Technical SEO: rithwikbirdfeeds.com (2026-11-16). Score 88/100
Works: 200 on all 3 pages, self canonicals, hreflang en-IN/x-default, lang en-IN, index/follow + max-snippet, viewport, one h1, full content in raw HTML (no SPA), 404 page returns real 404 + noindex, www -> apex 301 (path kept), sitemap valid (helper), robots.txt valid, IndexNow key file live (/58e39489...txt), og images 200, old github.io pages carry canonical to new domain.
Findings
- Medium: http:// not redirected in my test (http://rithwikbirdfeeds.com/ and /bird-feeds/ returned 200, no Location). Caveat: my path goes via an egress proxy, so re-test from outside. Fix (C/dashboard): Cloudflare SSL/TLS > Edge Certificates > Always Use HTTPS on.
- Medium: github.io forward is JS-only (location.replace). Old URL returns 200; Google relies on the canonical there (present, correct). Fix (A/C): keep; optionally add <meta http-equiv=refresh> in Site.astro/404.astro for the github.io host; owner can't set 301 on github.io.
- Low: slash-less URLs (/bird-feeds, /human-food, /index.html) redirect with 307 (Cloudflare auto-trailing-slash), not 301/308. Canonicals cover it. Fix (A): add _redirects (/bird-feeds /bird-feeds/ 301, /human-food /human-food/ 301, /index.html / 301) in site/public.
- Low: HSTS max-age=31536000 only; no includeSubDomains/preload. Add in site/public/_headers once all subdomains are HTTPS. No CSP (A, optional; site uses inline scripts so needs hashes).
- Low: pages cache-control max-age=0, must-revalidate: fine for crawl; no issue.
- Low: no /.well-known/security.txt (404). Optional (A).
- Low: TLS could not be verified: cert seen was the sandbox proxy's. Check in SSL Labs.
- Info: home sends 1 JSON-LD block; in-page nav uses anchors and /bird-feeds/ /human-food/ links, crawlable. Three views share one component but each URL has distinct title/desc/canonical/h1, so duplicate risk is low.
