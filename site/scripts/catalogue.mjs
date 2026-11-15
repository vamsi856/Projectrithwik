// Builds the printable product catalogue (A4 PDF) from the same data as the website, so the two
// never disagree. Output: public/Rithwik-Catalogue.pdf (the site's "Download catalogue" link).
//
//   cd site && npm run catalogue          (then npm run build to publish it)
//
// Needs Playwright's Chromium (npx playwright install chromium) and the dev dependencies.
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import QR from 'qrcode';
import sharp from 'sharp';

const ROOT = resolve('.');
const tmp = mkdtempSync(join(tmpdir(), 'rithwik-cat-'));
const require = createRequire(import.meta.url);
// Playwright is used from wherever it is installed (project or global), like scripts/check-sizes.cjs
const { chromium } = require('playwright');
const SITE_URL = (process.env.SITE_URL || 'https://vamsi856.github.io/Projectrithwik/').replace(/\/?$/, '/');
const BASE = new URL(SITE_URL).pathname;

// ---- the site's data (TypeScript) -------------------------------------------------------
writeFileSync(join(tmp, 'entry.ts'), `
export * from '${ROOT}/src/data/products';
export { REGISTRATIONS } from '${ROOT}/src/data/registrations';
export { LEGACY, FOUNDERS } from '${ROOT}/src/data/legacy';
export { NETWORK } from '${ROOT}/src/data/network';
export { photo } from '${ROOT}/src/data/photos';
`);
await build({ entryPoints: [join(tmp, 'entry.ts')], bundle: true, platform: 'node', format: 'cjs', outfile: join(tmp, 'data.cjs'), define: { 'import.meta.env.BASE_URL': JSON.stringify(BASE) }, logLevel: 'error' });
const D = require(join(tmp, 'data.cjs'));
const outline = JSON.parse(readFileSync(join(ROOT, 'src/data/india-outline.json'), 'utf8'));
const sizes = JSON.parse(readFileSync(join(ROOT, 'src/data/photo-sizes.json'), 'utf8'));

// ---- helpers ------------------------------------------------------------------------------
const f = (p) => pathToFileURL(join(ROOT, p)).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** a product photo file at a print-friendly width */
// Photos go in as JPEG copies: Chrome keeps a JPEG in the PDF as it is, but re-encodes WebP as a
// large uncompressed image (35 MB instead of a few MB).
const jpegs = new Map();
const img = (key, want = 480) => {
  const z = sizes[key];
  if (!z) return null;
  const w = z.widths.includes(want) ? want : z.widths.find((x) => x >= want) ?? z.widths[z.widths.length - 1];
  const p = `public/img/${key}-${w}.webp`;
  if (!existsSync(join(ROOT, p))) return null;
  const out = join(tmp, `${key}-${w}.jpg`);
  jpegs.set(out, join(ROOT, p));
  return pathToFileURL(out).href;
};
/** a product's main picture: the one its card opens with (the first option's own photo, if it has one) */
const mainPhoto = (p) => p.variants[0]?.photo || p.photo;
const qr = (text, dark) => QR.toString(text, { type: 'svg', margin: 0, color: { dark, light: '#0000' }, errorCorrectionLevel: 'M' });
const groupsOf = (items, groups) => groups.map((g) => ({ ...g, items: items.filter((p) => p.group === g.id) })).filter((g) => g.items.length);

const options = (p) => {
  if (p.axes?.length) return p.axes.flatMap((a) => a.options.map((o) => ({ label: o })));
  return p.variants.filter((v) => v.label).map((v) => ({ label: v.label, photo: v.photo || p.photo }));
};
const tile = (p) => {
  const src = img(mainPhoto(p));
  const ops = options(p);
  return `<article class="tile">
    <div class="tile__img">${src ? `<img src="${src}" alt="">` : ''}</div>
    <h4>${esc(p.name)}</h4>
    ${ops.length ? `<p class="tile__ops">${ops.map((o) => `<span>${ops.some((x) => x.photo !== ops[0].photo) && o.photo && img(o.photo, 480) ? `<i style="background-image:url('${img(o.photo, 480)}')"></i>` : ''}${esc(o.label)}</span>`).join('')}</p>` : ''}
  </article>`;
};

const food = groupsOf(D.FOOD, D.FOOD_GROUPS);
const bird = groupsOf(D.BIRD, D.BIRD_GROUPS);
const held = D.REGISTRATIONS.filter((r) => r.held);
const C = D.CONTACT, B = D.BRANDS;
const main = D.NETWORK.find((p) => p.main);

// ---- the India map ------------------------------------------------------------------------
const P = (lon, lat) => [(lon - outline.lon0) * outline.k * outline.c, (outline.lat1 - lat) * outline.k];
const [mx, my] = P(main.lon, main.lat);
const map = `<svg viewBox="0 0 ${outline.w} ${outline.h}" class="map">
  <path d="${outline.d}" class="map__land"/>
  ${D.NETWORK.filter((p) => !p.main).map((p) => { const [x, y] = P(p.lon, p.lat); const dx = x - mx, dy = y - my; return `<path class="map__route" d="M${mx.toFixed(1)} ${my.toFixed(1)}Q${(mx + dx / 2 - dy * 0.18).toFixed(1)} ${(my + dy / 2 + dx * 0.18).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}"/>`; }).join('')}
  ${D.NETWORK.map((p) => { const [x, y] = P(p.lon, p.lat); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.main ? 9 : 5.5}" class="${p.main ? 'map__main' : 'map__pin'}"/>`; }).join('')}
  ${D.NETWORK.filter((p) => ['Delhi', 'Neemuch', 'Rajkot', 'Kolkata', 'Hyderabad'].includes(p.name)).map((p) => { const [x, y] = P(p.lon, p.lat); return `<text x="${(x + 11).toFixed(1)}" y="${(y + 6).toFixed(1)}" class="map__name">${p.name}</text>`; }).join('')}
  <circle cx="${mx.toFixed(1)}" cy="${(my - 26).toFixed(1)}" r="0" />
  <text x="${(mx + 70).toFixed(1)}" y="${(my + 46).toFixed(1)}" class="map__name map__name--main">Duvvur</text>
  <path d="M${(mx + 8).toFixed(1)} ${(my + 6).toFixed(1)}L${(mx + 66).toFixed(1)} ${(my + 38).toFixed(1)}" class="map__lead"/>
</svg>`;

// ---- the cover's slanted photo strip ------------------------------------------------------
const coverKeys = ['foxtail-summer-rithwik', 'quinoa-regular-rithwik', 'jowar-red-rithwik', 'kabuli-rithwik', 'sunflower-striped', 'clove', 'proso-green-rithwik'];
const strip = coverKeys.map((k, i) => `<div class="slice" style="--i:${i};--n:${coverKeys.length};background-image:url('${img(k, 800)}')"></div>`).join('');

const year = new Date().getFullYear();
const foot = (n, tone = '') => `<footer class="pfoot ${tone}"><span>Rithwik · Product catalogue ${year}</span><span>Call / WhatsApp ${C.call.label}</span><span>${n}</span></footer>`;

const fontFace = (name, file, weight = 400) => `@font-face{font-family:"${name}";font-weight:${weight};src:url("${f('public/fonts/' + file)}") format("woff2")}`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rithwik Industries &amp; Rithwik Bird Feeds: Product Catalogue ${year}</title>
<style>
${fontFace('Anton', 'anton-latin-400-normal.woff2')}
${fontFace('Inst', 'instrument-sans-latin-400-normal.woff2', 400)}
${fontFace('Inst', 'instrument-sans-latin-500-normal.woff2', 500)}
${fontFace('Inst', 'instrument-sans-latin-600-normal.woff2', 600)}
${fontFace('Inst', 'instrument-sans-latin-700-normal.woff2', 700)}
@page { size: A4; margin: 0 }
:root { --navy:#0b1924; --navy2:#132a3b; --sky:#7cc4ea; --gold:#f2b21b; --khaki:#e4dfc1; --paper:#efeadb; --cream:#f6f2e6; --ink:#1c2533; --bronze:#a07a2c; --bronze2:#c59b45; --leaf:#5c7f4c; }
* { box-sizing: border-box; margin: 0; padding: 0 }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact }
body { font: 400 9.6pt/1.45 Inst, sans-serif; color: var(--ink) }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: var(--paper); padding: 16mm 14mm 18mm }
.page:last-child { page-break-after: auto }
h1, h2, h3, .anton { font-family: Anton, Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: .005em; line-height: .92 }
.kicker { font: 700 8pt/1 Inst; letter-spacing: .16em; text-transform: uppercase; color: var(--bronze) }
.pfoot { position: absolute; left: 14mm; right: 14mm; bottom: 8mm; display: flex; justify-content: space-between; font: 600 7pt/1 Inst; letter-spacing: .06em; text-transform: uppercase; opacity: .55 }
.pfoot.light { color: var(--khaki) }

/* ---------- cover ---------- */
.cover { padding: 0; background: var(--paper) }
.cover__top { display: flex; align-items: center; justify-content: space-between; padding: 14mm 14mm 0 }
.cover__logos { display: flex; align-items: center; gap: 4mm }
.cover__logos img { width: 17mm; height: 17mm; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 .6mm var(--paper), 0 0 0 1mm var(--bronze2) }
.cover__logos img.food { background: #fff; object-fit: contain; padding: .8mm }
.cover__top p { font: 600 8pt/1.35 Inst; text-align: right; letter-spacing: .04em }
.cover__title { padding: 13mm 14mm 0 }
.cover__title h1 { font-size: 30mm; color: var(--ink) }
.cover__title h1 span { color: var(--bronze); display: block }
.cover__title p { margin-top: 5mm; font: 500 12pt/1.35 Inst; max-width: 150mm }
.strip { position: relative; height: 92mm; margin: 11mm 0 0 }
.slice { position: absolute; top: 0; height: 100%; --w: calc(210mm / var(--n)); --d: 9mm; left: calc(var(--i) * var(--w) - var(--d) / 2); width: calc(var(--w) + var(--d));
  background-size: cover; background-position: center; clip-path: polygon(calc(var(--d) + .8mm) 0, calc(100% - .8mm) 0, calc(100% - var(--d) - .8mm) 100%, .8mm 100%) }
.slice:first-child { left: 0; width: calc(var(--w) + var(--d) / 2); clip-path: polygon(0 0, calc(100% - .8mm) 0, calc(100% - var(--d) - .8mm) 100%, 0 100%) }
.slice:last-child { width: calc(var(--w) + var(--d) / 2); clip-path: polygon(calc(var(--d) + .8mm) 0, 100% 0, 100% 100%, .8mm 100%) }
.cover__band { position: absolute; left: 0; right: 0; bottom: 0; height: 64mm; background: var(--ink); color: var(--khaki); padding: 11mm 14mm 0 }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm }
.facts b { display: block; font: 400 15mm/1 Anton; color: var(--bronze2); white-space: nowrap }
.facts b small { font-size: .42em; margin-right: 1mm; vertical-align: .9em }
.facts span { display: block; margin-top: 2mm; font: 600 8.6pt/1.3 Inst }
.cover__brands { display: flex; justify-content: space-between; margin-top: 11mm; padding-top: 5mm; border-top: .3mm solid rgba(228,223,193,.25); font: 600 9pt/1.3 Inst }
.cover__brands em { font-style: normal; color: var(--bronze2) }

/* ---------- about ---------- */
.about h2 { font-size: 15mm; margin-top: 3mm }
.about h2 span { color: var(--bronze) }
.about__cols { display: grid; grid-template-columns: 1.35fr 1fr; gap: 9mm; margin-top: 7mm }
.lead { font: 600 12.5pt/1.4 Inst }
.about__cols p + p { margin-top: 3.2mm }
.no1 { background: var(--navy); color: var(--khaki); border-radius: 5mm; padding: 7mm 7mm 7mm 6mm; display: flex; align-items: center; gap: 5mm }
.no1 b { font: 400 34mm/.8 Anton; background: linear-gradient(115deg,#a96d02,#f2b21b 30%,#fff2bd 40%,#f7c94a 50%,#d29410 72%,#ffe39a 90%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(1.2mm 1.2mm 0 #7a5208) }
.no1 h3 { font-size: 8.4mm; line-height: 1; color: var(--gold) }
.no1 p { margin-top: 2mm; font-size: 8.4pt; opacity: .8 }
.facts--ink { margin-top: 8mm; gap: 1mm; border-radius: 4mm; overflow: hidden }
.facts--ink > div { background: var(--ink); color: var(--khaki); padding: 5mm 5mm 5mm }
.facts--ink b { font-size: 11.5mm }
.timeline { margin-top: 5mm; display: grid; grid-template-columns: repeat(5, 1fr); position: relative }
.timeline::before { content: ""; position: absolute; left: 3mm; right: 3mm; top: 8.2mm; height: .5mm; background: var(--bronze2) }
.tl { position: relative; padding-right: 3mm }
.tl .yr { font: 400 9mm/1 Anton; color: var(--ink) }
.tl .dot { width: 4mm; height: 4mm; border-radius: 50%; background: var(--bronze); margin: 1.6mm 0 3mm; box-shadow: 0 0 0 1.2mm var(--paper) }
.tl.now .dot { background: var(--leaf) }
.tl h4 { font: 700 9pt/1.25 Inst }
.tl p { font-size: 8.2pt; line-height: 1.3; margin-top: 1mm; opacity: .8 }
.founders { width: 17mm; height: 17mm; border-radius: 50%; object-fit: cover; margin-top: 2.5mm; box-shadow: 0 0 0 .8mm var(--bronze2) }
.mission { margin-top: 13mm; display: grid; grid-template-columns: 1.5fr 1fr; gap: 5mm }
.mission > div { border-radius: 4mm; padding: 6mm; background: var(--cream) }
.mission h3 { font-size: 7mm; margin-bottom: 2.5mm }
.mission .goal { background: var(--bronze); color: #fff }
.mission .goal p { font: 600 11pt/1.4 Inst }

/* ---------- quality & reach ---------- */
.q h2 { font-size: 13mm; margin-top: 3mm }
.certs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3.5mm; margin-top: 6mm }
.cert { background: #fff; border-radius: 4mm; padding: 4.5mm 3mm 4mm; text-align: center; box-shadow: 0 .6mm 2mm rgba(28,37,51,.08) }
.cert .seal { width: 21mm; height: 21mm; margin: 0 auto 2.5mm; display: grid; place-items: center; border-radius: 50% }
.cert .seal img { max-width: 100%; max-height: 100%; object-fit: contain }
.cert .seal.word { box-shadow: inset 0 0 0 .7mm var(--ink), inset 0 0 0 1.6mm #fff, inset 0 0 0 1.9mm rgba(28,37,51,.35); font: 400 5mm/1 Anton; color: var(--ink) }
.cert h4 { font: 700 8.6pt/1.2 Inst }
.cert p { font: 600 7.4pt/1.2 Inst; color: var(--bronze); margin-top: .8mm }
.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; margin-top: 8mm }
.step { border-top: .6mm solid var(--bronze2); padding-top: 2.5mm }
.step b { font: 400 7mm/1 Anton; color: var(--bronze) }
.step h4 { font: 700 9pt/1.2 Inst; margin-top: 1.5mm }
.step p { font-size: 7.8pt; line-height: 1.32; margin-top: 1mm; opacity: .82 }
.reach { display: grid; grid-template-columns: 96mm 1fr; gap: 7mm; margin-top: 8mm; align-items: start }
.map { width: 96mm; height: auto; display: block }
.map__land { fill: rgba(28,37,51,.07); stroke: var(--ink); stroke-width: 1.4; stroke-linejoin: round }
.map__route { fill: none; stroke: var(--bronze2); stroke-width: 1.8 }
.map__pin { fill: var(--bronze); stroke: #fff; stroke-width: 1.6 }
.map__main { fill: var(--leaf); stroke: #fff; stroke-width: 2.4 }
.map__name { font: 600 17px Inst; fill: var(--ink); paint-order: stroke; stroke: var(--paper); stroke-width: 4px }
.map__name--main { font: 400 24px Anton; fill: var(--leaf); text-transform: uppercase }
.map__lead { stroke: var(--leaf); stroke-width: 1.4; fill: none }
.places h3 { font-size: 8mm }
.places ul { list-style: none; columns: 2; column-gap: 5mm; margin-top: 4mm }
.places li { font: 600 9.4pt/1.9 Inst; break-inside: avoid; display: flex; align-items: center; gap: 2mm }
.places li::before { content: ""; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: var(--bronze); flex: none }
.places li.main::before { background: var(--leaf); width: 3mm; height: 3mm }
.wh { margin-top: 5mm; background: var(--cream); border-radius: 4mm; padding: 5mm; font-size: 8.6pt }
.wh b { display: block; font: 700 9.4pt/1.3 Inst; margin-bottom: 1mm }

/* ---------- range pages ---------- */
.range { padding-top: 12mm }
.rhead { display: flex; align-items: center; gap: 5mm; padding-bottom: 5mm; border-bottom: .4mm solid currentColor }
.rhead img { width: 19mm; height: 19mm; border-radius: 50%; object-fit: cover; flex: none }
.rhead h2 { font-size: 13mm }
.rhead p { font: 600 8.6pt/1.35 Inst; margin-top: 1.5mm }
.rhead .meta { margin-left: auto; text-align: right; font: 600 7.8pt/1.5 Inst; opacity: .8 }
.ghead { display: flex; align-items: baseline; gap: 4mm; margin: 6.5mm 0 3.2mm }
.ghead h3 { font-size: 7.4mm }
.ghead p { font-size: 8.4pt; opacity: .75 }
.tiles { display: grid; grid-template-columns: repeat(var(--cols, 4), 1fr); gap: 3.6mm }
.tile { border-radius: 3.4mm; overflow: hidden; background: #fff; box-shadow: 0 .5mm 2mm rgba(28,37,51,.08) }
.tile__img { aspect-ratio: 4 / 3; background: #ddd5bd }
.tile__img img { width: 100%; height: 100%; object-fit: cover; display: block }
.tile h4 { font: 700 9pt/1.2 Inst; padding: 2.4mm 2.6mm 0 }
.tile__ops { display: flex; flex-wrap: wrap; gap: 1.1mm; padding: 1.6mm 2.4mm 2.6mm }
.tile__ops span { display: inline-flex; align-items: center; gap: .9mm; font: 600 6.9pt/1 Inst; padding: .9mm 1.6mm; border-radius: 9mm; background: rgba(160,122,44,.13); color: #6b4d12 }
.tile__ops i { width: 3.2mm; height: 3.2mm; border-radius: 50%; background-size: cover; background-position: center; margin-left: -.9mm }
.tile:not(:has(.tile__ops)) h4 { padding-bottom: 2.8mm }
.cols5 { --cols: 5 } .cols5 .tile h4 { font-size: 8.4pt }
.range--food { background: var(--paper); color: var(--ink) }
.range--food .rhead img { background: #fff; object-fit: contain; padding: .8mm; box-shadow: 0 0 0 .5mm var(--bronze2) }
.range--food .rhead h2 span { color: var(--bronze) }
.range--bird { background: var(--navy); color: var(--khaki) }
.range--bird .rhead { border-color: rgba(228,223,193,.35) }
.range--bird .rhead h2 span { color: var(--gold) }
.range--bird .rhead h2 em { font-style: normal; color: var(--sky) }
.range--bird .rhead img { box-shadow: 0 0 0 .5mm var(--gold) }
.range--bird .ghead h3 { color: var(--gold) }
.range--bird .tile { background: var(--navy2); box-shadow: none }
.range--bird .tile h4 { color: #fff }
.range--bird .tile__ops span { background: rgba(124,196,234,.16); color: var(--sky) }
.range--bird .kicker { color: var(--gold) }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 3.6mm }
.split .tiles { --cols: 2 }
.callout { margin-top: 7mm; border-radius: 4mm; padding: 5mm 6mm; display: flex; gap: 6mm; align-items: center; background: rgba(242,178,27,.1); box-shadow: inset 0 0 0 .3mm rgba(242,178,27,.45) }
.callout b { font: 400 17mm/.8 Anton; color: var(--gold) }
.callout h4 { font: 400 6.4mm/1 Anton; text-transform: uppercase; color: #fff }
.callout p { font-size: 8.4pt; margin-top: 1.4mm; opacity: .85 }

/* page 5's closing note */
.ask { margin-top: 8mm; border-radius: 4mm; padding: 5.5mm 6mm; display: flex; align-items: center; gap: 6mm; background: var(--ink); color: var(--khaki) }
.ask h4 { font: 400 6.6mm/1 Anton; text-transform: uppercase; color: #fff }
.ask p { font-size: 8.8pt; margin-top: 1.4mm; opacity: .85 }
.ask .ask__tel { margin-left: auto; text-align: right; font: 400 9mm/1 Anton; color: var(--bronze2); white-space: nowrap }
.ask .ask__tel small { display: block; font: 600 7.6pt Inst; color: var(--khaki); opacity: .7; margin-top: 1.4mm }
/* ---------- back ---------- */
.back { background: var(--ink); color: var(--khaki); padding-top: 18mm }
.back h2 { font-size: 22mm; color: #fff }
.back h2 span { color: var(--bronze2) }
.back .lead { margin-top: 5mm; max-width: 150mm; font-weight: 500 }
.contact { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 10mm }
.box { border-radius: 4mm; padding: 6mm; background: rgba(228,223,193,.07); box-shadow: inset 0 0 0 .3mm rgba(228,223,193,.18) }
.box h3 { font-size: 6.6mm; color: var(--bronze2); margin-bottom: 3mm }
.box p { font-size: 9.2pt; line-height: 1.55 }
.box p + p { margin-top: 2mm }
.box .big { font: 400 9mm/1.05 Anton; color: #fff; letter-spacing: .01em }
.box .big small { font: 600 8pt Inst; color: var(--khaki); opacity: .7; letter-spacing: 0; margin-left: 1.5mm }
.codes { display: flex; gap: 8mm; margin-top: 10mm }
.code { display: flex; gap: 4mm; align-items: center }
.code .q { width: 30mm; height: 30mm; background: var(--khaki); border-radius: 3mm; padding: 2.4mm }
.code .q svg { width: 100%; height: 100%; display: block }
.code b { font: 400 6mm/1 Anton; text-transform: uppercase; color: #fff; display: block }
.code span { font-size: 8.4pt; opacity: .8; display: block; margin-top: 1.2mm; max-width: 50mm; word-break: break-all }
.backbrands { position: absolute; left: 14mm; right: 14mm; bottom: 20mm; display: flex; gap: 6mm; align-items: center; padding-top: 6mm; border-top: .3mm solid rgba(228,223,193,.2) }
.backbrands img { width: 15mm; height: 15mm; border-radius: 50%; object-fit: cover }
.backbrands img.food { background: #fff; object-fit: contain; padding: .6mm }
.backbrands p { font: 600 8.6pt/1.4 Inst }
.backbrands .note { margin-left: auto; text-align: right; font-weight: 500; opacity: .7; max-width: 80mm }
</style></head><body>

<!-- 1. cover -->
<section class="page cover">
  <div class="cover__top">
    <div class="cover__logos"><img src="${f('src/assets/brand/birdfeeds-emblem.jpg')}" alt=""><img class="food" src="${f('src/assets/brand/industries-emblem.png')}" alt=""></div>
    <p>Rithwik Bird Feeds · Rithwik Industries<br>Kurnool, Andhra Pradesh, India</p>
  </div>
  <div class="cover__title">
    <p class="kicker">Edition ${year}</p>
    <h1 style="margin-top:3mm">Product<span>catalogue</span></h1>
    <p>Millets, super foods, oil seeds, pulses, spices and cereals for people, and millets, jowar, maize, sunflower and safflower for birds.</p>
  </div>
  <div class="strip">${strip}</div>
  <div class="cover__band">
    <div class="facts">
      <div><b><small>SINCE</small>1925</b><span>a family grain trade</span></div>
      <div><b>20,000MT+</b><span>annual production</span></div>
      <div><b>3,000+</b><span>customers</span></div>
      <div><b>40+</b><span>products</span></div>
    </div>
    <div class="cover__brands"><span>Rithwik Industries: <em>Nature's grain, nurtured for you</em></span><span>Rithwik Bird Feeds: <em>No. 1 foxtail millet supplier in India</em></span></div>
  </div>
</section>

<!-- 2. who we are -->
<section class="page about">
  <p class="kicker">Who we are</p>
  <h2>A family grain trade <span>since 1925</span></h2>
  <div class="about__cols">
    <div>
      <p class="lead">Rithwik Industries carries forward a family grain trade that began in 1925, bringing millets, super foods, oil seeds, pulses and spices to retail packers, traders and bulk buyers.</p>
      <p>Rithwik Bird Feeds brings in millets, jowar, maize, sunflower and safflower for birds. We clean and sort everything at our own processing unit, ready to supply processed and unprocessed, to traders, pet shops, bird keepers and export houses.</p>
      <p>Grain comes straight from farmers across Andhra Pradesh and Karnataka, after each harvest. Foxtail millet comes from both the summer and the winter crop.</p>
    </div>
    <div class="no1"><b>1</b><div><h3>Foxtail millet supplier in India</h3><p>Summer and winter crop foxtail, cleaned, Sortex-sorted and graded in Kurnool.</p></div></div>
  </div>
  <p class="kicker" style="margin-top:12mm">Four generations</p>
  <div class="timeline">
    ${D.LEGACY.map((l, i) => `<div class="tl ${i === D.LEGACY.length - 1 ? 'now' : ''}"><div class="yr">${l.year}</div><div class="dot"></div><h4>${esc(l.person)}</h4><p>${esc(l.firm)}</p>${i === D.LEGACY.length - 1 && img(D.FOUNDERS.circle) ? `<img class="founders" src="${img(D.FOUNDERS.circle)}" alt="">` : ''}</div>`).join('')}
  </div>
  <div class="mission">
    <div><h3>Our mission</h3><p>Our mission is to connect farmers directly with industries by sourcing quality agricultural produce, ensuring proper cleaning, grading, and processing, and delivering products that meet the specific requirements of every customer.</p><p style="margin-top:2.4mm">We aim to maintain high quality standards, build trusted partnerships, support farmers, and provide reliable agricultural solutions across different industries.</p></div>
    <div class="goal"><h3>Our goal is simple</h3><p>Empower farmers, ensure quality, and make the right products reach the right industries in the right way.</p></div>
  </div>
  ${foot(2)}
</section>

<!-- 3. quality and reach -->
<section class="page q">
  <p class="kicker">Quality and reach</p>
  <h2>Certified, sorted, delivered</h2>
  <div class="certs">
    ${held.map((r) => `<div class="cert"><div class="seal ${r.logo ? '' : 'word'}">${r.logo ? `<img src="${f('public/certs/' + r.logo)}" alt="">` : esc(r.mark)}</div><h4>${esc(r.name)}</h4><p>${esc(r.status)}</p></div>`).join('')}
  </div>
  <div class="steps">
    ${[['From the field', 'Grain comes in from farms after each harvest.'], ['Cleaning', 'Sieves shake out dust, straw, stones and broken grain.'], ['Sortex sorting', 'A colour sorter removes any discoloured grain or stone.'], ['Grading and bagging', 'Graded to your spec, weighed and sealed, ready to load.'], ['On the road', 'Loaded at our Duvvur warehouse, across India and for export.']].map(([h, p], i) => `<div class="step"><b>0${i + 1}</b><h4>${h}</h4><p>${p}</p></div>`).join('')}
  </div>
  <div class="reach">
    ${map}
    <div class="places">
      <p class="kicker">Where we operate</p>
      <h3 style="margin-top:2mm">${D.NETWORK.length} places across India</h3>
      <ul>${D.NETWORK.map((p) => `<li class="${p.main ? 'main' : ''}">${esc(p.name)}${p.main ? ' (main warehouse)' : ''}</li>`).join('')}</ul>
      <div class="wh"><b>Main warehouse and processing</b>${esc(C.warehouse)}<b style="margin-top:3mm">Office</b>${esc(C.office)}</div>
    </div>
  </div>
  ${foot(3)}
</section>

<!-- 4-5. Rithwik Industries -->
<section class="page range range--food">
  <div class="rhead"><img src="${f('src/assets/brand/industries-emblem.png')}" alt=""><div><p class="kicker">Food for people</p><h2>Rithwik <span>Industries</span></h2><p>For retail packers, traders and bulk buyers</p></div><div class="meta">${esc(B.food.email)}<br>GSTIN ${B.food.gstin}</div></div>
  ${food.slice(0, 2).map((g) => `<div class="ghead"><h3>${esc(g.label)}</h3><p>${esc(g.note ?? '')}</p></div><div class="tiles">${g.items.map(tile).join('')}</div>`).join('')}
  ${foot(4)}
</section>
<section class="page range range--food">
  ${food.slice(2).map((g) => `<div class="ghead"><h3>${esc(g.label)}</h3><p>${esc(g.note ?? '')}</p></div><div class="tiles cols5">${g.items.map(tile).join('')}</div>`).join('')}
  <div class="ask"><div><h4>Don't see what you need?</h4><p>Ask for a grade, a crop or a quantity that isn't listed here. We source to your specification.</p></div><p class="ask__tel">${C.call.label}<small>Call or WhatsApp</small></p></div>
  ${foot(5)}
</section>

<!-- 6. Rithwik Bird Feeds -->
<section class="page range range--bird">
  <div class="rhead"><img src="${f('src/assets/brand/birdfeeds-emblem.jpg')}" alt=""><div><p class="kicker">Food for birds</p><h2>Rithwik <span>Bird</span> <em>Feeds</em></h2><p>${D.BIRD.length} types of feeds in ${D.lineCount(D.BIRD)} grades, processed and unprocessed</p></div><div class="meta">${esc(B.bird.email)}<br>GSTIN ${B.bird.gstin}</div></div>
  <div class="ghead"><h3>${esc(bird[0].label)}</h3></div>
  <div class="tiles">${bird[0].items.map(tile).join('')}</div>
  <div class="split">
    ${bird.slice(1).map((g) => `<div><div class="ghead"><h3>${esc(g.label)}</h3></div><div class="tiles">${g.items.map(tile).join('')}</div></div>`).join('')}
  </div>
  <div class="callout"><b>1</b><div><h4>Foxtail millet supplier in India</h4><p>Summer and winter crop foxtail, cleaned, Sortex-sorted and graded. Supplied to traders, pet shops, bird keepers and export houses.</p></div></div>
  ${foot(6, 'light')}
</section>

<!-- 7. back -->
<section class="page back">
  <p class="kicker" style="color:var(--bronze2)">Order and enquiries</p>
  <h2>Ask for <span>today's price</span></h2>
  <p class="lead">Prices change with the crop and the season. Send us the product, the grade and the quantity, and we'll reply with today's price and availability.</p>
  <div class="contact">
    <div class="box"><h3>Call or WhatsApp</h3><p class="big">${C.call.label}<small>WhatsApp</small></p>${C.phones.slice(1).map((p) => `<p class="big" style="margin-top:1.5mm">${p.label}</p>`).join('')}</div>
    <div class="box"><h3>Email</h3><p><b>Rithwik Industries</b><br>${esc(B.food.email)}<br><span style="opacity:.7">GSTIN ${B.food.gstin}</span></p><p><b>Rithwik Bird Feeds</b><br>${esc(B.bird.email)}<br><span style="opacity:.7">GSTIN ${B.bird.gstin}</span></p></div>
    <div class="box"><h3>Office</h3><p>${esc(C.office)}</p></div>
    <div class="box"><h3>Warehouse</h3><p>${esc(C.warehouse)}</p></div>
  </div>
  <div class="codes">
    <div class="code"><div class="q">${await qr(`https://wa.me/${C.whatsapp}`, '#1c2533')}</div><div><b>WhatsApp us</b><span>Scan to send a message</span></div></div>
    <div class="code"><div class="q">${await qr(SITE_URL, '#1c2533')}</div><div><b>See the full range</b><span>${esc(SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span></div></div>
  </div>
  <div class="backbrands"><img src="${f('src/assets/brand/birdfeeds-emblem.jpg')}" alt=""><img class="food" src="${f('src/assets/brand/industries-emblem.png')}" alt=""><p>Rithwik Bird Feeds<br>Rithwik Industries</p><p class="note">Kurnool, Andhra Pradesh, India. A family grain trade since 1925.</p></div>
</section>

</body></html>`;

await Promise.all([...jpegs].map(([out, src]) => sharp(src).flatten({ background: '#ffffff' }).jpeg({ quality: 84, mozjpeg: true }).toFile(out)));
const htmlPath = join(tmp, 'catalogue.html');
writeFileSync(htmlPath, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const out = join(ROOT, 'public/Rithwik-Catalogue.pdf');
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
if (process.argv.includes('--png')) {
  await page.setViewportSize({ width: 794, height: 1123 });
  const n = await page.locator('.page').count();
  for (let i = 0; i < n; i++) await page.locator('.page').nth(i).screenshot({ path: join(process.env.PNG_DIR || tmp, `cat-${i + 1}.png`) });
}
await browser.close();
if (!process.argv.includes('--keep')) rmSync(tmp, { recursive: true, force: true });
console.log('catalogue written:', out);
