import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

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
  food: 'Rithwik Industries, Kurnool: millets, seeds and dals',
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
  document.title = titles[view];
  (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement).content = view === 'food' ? '#e4dfc1' : '#0b1924';
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  if (view !== 'book' && !inited.has(view)) { inited.add(view); initSite(view, sites[view]); }
  ScrollTrigger.refresh();
  const bookFlock = $('.page__flock') as unknown as SVGSVGElement | null;
  if (bookFlock && flockTweens.has(bookFlock)) flockTweens.get(bookFlock)!.forEach((t) => (view === 'book' ? t.play() : t.pause()));
  if (view === 'book') openBook();
}

function go(view: View, from?: { x: number; y: number; el?: Element }, push = true) {
  if (view === current) return;
  if (push) history.pushState({ view }, '', hashFor[view] || location.pathname + location.search);
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
  coverFront.setAttribute('tabindex', '-1');
  coverFront.setAttribute('aria-hidden', 'true');
  coverBack.setAttribute('tabindex', '0');
  $('#stageHint')!.textContent = 'Pick a page to step inside.';
  startFlock($('.page__flock') as unknown as SVGSVGElement);
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
  const size = () => { const d = Math.min(devicePixelRatio, 2); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
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
  const book = $('#book')!;
  stage.addEventListener('pointermove', (e) => {
    const rx = (e.clientY / innerHeight - 0.5) * -6, ry = (e.clientX / innerWidth - 0.5) * 8;
    gsap.to(book, { rotateX: rx, rotateY: ry, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
  });
  stage.addEventListener('pointerleave', () => gsap.to(book, { rotateX: 0, rotateY: 0, duration: 1 }));
}

/* ------------------------------------------------------------------ flocks */
const UP = 'M-32 -9 Q-17 -17 0 2 Q17 -17 32 -9 Q17 -8 0 7 Q-17 -8 -32 -9Z';
const DOWN = 'M-30 11 Q-17 3 0 2 Q17 3 30 11 Q17 5 0 7 Q-17 5 -30 11Z';
const NS = 'http://www.w3.org/2000/svg';
const flockColours = ['#f2b21b', '#7cc4ea', '#e4dfc1'];
const flockTweens = new WeakMap<SVGSVGElement, gsap.core.Tween[]>();
function buildFlock(svg: SVGSVGElement) {
  if (flockTweens.has(svg)) return flockTweens.get(svg)!;
  const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
  const n = Number(svg.dataset.flock);
  const tweens: gsap.core.Tween[] = [];
  for (let i = 0; i < n; i++) {
    const g = document.createElementNS(NS, 'g');
    const p = document.createElementNS(NS, 'path');
    const s = 0.35 + Math.random() * (w > 600 ? 0.9 : 0.45);
    p.setAttribute('d', UP);
    p.setAttribute('fill', flockColours[i % flockColours.length]);
    p.setAttribute('opacity', (0.55 + s * 0.4).toFixed(2));
    p.setAttribute('transform', `scale(${s.toFixed(2)})`);
    g.appendChild(p); svg.appendChild(g);
    const y = h * (0.12 + Math.random() * 0.6);
    if (reduce) { g.setAttribute('transform', `translate(${(w * (0.15 + Math.random() * 0.7)).toFixed(0)} ${y.toFixed(0)})`); continue; }
    tweens.push(
      gsap.to(g, {
        motionPath: { path: [{ x: -60, y }, { x: w * 0.3, y: y - h * 0.08 * Math.random() - 10 }, { x: w * 0.65, y: y + h * 0.1 * Math.random() }, { x: w + 60, y: y - h * 0.12 }], curviness: 1.3 },
        duration: 9 + Math.random() * 9 - s * 3, ease: 'none', repeat: -1, delay: -Math.random() * 14, paused: true,
      }),
      gsap.to(p, { attr: { d: DOWN }, duration: 0.16 + Math.random() * 0.14, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true }),
    );
  }
  flockTweens.set(svg, tweens);
  return tweens;
}
const startFlock = (svg: SVGSVGElement | null) => svg && buildFlock(svg).forEach((t) => t.play());

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
    const d = Math.min(devicePixelRatio, 2); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
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
  const size = canvas.offsetWidth * 2;
  const bird = tone === 'bird';
  const g = createGlobe(canvas, {
    devicePixelRatio: 2, width: size, height: size, phi, theta: 0.25, dark: 1, diffuse: 1.4,
    mapSamples: 12000, mapBrightness: bird ? 5 : 4,
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

/* ------------------------------------------------------------------ per-site motion */
function initSite(view: 'bird' | 'food', root: HTMLElement) {
  const T = siteTriggers[view];
  const st = (cfg: ScrollTrigger.StaticVars) => { const t = ScrollTrigger.create(cfg); T.push(t); return t; };
  const tw = (tween: gsap.core.Tween | gsap.core.Timeline) => { const t = (tween as any).scrollTrigger as ScrollTrigger | undefined; if (t) T.push(t); return tween; };

  // header: progress bar + current link
  const bar = $('.sbar', root)!;
  const prog = $('.sbar__progress', root)!;
  st({ trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: (s) => gsap.set(prog, { scaleX: s.progress }) });
  $$<HTMLAnchorElement>('[data-nav]', root).forEach((a) => {
    const sec = document.getElementById(a.dataset.nav!);
    if (sec) st({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => s.isActive && $$('[data-nav]', root).forEach((x) => x.classList.toggle('is-current', x === a)) });
  });
  void bar;

  // in-site anchor links
  $$<HTMLAnchorElement>('a[data-jump]', root).forEach((a) => a.addEventListener('click', (e) => {
    const t = document.getElementById(a.getAttribute('href')!.slice(1));
    if (!t) return; e.preventDefault(); scrollTo(t);
  }));

  // maps load only when close
  $$<HTMLIFrameElement>('iframe[data-src]', root).forEach((f) => new IntersectionObserver(([en], o) => { if (en.isIntersecting) { f.src = f.dataset.src!; o.disconnect(); } }, { rootMargin: '600px' }).observe(f));

  // flock + canvases
  $$<SVGSVGElement>('svg[data-flock]', root).forEach((svg) => {
    const tweens = buildFlock(svg);
    st({ trigger: svg.parentElement!, start: 'top bottom', end: 'bottom top', onToggle: (s) => tweens.forEach((t) => (s.isActive ? t.play() : t.pause())) });
  });
  $$<HTMLCanvasElement>('canvas.seedfall', root).forEach((c) => particleCanvas(c, 'fall'));
  $$<HTMLCanvasElement>('canvas.grainpour', root).forEach((c) => particleCanvas(c, 'pour'));

  // globe
  $$<HTMLCanvasElement>('canvas[data-globe]', root).forEach((c) => {
    let g: { toggle: (on?: boolean) => void } | null = null, loading = false;
    import('./pack3d').then(({ softwareGL }) => { if (softwareGL()) { c.closest('.vision__globe')?.classList.add('no-gl'); loading = true; } });
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
    const f = chip.dataset.filter;
    const shown = cards.filter((c) => { const on = f === 'all' || c.dataset.group === f; c.classList.toggle('is-hidden', !on); return on; });
    if (!reduce) gsap.fromTo(shown, { opacity: 0, y: 24, rotateX: -12 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'transform,opacity' });
    ScrollTrigger.refresh();
  }));

  // variant pickers keep the Ask link and GST in sync
  cards.forEach((card) => card.addEventListener('change', (e) => {
    const r = e.target as HTMLInputElement;
    if (r.type !== 'radio') return;
    $('[data-product]', card)!.dataset.product = r.value;
    const out = $('[data-gst-out]', card)!; out.textContent = r.dataset.gst!;
    if (!reduce) gsap.fromTo(out, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
  }));

  // Ask price -> fill this site's form
  const form = $<HTMLFormElement>('form[data-division]', root)!;
  $$<HTMLAnchorElement>('[data-product]', root).forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
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
      const ctl = await mount(c, {
        kind: c.dataset.pack as 'sack' | 'pouch', logo: c.dataset.logo!, items, auto: hero ? Number(c.dataset.auto) : studio ? 3800 : 0,
        bg: view === 'bird' ? '#0e2131' : '#efeadb',
        onChange: (i) => {
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
            $('[data-studio-gst]', studio)!.textContent = items[i].gst;
            $('[data-studio-ask]', studio)!.dataset.product = items[i].ask;
            if (!reduce) gsap.from($$('.studio__detail > *', studio), { y: 14, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
          }
        },
      });
      if (hero) {
        $('[data-pack-prev]', hero)!.addEventListener('click', () => { ctl.stopAuto(); ctl.prev(); });
        $('[data-pack-next]', hero)!.addEventListener('click', () => { ctl.stopAuto(); ctl.next(); });
        if (!reduce) st({ trigger: hero.closest('section')!, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => ctl.setScrollSpin(s.progress * Math.PI * 1.2) });
      }
      if (studio) $$('[data-pick]', studio).forEach((b) => b.addEventListener('click', () => { ctl.stopAuto(); ctl.show(Number(b.dataset.pick)); }));
    }, { rootMargin: '300px' });
    io.observe(c);
  });

  if (reduce) return;

  // marquees: GSAP loop that speeds up and leans with scroll velocity
  $$('.marquee__track', root).forEach((track) => {
    track.style.animation = 'none';
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    const lean = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
    st({ trigger: track, start: 'top bottom', end: 'bottom top', onUpdate: (s) => {
      const v = s.getVelocity();
      loop.timeScale(1 + Math.min(Math.abs(v) / 300, 6) * (v < 0 ? -1 : 1));
      lean(gsap.utils.clamp(-12, 12, v / -160));
      gsap.delayedCall(0.2, () => { loop.timeScale(1); lean(0); });
    } });
  });

  // headline splits
  $$('[data-split]', root).forEach((el) => {
    SplitText.create(el, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => tw(gsap.from(self.words, { yPercent: 115, rotate: 4, duration: 1.05, ease: 'power4.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })),
    });
  });
  // hero copy
  gsap.from($$('[data-rise]', $('main', root)!).slice(0, 3), { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.35 });
  const badge = $('.bird__badge, .food-hero__art img', root);
  if (badge) gsap.from(badge, { scale: 0.7, rotate: -8, opacity: 0, duration: 1.4, ease: 'elastic.out(1, 0.7)', delay: 0.2 });

  // reveals
  $$('[data-reveal]', root).forEach((el) => tw(gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })));

  // photo curtains
  $$('[data-curtain]', root).forEach((fig) => {
    const img = $('img', fig);
    tw(gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from(img, { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.1));
  });
  // parallax
  $$('[data-parallax]', root).forEach((el) => {
    const k = Number(el.dataset.parallax);
    tw(gsap.fromTo(el, { yPercent: -k * 50 }, { yPercent: k * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
  $$('.range__banner img', root).forEach((img) => tw(gsap.fromTo(img, { yPercent: -15 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } })));
  // ghost words drift
  $$('.ghost', root).forEach((g) => {
    const centred = g.classList.contains('ghost--enq');
    if (centred) gsap.set(g, { x: 0, xPercent: -50 });
    tw(gsap.fromTo(g, { xPercent: centred ? -40 : 6 }, { xPercent: centred ? -60 : -14, ease: 'none', scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });

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

  // counters
  $$('[data-count]', root).forEach((el) => {
    const n = Number(el.dataset.count); const o = { v: 0 };
    tw(gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.v))), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  });
  // facts pop
  $$('.facts', root).forEach((f) => tw(gsap.from($$('.fact', f), { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: f, start: 'top 90%', once: true } })));

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

  // vision: legend fades in under the globe
  $$('.vision', root).forEach((v) => tw(gsap.from($('.vision__legend', v), { opacity: 0, y: 16, duration: 0.8, delay: 0.6, scrollTrigger: { trigger: v, start: 'top 60%', once: true } })));

  // magnetic primary buttons
  if (fine) $$('[data-magnetic]', root).forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
  });

  // bird site: one bird flies down the page with your scroll
  const sb = $<SVGSVGElement>('.scrollbird', root);
  if (sb) {
    const wing = $('path', sb)!;
    const flap = gsap.to(wing, { attr: { d: DOWN }, duration: 0.14, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true });
    let idle: number;
    st({
      trigger: root, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => {
        const p = s.progress, w = innerWidth, h = innerHeight;
        const x = w * (0.5 + 0.42 * Math.sin(p * Math.PI * 5)), y = h * (0.25 + 0.5 * p) + Math.cos(p * Math.PI * 9) * 30;
        const ang = Math.cos(p * Math.PI * 5) * 25 * Math.sign(s.direction || 1);
        gsap.to(sb, { x, y, rotate: ang, opacity: p > 0.04 && p < 0.97 ? 0.95 : 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        flap.play(); clearTimeout(idle); idle = window.setTimeout(() => flap.pause(), 220);
      },
    });
  }
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
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  name.addEventListener('input', () => { if (name.value.trim()) { err.hidden = true; name.removeAttribute('aria-invalid'); } });
}

/* ------------------------------------------------------------------ misc */
const dlg = $<HTMLDialogElement>('#credits');
document.addEventListener('click', (e) => { if ((e.target as Element).closest('[data-credits]')) { e.preventDefault(); dlg?.showModal(); } });
$$('[data-year]').forEach((y) => (y.textContent = String(new Date().getFullYear())));

/* ------------------------------------------------------------------ start */
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
