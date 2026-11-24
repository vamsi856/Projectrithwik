// Renders the finished ad files into out/Rithwik-Ad/ (working files stay in out/):
//   Rithwik-Ad-4K-Birdsong.mp4     Rithwik-Ad-4K-Calm.mp4       3840x2160, 25 fps
//   Rithwik-Ad-1080p-Birdsong.mp4  Rithwik-Ad-1080p-Calm.mp4    1920x1080, 25 fps
// The picture is rendered once in 4K (the two versions differ only in sound) and the 1080p files
// are made from it. Both soundtracks are brought to the same loudness (-16 LUFS, peaks under
// -1.5 dBTP; pass --lufs -24 for a TV channel that asks for EBU R128 / -24 LKFS).
//
//   node render.mjs              everything
//   node render.mjs --1080       1080p only (renders the picture at 1080p, quicker)
//   node render.mjs --keep-picture   reuse the picture from last time (only the sound changed)
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, ensureBrowser } from '@remotion/renderer';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserExecutable } from './browser.mjs';

const root = path.dirname(fileURLToPath(import.meta.url)); // (also right on Windows)
const out = path.join(root, 'out');
const finals = path.join(out, 'Rithwik-Ad');
const args = process.argv.slice(2);
const only1080 = args.includes('--1080');
const LUFS = Number(args[args.indexOf('--lufs') + 1] || -16) || -16;
fs.mkdirSync(finals, { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...a], { stdio: 'inherit' });
const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0).padStart(4)} s] ${m}`);

if (!browserExecutable) await ensureBrowser();
log('bundling');
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const pick = (id, inputProps) => selectComposition({ serveUrl, id, inputProps, browserExecutable });

// 1. the picture
const scale = only1080 ? 1 : 2;
const master = path.join(out, `master-${only1080 ? '1080p' : '4k'}.mp4`);
// --keep-picture: only the sound changed, reuse the picture rendered last time
if (args.includes('--keep-picture') && fs.existsSync(master)) log(`picture: keeping ${path.relative(root, master)}`);
else {
  const inputProps = { soundtrack: 'calm', footage: 'footage' };
  const composition = await pick('RithwikAd-Calm', inputProps);
  let last = -1;
  await renderMedia({
    serveUrl, composition, inputProps, browserExecutable, outputLocation: master,
    codec: 'h264', crf: 14, x264Preset: 'medium', pixelFormat: 'yuv420p', colorSpace: 'bt709',
    imageFormat: 'jpeg', jpegQuality: 95, scale, muted: true, concurrency: 3,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; log(`picture ${Math.round(progress * 100)} %`); } },
  });
}

// 2. the two soundtracks, mixed by Remotion, then brought to the same loudness
const audio = {};
for (const [name, id] of [['Birdsong', 'RithwikAd-Birdsong'], ['Calm', 'RithwikAd-Calm']]) {
  const inputProps = { soundtrack: name.toLowerCase(), footage: 'footage' };
  const composition = await pick(id, inputProps);
  const wav = path.join(out, `mix-${name}.wav`);
  await renderMedia({ serveUrl, composition, inputProps, browserExecutable, outputLocation: wav, codec: 'wav', concurrency: 3 });
  // two-pass loudness normalisation (EBU R128 measurement)
  // (ffmpeg prints the measurement on stderr)
  const { stderr } = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', wav, '-af', `loudnorm=I=${LUFS}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = JSON.parse(stderr.slice(stderr.lastIndexOf('{')));
  audio[name] = path.join(out, `mix-${name}.m4a`);
  ff('-i', wav, '-af', `loudnorm=I=${LUFS}:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
    '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', audio[name]);
  log(`sound: ${name} (was ${m.input_i} LUFS)`);
}

// 3. the finished files
const tags = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart'];
let hd = master;
if (!only1080) {
  hd = path.join(out, 'master-1080p.mp4');
  ff('-i', master, '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '25', ...tags, '-an', hd);
  log('1080p picture made from the 4K master');
}
for (const name of Object.keys(audio)) {
  if (!only1080) ff('-i', master, '-i', audio[name], '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest', ...tags, path.join(finals, `Rithwik-Ad-4K-${name}.mp4`));
  ff('-i', hd, '-i', audio[name], '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest', ...tags, path.join(finals, `Rithwik-Ad-1080p-${name}.mp4`));
}
log('done: ' + path.relative(root, finals) + '/ ' + fs.readdirSync(finals).join(', '));
