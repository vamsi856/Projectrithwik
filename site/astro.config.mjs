import { defineConfig } from 'astro/config';

// The site's full address (served by the Cloudflare Worker "projectrithwik"). Every link, the
// canonical tags, sitemap.xml, robots.txt, llms.txt and the structured data follow it.
// The old GitHub Pages address (vamsi856.github.io/Projectrithwik/) forwards here.
const SITE_URL = process.env.SITE_URL || 'https://rithwikbirdfeeds.com/';
const url = new URL(SITE_URL);

export default defineConfig({
  site: url.origin,
  base: url.pathname.replace(/\/$/, '') || '/',
  trailingSlash: 'ignore',
  image: { layout: 'constrained' },
  // all CSS goes inside the page: no separate stylesheet to wait for before the first paint
  build: { inlineStylesheets: 'always' },
});
