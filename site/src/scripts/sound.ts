// Sound for the site. Off until the visitor turns it on (browsers require a click
// first, and surprise audio is rude).
//
// Bird Feeds and the book: a real dawn chorus, recorded in France by Joseph Sardin
// ("Réveil des oiseaux", Wikimedia Commons, CC0). It is looped with a slow
// equal-power crossfade so the seam is never heard.
// Human Food: a soft wind with the birdsong kept quiet and far away. No effect sounds there.
// The small interface sounds (page turn, seed rattle, chirp) are generated live too.

type Mode = 'book' | 'bird' | 'food' | 'off';
export type Sfx = 'turn' | 'whoosh' | 'tick' | 'rattle' | 'pop' | 'chirp';

const KEY = 'rithwik-sound';
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const FILES = { birds: `${BASE}sound/birds.mp3` };

let ctx: AudioContext | null = null;
let master: GainNode, sfxBus: GainNode, birdBus: GainNode, musicBus: GainNode, noise: AudioBuffer;
let enabled = false, mode: Mode = 'book';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

function boot() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // a gentle compressor keeps the generated effects from ever getting harsh
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(comp);
  // the recordings are already mastered: straight to the output
  birdBus = ctx.createGain(); birdBus.gain.value = 0; birdBus.connect(master);
  // Human Food's music goes through a soft generated room reverb, so it sounds warm and far off
  const verb = ctx.createConvolver();
  const len = ctx.sampleRate * 2.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb.buffer = ir;
  const verbGain = ctx.createGain(); verbGain.gain.value = 0.55; verb.connect(verbGain).connect(comp);
  const soften = ctx.createBiquadFilter(); soften.type = 'lowpass'; soften.frequency.value = 7500; soften.connect(comp);
  musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(soften);
  const send = ctx.createGain(); send.gain.value = 0.9; musicBus.connect(send).connect(verb);
  // two seconds of pink-ish noise for the paper and seed effects
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 0.9; }
  document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : enabled && ctx.resume(); });
  return ctx;
}

/* ---------------------------------------------------------------- recordings */
const buffers = new Map<string, Promise<AudioBuffer | null>>();
function load(url: string) {
  if (!buffers.has(url)) buffers.set(url, fetch(url).then((r) => r.arrayBuffer()).then((b) => new Promise<AudioBuffer>((ok, no) => ctx!.decodeAudioData(b, ok, no))).catch(() => null));
  return buffers.get(url)!;
}

// equal-power fade curves, so two overlapping copies never dip or swell
const N = 64;
const fadeIn = new Float32Array(N).map((_, i) => Math.sin((i / (N - 1)) * Math.PI / 2));
const fadeOut = new Float32Array(N).map((_, i) => Math.cos((i / (N - 1)) * Math.PI / 2));

/** The dawn chorus, looped forever with a 6 s crossfade, starting somewhere new each visit. */
let bedTimer = 0, bedStarted = false;
async function startBirds() {
  if (bedStarted) return; bedStarted = true;
  const buf = await load(FILES.birds);
  if (!buf || !ctx) { bedStarted = false; return; }
  const X = 6;
  const play = (t: number, offset: number) => {
    const s = ctx!.createBufferSource(), g = ctx!.createGain();
    s.buffer = buf; g.gain.value = 0;
    const end = t + buf.duration - offset;
    g.gain.setValueCurveAtTime(fadeIn, t, X);
    g.gain.setValueCurveAtTime(fadeOut, end - X, X);
    s.connect(g).connect(birdBus); s.start(t, offset); s.stop(end + 0.05);
    const next = end - X;
    bedTimer = window.setTimeout(() => play(next, 0), Math.max(0, (next - ctx!.currentTime - 2) * 1000));
  };
  play(ctx.currentTime + 0.05, rand(0, buf.duration - 20));
}

/* ---------------------------------------------------------------- wind (Human Food) */
// Human Food's sound is a soft wind over the fields (filtered noise that slowly breathes), with the
// birdsong kept far away and quiet, swelling a little now and then, as if a few birds pass over.
let wind: { gain: GainNode } | null = null, windTimer = 0;
function startWind() {
  if (wind) return;
  const src = ctx!.createBufferSource(); src.buffer = noise; src.loop = true;
  const bp = ctx!.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.7;
  const lfo = ctx!.createOscillator(), lg = ctx!.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 320; lfo.connect(lg).connect(bp.frequency);
  const gain = ctx!.createGain(); gain.gain.value = 0;
  src.connect(bp).connect(gain).connect(master); src.start(); lfo.start();
  wind = { gain };
}
/** While Human Food is open with sound on: the wind stays, the birds come and go softly. */
function scheduleMusic() {
  clearTimeout(windTimer);
  if (!enabled || mode !== 'food' || !ctx) return;
  startWind();
  const t = ctx.currentTime;
  wind!.gain.gain.setTargetAtTime(0.12, t, 1.5);
  // a quiet bed of birdsong, with a gentle swell for a few seconds now and then
  birdBus.gain.setTargetAtTime(Math.random() < 0.45 ? rand(0.22, 0.34) : 0.1, t, 2.5);
  windTimer = window.setTimeout(scheduleMusic, rand(6000, 14000));
}
const musicTimerClear = () => { clearTimeout(windTimer); if (wind && ctx) wind.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.6); };

function levels() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const birds = !enabled ? 0 : mode === 'bird' ? 1 : mode === 'book' ? 0.6 : 0.1; // Human Food: faint, the wind schedule swells it
  birdBus.gain.setTargetAtTime(birds, t, 0.9);
  musicBus.gain.setTargetAtTime(0, t, 0.35);
}

/* ---------------------------------------------------------------- effects */
function note(t: number, f0: number, f1: number, dur: number, vol: number, out: AudioNode, type: OscillatorType = 'sine') {
  const o = ctx!.createOscillator(), g = ctx!.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.02);
}
function panner(x: number) { const p = ctx!.createStereoPanner(); p.pan.value = x; return p; }
function noiseHit(t: number, dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, vol: number, pan = 0) { noiseHitTo(sfxBus, t, dur, type, f0, f1, q, vol, pan); }
function noiseHitTo(out: AudioNode, t: number, dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, vol: number, pan = 0) {
  const s = ctx!.createBufferSource(); s.buffer = noise; s.playbackRate.value = rand(0.9, 1.1);
  const f = ctx!.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx!.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(panner(pan)).connect(sfxBus); s.start(t, rand(0, 1.5)); s.stop(t + dur + 0.05);
}

export function sfx(kind: Sfx) {
  if (!enabled || !ctx) return;
  if (mode === 'food') return; // Human Food: the music alone, no clicks, ticks or whooshes
  const t = ctx.currentTime + 0.01;
  switch (kind) {
    case 'turn': // a stiff paper page turning
      noiseHit(t, 0.42, 'bandpass', 4200, 900, 0.9, 0.5, -0.2);
      noiseHit(t + 0.12, 0.22, 'highpass', 6000, 3000, 0.5, 0.18, 0.25);
      break;
    case 'whoosh':
      noiseHit(t, 0.7, 'bandpass', 380, 1600, 1.4, 0.22, rand(-0.3, 0.3));
      break;
    case 'tick':
      note(t, 2400, 1900, 0.03, 0.06, sfxBus, 'triangle');
      break;
    case 'rattle': // seed shaken in a sack
      for (let i = 0; i < 16; i++) noiseHit(t + Math.random() * 0.28, 0.018, 'highpass', 3500, 5000, 0.7, rand(0.05, 0.14), rand(-0.4, 0.4));
      break;
    case 'pop':
      note(t, 520, 1150, 0.09, 0.14, sfxBus); note(t + 0.07, 900, 1500, 0.08, 0.08, sfxBus);
      break;
    case 'chirp': { // a few quick sparrow chips
      const n = 2 + ((Math.random() * 3) | 0);
      for (let i = 0; i < n; i++) note(t + i * 0.11, rand(4200, 5200), rand(2800, 3400), 0.07, 0.1, sfxBus);
      break;
    }
  }
}

/* ---------------------------------------------------------------- control */
export function setMode(m: Mode) {
  mode = m;
  levels();
  if (enabled && mode === 'food') scheduleMusic();
  else musicTimerClear();
}

export async function setEnabled(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {}
  if (on) {
    // iPhone: play as media, so the birds are heard even with the ringer switch on silent
    // (the visitor turned the sound on themselves)
    try { const as = (navigator as Navigator & { audioSession?: { type: string } }).audioSession; if (as) as.type = 'playback'; } catch {}
    boot(); await ctx!.resume();
    master.gain.setTargetAtTime(1, ctx!.currentTime, 0.3);
    startBirds();
    levels();
    if (mode === 'food') scheduleMusic();
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    musicTimerClear();
    levels();
    // let the fade finish, then stop the audio clock so nothing runs while muted
    setTimeout(() => { if (!enabled && ctx) ctx.suspend(); }, 900);
  }
  document.documentElement.classList.toggle('sound-on', on);
}

export const isEnabled = () => enabled;
/** The visitor turned sound on last time. We still need a click before playing. */
export function wantedBefore() { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } } // on by default unless turned off
