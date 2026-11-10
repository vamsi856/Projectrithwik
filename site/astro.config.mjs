// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vamsi856.github.io',
  base: '/Projectrithwik',
  trailingSlash: 'ignore',
  image: { layout: 'constrained' },
  build: { inlineStylesheets: 'auto' },
});
