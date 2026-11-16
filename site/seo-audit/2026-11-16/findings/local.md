# Local SEO findings (16 Nov 2026) - score 31/100

Business type: hybrid B2B wholesaler (office Kurnool + warehouse Duvvur, sells across India). Vertical: wholesale food grain / bird feed trader.

## NAP on site (consistent across the 3 pages, visible text, JSON-LD, tel/wa.me links)
- Office: 87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost, Kurnool, Andhra Pradesh 518002
- Warehouse: 2/161, 2/162, Sanjivareddypalle, Duvvur, YSR district (visible text and map tab only, NOT in JSON-LD)
- Phones: 92455 55556 (Call + WhatsApp), 88282 82823, 73299 99996. Emails rithwikbirdfeeds@gmail.com / rithwikindustries@gmail.com. 83097 82770 is not on the site or in the schema.
- JSON-LD: Organization "Rithwik, Kurnool" + two LocalBusiness/WholesaleStore nodes with address, geo (15.794046,78.053707), hasMap, areaServed Country India, telephone x3, contactPoint, taxID, parentOrganization. Missing: openingHoursSpecification, warehouse as a second location/department, aggregateRating (correct to omit with no on-site reviews), IndiaMART/Justdial in sameAs for Bird Feeds, Bird Feeds sameAs has only wa.me.
- Maps: iframe is maps.google.com/maps?q=lat,lng&output=embed (a bare coordinate pin, not a Business Profile place card). Directions links use ?api=1&destination=lat,lng. Works, but shows no name/reviews/photos.

## Web presence verified (search + direct fetch; Google/Maps not queryable here)
1. IndiaMART "Rithwik Bird Feeds" https://www.indiamart.com/rithwik-bird-feeds/ : Kurnool, AP, postal code 518003 (site says 518002), proprietor Billakanti Vasavi, GST 37CCDPV9154P1ZK (matches), 7 yrs; products spelled "Foxtile/Faxtile Millet", "Ragi Milet", "Ragullu"; contact numbers are IndiaMART virtual numbers (+91 72854xxxxx), no rithwikbirdfeeds.com anywhere on the page. Not in site sameAs.
2. IndiaMART "Rithwik Industries" https://www.indiamart.com/rithwikindustries/ : address Ramapuram, Kadapa, AP 516175 (site: Kurnool 518002), "founded 2025" (site timeline: 1925), Partnership, B Vasavi (Proprietor), GST 37ABKFR7391G1ZM (matches), 4.0 rating from 5 reviews, 69% response rate, no website link. Virtual phone +91-7942552606. Linked from site sameAs, but no link back.
3. Justdial "Rithwik Bird Feeds, Ballary Road, Kurnool" exists (appears in search; page returns 403 to bots so address/phone/rating could NOT be read). Must be checked by owner for number 83097 82770 and old address.
4. Third-party data pages (not owner-controlled): Trademo (rithwik-bird-feeds/49325800), TheCompanyCheck ("Rithwik Bird Feeds ... registered office Gadwal, Telangana", proprietor Billakanti Vasavi, inc. 30-May-2022), OpenCorpData LEI (87/1404 Telecom Nagar, Ward 87, Kurnool 518003). WorkIndia job ads for "Rithwik bird feeds, Kurnool".
5. Facebook, Instagram, TradeIndia, ExportersIndia, Sulekha: no confirmed pages found (fetches returned generic/blocked pages). Treat as absent until owner confirms.
6. Google Business Profile: could not be verified (Google search/Maps need a browser; no API). README says none yet. No Maps embed with a place ID, no review widget, no GBP link anywhere on site or schema.
7. Reviews: none on site, none in schema. Only visible rating anywhere: IndiaMART Industries 4.0/5 (5 reviews). 
8. Number 83097 82770: not found on any listing I could read (IndiaMART x2 clean; Justdial unreadable; DDG search for the number returned nothing useful).

## Problems
- Critical: no Google Business Profile (the main local-ranking factor; also Maps pin is only coordinates). Class C.
- High: postcode conflict 518002 (site) vs 518003 (IndiaMART, LEI/GST-style records). Owner must confirm the correct one from the GST certificate; then make site, listings and GBP identical. Class C (+A if site changes).
- High: IndiaMART Industries shows Ramapuram, Kadapa, founded 2025, no website; weakens brand/entity and contradicts "Since 1925". Class C.
- High: both IndiaMART profiles and Justdial lack the website URL (no link/NAP-citation signal to the domain). Class C.
- Medium: JSON-LD lacks openingHoursSpecification, warehouse location, and Bird Feeds sameAs list is only WhatsApp. Class A (site/src/components/Site.astro + BRANDS.profiles in products.ts: add IndiaMART Bird Feeds URL, Justdial URL, GBP URL when live; add openingHoursSpecification only after the owner confirms hours; add a second Place/department for Duvvur warehouse).
- Medium: hasMap should be the GBP/place URL once available (currently a directions URL). Class A, after GBP exists.
- Low: three phones in schema `telephone` array; fine, but keep 92455 55556 first. Org name "Rithwik, Kurnool" differs from the two brand names (intended).

## Owner action list (in order)
Use identical text everywhere. Name, Address, Phone below; Website: https://rithwikbirdfeeds.com/bird-feeds/ (Bird Feeds) and https://rithwikbirdfeeds.com/human-food/ (Industries).
1. Google Business Profile for Rithwik Bird Feeds. Name: Rithwik Bird Feeds. Category: Bird food store? No: use primary "Wholesaler" / "Grain wholesaler" (pick the closest offered) and add "Food grain supplier", "Pet food store (wholesale)" as secondary. Address: 87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost, Kurnool, Andhra Pradesh [518002 or confirmed pincode]. Phone: 92455 55556. Website as above. Verify by video/postcard. Add 10+ photos of grain, godown, sacks. Tick "visits by appointment" if no walk-in shop.
2. Google Business Profile for Rithwik Industries: same address and phone, Category "Grain wholesaler" + "Food manufacturer/Spice wholesaler" as offered. Two profiles at one address may need a different suite/landmark and a separate sign or proof; if Google rejects, keep one profile.
3. Warehouse (optional): Duvvur, Sanjivareddypalle, 2/161, 2/162, YSR district; only if staffed and open to visitors.
4. IndiaMART Industries: edit Address to Kurnool office, set year of establishment 1925 (or family trade note in About), add website, phone 92455 55556, category Food grains / Millets wholesaler.
5. IndiaMART Bird Feeds: fix pincode, correct spellings (Foxtail Millet, Ragi), add website, add "Bird feed" products, ask buyers for reviews.
6. Justdial: claim "Rithwik Bird Feeds, Ballary Road, Kurnool" via free listing; check address, make phone 92455 55556, remove 83097 82770 if present, add website and categories. Create a second one for Rithwik Industries.
7. TradeIndia, ExportersIndia, Sulekha: free listings with the same NAP and website.
8. Facebook page and Instagram: name "Rithwik Bird Feeds", website link, same phone; post foxtail millet photos.
9. Ask 10 existing buyers for Google reviews (share the GBP review link on WhatsApp); reply to every review.
10. Correct MCA/credit-data pages (TheCompanyCheck shows Gadwal, Telangana) only if wrong in the GST record.

## Limits
Google Search/Maps/GBP data, Justdial page contents, Facebook/Instagram status and citation volume need a browser or paid tools; not assessed. Proximity not controllable.
