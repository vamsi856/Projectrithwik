import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';
import { sfx, setMode, setEnabled, isEnabled, wantedBefore } from './sound';
import { applyFestive } from './festive';
import { MONTHS_LONG } from '../data/seasons';
import { createFlock, MACAW, SCARLET } from './flock';
import { initPerches } from './perch';
import { softwareGL } from './gpu';

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);

type View = 'book' | 'bird' | 'food';
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const WA = '918309782770';
if (!reduce) document.documentElement.classList.add('has-motion');

/* ------------------------------------------------------------------ smooth scroll */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = (target: Element | number, immediate = false) => {
  const offset = typeof target === 'number' ? 0 : -((document.querySelector('[data-site]:not([hidden]) .sbar') as HTMLElement)?.offsetHeight ?? 0) + 1;
  if (lenis) lenis.scrollTo(target as HTMLElement, { immediate, offset, duration: 1.3 });
  else if (typeof target === 'number') scrollTo2(target);
  else window.scrollTo({ top: (target as HTMLElement).getBoundingClientRect().top + scrollY + offset, behavior: immediate || reduce ? 'auto' : 'smooth' });
};
const scrollTo2 = (y: number) => window.scrollTo({ top: y });

/* ------------------------------------------------------------------ views */
const stage = $('#book-view')!;
const sites: Record<'bird' | 'food', HTMLElement> = { bird: $('[data-site="bird"]')!, food: $('[data-site="food"]')! };
const titles: Record<View, string> = {
  book: 'Rithwik, Kurnool: Bird Feeds and Human Food',
  bird: 'Rithwik Bird Feeds, Kurnool',
  food: 'Rithwik Industries, Kurnool: millets, super foods, pulses and spices',
};
const hashFor: Record<View, string> = { book: '', bird: '#bird-feeds', food: '#human-food' };
const viewFromHash = (): View => (location.hash === '#bird-feeds' ? 'bird' : location.hash === '#human-food' ? 'food' : 'book');
let current: View = 'book';
const siteTriggers: Record<'bird' | 'food', ScrollTrigger[]> = { bird: [], food: [] };
const inited = new Set<string>();

function show(view: View) {
  current = view;
  stage.hidden = view !== 'book';
  (Object.keys(sites) as ('bird' | 'food')[]).forEach((k) => {
    sites[k].hidden = k !== view;
    siteTriggers[k].forEach((t) => (k === view ? t.enable() : t.disable()));
  });
  document.body.dataset.view = view;
  document.documentElement.dataset.view = view;
  setMode(view);
  document.dispatchEvent(new Event('rithwik:view'));
  document.title = titles[view];
  (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement).content = view === 'food' ? '#e4dfc1' : '#0b1924';
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  if (view !== 'book' && !inited.has(view)) { inited.add(view); initSite(view, sites[view]); }
  ScrollTrigger.refresh();
  const bookFlock = $('.stage__flock');
  if (bookFlock && flocks.has(bookFlock)) view === 'book' ? flocks.get(bookFlock)!.play() : flocks.get(bookFlock)!.pause();
  if (view === 'book') openBook();
}

function go(view: View, from?: { x: number; y: number; el?: Element }, push = true) {
  if (view === current) return;
  if (push) history.pushState({ view }, '', hashFor[view] || location.pathname + location.search);
  sfx('turn');
  const swap = () => show(view);
  if (reduce) return swap();
  const root = document.documentElement;
  const x = from ? from.x : innerWidth / 2, y = from ? from.y : innerHeight / 2;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  if ('startViewTransition' in document) {
    (document as any).startViewTransition(swap);
    return;
  }
  // fallback: grow a page-coloured panel, swap, then wipe it away
  const turn = $('#turn')!;
  const r = from?.el?.getBoundingClientRect() ?? new DOMRect(x - 40, y - 40, 80, 80);
  gsap.set(turn, { visibility: 'visible', position: 'fixed', zIndex: 80, left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 8, clipPath: 'inset(0% 0% 0% 0%)', background: view === 'food' ? '#e4dfc1' : '#0b1924' });
  gsap.timeline()
    .to(turn, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.7, ease: 'power3.inOut' })
    .add(swap)
    .to(turn, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power3.inOut' }, '+=0.05')
    .set(turn, { visibility: 'hidden' });
}

addEventListener('popstate', () => go(viewFromHash(), undefined, false));

/* ------------------------------------------------------------------ the book */
const coverFront = $('#openBook')!;
const coverBack = $('.cover__back')!;
let opened = false;
function openBook() {
  if (opened) return;
  opened = true;
  stage.classList.add('is-open');
  sfx('turn');
  nudgeSound();
  coverFront.setAttribute('tabindex', '-1');
  coverFront.setAttribute('aria-hidden', 'true');
  coverBack.setAttribute('tabindex', '0');
  $('#stageHint')!.textContent = 'Pick a page to step inside.';
  const bf = $('.stage__flock'); if (bf) flockFor(bf).play();
}
coverFront.addEventListener('click', openBook);

$$('[data-enter]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const inBook = a.closest('.book');
    if (inBook && !opened) return openBook();
    const r = a.getBoundingClientRect();
    go(a.dataset.enter as View, { x: (e as MouseEvent).clientX || r.left + r.width / 2, y: (e as MouseEvent).clientY || r.top + r.height / 2, el: a.closest('.page') ?? a });
  }),
);
document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('[data-book], [data-switch]');
  if (!t) return;
  e.preventDefault();
  const me = e as MouseEvent;
  go((t.dataset.switch as View) || 'book', { x: me.clientX, y: me.clientY });
});

// golden dust drifting over the desk
(() => {
  const c = $<HTMLCanvasElement>('.stage__dust');
  if (!c || reduce) return;
  const ctx = c.getContext('2d')!;
  let W = 0, H = 0, raf = 0;
  const motes = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.0002 + Math.random() * 0.0005, p: Math.random() * 6.28 }));
  const size = () => { const d = Math.min(devicePixelRatio, 1.5); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const tick = (t: number) => {
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.y -= m.s; if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      const x = (m.x + Math.sin(t / 2400 + m.p) * 0.01) * W, y = m.y * H;
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t / 900 + m.p);
      ctx.fillStyle = '#b08a3e';
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) raf = requestAnimationFrame(tick); }).observe(c);
})();

// book tilts toward the pointer
if (fine && !reduce) {
  // tilt a wrapper, never the book itself: the book's own transform slides it to the
  // centre when the cover opens, and an inline transform would freeze it off-centre
  const book = $('#bookTilt')!;
  stage.addEventListener('pointermove', (e) => {
    const rx = (e.clientY / innerHeight - 0.5) * -6, ry = (e.clientX / innerWidth - 0.5) * 8;
    gsap.to(book, { rotateX: rx, rotateY: ry, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
  });
  stage.addEventListener('pointerleave', () => gsap.to(book, { rotateX: 0, rotateY: 0, duration: 1 }));
}

/* ------------------------------------------------------------------ flocks */
// Real macaws with real wingbeats (footage frames on one canvas, see flock.ts).
type Flock = ReturnType<typeof createFlock>;
const flocks = new Map<Element, Flock>();
function flockFor(c: HTMLElement) {
  if (flocks.has(c)) return flocks.get(c)!;
  const hero = c.classList.contains('bird__flock');
  const portrait = innerWidth < innerHeight;
  // sizes follow the canvas: on a laptop the nearest macaw is about a third of the screen wide,
  // on a phone about 60% of the width; far birds are about 40% of that
  // on the book's desk they fly behind the open book, through the margins
  const near = (w: number, h: number) => (hero ? Math.min(w < h ? w * 0.62 : w * 0.34, h * 0.75, 620) : Math.min(w < h ? w * 0.5 : w * 0.19, h * 0.38, 380));
  const f = createFlock(c, {
    sheets: [MACAW], still: reduce,
    count: Math.max(2, Number(c.dataset.flock) - (portrait ? 1 : 0)),
    near, far: (w, h) => near(w, h) * 0.42,
    band: hero ? (portrait ? [0.08, 0.6] : [0.12, 0.66]) : [0.12, 0.78],
  });
  flocks.set(c, f);
  return f;
}

/* ------------------------------------------------------------------ particle canvases */
function particleCanvas(c: HTMLCanvasElement, mode: 'fall' | 'pour') {
  if (reduce) return;
  const ctx = c.getContext('2d')!;
  const colours = mode === 'fall' ? ['#d9b24a', '#e6d39a', '#f2ede1', '#8a3b2b', '#2c2a2a', '#b9b3a6'] : ['#c59b45', '#d9b24a', '#a07a2c', '#e6d39a'];
  let W = 0, H = 0, raf = 0, parts: any[] = [];
  const spawn = (any: boolean) => mode === 'fall'
    ? { x: Math.random() * W, y: any ? Math.random() * H : -10, vy: 0.25 + Math.random() * 0.6, vx: (Math.random() - 0.5) * 0.25, r: Math.random() * 3, vr: (Math.random() - 0.5) * 0.03, s: 1.4 + Math.random() * 2.4, c: colours[(Math.random() * colours.length) | 0], a: 0.25 + Math.random() * 0.45 }
    : { x: W * (0.5 + (Math.random() - 0.5) * 0.05), y: any ? Math.random() * H * 0.3 : -10, vy: 1.5 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.3, r: Math.random() * 3, vr: (Math.random() - 0.5) * 0.1, s: 1.6 + Math.random() * 1.6, c: colours[(Math.random() * colours.length) | 0], a: 0.9 };
  const size = () => {
    const d = Math.min(devicePixelRatio, 1.5); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    parts = Array.from({ length: mode === 'fall' ? Math.round(Math.min(90, W / 16)) : 70 }, () => spawn(true));
  };
  const floor = () => H * 0.36; // lands on the top seal of the pouch
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx; p.r += p.vr;
      if (mode === 'pour') { p.vy += 0.05; if (p.y > floor()) Object.assign(p, spawn(false)); }
      else if (p.y > H + 10) { if (p.trail) { parts.splice(parts.indexOf(p), 1); continue; } Object.assign(p, spawn(false)); }
      if (p.trail) p.vy += 0.04;
      ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.25, p.s * 0.8, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }
    raf = requestAnimationFrame(tick);
  };
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting && c.offsetParent) { size(); raf = requestAnimationFrame(tick); } }).observe(c);
  // click or tap the hero: a handful of seed scatters from that point
  if (mode === 'fall') c.parentElement!.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a, button, canvas[data-pack], .hpack')) return;
    const r = c.getBoundingClientRect();
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3.5;
      parts.push({ x: e.clientX - r.left, y: e.clientY - r.top, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, r: 0, vr: (Math.random() - 0.5) * 0.3, s: 2 + Math.random() * 2.6, c: colours[(Math.random() * colours.length) | 0], a: 0.95, trail: true });
    }
    sfx('rattle'); setTimeout(() => sfx('chirp'), 180);
  });
  // a few seeds tumble from the pointer as it moves over the hero
  if (mode === 'fall' && fine) c.parentElement!.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    if (Math.random() > 0.45 || parts.length > 160) return;
    parts.push({ x: e.clientX - r.left, y: e.clientY - r.top, vy: 0.6 + Math.random(), vx: (Math.random() - 0.5) * 1.2, r: 0, vr: (Math.random() - 0.5) * 0.2, s: 2 + Math.random() * 2.5, c: colours[(Math.random() * colours.length) | 0], a: 0.9, trail: true });
  });
}

/* ------------------------------------------------------------------ globe */
async function globe(canvas: HTMLCanvasElement, tone: string) {
  const { default: createGlobe } = await import('cobe');
  let phi = 4.6;
  const size = canvas.offsetWidth * Math.min(devicePixelRatio, 1.5);
  const bird = tone === 'bird';
  const g = createGlobe(canvas, {
    devicePixelRatio: Math.min(devicePixelRatio, 1.5), width: size, height: size, phi, theta: 0.25, dark: 1, diffuse: 1.4,
    mapSamples: 10000, mapBrightness: bird ? 5 : 4,
    baseColor: bird ? [0.12, 0.25, 0.35] : [0.2, 0.22, 0.26],
    markerColor: bird ? [0.95, 0.7, 0.1] : [0.77, 0.6, 0.27],
    glowColor: bird ? [0.25, 0.45, 0.6] : [0.45, 0.4, 0.3],
    markers: [
      { location: [15.83, 78.04], size: 0.1 }, // Kurnool
      { location: [25.2, 55.27], size: 0.04 }, { location: [51.5, -0.12], size: 0.04 }, { location: [35.68, 139.69], size: 0.04 },
      { location: [40.71, -74.0], size: 0.04 }, { location: [1.35, 103.82], size: 0.04 }, { location: [52.37, 4.9], size: 0.03 },
    ],
    onRender: (state) => { if (!reduce) phi += 0.0035; state.phi = phi; },
  });
  canvas.classList.add('is-ready');
  return g;
}

/* ------------------------------------------------------------------ work that can wait */
// Set-up for things below the first screen runs in short slices (a few ms each) with the
// page free to paint and respond in between. When the queue is empty the scroll positions
// are measured once for everything.
const queue: (() => void)[] = [];
let draining = false;
const drain = () => {
  const end = performance.now() + 6;
  while (queue.length && performance.now() < end) queue.shift()!();
  if (queue.length) setTimeout(drain, 0);
  else { draining = false; ScrollTrigger.refresh(); }
};
function after(fn: () => void) {
  queue.push(fn);
  if (!draining) { draining = true; setTimeout(drain, 0); }
}

/* ------------------------------------------------------------------ per-site motion */
function initSite(view: 'bird' | 'food', root: HTMLElement) {
  const T = siteTriggers[view];
  const st = (cfg: ScrollTrigger.StaticVars) => { const t = ScrollTrigger.create(cfg); T.push(t); return t; };
  const tw = (tween: gsap.core.Tween | gsap.core.Timeline) => { const t = (tween as any).scrollTrigger as ScrollTrigger | undefined; if (t) T.push(t); return tween; };

  // CSS loops (seed-to-sack machines, floating packs, sound waves) pause off screen
  const offIO = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)), { rootMargin: '120px 0px' });
  $$(':scope > main > section, :scope > main > div, :scope > main > figure, .story, .marquee, .hpack, .studio', root).forEach((el) => offIO.observe(el));

  // header: progress bar + current link
  const bar = $('.sbar', root)!;
  const prog = $('.sbar__progress', root)!;
  st({ trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: (s) => gsap.set(prog, { scaleX: s.progress }) });
  $$<HTMLAnchorElement>('[data-nav]', root).forEach((a) => {
    const sec = document.getElementById(a.dataset.nav!);
    if (sec) st({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => (s.isActive ? $$('[data-nav]', root).forEach((x) => x.classList.toggle('is-current', x === a)) : a.classList.remove('is-current')) });
  });
  // phones: the section links live in a menu under the header
  const menuBtn = $<HTMLButtonElement>('[data-menu]', bar);
  if (menuBtn) {
    const setMenu = (open: boolean) => {
      bar.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      $('.sr', menuBtn)!.textContent = open ? 'Close menu' : 'Menu';
    };
    menuBtn.addEventListener('click', () => { const open = !bar.classList.contains('is-open'); setMenu(open); sfx('tick'); if (open) $<HTMLElement>('.sbar__nav a', bar)?.focus({ preventScroll: true }); });
    $('.sbar__nav', bar)!.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bar.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
    document.addEventListener('pointerdown', (e) => { if (bar.classList.contains('is-open') && !bar.contains(e.target as Node)) setMenu(false); });
    matchMedia('(min-width: 761px)').addEventListener('change', (m) => m.matches && setMenu(false));
    document.addEventListener('rithwik:view', () => setMenu(false));
  }
  void bar;

  // skip link: keyboard focus jumps past the header and its links, into the page
  $('[data-skip]', root)?.addEventListener('click', (e) => {
    e.preventDefault();
    $('main', root)!.focus({ preventScroll: true });
  });

  // in-site anchor links
  $$<HTMLAnchorElement>('a[data-jump]', root).forEach((a) => a.addEventListener('click', (e) => {
    const t = document.getElementById(a.getAttribute('href')!.slice(1));
    if (!t) return; e.preventDefault(); scrollTo(t);
  }));

  // maps load only when close
  $$<HTMLIFrameElement>('iframe[data-src]', root).forEach((f) => new IntersectionObserver(([en], o) => { if (en.isIntersecting) { f.src = f.dataset.src!; o.disconnect(); } }, { rootMargin: '600px' }).observe(f));

  // flock + canvases
  $$('[data-flock]', root).forEach((c) => flockFor(c).play());
  $$<HTMLCanvasElement>('canvas.seedfall', root).forEach((c) => particleCanvas(c, 'fall'));
  $$<HTMLCanvasElement>('canvas.grainpour', root).forEach((c) => particleCanvas(c, 'pour'));

  // globe
  $$<HTMLCanvasElement>('canvas[data-globe]', root).forEach((c) => {
    let g: { toggle: (on: boolean) => void } | null = null, loading = false;
    if (softwareGL()) { c.closest('.vision__globe')?.classList.add('no-gl'); loading = true; }
    new IntersectionObserver(async ([en]) => {
      if (g) return g.toggle(en.isIntersecting);
      if (!en.isIntersecting || !c.offsetWidth || loading || c.closest('.no-gl')) return;
      loading = true;
      g = await globe(c, c.dataset.globe!).catch(() => null);
    }, { rootMargin: '150px' }).observe(c);
  });

  // filters
  const cards = $$('[data-card]', root);
  $$<HTMLButtonElement>('.chip', root).forEach((chip) => chip.addEventListener('click', () => {
    $$('.chip', root).forEach((c) => { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
    sfx('tick');
    const f = chip.dataset.filter;
    const shown = cards.filter((c) => { const on = f === 'all' || c.dataset.group === f; c.classList.toggle('is-hidden', !on); return on; });
    if (!reduce) gsap.fromTo(shown, { opacity: 0, y: 24, rotateX: -12 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'transform,opacity' });
    ScrollTrigger.refresh();
  }));

  // variant pickers keep the Ask link in sync
  cards.forEach((card) => card.addEventListener('change', (e) => {
    const r = e.target as HTMLInputElement;
    if (r.type !== 'radio') return;
    // a card with several choices (crop, processing) names the line from all of them
    const picked = $$<HTMLInputElement>('[data-axis] input:checked', card).map((i) => i.value);
    const line = card.dataset.name ? `${card.dataset.name} (${picked.map((v, i) => (i ? v.toLowerCase() : v)).join(', ')})` : r.value;
    $('[data-product]', card)!.dataset.product = line;
    // the picture follows the line: red quinoa shows red quinoa
    const looks = $$<HTMLElement>('[data-look]', card);
    if (looks.length > 1) looks.forEach((l) => l.classList.toggle('is-shown', l.dataset.look!.split('|').includes(line)));
    const wa = $<HTMLAnchorElement>('[data-wa]', card);
    if (wa) wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hello ${wa.dataset.wa}, I would like to order: ${line}. Please share the price and availability.`)}`;
  }));

  // Ask price -> fill this site's form
  const form = $<HTMLFormElement>('form[data-division]', root)!;
  $$<HTMLAnchorElement>('[data-product]', root).forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    sfx('rattle');
    const sel = form.elements.namedItem('product') as HTMLSelectElement;
    const opt = [...sel.options].find((o) => o.value === a.dataset.product);
    if (opt) opt.selected = true;
    scrollTo(form.closest('section')!);
    setTimeout(() => {
      (form.elements.namedItem('name') as HTMLInputElement).focus({ preventScroll: true });
      if (!reduce) gsap.fromTo(sel, { boxShadow: '0 0 0 0px rgba(242,178,27,.9)' }, { boxShadow: '0 0 0 8px rgba(242,178,27,0)', duration: 1.2, ease: 'power2.out' });
    }, reduce ? 0 : 1300);
  }));
  wireForm(form);

  // 3D packs load when they come near the screen
  $$<HTMLCanvasElement>('canvas[data-pack]', root).forEach((c) => {
    const io = new IntersectionObserver(async ([en]) => {
      if (!en.isIntersecting || !c.offsetWidth) return;
      io.disconnect();
      await new Promise((r) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 300)));
      const { mountPack, mountLineup } = await import('./pack3d');
      const items = JSON.parse(c.dataset.items!);
      const hero = c.closest<HTMLElement>('[data-hero-pack]');
      const studio = c.closest<HTMLElement>('[data-studio]');
      const mount = studio ? mountLineup : mountPack;
      // while the visitor is scrolling the names row by hand, the page never moves it for them
      let rowTouch = false, rowHold = 0;
      const ctl = await mount(c, {
        kind: c.dataset.pack as 'sack' | 'pouch', logo: c.dataset.logo!, items, auto: hero ? Number(c.dataset.auto) : studio ? 3800 : 0,
        bg: view === 'bird' ? '#0e2131' : '#efeadb',
        onChange: (i) => {
          sfx('whoosh');
          if (hero) {
            $('[data-pack-index]', hero)!.textContent = String(i + 1).padStart(2, '0');
            const nm = $('[data-pack-name]', hero)!;
            if (!reduce) gsap.fromTo(nm, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
            nm.textContent = items[i].name;
          }
          if (studio) {
            $$('[data-pick]', studio).forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.pick) === i)));
            $('[data-studio-name]', studio)!.textContent = items[i].name;
            $('[data-studio-variant]', studio)!.textContent = items[i].options;
            $('[data-studio-ask]', studio)!.dataset.product = items[i].ask;
            $('[data-studio-index]', studio)!.textContent = String(i + 1).padStart(2, '0');
            // keep the chosen name in the middle of the row (horizontal scroll only)
            const pk = $<HTMLElement>('[data-studio-picker]', studio)!, btn = $<HTMLElement>(`[data-pick="${i}"]`, studio)!;
            if (!rowTouch && performance.now() > rowHold) pk.scrollTo({ left: btn.offsetLeft - pk.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
            if (!reduce) gsap.from($$('.studio__what > *', studio), { y: 10, opacity: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' });
          }
        },
      });
      if (hero) {
        $('[data-pack-prev]', hero)!.addEventListener('click', () => { ctl.stopAuto(); ctl.prev(); });
        $('[data-pack-next]', hero)!.addEventListener('click', () => { ctl.stopAuto(); ctl.next(); });
        if (!reduce) st({ trigger: hero.closest('section')!, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => ctl.setScrollSpin(s.progress * Math.PI * 1.2) });
      }
      if (studio) {
        // picking a name (or an arrow) turns that pack to the front. The page only glides
        // when the turning ring is mostly out of sight, so tapping a name never jolts it.
        const stageEl = $<HTMLElement>('.studio__stage', studio) ?? studio;
        const bring = () => {
          const hdr = $<HTMLElement>('.sbar', root)?.offsetHeight ?? 0, r = stageEl.getBoundingClientRect();
          const seen = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, hdr)) / (r.height || 1);
          if (seen >= 0.6) return;
          if (lenis) lenis.scrollTo(stageEl, { offset: -hdr - 12, duration: 0.9 });
          else window.scrollTo({ top: r.top + scrollY - hdr - 12, behavior: reduce ? 'auto' : 'smooth' });
        };
        const choose = (go: () => void) => { ctl.stopAuto(); rowTouch = false; rowHold = 0; bring(); go(); };
        $$('[data-pick]', studio).forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.pick); if (i === ctl.index) return; choose(() => ctl.show(i)); }));
        $('[data-studio-prev]', studio)?.addEventListener('click', () => choose(() => ctl.prev()));
        $('[data-studio-next]', studio)?.addEventListener('click', () => choose(() => ctl.next()));
        // the names row scrolls like any side scroller: touching it stops the ring turning
        // by itself, and nothing pulls the row back while (or just after) it is being moved
        const pk = $<HTMLElement>('[data-studio-picker]', studio)!;
        const hands = () => { ctl.stopAuto(); rowHold = performance.now() + 1500; };
        pk.addEventListener('touchstart', () => { rowTouch = true; hands(); }, { passive: true });
        const lift = () => { rowTouch = false; rowHold = performance.now() + 1200; };
        pk.addEventListener('touchend', lift, { passive: true });
        pk.addEventListener('touchcancel', lift, { passive: true });
        pk.addEventListener('wheel', hands, { passive: true });
        pk.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') hands(); });
      }
    }, { rootMargin: '300px' });
    io.observe(c);
  });

  // certification seals open a details dialog
  $$('.certs', root).forEach((sec) => {
    const dlg = $<HTMLDialogElement>('[data-cert-dialog]', sec)!;
    $$<HTMLButtonElement>('[data-cert]', sec).forEach((b) => b.addEventListener('click', () => {
      $$('[data-cert-panel]', dlg).forEach((a) => (a.hidden = a.dataset.certPanel !== b.dataset.cert));
      sfx('tick'); dlg.showModal();
    }));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  });

  // season clock
  $$('[data-seasons]', root).forEach((sec) => {
    const crops: { name: string; months: number[]; c1: string; c2: string }[] = JSON.parse(sec.dataset.seasons!);
    const now = new Date().getMonth() + 1;
    let month = now;
    const hand = $('[data-hand]', sec)!, hub = $('[data-hub-month]', sec)!, label = $('[data-season-label]', sec)!;
    const nowList = $('[data-season-now]', sec)!, nextList = $('[data-season-next-list]', sec)!;
    const rings = $$('[data-ring]', sec), labels = $$<SVGTextElement>('[data-month]', sec);
    let turns = 0, last = month;
    const chip = (c: typeof crops[number], i: number) => `<li data-crop="${i}"><span class="seed" aria-hidden="true" style="--c1:${c.c1};--c2:${c.c2};--g:6px"></span>${c.name}</li>`;
    const render = () => {
      // keep the hand turning forwards through December into January
      if (last === 12 && month === 1) turns++; else if (last === 1 && month === 12) turns--;
      last = month;
      hand.style.transform = `rotate(${(turns * 12 + month - 0.5) * 30}deg)`;
      hub.textContent = MONTHS_LONG[month - 1].slice(0, 3);
      label.textContent = month === now ? `${MONTHS_LONG[month - 1]} (now)` : MONTHS_LONG[month - 1];
      labels.forEach((t) => t.classList.toggle('is-now', Number(t.dataset.month) === month));
      const nm = month === 12 ? 1 : month + 1;
      const inNow = crops.map((c, i) => [c, i] as const).filter(([c]) => c.months.includes(month));
      const inNext = crops.map((c, i) => [c, i] as const).filter(([c]) => c.months.includes(nm) && !c.months.includes(month));
      nowList.innerHTML = inNow.length ? inNow.map(([c, i]) => chip(c, i)).join('') : '<li class="is-empty">A quiet month for harvests. Stocks from last season are available.</li>';
      nextList.innerHTML = inNext.length ? inNext.map(([c, i]) => chip(c, i)).join('') : '<li class="is-empty">Nothing new next month</li>';
      rings.forEach((r, i) => { const on = crops[i].months.includes(month); r.classList.toggle('is-lit', on); r.classList.toggle('is-dim', !on); });
      if (!reduce) gsap.from($$('li', nowList), { y: 10, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
    };
    const step = (d: number) => { month = ((month - 1 + d + 12) % 12) + 1; sfx('tick'); render(); };
    $('[data-season-prev]', sec)!.addEventListener('click', () => step(-1));
    $('[data-season-next]', sec)!.addEventListener('click', () => step(1));
    // point at the dial to pick a month
    const svg = $('svg', sec)!;
    const pick = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect(); const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(x, y) < r.width * 0.16) return;
      const deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
      const m = Math.floor((((deg % 360) + 360) % 360) / 30) + 1;
      if (m !== month) { month = m; sfx('tick'); render(); }
    };
    svg.addEventListener('click', pick);
    // hover a crop to light up its ring
    sec.addEventListener('pointerover', (e) => {
      const li = (e.target as Element).closest<HTMLElement>('[data-crop]'); if (!li) return;
      const k = Number(li.dataset.crop); rings.forEach((r, i) => { r.classList.toggle('is-dim', i !== k); r.classList.toggle('is-lit', i === k); });
    });
    sec.addEventListener('pointerout', (e) => { if ((e.target as Element).closest('[data-crop]')) render(); });
    render();
  });

  if (reduce) return;

  // Everything below the first screen is set up a little later, in small slices between
  // frames, so the first screen paints and answers taps straight away.
  const first = $(':scope > main > section', root);
  const lazy = (el: Element, fn: () => void) => (first?.contains(el) ? fn() : after(fn));
  after(() => {
    // legacy: the rail draws across, each generation stamps in, the year counts up from 1900
    $$('[data-legacy]', root).forEach((lg) => {
      const line = $<SVGPathElement>('.legacy__line path', lg)!;
      const steps = $$('[data-legacy-step]', lg);
      const tl = gsap.timeline({ scrollTrigger: { trigger: lg, start: 'top 75%', once: true } })
        .fromTo(line, { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0)
        .from(steps, { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 }, 0.1)
        .from($$('.legacy__dot', lg), { scale: 0, duration: 0.45, ease: 'back.out(3)', stagger: 0.12 }, 0.15);
      tw(tl);
    });

  
  });

  after(() => {
    // season dial: arcs draw themselves in
    $$('[data-seasons]', root).forEach((sec) => {
      const arcs = $$<SVGPathElement>('.seasons__arc', sec);
      arcs.forEach((a) => { const L = a.getTotalLength(); a.style.strokeDasharray = `${L}`; a.style.strokeDashoffset = `${L}`; });
      tw(gsap.to(arcs, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out', stagger: 0.04, scrollTrigger: { trigger: sec, start: 'top 70%', once: true } }));
    });

  
  });

  after(() => {
    // seed-to-sack: pin and scroll sideways on wide screens
    $$('[data-story]', root).forEach((sec) => {
      const pin = $('.story__pin', sec)!, track = $('[data-story-track]', sec)!, bar = $('[data-story-bar]', sec)!;
      if (innerWidth > 860) {
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const t = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) },
        });
        tw(t);
        $$('.story__panel', sec).forEach((panel) => {
          tw(gsap.from($$('.story__copy > *', panel), { y: 40, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: panel, containerAnimation: t, start: 'left 75%', once: true } }));
          tw(gsap.from($('.story__art', panel), { scale: 0.85, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: panel, containerAnimation: t, start: 'left 85%', once: true } }));
        });
      } else {
        $$('.story__panel', sec).forEach((panel) => tw(gsap.from(panel, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 85%', once: true } })));
      }
    });

  
  });

  after(() => {
    // registration seals stamp down
    $$('.certs__grid', root).forEach((r) => tw(gsap.from($$('.cert__seal', r), {
      scale: 1.9, rotate: -24, opacity: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.15,
      scrollTrigger: { trigger: r, start: 'top 85%', once: true, onEnter: () => setTimeout(() => sfx('tick'), 450) },
    })));

  
  });

  // hero birds scatter from the pointer or a finger, then settle back
  $$('.bird__flock', root).forEach((c) => {
    const hero = c.closest('section')!, f = flockFor(c);
    let lastChirp = 0;
    const scare = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      if (f.scare(e.clientX - r.left, e.clientY - r.top) && performance.now() - lastChirp > 1600) { lastChirp = performance.now(); sfx('chirp'); }
    };
    hero.addEventListener('pointermove', scare);
    hero.addEventListener('pointerdown', scare);
  });

  after(() => {
    // marquees: GSAP loop that speeds up and leans with scroll velocity
    $$('.marquee__track', root).forEach((track) => {
      track.style.animation = 'none';
      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1, paused: true });
      const lean = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const settle = gsap.delayedCall(0.2, () => { loop.timeScale(1); lean(0); }).pause();
      st({ trigger: track, start: 'top bottom', end: 'bottom top',
        onToggle: (s) => (s.isActive ? loop.play() : loop.pause()),
        onUpdate: (s) => {
          const v = s.getVelocity();
          loop.timeScale(1 + Math.min(Math.abs(v) / 300, 6) * (v < 0 ? -1 : 1));
          lean(gsap.utils.clamp(-12, 12, v / -160));
          settle.restart(true);
        } });
    });

  
  });

  // headline splits
  $$('[data-split]', root).forEach((el) => lazy(el, () => {
    SplitText.create(el, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => tw(gsap.from(self.words, { yPercent: 115, rotate: 4, duration: 1.05, ease: 'power4.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })),
    });
  }));
  // hero copy: its entrance is CSS (see .hw and [data-rise] in v2.css), so it starts with the first paint
  const badge = $('.food-hero__art img', root);
  if (badge) gsap.from(badge, { scale: 0.7, rotate: -8, opacity: 0, duration: 1.4, ease: 'elastic.out(1, 0.7)', delay: 0.2 });

  // reveals
  $$('[data-reveal]', root).forEach((el) => lazy(el, () => tw(gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }))));

  // photo curtains
  $$('[data-curtain]', root).forEach((fig) => lazy(fig, () => {
    const img = $('img', fig);
    tw(gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from(img, { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.1));
  }));
  // parallax
  $$('[data-parallax]', root).forEach((el) => lazy(el, () => {
    const k = Number(el.dataset.parallax);
    tw(gsap.fromTo(el, { yPercent: -k * 50 }, { yPercent: k * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }));
  $$('.range__banner img', root).forEach((img) => lazy(img, () => tw(gsap.fromTo(img, { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } }))));
  // ghost words drift
  $$('.ghost', root).forEach((g) => lazy(g, () => {
    const centred = g.classList.contains('ghost--enq');
    if (centred) gsap.set(g, { x: 0, xPercent: -50 });
    tw(gsap.fromTo(g, { xPercent: centred ? -40 : 6 }, { xPercent: centred ? -60 : -14, ease: 'none', scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }));

  after(() => {
    // cards cascade in, then tilt with the pointer
    gsap.set(cards, { opacity: 0, y: 60, rotateX: -18, transformPerspective: 900 });
    T.push(...ScrollTrigger.batch(cards, {
      start: 'top 92%', once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }),
    }));
    $$('.pcard__swatch', root).forEach((s) => tw(gsap.from(s, { rotate: -200, scale: 0, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: s, start: 'top 95%', once: true } })));
    if (fine) cards.forEach((card) => {
      const shine = document.createElement('span'); shine.className = 'pcard__shine'; card.appendChild(shine);
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${px * 100}%`); card.style.setProperty('--my', `${py * 100}%`);
        gsap.to(card, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 8, transformPerspective: 900, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' }));
    });

  
  });

  after(() => {
    // birds on the feed cards (see perch.ts)
    initPerches(root, reduce);

  
  });

  after(() => {
    // counters
    $$('[data-count]', root).forEach((el) => {
      const n = Number(el.dataset.count); const o = { v: Number(el.dataset.countFrom || 0) };
      tw(gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.v))), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    });
    // facts pop
    $$('.facts', root).forEach((f) => tw(gsap.from($$('.fact', f), { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: f, start: 'top 90%', once: true } })));

  
  });

  after(() => {
    // steps: dashed path draws, numbers pop
    $$('.steps', root).forEach((sec) => {
      const path = $<SVGPathElement>('.steps__path path', sec);
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: `6 10`, strokeDashoffset: 0 });
        const mask = path.cloneNode() as SVGPathElement; // reveal by animating a solid overlay mask
        void mask;
        tw(gsap.fromTo(path, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: sec, start: 'top 75%', end: 'center 50%', scrub: true } }));
        void len;
      }
      tw(gsap.from($$('.step', sec), { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: sec, start: 'top 75%', once: true } }));
      tw(gsap.from($$('.step b', sec), { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)', stagger: 0.15, delay: 0.3, scrollTrigger: { trigger: sec, start: 'top 75%', once: true } }));
    });

  
  });

  after(() => {
    // vision: legend fades in under the globe
    $$('.vision', root).forEach((v) => tw(gsap.from($('.vision__legend', v), { opacity: 0, y: 16, duration: 0.8, delay: 0.6, scrollTrigger: { trigger: v, start: 'top 60%', once: true } })));

    // magnetic primary buttons
    if (fine) $$('[data-magnetic]', root).forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 }); });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
    });

  
  });

  after(() => {
    // bird site: real macaws fly across the screen as you scroll down the page, past the
    // millets, the packs and everything else. They only set off while the page is moving and
    // ride up with it a little slower than the content (so they read as further away); when
    // scrolling stops they fly on out of the screen and no new ones come until you scroll.
    const sb = $('.scrollbird', root);
    if (sb && !reduce) {
      const near = (w: number, h: number) => (w < h ? Math.min(w * 0.44, h * 0.27, 310) : Math.min(w * 0.17, h * 0.36, 330));
      const f = createFlock(sb, { sheets: [MACAW, SCARLET], count: innerWidth < innerHeight ? 2 : 3, near, far: (w, h) => near(w, h) * 0.5, stream: { parallax: 0.4 } });
      f.setActive(false); f.play();
      // the hero has its own flock: these take over once it is scrolled past
      const hero = $<HTMLElement>('.bird__hero', root);
      if (hero) st({ trigger: hero, start: 'bottom 55%', endTrigger: root, end: 'bottom bottom', onToggle: (s) => f.setActive(s.isActive) });
      else f.setActive(true);
    }
  });
}

/* ------------------------------------------------------------------ forms */
function wireForm(form: HTMLFormElement) {
  const err = $('.form__error', form)!;
  const name = form.elements.namedItem('name') as HTMLInputElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!name.value.trim()) { err.hidden = false; name.setAttribute('aria-invalid', 'true'); name.focus(); if (!reduce) gsap.fromTo(name, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }); return; }
    err.hidden = true; name.removeAttribute('aria-invalid');
    const f = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement).value || '').trim();
    const lines = [`Hello ${form.dataset.division},`, `I'm ${name.value.trim()}. I'd like a price for ${f('product')}.`, f('qty') && `Quantity: ${f('qty')}`, f('msg')].filter(Boolean);
    sfx('pop');
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
    // no 'noopener' feature here: with it, open() always returns null and a blocked tab can't be told apart
    let w: Window | null = null;
    try { w = window.open(url, '_blank'); if (w) w.opener = null; } catch { w = null; }
    link.href = url;
    ok.classList.toggle('is-warn', !w);
    okTitle.textContent = w ? `Thanks, ${name.value.trim().split(/\s+/)[0]}. WhatsApp is opening with your message.` : 'Your browser stopped WhatsApp from opening.';
    okBody.firstChild!.textContent = w ? "Press send there and we'll reply with today's price. " : 'Your message is ready. ';
    link.textContent = w ? "Didn't open? Tap here" : 'Open WhatsApp and send it';
    ok.hidden = false;
    if (!reduce) gsap.fromTo(ok, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
  });
  const ok = $<HTMLElement>('.form__ok', form)!, okTitle = $('[data-form-ok-title]', ok)!, okBody = $('[data-form-ok-body]', ok)!, link = $<HTMLAnchorElement>('[data-form-wa]', ok)!;
  // editing the form again clears the old confirmation
  form.addEventListener('input', () => { ok.hidden = true; });
  name.addEventListener('input', () => { if (name.value.trim()) { err.hidden = true; name.removeAttribute('aria-invalid'); } });
}

/* ------------------------------------------------------------------ sound */
const soundBtn = $<HTMLButtonElement>('[data-sound-toggle]')!;
const soundLabel = $('[data-sound-label]')!;
const nudge = $('[data-sound-nudge]')!;
// sound they had on last time shows as on, and starts on their first tap anywhere
let soundPending = wantedBefore();
const reflectSound = () => {
  const on = isEnabled() || soundPending;
  soundBtn.setAttribute('aria-pressed', String(on));
  const what = document.documentElement.dataset.view === 'food' ? 'Flute' : 'Birdsong';
  soundLabel.textContent = `${what} ${on ? 'on' : 'off'}`;
};
document.addEventListener('rithwik:view', reflectSound);
// sound left on last visit (it shows as on): browsers only let it start after a real tap,
// click or key press, so it starts on the first one anywhere on the page. A touch that only
// scrolls is not one (the browser would refuse), so we keep waiting for a real tap.
const unlockEvents = ['pointerup', 'touchend', 'click', 'keydown'] as const;
const stopWaiting = () => unlockEvents.forEach((t) => removeEventListener(t, unlock, true));
async function unlock(e: Event) {
  if (!soundPending) return stopWaiting();
  if ((e.target as Element | null)?.closest?.('[data-sound-toggle]')) return; // the button handles itself
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  if (ua && !ua.isActive) return;
  soundPending = false; stopWaiting();
  await setEnabled(true); reflectSound();
}
soundBtn.addEventListener('click', async () => {
  nudge.hidden = true;
  // while it is waiting to start, the button shows "on": a press means "start", not "turn off"
  if (soundPending) { soundPending = false; stopWaiting(); await setEnabled(true); }
  else await setEnabled(!isEnabled());
  reflectSound();
});
function nudgeSound() {
  if (isEnabled() || wantedBefore()) return;
  setTimeout(() => {
    if (isEnabled()) return;
    nudge.hidden = false;
    if (!reduce) gsap.fromTo(nudge, { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    setTimeout(() => { if (!reduce) gsap.to(nudge, { opacity: 0, duration: 0.6, onComplete: () => { nudge.hidden = true; } }); else nudge.hidden = true; }, 7000);
  }, 1800);
}
if (soundPending) {
  reflectSound();
  unlockEvents.forEach((t) => addEventListener(t, unlock, true));
}

/* ------------------------------------------------------------------ misc */
const dlg = $<HTMLDialogElement>('#credits');
document.addEventListener('click', (e) => { if ((e.target as Element).closest('[data-credits]')) { e.preventDefault(); dlg?.showModal(); } });
$$('[data-year]').forEach((y) => (y.textContent = String(new Date().getFullYear())));

/* ------------------------------------------------------------------ start */
applyFestive(reduce);
const first = viewFromHash();
if (first === 'book') {
  show('book');
  opened = false; // let the cover open on its own
  stage.classList.remove('is-open');
  (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(openBook, reduce ? 0 : 900));
} else {
  opened = true; stage.classList.add('is-open');
  show(first);
}
document.fonts?.ready.then(() => ScrollTrigger.refresh());
