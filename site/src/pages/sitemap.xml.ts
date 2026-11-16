// sitemap.xml: the three pages, each with the product photos shown on it (for Google Images).
import type { APIRoute } from 'astro';
import { BIRD, FOOD, type Product } from '../data/products';
import { photo } from '../data/photos';
import { pageUrl } from '../data/site-url';
import type { View } from '../data/seo';
import { INFO_PAGES } from '../data/pages';
import { siteUrl } from '../data/site-url';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const today = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = ({ site }) => {
  const abs = (u: string) => new URL(u, site ?? 'https://rithwikbirdfeeds.com').href;
  const images = (items: Product[]) =>
    [...new Set(items.flatMap((p) => [p.photo, ...p.variants.map((v) => v.photo)]).filter(Boolean) as string[])]
      .map((k) => photo(k))
      .filter((p) => p !== undefined)
      .map((p) => `    <image:image><image:loc>${esc(abs(p!.src))}</image:loc></image:image>`)
      .join('\n');
  const url = (v: View, priority: string, imgs = '') => `  <url>
    <loc>${esc(pageUrl(site, v))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>${imgs ? '\n' + imgs : ''}
  </url>`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url('book', '1.0')}
${url('bird', '0.9', images(BIRD))}
${url('food', '0.9', images(FOOD))}
${INFO_PAGES.map((p) => `  <url>\n    <loc>${esc(siteUrl(site) + p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${p.path.includes('products') ? '0.8' : '0.6'}</priority>\n  </url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
