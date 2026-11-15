// The app manifest (home-screen name and icons), following the site's address.
import type { APIRoute } from 'astro';
import { BASE } from '../data/site-url';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({
    name: 'Rithwik, Kurnool: Bird Feeds and Human Food',
    short_name: 'Rithwik',
    description: 'Rithwik Bird Feeds and Rithwik Industries, Kurnool: a family grain trade since 1925.',
    start_url: BASE,
    scope: BASE,
    display: 'browser',
    background_color: '#0b1924',
    theme_color: '#0b1924',
    icons: [
      { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2) + '\n', { headers: { 'Content-Type': 'application/manifest+json' } });
