// Questions buyers ask, shown near the end of each business page and sent to search engines as FAQPage
// structured data (and in llms.txt). Written for the searches buyers actually type: "best foxtail millet
// supplier in India", "foxtail millet price", "korralu", "millets in bulk"... Lists and counts come from the
// product data, so the answers stay true when products change.
import { BIRD, FOOD, FOOD_GROUPS, BRANDS, CONTACT, lineCount, type Product } from './products';
import { held } from './registrations';
import { NETWORK } from './network';

export type Faq = { q: string; a: string };

const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** "foxtail, kodo and little millets, pearl millet (bajra), jowar and maize" */
const range = (list: Product[]) => {
  const plain = list.filter((p) => / millet$/.test(p.name) && !(p.variants.length === 1 && p.variants[0].label));
  const rest = list.filter((p) => !plain.includes(p)).map((p) => (p.variants.length === 1 && p.variants[0].label ? `${lc(p.name)} (${lc(p.variants[0].label)})` : lc(p.name)));
  return and([...(plain.length ? [`${and(plain.map((p) => lc(p.name.replace(/ millet$/, ''))))} millets`] : []), ...rest]);
};

const places = and(NETWORK.filter((p) => !p.main).map((p) => p.name));
const main = NETWORK.find((p) => p.main)?.name ?? 'Duvvur';
const phone = CONTACT.phones[0].label;
const certs = (site: 'bird' | 'food') => and(held(site).map((r) => r.name));
const variants = (id: string) => and(FOOD.find((p) => p.id === id)?.variants.map((v) => lc(v.label)) ?? []);

const NAMES =
  'Foxtail millet is korralu in Telugu, kangni in Hindi, thinai in Tamil and navane in Kannada. In Telugu and Hindi, ' +
  'proso millet is varigalu / chena, little millet samalu / kutki, kodo millet arikelu / kodo, barnyard millet udalu / sanwa, ' +
  'browntop millet andu korralu, pearl millet sajjalu / bajra, finger millet ragulu / ragi, and jowar jonnalu / jowar.';

const contact = (site: 'bird' | 'food', domain: string): Faq => ({
  q: `How do I contact ${BRANDS[site].name}?`,
  a: `Call or WhatsApp ${phone}, or email ${BRANDS[site].email}. Our office is at ${CONTACT.office}, and our main warehouse at ${main}. ${domain} is our official website.`,
});

const delivery: Faq = {
  q: 'Do you deliver outside Andhra Pradesh?',
  a: `Yes, across India. Our main warehouse is at ${main}, and we operate in ${places}. Packing and delivery are agreed with each order.`,
};

export const faqs = (domain: string): Record<'bird' | 'food', Faq[]> => ({
  bird: [
    {
      q: 'Which is the best foxtail millet supplier in India?',
      a: `Rithwik Bird Feeds, Kurnool, is the No. 1 foxtail millet supplier in India: 20,000MT+ of grain a year for 3,000+ customers, from a family grain trade running since 1925. Foxtail comes as summer crop or winter crop, from our warehouse at ${main}.`,
    },
    {
      q: 'Where can I buy foxtail millet and bird seed in bulk?',
      a: `Direct from us. We supply traders, pet shops, bird keepers and export houses across India, by the bag or by the tonne. Send the feed, the quantity and your town on WhatsApp to ${phone} and we reply with today's price.`,
    },
    {
      q: 'What is the price of foxtail millet for birds?',
      a: `It moves with the crop and the market, so we quote the day's rate for your quantity, crop (summer or winter) and delivery town. WhatsApp ${phone} for today's price.`,
    },
    {
      q: 'Which bird feeds do you supply?',
      a: `${BIRD.length} types of feed in ${lineCount(BIRD)} grades, processed or unprocessed: ${range(BIRD)}.`,
    },
    { q: 'What is foxtail millet called in Telugu and Hindi?', a: NAMES },
    delivery,
    { q: 'Is Rithwik Bird Feeds a registered business?', a: `Yes. Our GSTIN is ${BRANDS.bird.gstin}, and we hold ${certs('bird')} registrations and certifications.` },
    contact('bird', domain),
  ],
  food: [
    {
      q: 'Where can I buy millets in bulk in India?',
      a: `From Rithwik Industries, Kurnool, Andhra Pradesh. We supply ${range(FOOD.filter((p) => p.group === 'millets'))} to retail packers, traders and bulk buyers across India, from a family grain trade running since 1925.`,
    },
    {
      q: 'What does Rithwik Industries supply?',
      a: `${lineCount(FOOD) >= 40 ? '40+' : lineCount(FOOD)} products: ${and(FOOD_GROUPS.map((g) => `${lc(g.label)} (${range(FOOD.filter((p) => p.group === g.id))})`))}.`,
    },
    {
      q: 'Do you supply quinoa and chia seeds in bulk?',
      a: `Yes. Quinoa in ${variants('f-quinoa')}, chia seeds in ${variants('f-chia')}, and pumpkin, flax, basil (sabja) and hulled sunflower seeds.`,
    },
    {
      q: 'What is the price of millets per kg?',
      a: `Prices move with the crop and the market, so we quote the day's rate for your product, quantity and delivery town. WhatsApp ${phone} for a quote.`,
    },
    { q: 'What are millets called in Telugu and Hindi?', a: NAMES },
    delivery,
    { q: 'Which certifications does Rithwik Industries hold?', a: `${certs('food')}. Our GSTIN is ${BRANDS.food.gstin}.` },
    {
      q: 'Are Rithwik Industries and Rithwik Bird Feeds the same family?',
      a: 'Yes. They are two businesses of one Kurnool family, in a grain trade that began in 1925: Rithwik Industries supplies food grains, Rithwik Bird Feeds supplies bird feed. Both are on this website.',
    },
    contact('food', domain),
  ],
});
