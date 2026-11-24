// Renders the ad's music and sounds (audio/synth.js) to WAV files in public/audio/, using the
// Web Audio API in Chromium:   node audio/make-music.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.resolve(__dirname, '..', 'public', 'audio');

function wav(file, pcm, sampleRate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(sampleRate * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, pcm]));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({ path: path.join(__dirname, 'synth.js') });
  for (const name of ['calm', 'human-food', 'page-turn']) {
    const t0 = Date.now();
    const { sampleRate, data } = await page.evaluate((n) => window.renderTrack(n), name);
    const file = path.join(OUT, `${name}.wav`);
    wav(file, Buffer.from(data, 'base64'), sampleRate);
    console.log(`${name}.wav  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  await browser.close();
  // the site's dawn chorus (Joseph Sardin, CC0), for the birdsong soundtrack
  fs.copyFileSync(path.resolve(__dirname, '..', '..', 'site', 'public', 'sound', 'birds.mp3'), path.join(OUT, 'birds.mp3'));
})().catch((e) => { console.error(e); process.exit(1); });
