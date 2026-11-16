// The site's full address (from astro.config.mjs) and the address of each page, for the files
// that are not HTML pages (sitemap.xml, robots.txt, llms.txt, site.webmanifest).
import { PATHS, type View } from './seo';
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const siteUrl = (site: URL | undefined) => new URL(BASE, site ?? 'https://rithwikbirdfeeds.com').href;
export const pageUrl = (site: URL | undefined, v: View) => `${siteUrl(site)}${PATHS[v]}`;
