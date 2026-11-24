// Music and sound for the ad, made with the Web Audio API (rendered offline in Chromium by
// make-music.cjs). Everything is generated here, so the soundtrack is ours to broadcast.
//   calm        a plain, calm piece for the whole ad: soft pad, felt piano, bass (D major, 72 bpm)
//   human-food  the site's own Human Food music (site/src/scripts/sound.ts): a tanpura-style drone,
//               slow notes in raga Mohanam and now and then a chime
//   page-turn   the site's page-turn sound
// A fixed random seed makes every render identical.
(() => {
  const SR = 48000;
  let seed = 7;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rand = (a, b) => a + rnd() * (b - a);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function reverb(ctx, seconds, decay, tone) {
    const len = Math.floor(SR * seconds), ir = ctx.createBuffer(2, len, SR);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch); let lp = 0;
      for (let i = 0; i < len; i++) {
        const w = rnd() * 2 - 1; lp += (w - lp) * tone; // darker tail
        d[i] = (i < SR * 0.012 ? 0 : lp) * Math.pow(1 - i / len, decay);
      }
    }
    const c = ctx.createConvolver(); c.buffer = ir; return c;
  }
  const panner = (ctx, x) => { const p = ctx.createStereoPanner(); p.pan.value = x; return p; };

  /* ---------------------------------------------------------------- calm */
  function calm(ctx, out) {
    const BEAT = 60 / 72, BAR = BEAT * 4;
    const bus = ctx.createGain(); bus.gain.value = 1;
    const verb = reverb(ctx, 4.2, 3.2, 0.35), wet = ctx.createGain(); wet.gain.value = 0.42;
    const dry = ctx.createGain(); dry.gain.value = 0.8;
    bus.connect(dry).connect(out); bus.connect(verb); verb.connect(wet).connect(out);

    // chords: bass, pad voicing, the notes the piano picks from (MIDI)
    const D = { bass: 38, pad: [54, 57, 61, 64], arp: [62, 66, 69, 73, 76] };          // Dmaj9
    const Bm = { bass: 47, pad: [54, 57, 62, 64], arp: [59, 62, 66, 69, 74] };         // Bm7(add11)
    const G = { bass: 43, pad: [54, 59, 62, 69], arp: [55, 59, 62, 66, 69] };          // Gmaj9
    const A = { bass: 45, pad: [52, 57, 62, 64], arp: [57, 62, 64, 69, 71] };          // Asus4
    const plan = [D, D, Bm, G, A, D, Bm, G, A, D, Bm, G, A, D, G, A]; // bars 0..15; the last chord follows
    const FINAL = 16 * BAR; // the closing D chord, then it rings out

    // felt piano: a soft harmonic tone, its brightness closing as it fades
    const harm = new Float32Array([0, 1, 0.42, 0.16, 0.09, 0.05, 0.03, 0.02, 0.012]);
    const wave = ctx.createPeriodicWave(harm, new Float32Array(harm.length));
    const piano = (t, m, vel, len) => {
      const f = midi(m), o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.setPeriodicWave(wave); o.frequency.value = f * (1 + rand(-0.0006, 0.0006));
      lp.type = 'lowpass'; lp.Q.value = 0.4;
      lp.frequency.setValueAtTime(Math.min(9000, f * (4 + vel * 6)), t); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.6), t + 1.8);
      const decay = Math.min(6, 2.6 + (72 - m) * 0.08) * (len || 1);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16 * vel, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.06 * vel, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(lp).connect(g).connect(panner(ctx, Math.max(-0.5, Math.min(0.5, (m - 64) / 28)))).connect(bus);
      o.start(t); o.stop(t + decay + 0.1);
    };
    // pad: a soft triangle and a sine, slightly detuned, through a dark filter. (Saws made the
    // overtones of F#3, A3 and C#4 pile up near 1100 Hz, a faint whine all through the piece.)
    const pad = (t, notes, len, vol) => {
      notes.forEach((m, k) => {
        const g = ctx.createGain(), lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 640; lp.Q.value = 0.3;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 1.6, t + 1.6); g.gain.setValueAtTime(vol * 1.6, t + len - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + len + 2.4);
        for (const [c, type] of [[-6, 'triangle'], [6, 'sine']]) {
          const o = ctx.createOscillator(); o.type = type; o.frequency.value = midi(m); o.detune.value = c + rand(-2, 2);
          o.connect(lp); o.start(t); o.stop(t + len + 2.5);
        }
        lp.connect(g).connect(panner(ctx, (k - 1.5) * 0.25)).connect(bus);
      });
    };
    const bass = (t, m, len, vol) => {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
      o.frequency.value = midi(m); o2.frequency.value = midi(m) * 2; g2.gain.value = 0.12;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.25); g.gain.setValueAtTime(vol, t + len - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + len + 0.9);
      o.connect(g); o2.connect(g2).connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + len + 1); o2.stop(t + len + 1);
    };
    const bell = (t, m, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = midi(m); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      o.connect(g).connect(panner(ctx, rand(-0.6, 0.6))).connect(bus); o.start(t); o.stop(t + 4.1);
    };

    plan.forEach((ch, bar) => {
      const t = bar * BAR;
      pad(t, ch.pad, BAR, bar === 0 ? 0.022 : 0.03);
      if (bar >= 2) bass(t, ch.bass, BAR, bar >= 5 ? 0.2 : 0.14);
      if (bar === 0) { bell(t + 1.2, 81, 0.05); bell(t + 2.4, 78, 0.04); return; }
      // broken chord in eighths, a few left out, gently louder on the beat
      const pattern = [0, 2, 1, 3, 2, 4, 3, 1];
      pattern.forEach((idx, k) => {
        if (bar < 3 && k % 2 === 1) return;           // sparser at first
        if (rnd() < 0.18 && k > 0) return;
        const swing = k % 2 ? rand(0.0, 0.025) : rand(-0.01, 0.01);
        piano(t + k * (BEAT / 2) + swing, ch.arp[idx], (k % 2 ? 0.55 : 0.75) * rand(0.85, 1.05));
      });
      // a slow melody on top in the middle of the piece
      if (bar >= 5 && bar <= 13) {
        const top = ch.arp.slice(-3).map((m) => m + 12);
        piano(t + rand(-0.01, 0.02), pick(top), 0.5, 1.3);
        if (rnd() < 0.6) piano(t + BEAT * 2 + rand(0, 0.03), pick(top), 0.42, 1.2);
      }
      if (bar % 4 === 2) bell(t + BEAT * 3.5, ch.arp[4] + 12, 0.035);
      // the Asus4 opens to A on beat 3
      if (ch === A) piano(t + BEAT * 2, 61, 0.6);
    });
    // the end: a slower D chord rolled up the keyboard, then it rings away
    pad(FINAL, D.pad, 7, 0.03); bass(FINAL, D.bass, 6, 0.2);
    [50, 57, 62, 66, 69, 73, 78].forEach((m, k) => piano(FINAL + k * 0.11, m, 0.62 - k * 0.03, 1.6));
    bell(FINAL + 1.4, 86, 0.04);
    return FINAL + 9;
  }

  /* ---------------------------------------------------------------- the site's Human Food music */
  function humanFood(ctx, out, seconds) {
    const SA = 261.63, MOHANAM = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(out);
    const verb = reverb(ctx, 2.8, 2.6, 1), verbGain = ctx.createGain(); verbGain.gain.value = 0.55; verb.connect(verbGain).connect(comp);
    const soften = ctx.createBiquadFilter(); soften.type = 'lowpass'; soften.frequency.value = 7500; soften.connect(comp);
    const bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(soften);
    const send = ctx.createGain(); send.gain.value = 0.9; bus.connect(send).connect(verb);
    const pluck = (t, f, vol, dur, pan) => {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = f; o2.frequency.value = f * 2.001; g2.gain.value = 0.18;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o1.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(panner(ctx, pan)).connect(bus);
      o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
    };
    const chime = (t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = SA * 4 * pick(MOHANAM); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g).connect(panner(ctx, rand(-0.7, 0.7))).connect(bus); o.start(t); o.stop(t + 2.7);
    };
    // drone
    const dg = ctx.createGain(); dg.gain.value = 0.15;
    const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1400;
    [[SA / 2, 'sine', 0.45], [SA / 2 * 1.5, 'triangle', 0.25], [SA / 2 * 1.003, 'sine', 0.3], [SA, 'sine', 0.45], [SA * 1.5, 'sine', 0.12]].forEach(([f, type, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; o.connect(g).connect(dlp); o.start(0); o.stop(seconds);
    });
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.04; lfo.connect(lg).connect(dg.gain); lfo.start(0); lfo.stop(seconds);
    dlp.connect(dg).connect(bus);
    // phrases every few seconds, as on the site
    let lastDeg = 0;
    for (let t = 0.4; t < seconds - 3; t += rand(2.6, 5.2)) {
      let tt = t;
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        lastDeg = Math.max(0, Math.min(7, lastDeg + pick([-1, -1, 1, 1, 2, -2, 0])));
        const oct = lastDeg >= 5 ? 2 : 1;
        pluck(tt, SA * oct * MOHANAM[lastDeg % 5], 0.42, rand(1.8, 3), rand(-0.35, 0.35));
        tt += rand(0.45, 0.9);
      }
      if (rnd() < 0.35) chime(tt + rand(0.2, 1));
    }
    return seconds;
  }

  /* ---------------------------------------------------------------- the page-turn sound */
  function pageTurn(ctx, out) {
    const noise = ctx.createBuffer(1, SR * 2, SR), d = noise.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) { const w = rnd() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 0.9; }
    const hit = (t, dur, type, f0, f1, q, vol, pan) => {
      const s = ctx.createBufferSource(); s.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(panner(ctx, pan)).connect(out); s.start(t, 0.3); s.stop(t + dur + 0.05);
    };
    hit(0.02, 0.42, 'bandpass', 4200, 900, 0.9, 0.5, -0.2);
    hit(0.14, 0.22, 'highpass', 6000, 3000, 0.5, 0.18, 0.25);
    return 1;
  }

  /** Renders one track; returns base64 of 16-bit stereo PCM, peak-normalised to -3 dBFS. */
  window.renderTrack = async (name) => {
    const seconds = name === 'calm' ? 64 : name === 'human-food' ? 40 : 1;
    const ctx = new OfflineAudioContext(2, Math.ceil(seconds * SR), SR);
    const out = ctx.createGain(); out.connect(ctx.destination);
    if (name === 'calm') calm(ctx, out); else if (name === 'human-food') humanFood(ctx, out, seconds); else pageTurn(ctx, out);
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    let peak = 1e-9; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const k = Math.pow(10, -3 / 20) / peak;
    // a short fade at the very end so nothing clicks
    const fade = Math.floor(SR * (name === 'page-turn' ? 0.05 : 3));
    const pcm = new Int16Array(L.length * 2);
    for (let i = 0; i < L.length; i++) {
      const f = i > L.length - fade ? (L.length - i) / fade : 1;
      for (const [c, ch] of [[0, L], [1, R]]) {
        const dither = (rnd() - rnd()) / 32768;
        pcm[i * 2 + c] = Math.max(-32768, Math.min(32767, Math.round((ch[i] * k * f + dither) * 32767)));
      }
    }
    const bytes = new Uint8Array(pcm.buffer); let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { sampleRate: SR, data: btoa(s) };
  };
})();
