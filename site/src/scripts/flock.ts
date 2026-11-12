// Real birds in flight, each on its own small canvas.
//
// Each bird is a frame sequence cut from real slow-motion footage (the wings beat
// exactly as the bird's did), packed into one sprite sheet. The engine moves the
// birds across the sky with depth, a little climb and dip on each wingbeat, bank on
// turns, and lets the pointer scatter them. One loop per flock, and it sleeps
// whenever it is off screen, so it costs almost nothing on a laptop.

import { gsap } from 'gsap';
import { softwareGL } from './gpu';

export type Sheet = {
  /** sprite sheet urls; frames run across them in order (each stays under GPU texture limits) */ src: string[];
  /** frames per sheet image */ per: number;
  /** frame size in the sheet, px */ fw: number; fh: number;
  cols: number; frames: number;
  /** footage frame rate after sampling */ fps: number;
  /** where the bird's body sits inside a frame (0..1), used as the pivot */ ax: number; ay: number;
  /** tilt applied to every frame, radians (levels footage shot at an angle) */ rot?: number;
  /** only the half-size copy is kept decoded (the full image is left to the browser): for
   * extra species, so a phone never holds two full sets of frames in memory */ lite?: boolean;
};

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
/** Blue-and-gold macaw, one full wingbeat cut at full resolution from the 4K version of
 * free slow-motion footage (Christopher Borges on Pexels, Pexels licence), each frame
 * restored with Real-ESRGAN (the video's compression smear removed, feathers sharpened),
 * colour-corrected to the bird's true gold and turquoise. Sheets stay under 4096 px for phone GPUs. */
export const MACAW: Sheet = { src: [0, 1, 2].map((k) => `${BASE}birds/macaw-hq-${k}.webp`), per: 12, fw: 1062, fh: 725, cols: 3, frames: 27, fps: 30, ax: 0.704, ay: 0.708, rot: -0.1 };
/** Scarlet macaw: the same wingbeat, with the gold plumage turned to scarlet (the blue
 * flight and tail feathers kept), so the sky has more than one kind of macaw. */
export const SCARLET: Sheet = { ...MACAW, src: [0, 1, 2].map((k) => `${BASE}birds/scarlet-hq-${k}.webp`), lite: true };

type Bird = {
  sheet: Sheet; img: Mip[];
  /** the bird's own canvas, its context, backing width and the frame it holds */
  el: HTMLCanvasElement | null; g: CanvasRenderingContext2D | null; bw: number; lastF: number;
  x: number; y: number; y0: number; vx: number; size: number; depth: number;
  lane: number; t: number; rate: number; wob: number; dx: number; dy: number; vdx: number; vdy: number; panic: number;
  flip: boolean;
};

export type FlockOptions = {
  sheets: Sheet[];
  count: number;
  /** bird size in CSS px for the nearest and farthest birds; a function gets the canvas
   * size, so birds scale with the screen and are resized when it changes */
  near: number | ((w: number, h: number) => number); far: number | ((w: number, h: number) => number);
  /** vertical band of the sky the birds use (0..1 of height) */ band?: [number, number];
  /** reduced motion: draw one still frame */ still?: boolean;
  /** called when a bird is startled */ onScare?: () => void;
  /** one bird held in the middle of the canvas (the scroll companion) */ pinned?: boolean;
  /** birds that come with the page as it scrolls: they only set off while the visitor is
   * scrolling, ride up the screen with the page (at `parallax` of its speed, so they read
   * as further away), speed up with it, and are gone soon after it stops */
  stream?: { parallax: number };
};

// Frames are decoded once and shared by every flock on the page.
// Each sheet is fetched and decoded off the page (in a worker), then cut into one small
// bitmap per frame: drawing a frame out of a whole 3000 px sheet costs the browser ~50x more
// than drawing a frame-sized bitmap, which is what kept phones (and Lighthouse) busy.
// Every frame also gets a half-size copy made with high-quality resampling, and small birds
// are drawn from that: shrinking a big frame 2-3x in one step looks soft and shimmery.
type Mip = { full: CanvasImageSource | null; half: CanvasImageSource | null; hs: number };
const sheets = new Map<string, Promise<Mip[]>>();
const yieldNow = () => new Promise<void>((r) => setTimeout(r, 0));
/** Resolves once the page has loaded and gone quiet: birds never compete with the first paint. */
export const whenIdle = (() => {
  let p: Promise<void> | null = null;
  return () => (p ??= new Promise<void>((ok) => {
    const idle = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(() => ok(), { timeout: 2500 }) : setTimeout(ok, 600));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }));
})();
// the cutting happens in a worker when the browser allows it (see frames.worker.ts)
let worker: Worker | null | undefined;
let jobs = 0;
const waiting = new Map<number, (r: { frames?: { full: ImageBitmap | null; half: ImageBitmap | null }[]; error?: string }) => void>();
function inWorker(src: string, s: Sheet, count: number, hs: number) {
  if (worker === undefined) {
    try {
      worker = new Worker(new URL('./frames.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => { waiting.get(e.data.id)?.(e.data); waiting.delete(e.data.id); };
      worker.onerror = () => { worker = null; waiting.forEach((done) => done({ error: 'worker' })); waiting.clear(); };
    } catch { worker = null; }
  }
  if (!worker) return Promise.resolve(null);
  const id = ++jobs;
  return new Promise<Mip[] | null>((ok) => {
    waiting.set(id, (r) => ok(r.frames ? r.frames.map((f) => ({ full: f.full ?? f.half, half: f.half, hs })) : null));
    worker!.postMessage({ id, src: new URL(src, location.href).href, fw: s.fw, fh: s.fh, cols: s.cols, count, hs, lite: !!s.lite });
  });
}
function framesOf(src: string, s: Sheet, count: number): Promise<Mip[]> {
  const key = `${src}|${s.lite ? 'lite' : 'full'}`;
  // lite species keep only a 0.7x copy, so a phone never holds two full sets of frames
  const hs = s.lite ? 0.7 : 0.5, hw = Math.round(s.fw * hs), hh = Math.round(s.fh * hs);
  if (!sheets.has(key)) sheets.set(key, (async () => {
    await whenIdle();
    const done = await inWorker(src, s, count, hs);
    if (done) return done;
    // no worker: the same cutting on the page, a frame at a time
    const blob = await (await fetch(src)).blob();
    const cut = (sx: number, sy: number, o?: ImageBitmapOptions) => createImageBitmap(sheet, sx, sy, s.fw, s.fh, o);
    let sheet: ImageBitmap;
    try { sheet = await createImageBitmap(blob); } catch {
      // very old browsers: cut the frames out onto small canvases instead
      const im = await loadImg(src);
      return Array.from({ length: count }, (_, i) => {
        const c = document.createElement('canvas'); c.width = s.fw; c.height = s.fh;
        c.getContext('2d')!.drawImage(im, (i % s.cols) * s.fw, Math.floor(i / s.cols) * s.fh, s.fw, s.fh, 0, 0, s.fw, s.fh);
        return { full: c, half: null, hs: 1 };
      });
    }
    const out: Mip[] = [];
    for (let i = 0; i < count; i++) {
      const sx = (i % s.cols) * s.fw, sy = Math.floor(i / s.cols) * s.fh;
      const full = s.lite ? null : await cut(sx, sy);
      await yieldNow();
      let half: ImageBitmap | null = null;
      try { half = await cut(sx, sy, { resizeWidth: hw, resizeHeight: hh, resizeQuality: 'high' }); } catch { /* full only */ }
      out.push({ full: full ?? half, half, hs });
      await yieldNow(); // a frame at a time, so the page never stutters while birds load
    }
    sheet.close();
    return out;
  })());
  return sheets.get(key)!;
}
const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = no; i.src = src; });

export function createFlock(host: HTMLElement, o: FlockOptions) {
  // Every bird is its own small canvas, moved by the compositor with a CSS transform. Only a
  // bird's own pixels are redrawn, and only when its wingbeat moves on to the next frame:
  // one canvas the size of the sky cost a phone (and a GPU-less laptop) millions of pixels a
  // frame even when it only held three birds.
  host.style.overflow = 'hidden';
  // the birds' own depth order stays inside the flock: the flock as a whole sits where the page
  // puts it (behind the hero text and pack), as the single canvas did
  host.style.isolation = 'isolate';
  const band = o.band ?? [0.08, 0.72];
  let W = 0, H = 0, dpr = 1, running = false, visible = false, wanted = false, last = 0;
  // stream mode: page scroll since the last frame, how stirred the sky is, and whether new
  // birds may set off at all
  let lastSY = scrollY, stir = 0, sinceSpawn = 9, active = true, idle = false;
  const birds: Bird[] = [];
  const imgs = new Map<Sheet, Mip[]>();
  const spare: HTMLCanvasElement[] = [];
  let cap = 3; // highest pixel density drawn (lowered once frames load, if there is no graphics card)

  const attach = (b: Bird) => {
    const el = spare.pop() ?? document.createElement('canvas');
    el.className = 'flock__bird';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;will-change:transform;transform-origin:${b.sheet.ax * 100}% ${b.sheet.ay * 100}%;z-index:${Math.round(b.depth * 100)}`;
    b.el = el; b.g = el.getContext('2d'); b.bw = 0; b.lastF = -1;
    host.appendChild(el);
    fit(b);
  };
  const detach = (b: Bird) => { if (b.el) { b.el.remove(); spare.push(b.el); b.el = null; b.g = null; } };
  /** size a bird's canvas to the bird at this screen's pixel density */
  const fit = (b: Bird) => {
    if (!b.el) return;
    const w = b.size, h = (w * b.sheet.fh) / b.sheet.fw, bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
    if (bw === b.bw && bh === b.el.height) return;
    b.el.width = bw; b.el.height = bh; b.bw = bw; b.lastF = -1;
    b.el.style.width = `${w}px`; b.el.style.height = `${h}px`;
    if (b.g) b.g.imageSmoothingQuality = 'high';
  };

  const size = () => {
    // draw at the screen's own pixel density (phones are 3x): a 2x canvas stretched to 3x
    // was a large part of why the birds looked soft
    // ...except where there is no graphics card: every bird pixel is then pushed by the CPU,
    // and smooth flight matters more than the last bit of sharpness
    dpr = Math.min(devicePixelRatio || 1, cap);
    W = host.clientWidth; H = host.clientHeight;
  };

  const px = (v: FlockOptions['near']) => (typeof v === 'function' ? v(W, H) : v);
  // never wider on screen than the footage itself: stretching a frame is what reads as blur
  const crisp = (size: number) => Math.min(size, Math.max(...o.sheets.map((s) => s.fw)) / dpr);
  const sizeAt = (depth: number) => crisp(px(o.far) + (px(o.near) - px(o.far)) * depth);
  const blank = { el: null, g: null, bw: 0, lastF: -1 };
  const spawn = (b: Partial<Bird> & { sheet: Sheet; img: Mip[]; depth: number; lane?: number }, anywhere: boolean): Bird => {
    const size = sizeAt(b.depth);
    const keep = { el: b.el ?? null, g: b.g ?? null, bw: b.bw ?? 0, lastF: -1 };
    if (o.pinned) return { ...keep, sheet: b.sheet, img: b.img, depth: 1, size, lane: 0, x: W / 2, y: H / 2, y0: H / 2, vx: 0, t: 0, rate: 1, wob: 0, dx: 0, dy: 0, vdx: 0, vdy: 0, panic: 0, flip: false };
    // each bird keeps its own height band, so a small flock never bunches up
    const lanes = Math.max(1, o.count), lane = b.lane ?? 0, lh = (band[1] - band[0]) / lanes;
    const y0 = H * (band[0] + lh * (lane + 0.2 + Math.random() * 0.6));
    // nearer birds cross faster: parallax
    const vx = (W * 0.045 + 26) * (0.55 + b.depth * 0.9) * (0.85 + Math.random() * 0.3);
    return {
      ...keep, sheet: b.sheet, img: b.img, depth: b.depth, size, lane,
      x: anywhere ? ((lane + 0.25 + Math.random() * 0.5) / lanes) * W : -size * 0.8, y: y0, y0, vx,
      t: Math.random() * 10, rate: 0.85 + Math.random() * 0.3, wob: Math.random() * 6.28,
      dx: 0, dy: 0, vdx: 0, vdy: 0, panic: 0, flip: false,
    };
  };

  const streamBird = (down: boolean): Bird => {
    // any species whose frames are ready (a second one may still be loading)
    const pool = o.sheets.filter((s) => imgs.has(s)), sheet = pool[(Math.random() * pool.length) | 0];
    const depth = 0.35 + Math.random() * 0.65, size = sizeAt(depth);
    // scrolling down, the page carries birds upward, so they set off low (and the reverse)
    const y0 = H * (down ? 0.42 + Math.random() * 0.4 : 0.12 + Math.random() * 0.4);
    return {
      ...blank, sheet, img: imgs.get(sheet)!, depth, size, lane: 0, x: -size * 0.75, y: y0, y0,
      vx: (W * 0.16 + 80) * (0.7 + depth * 0.6), t: Math.random() * 10, rate: 0.9 + Math.random() * 0.2, wob: Math.random() * 6.28,
      dx: 0, dy: 0, vdx: 0, vdy: 0, panic: 0, flip: false,
    };
  };
  function flow(dt: number) {
    const sy = scrollY, d = sy - lastSY; lastSY = sy;
    // stir rises with scroll speed and dies away within about a second of stopping
    stir = Math.max(stir * Math.pow(0.03, dt), Math.min(1, Math.abs(d) / (240 * dt + 1e-3)));
    sinceSpawn += dt;
    if (active && stir > 0.12 && birds.length < o.count && sinceSpawn > 1.1 && imgs.size) {
      const nb = streamBird(d >= 0); birds.push(nb); attach(nb); sinceSpawn = 0;
    }
    for (let i = birds.length - 1; i >= 0; i--) {
      const b = birds[i];
      b.y0 -= d * o.stream!.parallax * (0.55 + 0.45 * b.depth);
      b.x += Math.abs(d) * 0.18 * b.depth; // the scroll gives them a push
      if (b.x - b.size * 0.3 > W + 40 || b.y0 < -b.size * 0.8 || b.y0 > H + b.size * 0.8) { detach(b); birds.splice(i, 1); }
    }
  }

  function draw(dt: number) {
    if (o.stream && dt) flow(dt);
    for (const b of birds) {
      const s = b.sheet;
      if (dt) {
        b.t += dt * b.rate * (1 + b.panic * 1.6);
        b.x += b.vx * dt * (1 + b.panic * 1.2);
        b.wob += dt * 0.5;
        // scatter: spring back toward the flight line
        b.vdx += (-b.dx * 2.2 - b.vdx * 2.4) * dt; b.vdy += (-b.dy * 2.2 - b.vdy * 2.4) * dt;
        b.dx += b.vdx * dt; b.dy += b.vdy * dt;
        b.panic = Math.max(0, b.panic - dt * 0.6);
        if (!o.stream && b.x - b.size > W + 40) { Object.assign(b, spawn(b, false)); fit(b); }
        if (o.pinned) b.x = W / 2;
      }
      if (!b.el || !b.g) continue;
      const f = Math.floor(b.t * s.fps) % s.frames;
      // the footage already carries the bird's own rise and fall; add a slow drift
      const y = b.y0 + (o.pinned ? 0 : Math.sin(b.wob) * H * 0.03) + b.dy;
      const x = b.x + b.dx;
      const w = b.size, h = (w * s.fh) / s.fw;
      const bank = (s.rot ?? 0) + Math.cos(b.wob) * 0.05 + gsap.utils.clamp(-0.35, 0.35, b.vdy * 0.0015);
      // the wings only move on when the footage does (30 times a second)
      if (f !== b.lastF) {
        // the smaller copy only when it is still at least as big as the bird on screen:
        // stretching it up (even a little) is what made the birds look soft on phones
        const mip = b.img[f], small = mip.half && b.bw <= s.fw * mip.hs;
        b.g.clearRect(0, 0, b.bw, b.el.height);
        b.g.drawImage((small ? mip.half : mip.full)!, 0, 0, b.bw, b.el.height);
        b.lastF = f;
      }
      b.el.style.transform = `translate3d(${(x - w * s.ax).toFixed(2)}px,${(y - h * s.ay).toFixed(2)}px,0) rotate(${bank.toFixed(4)}rad)`;
    }
  }

  const tick = () => {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - (last || now)); last = now;
    draw(dt);
    // an empty, still sky costs nothing: sleep until the page scrolls again (never on the
    // first frame after waking, which has no time step yet)
    if (o.stream && dt && !birds.length && stir < 0.05) { idle = true; sync(); }
  };
  // a scroll wakes the sky already stirred, so the first bird can set off straight away
  const wakeOnScroll = () => { if (idle && active) { idle = false; stir = Math.max(stir, 0.5); lastSY = scrollY; sync(); } };
  if (o.stream) addEventListener('scroll', wakeOnScroll, { passive: true });
  const sync = () => {
    const go = wanted && visible && !document.hidden && (birds.length > 0 || (!!o.stream && !idle)) && !o.still;
    if (go && !running) { last = 0; gsap.ticker.add(tick); running = true; }
    if (!go && running) { gsap.ticker.remove(tick); running = false; }
  };

  const ready = (async () => {
    // decoded once into bitmaps so drawing never stalls on decode
    const loads = o.sheets.map(async (s) => {
      const parts = await Promise.all(s.src.map((u, k) => framesOf(u, s, Math.min(s.per, s.frames - k * s.per))));
      imgs.set(s, parts.flat());
    });
    // a stream starts with the first species to arrive; a fixed flock waits for all of them
    await (o.stream ? Promise.race(loads) : Promise.all(loads));
    if (softwareGL()) cap = 1;
    size();
    for (let i = 0; i < (o.stream ? 0 : o.count); i++) {
      const sheet = o.sheets[i % o.sheets.length];
      // spread depths so the flock reads as near and far
      const depth = o.count === 1 ? 1 : i / (o.count - 1);
      // lanes are shuffled so the nearest bird is not always lowest
      const lane = [1, 0, 2, 3, 4][i] ?? i;
      const b = spawn({ sheet, img: imgs.get(sheet)!, depth, lane: Math.min(lane, o.count - 1) }, true);
      birds.push(b); attach(b);
    }
    draw(0);
    sync();
  })();

  new ResizeObserver(() => {
    const ow = W, oh = H; size();
    if (ow && W && !o.stream) birds.forEach((b) => { b.x *= W / ow; b.y0 *= H / (oh || H); if (o.pinned) b.y0 = H / 2; });
    birds.forEach((b) => { b.size = sizeAt(b.depth); fit(b); });
    if (!running) draw(0);
  }).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(host);
  document.addEventListener('visibilitychange', sync);

  return {
    ready,
    play() { wanted = true; lastSY = scrollY; sync(); },
    /** stream mode: whether new birds may set off (the ones in the air finish their flight) */
    setActive(on: boolean) { active = on; if (on && idle) { idle = false; stir = Math.max(stir, 0.5); lastSY = scrollY; sync(); } },
    pause() { wanted = false; sync(); },
    /** startle the birds near a point (CSS px inside the flock's box) */
    scare(px: number, py: number) {
      let any = false;
      for (const b of birds) {
        const bx = b.x + b.dx, by = b.y0 + b.dy;
        const dx = bx - px, dy = by - py, d = Math.hypot(dx, dy), r = 120 + b.size * 0.6;
        if (d > r) continue;
        const k = ((r - d) / r) * 520;
        b.vdx += (dx / (d || 1)) * k; b.vdy += (dy / (d || 1)) * k - 160; b.panic = 1; any = true;
      }
      if (any) o.onScare?.();
      return any;
    },
  };
}
