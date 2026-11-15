import { defineConfig } from 'astro/config';

// The site's full address. Change it here (or set SITE_URL when building) when the site moves
// to its own domain, e.g. 'https://rithwikindustries.com/': every link, the canonical tags,
// sitemap.xml, robots.txt, llms.txt and the structured data follow it.
const SITE_URL = process.env.SITE_URL || 'https://vamsi856.github.io/Projectrithwik/';
const url = new URL(SITE_URL);

export default defineConfig({
  site: url.origin,
  base: url.pathname.replace(/\/$/, '') || '/',
  trailingSlash: 'ignore',
  image: { layout: 'constrained' },
  // all CSS goes inside the page: no separate stylesheet to wait for before the first paint
  build: { inlineStylesheets: 'always' },
});
