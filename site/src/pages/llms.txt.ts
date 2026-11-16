// llms.txt (llmstxt.org): a plain summary of the business for AI assistants such as ChatGPT,
// Claude, Gemini and Perplexity, built from the same data as the site so it never goes stale.
import type { APIRoute } from 'astro';
import { BIRD, FOOD, BIRD_GROUPS, FOOD_GROUPS, BRANDS, CONTACT, lineCount, type Product } from '../data/products';
import { REGISTRATIONS } from '../data/registrations';
import { LEGACY } from '../data/legacy';
import { NETWORK } from '../data/network';
import { pageUrl, siteUrl } from '../data/site-url';
import { faqs } from '../data/faq';

const range = (items: Product[], groups: readonly { id: string; label: string }[]) =>
  groups
    .map((g) => {
      const ps = items.filter((p) => p.group === g.id);
      if (!ps.length) return '';
      const lines = ps.map((p) => {
        const opts = p.axes?.length ? p.axes.map((a) => `${a.name}: ${a.options.join(', ')}`).join('; ') : p.variants.map((v) => v.label).filter(Boolean).join(', ');
        return `- ${p.name}${opts ? ` (${opts})` : ''}`;
      });
      return `### ${g.label}\n${lines.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');

const certs = (site: 'bird' | 'food') => REGISTRATIONS.filter((r) => r.held && r.for.includes(site)).map((r) => r.name).join(', ');

export const GET: APIRoute = ({ site }) => {
  const S = siteUrl(site), bird = pageUrl(site, 'bird'), food = pageUrl(site, 'food');
  const main = NETWORK.find((p) => p.main)!;
  const body = `# Rithwik Bird Feeds & Rithwik Industries, Kurnool

> A family grain trade from Kurnool, Andhra Pradesh, India, that began in 1925. Today it runs as two businesses: Rithwik Bird Feeds (millets, jowar, maize, sunflower and safflower for birds; the No. 1 foxtail millet supplier in India) and Rithwik Industries (millets, super foods, oil seeds, pulses, spices and cereals for people). Both clean, sort and grade at their own processing unit and supply processed or unprocessed, in bulk, across India and for export.

Key facts:
- Family grain trade since 1925; Rithwik Bird Feeds and Rithwik Industries since 2022.
- Annual production: 20,000 MT+.
- Customers: 3,000+ (traders, pet shops, bird keepers, export houses, retail packers and bulk buyers).
- Rithwik Bird Feeds: ${BIRD.length} types of feed in ${lineCount(BIRD)} grades. Rithwik Industries: 40+ products.
- Main warehouse: ${main.name} (${CONTACT.warehouse}). Office: ${CONTACT.office}.
- Operating in: ${NETWORK.map((p) => p.name).join(', ')}.
- Prices are given on request (by phone, WhatsApp or the order form); they change with the crop and the season.

Mission: to connect farmers directly with industries by sourcing quality agricultural produce, ensuring proper cleaning, grading and processing, and delivering products that meet the specific requirements of every customer. Goal: empower farmers, ensure quality, and make the right products reach the right industries in the right way.

## Pages

- [Rithwik Bird Feeds](${bird}): bird feed grains, processed or unprocessed, for traders, pet shops, bird keepers and export houses.
- [Rithwik Industries](${food}): food staples for retail packers, traders and bulk buyers.
- [Home](${S}): both businesses, the family story since 1925 and where they operate.
- [Product catalogue (PDF)](${S}Rithwik-Catalogue.pdf)

## Contact

- Phone and WhatsApp: ${CONTACT.call.label} (+91), also ${CONTACT.phones.slice(1).map((p) => p.label).join(' and ')}
- [WhatsApp ${CONTACT.call.label}](https://wa.me/${CONTACT.whatsapp})
- Email: ${BRANDS.bird.email} (Bird Feeds), ${BRANDS.food.email} (Industries)
- [Office](${CONTACT.directions}): ${CONTACT.office}
- [Warehouse](${CONTACT.warehouseDirections}): ${CONTACT.warehouse}
- GSTIN: ${BRANDS.bird.gstin} (Rithwik Bird Feeds), ${BRANDS.food.gstin} (Rithwik Industries)
- Also spelled: Rithvik / Ritwik Bird Feeds, Rithvik / Ritwik Industries
- [Official website](${siteUrl(site)}): the only official website of both businesses${[...BRANDS.bird.profiles, ...BRANDS.food.profiles].map((u) => `\n- [Also listed on ${new URL(u).hostname.replace(/^www\./, '')}](${u})`).join('')}

## Certifications and registrations

- Rithwik Bird Feeds: ${certs('bird')}
- Rithwik Industries: ${certs('food')}

## Rithwik Bird Feeds range

${range(BIRD, BIRD_GROUPS)}

## Rithwik Industries range

${range(FOOD, FOOD_GROUPS)}

## Questions buyers ask
${(() => { const F = faqs(new URL(S).host); return [...F.bird, ...F.food.filter((f) => !F.bird.some((b) => b.q === f.q || b.a === f.a))].map((f) => `### ${f.q}\n${f.a}`).join('\n\n'); })()}

## History

${LEGACY.map((l) => `- ${l.year}: ${l.person}, ${l.firm}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
