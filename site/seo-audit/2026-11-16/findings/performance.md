# Performance findings (lab estimates, Lighthouse 13.6.0 run locally via npx; PSI keyless quota exhausted, no CrUX/field data)
Chrome was run with --no-sandbox (container runs as root, known). Lab numbers are not a real phone; mobile = Lighthouse default 4x CPU + slow 4G emulation.

| Page | Mobile score | LCP | TBT | CLS | Desktop score | LCP | TBT |
|---|---|---|---|---|---|---|---|
| / | 71 | 1.2s | 1690ms | 0 | 99 | 0.3s | 10ms |
| /bird-feeds/ | 72 | 1.8s | 1750ms | 0 | 94 | 0.4s | 200ms |
| /human-food/ | 72 | 1.1s | 1800ms | 0 | 100 | 0.4s | 0 |

Weight (mobile, transfer): / 21 req 1012KB; bird-feeds 25 req 1361KB; human-food 27 req 651KB. Doc 69KB br; fonts 5 files 87KB; JS 98-236KB (main ~86KB br, pack3d 138KB br); fetch() of flock sprites 644-797KB (birds/macaw-hq-*.webp, scarlet-hq-*.webp).
LCP element: bird-feeds = hero img section#b-top .bird__photo img (budgies AVIF 20KB; it has loading=lazy + fetchpriority=high). Subparts: TTFB 293, load delay 110, load duration 106, render delay 261ms. Home/food LCP is text/emblem, subparts TTFB ~330-365ms, render delay ~345ms.
No render-blocking resources, fonts preloaded + font-display swap, no third parties except Cloudflare's auto-injected beacon.
Cache: /_astro/* and /fonts/* immutable 1y. /img/*, /birds/*, catalogue PDF, webmanifest: max-age=0 must-revalidate. HTML brotli, HTTP/2, HTTP/3.
Issues: see final report.
