// Everything search engines and AI assistants read about the site, in one place.
// The site's address comes from astro.config.mjs (SITE_URL); every URL below follows it.
import { BIRD, FOOD, lineCount } from './products';

export type View = 'book' | 'bird' | 'food';

/** Paste the code from Google Search Console ("HTML tag" method) here to verify the site. */
export const GOOGLE_SITE_VERIFICATION = '';
/** Same for Bing Webmaster Tools (optional). */
export const BING_SITE_VERIFICATION = '';

/** the path of each view, below the site's base */
export const PATHS: Record<View, string> = { book: '', bird: 'bird-feeds/', food: 'human-food/' };

const nBird = BIRD.length, gBird = lineCount(BIRD);

export const META: Record<View, { title: string; description: string; ogTitle: string }> = {
  book: {
    title: 'Rithwik Bird Feeds & Rithwik Industries, Kurnool',
    description:
      'Official website of Rithwik Bird Feeds and Rithwik Industries, Kurnool, since 1925: foxtail millet, bird seed, millets, quinoa, chia, pulses and spices in bulk.',
    ogTitle: 'Rithwik Bird Feeds & Rithwik Industries, Kurnool',
  },
  bird: {
    title: 'No. 1 Foxtail Millet Supplier in India | Rithwik Bird Feeds',
    description: `India's No. 1 foxtail millet (korralu) supplier, Kurnool. ${nBird} bird feeds in ${gBird} grades, processed or unprocessed, in bulk across India. WhatsApp 92455 55556.`,
    ogTitle: 'Rithwik Bird Feeds: foxtail millet and bird seed from Kurnool',
  },
  food: {
    title: 'Bulk Millets, Quinoa & Chia Supplier | Rithwik Industries',
    description:
      'Bulk millets, quinoa, chia, oil seeds, pulses and spices from Kurnool for retail packers, traders and bulk buyers across India. 40+ products, since 1925.',
    ogTitle: 'Rithwik Industries: millets, super foods, pulses and spices from Kurnool',
  },
};
