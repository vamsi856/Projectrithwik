// robots.txt: everything may be crawled and indexed, search engines and AI assistants alike, so the
// businesses can be found on Google and Bing and cited by ChatGPT, Claude, Perplexity and Gemini.
// The AI crawlers get a group of their own so the welcome is explicit; Content-Signal (a Cloudflare
// proposal) states the same for search, AI answers and AI training.
import type { APIRoute } from 'astro';
import { siteUrl } from '../data/site-url';

const AI = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended'];
const SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes';

export const GET: APIRoute = ({ site }) =>
  new Response(`# Rithwik Bird Feeds & Rithwik Industries, Kurnool
# Official website: ${siteUrl(site)}

User-agent: *
${SIGNAL}
Allow: /

# AI search and assistants are welcome to read and cite every page
${AI.map((a) => `User-agent: ${a}`).join('\n')}
${SIGNAL}
Allow: /

Sitemap: ${siteUrl(site)}sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
