// robots.txt: everything may be crawled and indexed, search engines and AI assistants alike.
// (Search engines only read robots.txt at the root of a domain, so it takes effect once the
// site is on its own domain. Until then, submit the sitemap in Google Search Console.)
import type { APIRoute } from 'astro';
import { siteUrl } from '../data/site-url';

export const GET: APIRoute = ({ site }) =>
  new Response(`# Rithwik Bird Feeds & Rithwik Industries, Kurnool
User-agent: *
Allow: /

Sitemap: ${siteUrl(site)}sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
