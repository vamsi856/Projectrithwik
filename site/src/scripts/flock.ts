// Real birds in flight, drawn on one canvas.
//
// Each bird is a frame sequence cut from real slow-motion footage (the wings beat
// exactly as the bird's did), packed into one sprite sheet. The engine moves the
// birds across the sky with depth, a little climb and dip on each wingbeat, bank on
// turns, and lets the pointer scatter them. One canvas, one loop, and it sleeps
// whenever it is off screen, so it costs almost nothing on a laptop.

import { gsap } from 'gsap';

export type Sheet = {
  /** sprite sheet urls; frames run across them in order (each stays under GPU texture limits) */ src: string[];
  /** frames per sheet image */ per: number;
  /** frame size in the sheet, px */ fw: number; fh: number;
  cols: number; frames: number;
  /** footage frame rate after sampling */ fps: number;
  /** where the bird's body sits inside a frame (0..1), used as the pivot */ ax: number; ay: number;
  /** tilt applied to every frame, radians (levels footage shot at an angle) */ rot?: number;
};

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
/** Blue-and-gold macaw, one full wingbeat cut from the 4K version of free slow-motion
 * footage (Christopher Borges on Pexels, Pexels licence), colour-corrected to the
 * bird's true gold and turquoise. */
export const MACAW: Sheet = { src: [`${BASE}birds/macaw-4k-0.webp`, `${BASE}birds/macaw-4k-1.webp`], per: 20, fw: 947, fh: 651, cols: 4, frames: 27, fps: 30, ax: 0.711, ay: 0.71, rot: -0.1 };

type Bird = {
  sheet: Sheet; img: Mip[];
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
};

// one decoded bitmap per sheet, shared by every flock on the page
// Each sheet is also decoded at half size with high-quality resampling, and small birds
// are drawn from that copy: shrinking a big frame by 2-3x in one step on the GPU looks soft
// and shimmery, while a pre-shrunk copy stays crisp.
type Mip = { full: CanvasImageSource; half: CanvasImageSource | null };
const bitmaps = new Map<string, Promise<Mip>>();
const bitmap = (src: string) => {
  if (!bitmaps.has(src)) bitmaps.set(src, loadImg(src).then(async (im): Promise<Mip> => {
    if (!('createImageBitmap' in window)) return { full: im, half: null };
    const full = await createImageBitmap(im);
    let half: ImageBitmap | null = null;
    try { half = await createImageBitmap(im, { resizeWidth: Math.round(im.naturalWidth / 2), resizeHeight: Math.round(im.naturalHeight / 2), resizeQuality: 'high' }); } catch { /* full only */ }
    return { full, half };
  }));
  return bitmaps.get(src)!;
};
const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = no; i.src = src; });

export function createFlock(canvas: HTMLCanvasElement, o: FlockOptions) {
  const ctx = canvas.getContext('2d', { alpha: true })!;
  const band = o.band ?? [0.08, 0.72];
  let W = 0, H = 0, dpr = 1, running = false, visible = false, wanted = false, last = 0;
  const birds: Bird[] = [];
  const imgs = new Map<Sheet, Mip[]>();

  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr)); canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.imageSmoothingQuality = 'high';
    if (o.still) draw(0);
  };

  const px = (v: FlockOptions['near']) => (typeof v === 'function' ? v(W, H) : v);
  const sizeAt = (depth: number) => px(o.far) + (px(o.near) - px(o.far)) * depth;
  const spawn = (b: Partial<Bird> & { sheet: Sheet; img: Mip[]; depth: number; lane?: number }, anywhere: boolean): Bird => {
    const size = sizeAt(b.depth);
    if (o.pinned) return { sheet: b.sheet, img: b.img, depth: 1, size, lane: 0, x: W / 2, y: H / 2, y0: H / 2, vx: 0, t: 0, rate: 1, wob: 0, dx: 0, dy: 0, vdx: 0, vdy: 0, panic: 0, flip: false };
    // each bird keeps its own height band, so a small flock never bunches up
    const lanes = Math.max(1, o.count), lane = b.lane ?? 0, lh = (band[1] - band[0]) / lanes;
    const y0 = H * (band[0] + lh * (lane + 0.2 + Math.random() * 0.6));
    // nearer birds cross faster: parallax
    const vx = (W * 0.045 + 26) * (0.55 + b.depth * 0.9) * (0.85 + Math.random() * 0.3);
    return {
      sheet: b.sheet, img: b.img, depth: b.depth, size, lane,
      x: anywhere ? ((lane + 0.25 + Math.random() * 0.5) / lanes) * W : -size * 0.8, y: y0, y0, vx,
      t: Math.random() * 10, rate: 0.85 + Math.random() * 0.3, wob: Math.random() * 6.28,
      dx: 0, dy: 0, vdx: 0, vdy: 0, panic: 0, flip: false,
    };
  };

  function draw(dt: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
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
        if (b.x - b.size > W + 40) Object.assign(b, spawn(b, false));
        if (o.pinned) b.x = W / 2;
      }
      const f = Math.floor(b.t * s.fps) % s.frames, part = Math.floor(f / s.per), lf = f % s.per;
      const sx = (lf % s.cols) * s.fw, sy = Math.floor(lf / s.cols) * s.fh;
      // the footage already carries the bird's own rise and fall; add a slow drift
      const y = b.y0 + (o.pinned ? 0 : Math.sin(b.wob) * H * 0.03) + b.dy;
      const x = b.x + b.dx;
      const w = b.size, h = (w * s.fh) / s.fw;
      const bank = (s.rot ?? 0) + Math.cos(b.wob) * 0.05 + gsap.utils.clamp(-0.35, 0.35, b.vdy * 0.0015);
      ctx.save();
      ctx.translate(x, y); ctx.rotate(bank);
      const mip = b.img[part], small = mip.half && w * dpr < s.fw * 0.6;
      if (small) ctx.drawImage(mip.half!, sx / 2, sy / 2, s.fw / 2, s.fh / 2, -w * s.ax, -h * s.ay, w, h);
      else ctx.drawImage(mip.full, sx, sy, s.fw, s.fh, -w * s.ax, -h * s.ay, w, h);
      ctx.restore();
    }
  }

  const tick = () => {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - (last || now)); last = now;
    draw(dt);
  };
  const sync = () => {
    const go = wanted && visible && !document.hidden && birds.length > 0 && !o.still;
    if (go && !running) { last = 0; gsap.ticker.add(tick); running = true; }
    if (!go && running) { gsap.ticker.remove(tick); running = false; }
  };

  const ready = (async () => {
    // decoded once into a bitmap so drawing never stalls on decode
    await Promise.all(o.sheets.map(async (s) => imgs.set(s, await Promise.all(s.src.map(bitmap)))));
    size();
    for (let i = 0; i < o.count; i++) {
      const sheet = o.sheets[i % o.sheets.length];
      // spread depths so the flock reads as near and far; draw far first
      const depth = o.count === 1 ? 1 : i / (o.count - 1);
      // lanes are shuffled so the nearest bird is not always lowest
      const lane = [1, 0, 2, 3, 4][i] ?? i;
      birds.push(spawn({ sheet, img: imgs.get(sheet)!, depth, lane: Math.min(lane, o.count - 1) }, true));
    }
    if (o.still) draw(0);
    sync();
  })();

  new ResizeObserver(() => {
    const ow = W, oh = H; size();
    if (ow && W) birds.forEach((b) => { b.x *= W / ow; b.y0 *= H / (oh || H); b.size = sizeAt(b.depth); if (o.pinned) b.y0 = H / 2; });
    if (!running) draw(0);
  }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  return {
    ready,
    play() { wanted = true; sync(); },
    pause() { wanted = false; sync(); },
    /** startle the birds near a point (CSS px inside the canvas) */
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
