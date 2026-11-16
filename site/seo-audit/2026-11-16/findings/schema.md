# Schema / structured data: rithwikbirdfeeds.com (audit 2026-11-16)

Score: 74/100. Source: components/Site.astro lines 55-104 (one `<script type="application/ld+json">` per page, `@graph`), data in products.ts (CONTACT, BRANDS), faq.ts.

## Detected (raw HTML, server-rendered, 1 block per page, all valid JSON, @context https://schema.org, no Microdata/RDFa)
| Page | Nodes in @graph |
|---|---|
| / | WebSite, WebPage, Organization (#family), LocalBusiness+WholesaleStore x2 (bird, food) |
| /bird-feeds/ | WebSite, WebPage, Organization, FAQPage (8 Q), LocalBusiness (bird only) |
| /human-food/ | WebSite, WebPage, Organization, FAQPage (9 Q), LocalBusiness (food only) |

## Consistency (verified against visible HTML)
Pass: address (87/1404 Dhanalakshmi Nagar, Kurnool 518002), 3 phones (+919245555556 / 8828282823 / 7329999996 all visible as tel: links), emails, GSTINs, geo 15.794046,78.053707 (= CONTACT.officeAt = map pin), hasMap, canonical/URL per page, absolute https URLs, @id scheme, parent/sub links, IndiaMART sameAs (visible link on home/food), founders' names visible (legacy 2022 dot). No placeholders. FAQ text matches visible FAQ (same data).

## Findings

1. **FAQPage (Info, A)**. Google retired FAQ rich results for all sites (7 May 2026). No SERP benefit; AI/GEO benefit unconfirmed. Not an error, harmless since it mirrors visible content. Keep or drop at no cost; do not spend more effort. Do not add FAQPage to `/`.

2. **Dangling @id references on the two inner pages (Medium, A)**. Organization#family lists `subOrganization` of both `/bird-feeds/#business` and `/human-food/#business`, but each inner page defines only its own business node. Cross-document @id refs are legal, but Google parses per page, so the sibling is an undefined node there. Fix in Site.astro `family`: on each inner page list only the nodes in the graph (or inline `{@type, @id, name, url}` for the sibling).

3. **Entity naming is weak for the brand queries (High, A)**. WebSite.name and Organization.name = "Rithwik, Kurnool" (and og:site_name). That is not a brand anyone searches; Google's site-name logic uses WebSite.name, and the home title is "Rithwik Bird Feeds & Rithwik Industries, Kurnool". Fix: WebSite `name: "Rithwik Bird Feeds & Rithwik Industries"`, `alternateName: ["Rithwik Bird Feeds","Rithwik Industries","Rithwik Kurnool"]`; Organization name the same. (Changes og:site_name only if you also change the meta, which is invisible.) Client wording on the page is untouched.

4. **No BreadcrumbList (Medium, A)**. Inner pages are one level deep; a breadcrumb gives a "rithwikbirdfeeds.com > Bird Feeds" path in results. Ready JSON-LD below.

5. **Parent Organization is thin (Medium, A)**. It has no `email`, `sameAs`, `contactPoint`, `foundingDate`, `founder`, `legalName`. `foundingDate: 1925` sits on each LocalBusiness (Site.astro line 83) but the 1925 family trade is the Organization. Logo on the parent is the Industries emblem (food logo) and uses a hashed `_astro/...` URL that changes at every rebuild. Fix: add the fields below; use a stable logo URL such as `https://rithwikbirdfeeds.com/icon-512.png` (exists in public/; confirm it is the logo, at least 112x112, and not cropped).

6. **Founders not modelled (Medium, A)**. Names and photo are visible ("Bysani Vasavi and Bysani Sudheer, founders of Rithwik"). Add as `founder` Person (JSON below). Add only name, no jobTitle/birth data the page does not show. Image: `https://rithwikbirdfeeds.com/img/founders-circle-480.webp`.

7. **Warehouse not modelled (Medium, A)**. The main warehouse at Duvvur (2/161, 2/162, Sanjivareddypalle, Duvvur, YSR district; 14.829389,78.652194) is visible and a map tab, but absent from schema. Add as a second `Place` in `location` of the Organization (JSON below). Do not make it a second LocalBusiness (a warehouse is not a public store; it would split the entity).

8. **priceRange "Ask for a quote" (Low, A)**. Google expects a currency range like "₹₹" or "₹40-₹120"; free text is ignored or flagged by validators. Remove the property (Site.astro line 69), or use "₹₹" only if the client agrees.

9. **Offers have no item and no price (Medium, A)**. `hasOfferCatalog` lists 12 (bird) / ~40 (food) `Offer` objects with just name/description and `availability: InStock`. Issues: (a) an Offer should carry `itemOffered`; (b) `InStock` for made-to-order bulk grain is a claim the page does not make: confirm with the client or drop `availability`; (c) with no price this will never qualify for Product or merchant-listing rich results, so do not expect a SERP feature. The value is entity understanding of "foxtail millet / korralu". Fix in Site.astro line 81: wrap as `Offer` -> `itemOffered: {@type: Product, name, category, image?, brand}`; no `price`. Do NOT invent prices or add AggregateRating/Review (none exist on the page; that would violate Google's policies). If real per-product pages are ever built (class B), Product + `Offer` with `priceSpecification` (MinPrice, per quintal) only if prices are published.

10. **sameAs mostly empty (Medium, C then A)**. bird has only `wa.me` (a chat link, not a profile; Google ignores it for entity linking, harmless). Food has IndiaMART (not fetched by me; confirm it resolves). Once the owner creates Google Business Profile, Justdial, TradeIndia, LinkedIn, Facebook, Instagram, YouTube, add them in `BRANDS[...].profiles` (products.ts, as its comment says) and to the Organization. Nothing to add now that I can verify exists.

11. **primaryImageOfPage is a bare string (Low, A)**. Expected type is ImageObject. Use `{ "@type":"ImageObject", "url":..., "width":1200, "height":630 }` (dimensions per og:image:width/height meta; I did not decode the JPEGs).

12. **No openingHoursSpecification (Medium, B/C)**. Not on the page; Google's LocalBusiness guidance lists it as recommended. Needs the client's real hours first; do not guess. Same gate for GBP.

13. **alternateName contains misspellings (Low, A)**. "Rithvik", "Ritwik" appear only in JSON-LD, never on the page. Reasonable for a name people mistype, and low risk, but it is the only invisible text in the block; keep to 2-3 variants.

14. **LocalBusiness x2 at one address, identical phones/geo (Low, A)**. Acceptable (two brands, two GSTINs, parent links). Make sure Google Business Profile is ONE listing, or two clearly distinct ones; mismatched NAP across them will confuse local ranking. `telephone[0]` is the WhatsApp number: fine.

## Checked and fine
@context https; no deprecated types (no HowTo, SpecialAnnouncement); WebSite/WebPage/Organization/LocalBusiness subtype WholesaleStore valid; ISO dates not needed; URLs absolute; one H1 per page; per-page canonical equals JSON-LD url. WebSite SearchAction: do not add (no site search; Google removed the sitelinks searchbox).

## Ready JSON-LD (class A: edit `schema` in Site.astro; all values are already on the page or in the data files)

BreadcrumbList for /bird-feeds/ (same shape for /human-food/ with name "Human Food" and url /human-food/; omit on `/`):
```json
{"@type":"BreadcrumbList","@id":"https://rithwikbirdfeeds.com/bird-feeds/#breadcrumb","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Home","item":"https://rithwikbirdfeeds.com/"},
 {"@type":"ListItem","position":2,"name":"Rithwik Bird Feeds","item":"https://rithwikbirdfeeds.com/bird-feeds/"}]}
```
(and add `"breadcrumb":{"@id":".../#breadcrumb"}` to that page's WebPage node; for the human-food page use name "Rithwik Industries").

WebSite + Organization upgrade (replaces the current two nodes):
```json
{"@type":"WebSite","@id":"https://rithwikbirdfeeds.com/#site","url":"https://rithwikbirdfeeds.com/","name":"Rithwik Bird Feeds & Rithwik Industries","alternateName":["Rithwik Bird Feeds","Rithwik Industries","Rithwik Kurnool"],"inLanguage":"en-IN","publisher":{"@id":"https://rithwikbirdfeeds.com/#family"}},
{"@type":"Organization","@id":"https://rithwikbirdfeeds.com/#family","name":"Rithwik Bird Feeds & Rithwik Industries","url":"https://rithwikbirdfeeds.com/","logo":{"@type":"ImageObject","url":"https://rithwikbirdfeeds.com/icon-512.png","width":512,"height":512},"description":"A Kurnool family grain trade that began in 1925, today Rithwik Bird Feeds and Rithwik Industries.","foundingDate":"1925","foundingLocation":{"@type":"Place","name":"Kurnool, Andhra Pradesh"},"telephone":"+919245555556","email":"rithwikbirdfeeds@gmail.com",
 "address":{"@type":"PostalAddress","streetAddress":"87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost","addressLocality":"Kurnool","addressRegion":"Andhra Pradesh","postalCode":"518002","addressCountry":"IN"},
 "location":[
  {"@type":"Place","name":"Rithwik head office, Kurnool","address":{"@type":"PostalAddress","streetAddress":"87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost","addressLocality":"Kurnool","addressRegion":"Andhra Pradesh","postalCode":"518002","addressCountry":"IN"},"geo":{"@type":"GeoCoordinates","latitude":15.794046,"longitude":78.053707}},
  {"@type":"Place","name":"Rithwik main warehouse, Duvvur","address":{"@type":"PostalAddress","streetAddress":"2/161, 2/162, Sanjivareddypalle","addressLocality":"Duvvur","addressRegion":"Andhra Pradesh","addressCountry":"IN"},"geo":{"@type":"GeoCoordinates","latitude":14.829389,"longitude":78.652194}}],
 "founder":[
  {"@type":"Person","name":"Bysani Vasavi","image":"https://rithwikbirdfeeds.com/img/founders-circle-480.webp"},
  {"@type":"Person","name":"Bysani Sudheer","image":"https://rithwikbirdfeeds.com/img/founders-circle-480.webp"}],
 "subOrganization":[{"@id":"https://rithwikbirdfeeds.com/bird-feeds/#business"},{"@id":"https://rithwikbirdfeeds.com/human-food/#business"}],
 "sameAs":["https://www.indiamart.com/rithwikindustries/"]}
```
Notes: the phone/email shown on the parent should follow the client's decision on which mailbox is primary (two Gmail addresses exist, one per brand); the warehouse postal code is not on the page, so none is given. Only the `family` Organization carries the Industries IndiaMART link, which is a visible link on food/home; put it on the bird page only if the page also shows it.

Offer detail (replace the item in `hasOfferCatalog.itemListElement`, no price, no availability unless the client confirms stock):
```json
{"@type":"Offer","businessFunction":"http://purl.org/goodrelations/v1#Sell","itemOffered":{"@type":"Product","name":"Foxtail millet","description":"Foxtail millet: Summer crop, Winter crop","category":"Millets","brand":{"@id":"https://rithwikbirdfeeds.com/bird-feeds/#business"}}}
```
ImageObject for the page image:
```json
"primaryImageOfPage":{"@type":"ImageObject","url":"https://rithwikbirdfeeds.com/og-bird.jpg","width":1200,"height":630}
```
Remove `"priceRange":"Ask for a quote"`. Add to each LocalBusiness `"openingHoursSpecification"` only after the client supplies hours.
