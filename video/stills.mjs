// Renders a few still frames of the ad for a quick look:  node stills.mjs [frame ...]
// (footage from public/footage-1080 if it exists, else public/footage)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, ensureBrowser } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserExecutable } from './browser.mjs';

const root = path.dirname(fileURLToPath(import.meta.url)); // (also right on Windows)
const frames = process.argv.slice(2).map(Number);
const footage = fs.existsSync(path.join(root, 'public', 'footage-1080')) ? 'footage-1080' : 'footage';
const out = path.join(root, 'out', 'stills');
fs.mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const inputProps = { soundtrack: 'calm', footage };
if (!browserExecutable) await ensureBrowser();
const composition = await selectComposition({ serveUrl, id: 'RithwikAd-Calm', inputProps, browserExecutable });
for (const frame of frames.length ? frames : [30, 90, 125, 205, 222, 300, 420, 700, 919, 950, 1300, 1420]) {
  const file = path.join(out, `f${String(frame).padStart(4, '0')}.jpg`);
  await renderStill({ serveUrl, composition, frame, inputProps, output: file, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable });
  console.log(file);
}
