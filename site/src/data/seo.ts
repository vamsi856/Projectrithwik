// The page titles and descriptions, in one place.
// The site's address comes from astro.config.mjs (SITE_URL); every URL below follows it.

export type View = 'book' | 'bird' | 'food';

/** Paste the code from Google Search Console ("HTML tag" method) here to verify the site. */
export const GOOGLE_SITE_VERIFICATION = '';
/** Same for Bing Webmaster Tools (optional). */
export const BING_SITE_VERIFICATION = '';

/** the path of each view, below the site's base */
export const PATHS: Record<View, string> = { book: '', bird: 'bird-feeds/', food: 'human-food/' };

// Plain titles and descriptions: just the business names and the town (client, 17 Nov 2026). The
// keyword titles ("No. 1 Foxtail Millet Supplier in India"...) were taken out on purpose.
export const META: Record<View, { title: string; description: string }> = {
  book: {
    title: 'Rithwik Bird Feeds & Rithwik Industries',
    description: 'Rithwik Bird Feeds and Rithwik Industries, Kurnool, Andhra Pradesh.',
  },
  bird: {
    title: 'Rithwik Bird Feeds',
    description: 'Rithwik Bird Feeds, Kurnool, Andhra Pradesh.',
  },
  food: {
    title: 'Rithwik Industries',
    description: 'Rithwik Industries, Kurnool, Andhra Pradesh.',
  },
};
