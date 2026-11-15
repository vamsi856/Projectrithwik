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
    title: 'Rithwik Bird Feeds & Rithwik Industries, Kurnool | Since 1925',
    description:
      'A Kurnool family grain trade since 1925. Rithwik Bird Feeds: foxtail millet, jowar, sunflower and bird seed. Rithwik Industries: millets, super foods, pulses and spices.',
    ogTitle: 'Rithwik Bird Feeds & Rithwik Industries, Kurnool',
  },
  bird: {
    title: 'Rithwik Bird Feeds, Kurnool | Foxtail Millet & Bird Seed Supplier in India',
    description: `No. 1 foxtail millet supplier in India. ${nBird} types of bird feed in ${gBird} grades, processed or unprocessed: foxtail, proso, kodo and little millets, jowar, bajra, ragi, maize, sunflower and safflower.`,
    ogTitle: 'Rithwik Bird Feeds: foxtail millet and bird seed from Kurnool',
  },
  food: {
    title: 'Rithwik Industries, Kurnool | Millets, Super Foods, Pulses & Spices Supplier',
    description:
      'Millets, quinoa, chia, oil seeds, pulses, spices and cereals from Kurnool, Andhra Pradesh, for retail packers, traders and bulk buyers. 40+ products, a family grain trade since 1925.',
    ogTitle: 'Rithwik Industries: millets, super foods, pulses and spices from Kurnool',
  },
};
