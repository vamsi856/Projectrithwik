// Records the website frame by frame for the ad (see clock.js for how).
//
//   cd site && npx astro build            # the site to record (site/dist)
//   cd video && node capture/record.cjs   # all clips, 4K (3840x2160), 25 fps
//   node capture/record.cjs bird --scale 1   # one clip, 1920x1080, for a quick look
//
// Writes public/footage/<clip>.mp4 and public/footage/manifest.json (frame counts, the named
// segments of each clip and where the clicks happened), which the Remotion edit reads.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, '..', 'site', 'dist');
const OUT = path.join(ROOT, 'public', 'footage');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const FPS = Number(opt('fps', 25));
const SCALE = Number(opt('scale', 2)); // 2: a 1920x1080 page recorded at 3840x2160
const only = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

/* ------------------------------------------------------------------ the clips */
// A clip is one page load. Its segments follow each other: `y` is where the page is scrolled at the
// start of the segment (a CSS selector plus offset, or pixels; it jumps there at once), `to` is
// where it eases to by the end (default: stays), `s` is the length in seconds. `click` presses an
// element at `at` seconds into the segment. The edit cuts between segments.
const CLIPS = {
  // the book opens by itself, then Bird Feeds is picked from it
  open: { path: '/', segments: [
    { name: 'book', y: 0, s: 5.6 },
    { name: 'turn', y: 0, s: 7.4, click: { sel: '.cover__back[data-enter=bird]', at: 0 } },
  ] },
  bird: { path: '/bird-feeds/', segments: [
    { name: 'hero', y: 0, s: 6 },
    { name: 'about', y: ['.facts', -118], to: ['.facts', -70], s: 6.5 },
    { name: 'legacy', y: ['.legacy', -250], to: ['.legacy', -190], s: 5 },
    { name: 'packs', y: ['#b-packs', -100], s: 4.5 },
    { name: 'birds', y: ['#b-birds', 0], to: ['#b-birds', 260], s: 4.5 },
    { name: 'feeds', y: ['#b-feeds', 0], to: ['#b-feeds', 900], s: 6 },
    { name: 'story', y: ['#b-story', 0], to: ['#b-story', 1700], s: 7 },
    { name: 'vision', y: ['#b-vision', -70], to: ['#b-vision', 0], s: 6 },
    { name: 'certs', y: ['#b-certs', 0], s: 4 },
  ] },
  food: { path: '/human-food/', segments: [
    { name: 'hero', y: 0, s: 6 },
    { name: 'about', y: ['.facts', -118], to: ['.facts', -40], s: 5.5 },
    { name: 'packs', y: ['#f-packs', -100], s: 4.5 },
    { name: 'range', y: ['#f-range', 0], to: ['#f-range', 1100], s: 7 },
    { name: 'story', y: ['#f-story', 0], to: ['#f-story', 1500], s: 6 },
    { name: 'vision', y: ['#f-vision', -70], to: ['#f-vision', 0], s: 5.5 },
  ] },
};

/* ------------------------------------------------------------------ a small server for site/dist */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(DIST, path.normalize(p));
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/* ------------------------------------------------------------------ helpers */
// a calm ease: slow start, slow finish
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));

// what the recording leaves out: the sound button (there is no tapping in a video), the
// floating WhatsApp button (the end card carries the number) and scrollbars
const CAPTURE_CSS = `
  .sound, [data-sound-nudge], aside[aria-label="WhatsApp"] { display: none !important; }
  html { scrollbar-width: none !important; } ::-webkit-scrollbar { display: none !important; }
`;

/** Moves the page's clock one step; returns where the page is scrolled (for the screenshot clip). */
async function step(page, ms) {
  return page.evaluate(async (ms) => { window.__vt.advance(ms); await window.__vt.painted(); return [scrollX, scrollY]; }, ms);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(page, fn, label, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await page.evaluate(fn).catch(() => false)) return; await sleep(150); }
  throw new Error(`timed out waiting for ${label}`);
}
// lazy photos load at once (no warm-up scroll, which would set off the scroll animations early)
async function loadPhotos(page) {
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  await until(page, () => [...document.images].every((i) => i.complete), 'photos', 60000).catch((e) => console.warn('  ', e.message));
}
async function resolveY(page, y) {
  if (typeof y === 'number') return y;
  return page.evaluate(([sel, off]) => {
    const el = document.querySelector(`[data-site]:not([hidden]) ${sel}`) || document.querySelector(sel);
    if (!el) throw new Error('no ' + sel);
    return Math.round(el.getBoundingClientRect().top + scrollY + off);
  }, y);
}

function encoder(file) {
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    // Chrome's JPEGs are full-range BT.601: convert to broadcast-range BT.709
    '-vf', 'scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-g', String(FPS), '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, no) => ff.on('close', (c) => (c === 0 ? ok() : no(new Error('ffmpeg exited ' + c)))));
  return { write: (buf) => new Promise((ok) => (ff.stdin.write(buf) ? ok() : ff.stdin.once('drain', ok))), end: () => { ff.stdin.end(); return done; } };
}

/* ------------------------------------------------------------------ one clip */
async function record(browser, base, name, clip) {
  const t0 = Date.now();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE, reducedMotion: 'no-preference', colorScheme: 'light' });
  await ctx.addInitScript({ path: path.join(__dirname, 'clock.js') });
  await ctx.addInitScript((css) => {
    try { localStorage.setItem('rithwik-sound-v2', '0'); } catch {}
    document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
  }, CAPTURE_CSS);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.warn(`   [${name}] page error:`, e.message));
  const cdp = await ctx.newCDPSession(page);

  // ?gl=3d: the site's own switch for the 3D packs
  await page.goto(`${base}${clip.path}?gl=3d`, { waitUntil: 'load' });
  await loadPhotos(page);
  // wake the page's scripts: boot.ts waits for one animation frame, then a timer
  await step(page, 1000 / FPS); await step(page, 1000 / FPS);
  await until(page, () => performance.getEntriesByType('resource').some((e) => /\/_astro\/main\./.test(e.name)), 'main script');
  await sleep(1500);
  if (name === 'open') {
    // a visitor's first move fetches the two sites (main.ts warmBook); then their photos load
    await page.mouse.move(960, 900);
    await until(page, () => !!document.querySelector('[data-site=bird] .sbar') && !!document.querySelector('[data-site=food] .sbar'), 'the two sites');
    await loadPhotos(page);
    // the scarlet macaw sheets, so the hero flock has them when Bird Feeds opens
    await page.evaluate(() => Promise.all([0, 1, 2].map((i) => fetch(`/birds/scarlet-hq-${i}.webp`).then((r) => r.blob()))));
  }
  // the flock's sprite sheets and the 3D textures decode in real time: let them arrive
  await sleep(3000);

  const total = clip.segments.reduce((n, s) => n + Math.round(s.s * FPS), 0);
  const file = path.join(OUT, `${name}.mp4`);
  const enc = encoder(file);
  const meta = { file: `footage/${name}.mp4`, fps: FPS, width: 1920 * SCALE, height: 1080 * SCALE, frames: total, segments: [], clicks: [] };
  let frame = 0;
  for (const seg of clip.segments) {
    const n = Math.round(seg.s * FPS);
    const y0 = await resolveY(page, seg.y), y1 = seg.to !== undefined ? await resolveY(page, seg.to) : y0;
    meta.segments.push({ name: seg.name, from: frame, frames: n });
    for (let i = 0; i < n; i++, frame++) {
      const y = Math.round(y0 + (y1 - y0) * ease(i / Math.max(1, n - 1)));
      await page.evaluate((y) => { if (Math.abs(scrollY - y) > 0.5) window.scrollTo(0, y); }, y);
      if (seg.click && i === Math.round(seg.click.at * FPS)) {
        const box = await page.locator(seg.click.sel).first().boundingBox();
        const x = box.x + box.width / 2, yy = box.y + box.height / 2;
        await page.mouse.move(x, yy); await page.mouse.click(x, yy);
        meta.clicks.push({ frame, x: Math.round(x), y: Math.round(yy) });
      }
      const [sx, sy] = await step(page, i === 0 && frame === 0 ? 0 : 1000 / FPS);
      // the clip is in page coordinates, and its scale is what makes the image 2x (without it Chrome
      // returns a 1920x1080 picture even at deviceScaleFactor 2)
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, clip: { x: sx, y: sy, width: 1920, height: 1080, scale: SCALE } });
      await enc.write(Buffer.from(data, 'base64'));
      if (frame % 50 === 0) process.stdout.write(`   ${name}: frame ${frame}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
    }
  }
  await enc.end();
  await ctx.close();
  console.log(`   ${name}: ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${path.relative(ROOT, file)}`);
  return meta;
}

(async () => {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('No site build: run `npx astro build` in site/ first');
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const manifestFile = path.join(OUT, 'manifest.json');
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
  for (const [name, clip] of Object.entries(CLIPS)) {
    if (only.length && !only.includes(name)) continue;
    console.log(`recording ${name} (${1920 * SCALE}x${1080 * SCALE}, ${FPS} fps)`);
    manifest[name] = await record(browser, base, name, clip);
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1) + '\n');
  }
  await browser.close();
  server.close();
})().catch((e) => { console.error(e); process.exit(1); });
