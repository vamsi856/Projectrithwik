// All sound on the site is generated live with the Web Audio API: no files to
// download, no licences, and the birdsong never loops. Off until the visitor
// turns it on (browsers require a click first, and surprise audio is rude).

type Mode = 'book' | 'bird' | 'food' | 'off';
export type Sfx = 'turn' | 'whoosh' | 'tick' | 'rattle' | 'pop' | 'chirp';

const KEY = 'rithwik-sound';
let ctx: AudioContext | null = null;
let master: GainNode, ambBus: GainNode, sfxBus: GainNode, musicBus: GainNode, noise: AudioBuffer;
let drone: { gain: GainNode } | null = null, musicTimer = 0;
let enabled = false, mode: Mode = 'book', songTimer = 0, wind: { src: AudioBufferSourceNode; gain: GainNode; lfo: OscillatorNode } | null = null;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

function boot() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // a gentle compressor keeps chirps from ever getting harsh
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
  // a soft generated room reverb makes everything warmer and more natural
  const verb = ctx.createConvolver();
  const len = ctx.sampleRate * 2.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  verb.buffer = ir;
  const verbGain = ctx.createGain(); verbGain.gain.value = 0.55; verb.connect(verbGain).connect(comp);
  const soften = ctx.createBiquadFilter(); soften.type = 'lowpass'; soften.frequency.value = 7500; soften.connect(comp);
  ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(soften);
  const ambSend = ctx.createGain(); ambSend.gain.value = 0.35; ambBus.connect(ambSend).connect(verb);
  musicBus = ctx.createGain(); musicBus.gain.value = 0.9; musicBus.connect(soften);
  const musicSend = ctx.createGain(); musicSend.gain.value = 0.9; musicBus.connect(musicSend).connect(verb);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(comp);
  // two seconds of pink-ish noise, reused by wind and effects
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 0.9; }
  document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : enabled && ctx.resume(); });
  return ctx;
}

function panner(x: number) { const p = ctx!.createStereoPanner(); p.pan.value = x; return p; }

/* ---------------------------------------------------------------- birdsong */
// a single falling or rising note
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

const species: ((t: number, out: AudioNode, v: number) => number)[] = [
  // sparrow-like chips: a few quick down-sweeps
  (t, out, v) => { const n = 2 + ((Math.random() * 4) | 0); for (let i = 0; i < n; i++) note(t + i * 0.11, rand(4200, 5200), rand(2800, 3400), 0.07, v, out); return n * 0.11; },
  // canary trill: a rapid run of tiny notes
  (t, out, v) => { const n = 8 + ((Math.random() * 10) | 0), f = rand(3600, 4800); for (let i = 0; i < n; i++) note(t + i * 0.038, f * (1 + (i % 2) * 0.12), f * 0.86, 0.032, v * 0.8, out); return n * 0.038; },
  // bulbul-style two-part whistle
  (t, out, v) => { const a = rand(1700, 2200); note(t, a, a * 1.35, 0.16, v, out); note(t + 0.19, a * 1.3, a * 0.95, 0.2, v, out); if (Math.random() > 0.5) note(t + 0.44, a * 1.1, a * 1.5, 0.12, v * 0.8, out); return 0.6; },
  // parakeet squawk: rough, buzzy and short
  (t, out, v) => {
    const o = ctx!.createOscillator(), m = ctx!.createOscillator(), mg = ctx!.createGain(), g = ctx!.createGain(), f = ctx!.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(rand(1900, 2400), t); o.frequency.exponentialRampToValueAtTime(rand(1300, 1600), t + 0.18);
    m.frequency.value = rand(55, 80); mg.gain.value = 420; m.connect(mg).connect(o.frequency);
    f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.45, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(f).connect(g).connect(out); o.start(t); m.start(t); o.stop(t + 0.22); m.stop(t + 0.22);
    return 0.25;
  },
  // warbler: a wobbling phrase
  (t, out, v) => {
    const o = ctx!.createOscillator(), m = ctx!.createOscillator(), mg = ctx!.createGain(), g = ctx!.createGain(), dur = rand(0.45, 0.8);
    o.frequency.setValueAtTime(rand(2600, 3400), t); o.frequency.linearRampToValueAtTime(rand(3000, 4200), t + dur);
    m.frequency.value = rand(18, 34); mg.gain.value = rand(300, 700); m.connect(mg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.7, t + 0.05); g.gain.setValueAtTime(v * 0.7, t + dur - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); m.start(t); o.stop(t + dur + 0.02); m.stop(t + dur + 0.02);
    return dur;
  },
];

function song(volume = 1) {
  if (!ctx) return;
  const near = Math.random();
  const out = ctx.createGain(); out.gain.value = 1;
  const pan = panner(rand(-0.85, 0.85));
  // distant birds are quieter and duller
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3500 + near * 6000;
  out.connect(lp).connect(pan).connect(ambBus);
  const v = (0.018 + near * 0.05) * volume;
  let t = ctx.currentTime + 0.05;
  const sing = species[pick([0, 0, 1, 1, 1, 2, 2, 2, 4, 4, 3])];
  const reps = Math.random() > 0.6 ? 2 : 1;
  for (let r = 0; r < reps; r++) t += sing(t, out, v) + rand(0.15, 0.4);
}

function schedule() {
  clearTimeout(songTimer);
  if (!enabled || mode === 'off') return;
  const busy = mode === 'bird' ? 1 : mode === 'book' ? 0.6 : 0.12;
  if (Math.random() < busy) song(mode === 'food' ? 0.4 : 1);
  if (mode === 'bird' && Math.random() < 0.3) setTimeout(() => song(0.8), rand(150, 600)); // a reply
  songTimer = window.setTimeout(schedule, rand(900, 3200) / (0.6 + busy));
}

/* ---------------------------------------------------------------- wind */
function startWind() {
  if (!ctx || wind) return;
  const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.7;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 320; lfo.connect(lg).connect(bp.frequency);
  const gain = ctx.createGain(); gain.gain.value = 0;
  src.connect(bp).connect(gain).connect(ambBus); src.start(); lfo.start();
  wind = { src, gain, lfo };
}
function windLevel() {
  if (!ctx || !wind) return;
  const level = mode === 'food' ? 0.05 : mode === 'bird' ? 0.045 : 0.035;
  wind.gain.gain.setTargetAtTime(enabled ? level : 0, ctx.currentTime, 0.8);
}


/* ---------------------------------------------------------------- calm music (Human Food) */
// Mohanam, a five-note scale (Sa Ri Ga Pa Dha), played slowly like a distant flute or veena
const SA = 261.63;
const MOHANAM = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
function pluck(t: number, f: number, vol: number, dur: number, pan: number) {
  const o1 = ctx!.createOscillator(), o2 = ctx!.createOscillator(), g = ctx!.createGain(), lp = ctx!.createBiquadFilter();
  o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = f; o2.frequency.value = f * 2.001;
  const g2 = ctx!.createGain(); g2.gain.value = 0.18;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o1.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(panner(pan)).connect(musicBus);
  o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
}
function chime(t: number) {
  const f = SA * 4 * pick(MOHANAM);
  const o = ctx!.createOscillator(), g = ctx!.createGain();
  o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.018, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
  o.connect(g).connect(panner(rand(-0.7, 0.7))).connect(musicBus); o.start(t); o.stop(t + 2.7);
}
let lastDeg = 0;
function phrase() {
  if (!ctx) return;
  let t = ctx.currentTime + 0.1;
  const n = 2 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) {
    // mostly step to a neighbouring note, like a slow alaap
    lastDeg = Math.max(0, Math.min(7, lastDeg + pick([-1, -1, 1, 1, 2, -2, 0])));
    const oct = lastDeg >= 5 ? 2 : 1, f = SA * oct * MOHANAM[lastDeg % 5];
    pluck(t, f, 0.05, rand(1.8, 3), rand(-0.35, 0.35));
    t += rand(0.45, 0.9);
  }
  if (Math.random() < 0.35) chime(t + rand(0.2, 1));
}
function startDrone() {
  if (!ctx || drone) return;
  const gain = ctx.createGain(); gain.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
  [[SA / 2, 'sine', 0.6], [SA / 2 * 1.5, 'triangle', 0.25], [SA / 2 * 1.003, 'sine', 0.4], [SA, 'sine', 0.15]].forEach(([f, type, v]) => {
    const o = ctx!.createOscillator(), g = ctx!.createGain(); o.type = type as OscillatorType; o.frequency.value = f as number; g.gain.value = v as number;
    o.connect(g).connect(lp); o.start();
  });
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.006; lfo.connect(lg).connect(gain.gain); lfo.start();
  lp.connect(gain).connect(musicBus);
  drone = { gain };
}
function scheduleMusic() {
  clearTimeout(musicTimer);
  if (!enabled || mode !== 'food') return;
  phrase();
  musicTimer = window.setTimeout(scheduleMusic, rand(2600, 5200));
}
function musicLevel() {
  if (!ctx) return;
  if (mode === 'food' && enabled) startDrone();
  if (drone) drone.gain.gain.setTargetAtTime(enabled && mode === 'food' ? 0.022 : 0, ctx.currentTime, 1.2);
  scheduleMusic();
}

/* ---------------------------------------------------------------- effects */
function noiseHit(t: number, dur: number, type: BiquadFilterType, f0: number, f1: number, q: number, vol: number, pan = 0) {
  const s = ctx!.createBufferSource(); s.buffer = noise; s.playbackRate.value = rand(0.9, 1.1);
  const f = ctx!.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx!.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(panner(pan)).connect(sfxBus); s.start(t, rand(0, 1.5)); s.stop(t + dur + 0.05);
}

export function sfx(kind: Sfx) {
  if (!enabled || !ctx) return;
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
    case 'chirp':
      species[0](t, sfxBus, 0.1);
      break;
  }
}

/* ---------------------------------------------------------------- control */
export function setMode(m: Mode) {
  mode = m;
  windLevel();
  schedule();
  musicLevel();
}

export async function setEnabled(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {}
  if (on) {
    boot(); await ctx!.resume();
    startWind();
    master.gain.setTargetAtTime(0.9, ctx!.currentTime, 0.4);
    windLevel(); schedule(); musicLevel();
    if (mode === 'food') phrase(); else song(); // greet straight away so it's obvious sound is on
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    clearTimeout(songTimer); clearTimeout(musicTimer);
    windLevel(); musicLevel();
  }
  document.documentElement.classList.toggle('sound-on', on);
}

export const isEnabled = () => enabled;
/** The visitor turned sound on last time. We still need a click before playing. */
export function wantedBefore() { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } } // on by default unless turned off
