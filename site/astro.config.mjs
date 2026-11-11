// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vamsi856.github.io',
  base: '/Projectrithwik',
  trailingSlash: 'ignore',
  image: { layout: 'constrained' },
  // all CSS goes inside the page: no separate stylesheet to wait for before the first paint
  build: { inlineStylesheets: 'always' },
});
