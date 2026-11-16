# Visual / mobile rendering (lab, Chromium 375x812 @2x and 1920x1080, 16 Nov 2026)
Screenshots: screenshots/{home,bird-feeds,human-food}/rithwikbirdfeeds_com_{desktop,laptop,tablet,mobile}.png; JS-off and extra checks in screenshots/extra/.
Score: 86/100.

## Works
- No horizontal overflow at 375 or 1920 on any page (scrollWidth = viewport). Wide elements found are canvases/marquee clipped by overflow.
- h1 exists once per page, visible at opacity 1, inside the first 812px on mobile (bird-feeds top 562, human-food top 583). Home h1 is a 1px visually-hidden h1 (sr-only), fine for SEO.
- JS disabled: all content is in the DOM and readable (bird-feeds 8.6k chars, human-food 9.1k). No intro animation hides content. Reduced motion: identical layout, no hidden content.
- No cookie banner, modal or intro overlay covering content.
- Phone and WhatsApp reachable above the fold on mobile on all pages (header phone icon button 42x42 tel:+919245555556, floating WhatsApp 100px).

## Findings
1. Medium: floating sound button and WhatsApp button cover hero paragraph text on phones (bird-feeds and human-food, mobile.png; sound button over "processed", WhatsApp over the corner). They are position:fixed so it recurs at every scroll position. Evidence: bird-feeds_mobile.png at y~1385-1480 (2x px). Fix (A): in site/src/styles/v2.css give the hero text on <=480px a right padding of ~84px, or shrink the sound button to 40px and place it beside, not above, the WhatsApp button. Does not change wording or design.
2. Medium: Bird Feeds hero primary CTA "See the feeds" starts at y=855 on 375x812 (below the fold; only its top edge peeks). The visible CTAs are the header phone icon and WhatsApp float, so contact is OK but the primary button is not. Fix (A): on phones reduce hero pack height slightly in v2.css (pack block ~560px tall) so the button clears 812px. Human-food similar (Browse the range at ~y=788 top, clipped at the fold).
3. Low: phone number as text is not shown on mobile Bird Feeds header; the top bar shows 88282 82823 and 73299 99996 (tel links, 72x20 and 79x20 px, 12.5px font), not 92455 55556 which CLAUDE.md says is used everywhere. Check this is intended (the number the client wants to rank/convert on is only an icon on this page). Human Food top bar shows 92455 55556. Class A (data/products.ts CONTACT) after owner confirms.
4. Low: tap targets below 44px on phones: top-bar phone/email links (20px high), "Ask price"/"Order" buttons (86-91 x 33-34px), several chip/filter buttons 29px high, "Ask for this mix" 134x40. Mostly 33-40px; none overlap. Fix (A): min-height:44px on .btn in product cards (v2.css), top-bar links padding 12px vertical.
5. Low: small text on phones: 11.5-12.5px (pager "01 / 18", "Large parrot"/"Medium parrot" labels, top bar contacts, "Pick a name or drag the ring"). Body copy is 16px+. Raise these to 13-14px (A).
6. Low: JS off: Bird Feeds hero shows an empty area where the 3D pack would be (bird-feeds_nojs_m.png), and the home page shows only the closed cover with "Open the book" while the real /bird-feeds/ and /human-food/ links sit under it. Googlebot renders JS so crawling is unaffected; only affects no-JS visitors. Fix (A): small <noscript> style to show the static pack image / hide the cover.

## Notes
- Chromium ran without its sandbox in this container (known, per brief).
- Timings and rendering are lab estimates, not real devices.
