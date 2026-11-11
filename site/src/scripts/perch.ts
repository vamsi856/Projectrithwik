// Birds on the feed cards (Bird Feeds site).
//
// Each bird arrives when its card scrolls into view - a macaw flies in flapping and folds
// its wings as it lands, a lovebird swoops in, a finch or cockatiel hops up from behind
// the card - and then lives there: it breathes, pecks at the grain, bobs its head, turns
// round, shuffles along the edge, fluffs its feathers, turns to look at your pointer,
// and leans as the page moves. The two lovebirds touch beaks now and then. Tap a bird
// and it flies off (or ducks behind the card), coming back a few seconds later.
import { gsap } from 'gsap';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const SHEETS = [0, 1, 2].map((k) => `${BASE}birds/macaw-hq-${k}.webp`);
const FRAMES = 27, PER = 12, FPS = 30;

type Bird = {
  el: HTMLElement; hop: HTMLElement; sway: HTMLElement; bird: HTMLElement; img: HTMLElement; shadow: HTMLElement | null;
  fly: HTMLElement | null; card: HTMLElement; mates: Bird[];
  face: number; flip: number; front: boolean; arrive: string; fy: number;
  fx: number; shift: number; busy: boolean; sitting: boolean; away: boolean; timer: number; lastTurn: number;
  flap: { start(): void; stop(frame?: number): void } | null; flutter: gsap.core.Tween | null;
  ang: number; vel: number;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(w: [T, number][]) => { let r = Math.random() * w.reduce((s, x) => s + x[1], 0); for (const [v, n] of w) if ((r -= n) <= 0) return v; return w[0][0]; };

/** Steps the macaw flight footage frame by frame on a background sprite. */
function flapper(el: HTMLElement) {
  let f = 0, sheet = -1, last = 0, on = false;
  const show = (i: number) => {
    const s = (i / PER) | 0, j = i % PER;
    if (s !== sheet) { sheet = s; el.style.backgroundImage = `url(${SHEETS[s]})`; }
    el.style.backgroundPosition = `${(j % 3) * 50}% ${((j / 3) | 0) * (100 / 3)}%`;
  };
  const tick = (t: number) => { if (last) f = (f + (t - last) * FPS) % FRAMES; last = t; show(f | 0); };
  return {
    start() { if (on) return; on = true; last = 0; gsap.ticker.add(tick); },
    stop(frame = 0) { on = false; gsap.ticker.remove(tick); f = frame; show(frame); },
  };
}

export function initPerches(root: ParentNode, reduce: boolean) {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-perch]'));
  if (!els.length || reduce) return; // with reduced motion they simply sit still

  const birds: Bird[] = els.map((el) => {
    const fly = el.querySelector<HTMLElement>('.perch__fly');
    const b: Bird = {
      el, hop: el.querySelector('.perch__hop')!, sway: el.querySelector('.perch__sway')!, bird: el.querySelector('.perch__bird')!,
      img: el.querySelector('.perch__img')!, shadow: el.querySelector('.perch__shadow'), fly, card: el.closest<HTMLElement>('[data-perch-host]') ?? el.closest<HTMLElement>('[data-card]')!, mates: [],
      face: Number(el.dataset.face) || 1, flip: 1, front: el.dataset.pose === 'front', arrive: el.dataset.arrive === 'climb' ? 'climb' : fly ? el.dataset.arrive || 'hop' : 'hop',
      fy: parseFloat(getComputedStyle(el).getPropertyValue('--fy')) || 0.8, fx: parseFloat(getComputedStyle(el).getPropertyValue('--fx')) || 0.5,
      shift: 0, busy: false, sitting: false, away: true, timer: 0, lastTurn: 0,
      flap: fly?.classList.contains('perch__flap') ? flapper(fly) : null, flutter: null, ang: 0, vel: 0,
    };
    // data-face already includes any mirroring; the mirroring itself is done here, by GSAP
    // (a CSS scaleX(-1) would be read back by GSAP as a 180 degree turn, upside down)
    b.flip = b.bird.hasAttribute('data-flip') ? -1 : 1;
    gsap.set(b.bird, { scaleX: b.flip, rotation: 0, scaleY: 1 });
    gsap.set(el, { autoAlpha: 0 });
    b.flap?.stop(0); // sets the first frame, so the footage is loaded before it is needed
    return b;
  });
  // birds sharing a card know each other (the lovebird pair)
  const byCard = new Map<HTMLElement, Bird[]>();
  birds.forEach((b) => { const l = byCard.get(b.card) ?? []; l.push(b); byCard.set(b.card, l); });
  byCard.forEach((l) => l.forEach((b) => (b.mates = l.filter((m) => m !== b))));

  /* ------------------------------------------------------------ flight poses */
  const takeWing = (b: Bird) => {
    gsap.set(b.img, { opacity: 0 }); gsap.set(b.fly, { opacity: 1 });
    if (b.shadow) gsap.to(b.shadow, { opacity: 0, duration: 0.2 });
    if (b.flap) b.flap.start();
    else if (b.fly) b.flutter = gsap.fromTo(b.fly, { scaleY: 1 }, { scaleY: 0.62, duration: 0.07, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '45% 62%' });
  };
  const foldWings = (b: Bird) => {
    b.flap?.stop(0);
    b.flutter?.kill(); b.flutter = null; if (b.fly) gsap.set(b.fly, { scaleY: 1 });
    gsap.to(b.fly, { opacity: 0, duration: 0.14 });
    gsap.to(b.img, { opacity: 1, duration: 0.14 });
    if (b.shadow) gsap.to(b.shadow, { opacity: 1, duration: 0.3 });
  };
  /** clip everything below the card's top edge, so a bird can hide behind the card */
  const hideBelow = (b: Bird, on: boolean) => {
    const y = `${(b.fy * 100).toFixed(2)}%`;
    b.el.style.clipPath = on ? `polygon(-80% -80%, 180% -80%, 180% ${y}, -80% ${y})` : '';
  };
  const dir = (b: Bird) => b.face * b.flip; // which way the beak points now

  /* ------------------------------------------------------------ arriving */
  const arrive = (b: Bird, delay = 0) => {
    clearTimeout(b.timer); b.timer = 0; b.away = false; b.busy = true; b.sitting = false;
    const d = dir(b), done = () => { b.sitting = true; rest(b); };
    const tl = gsap.timeline({ delay, onComplete: done });
    gsap.set(b.hop, { x: b.shift, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
    if (b.arrive === 'climb') {
      // a big parrot climbs up over the edge: head first, a pause, a heave, upright
      const below = b.el.offsetHeight * b.fy + 8;
      tl.set(b.el, { autoAlpha: 1 }).call(() => hideBelow(b, true))
        .fromTo(b.hop, { y: below, rotation: 16 * d }, { y: below * 0.5, rotation: 12 * d, duration: 0.8, ease: 'power1.inOut' })
        .to(b.hop, { y: below * 0.22, rotation: 6 * d, duration: 0.5, ease: 'power1.inOut' }, '+=0.3')
        .to(b.hop, { y: 0, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, '+=0.2')
        .call(() => hideBelow(b, false))
        .to(b.bird, { scaleX: 1.05 * b.flip, scaleY: 1.06, duration: 0.16 }, '+=0.2')
        .to(b.bird, { rotation: 3, duration: 0.045, yoyo: true, repeat: 7, ease: 'sine.inOut' })
        .to(b.bird, { scaleX: b.flip, scaleY: 1, rotation: 0, duration: 0.3 });
      return;
    }
    if (b.arrive === 'hop') {
      // up from behind the card: a quick jump, a bounce, a shake of the feathers
      const below = b.el.offsetHeight * b.fy + 8;
      tl.set(b.el, { autoAlpha: 1 }).call(() => hideBelow(b, true))
        .fromTo(b.hop, { y: below }, { y: -16, duration: 0.36, ease: 'power2.out' })
        .to(b.hop, { y: 0, duration: 0.32, ease: 'bounce.out' })
        .call(() => hideBelow(b, false))
        .to(b.bird, { rotation: 4, duration: 0.05, yoyo: true, repeat: 5, ease: 'sine.inOut' }, '+=0.15')
        .set(b.bird, { rotation: 0 });
      return;
    }
    // flying in: from behind and above, a curving glide that flares up just before touchdown
    const far = Number(b.el.dataset.dist) || 0; // a longer flight, e.g. along the family timeline
    const dx = far || (b.arrive === 'macaw' ? 420 : 300), dy = far ? 150 : b.arrive === 'macaw' ? 260 : 210;
    const T = (b.arrive === 'macaw' ? 1.35 : 1.05) * (far ? Math.max(1, far / 420) ** 0.6 : 1);
    tl.set(b.el, { autoAlpha: 1 }).call(() => takeWing(b))
      .fromTo(b.hop, { x: b.shift - d * dx }, { x: b.shift, duration: T, ease: 'power2.out' }, 0)
      .fromTo(b.hop, { y: -dy }, { y: 0, duration: T, ease: 'sine.inOut' }, 0)
      .fromTo(b.hop, { rotation: 10 * d }, { rotation: -12 * d, duration: T, ease: 'power1.in' }, 0)
      .call(() => b.flap?.stop(0), [], T - 0.22) // wings held up as it flares
      .call(() => foldWings(b), [], T - 0.04)
      .to(b.hop, { rotation: 0, scaleX: 1.06, scaleY: 0.9, duration: 0.1, ease: 'power1.out' }, T)
      .to(b.hop, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
  };

  /* ------------------------------------------------------------ leaving */
  const leave = (b: Bird) => {
    if (b.away) return;
    clearTimeout(b.timer); b.timer = 0; b.away = true; b.busy = true; b.sitting = false;
    gsap.killTweensOf([b.hop, b.bird]);
    gsap.set(b.bird, { rotation: 0, scaleX: b.flip, scaleY: 1 });
    // it comes back a few seconds later, or as soon as its card is next in view
    const d = dir(b), back = () => { b.timer = 0; b.busy = false; if (inView.has(b.card)) arrive(b); };
    const tl = gsap.timeline({ onComplete: () => { b.timer = window.setTimeout(back, rnd(4500, 8000)); } });
    if (b.arrive === 'hop' || b.arrive === 'climb') {
      tl.to(b.hop, { y: -14, duration: 0.14, ease: 'power2.out' })
        .call(() => hideBelow(b, true))
        .to(b.hop, { y: b.el.offsetHeight * b.fy + 8, duration: 0.3, ease: 'power2.in' })
        .set(b.el, { autoAlpha: 0 })
        // it will pop up somewhere else along the edge
        .call(() => { b.shift = gsap.utils.clamp(-40, 40, rnd(-40, 40)); hideBelow(b, false); });
      return;
    }
    tl.to(b.hop, { scaleY: 0.88, duration: 0.08 }) // crouch, then spring
      .call(() => takeWing(b))
      .to(b.hop, { scaleY: 1, x: `+=${d * 460}`, duration: 1, ease: 'power2.in' })
      .to(b.hop, { y: -320, rotation: -14 * d, duration: 1, ease: 'power1.out' }, '<')
      .to(b.el, { autoAlpha: 0, duration: 0.3 }, '-=0.3')
      .call(() => { b.flap?.stop(0); b.flutter?.kill(); b.flutter = null; gsap.set(b.hop, { x: b.shift, y: 0, rotation: 0 }); });
  };

  /* ------------------------------------------------------------ living there */
  const rest = (b: Bird) => {
    b.busy = false; clearTimeout(b.timer);
    b.timer = window.setTimeout(() => act(b), rnd(1800, 5600));
  };
  const act = (b: Bird) => {
    b.timer = 0;
    if (!inView.has(b.card) || b.busy || b.away) return; // picks up again when back in view
    b.busy = true;
    const tl = gsap.timeline({ onComplete: () => rest(b) }), d = dir(b);
    // only a pair touches beaks (three in a row would bump into each other)
    const mate = b.mates.length === 1 ? b.mates.find((m) => m.sitting && !m.busy && !m.away) : undefined;
    const what = pick<string>(b.front
      ? [['bob', 30], ['lean', 26], ['fluff', 16], ['shuffle', 14], ['peck', 14], ['nuzzle', mate ? 22 : 0]]
      : [['peck', 36], ['turn', b.mates.length ? 0 : 14], ['shuffle', 14], ['fluff', 11], ['look', 11], ['bob', 9], ['nuzzle', mate ? 22 : 0]]);
    switch (what) {
      case 'peck': { // dip to the grain in front, once or twice
        const n = Math.random() < 0.45 ? 2 : 1, a = (b.front ? 8 : 16) * d;
        for (let i = 0; i < n; i++) tl.to(b.bird, { rotation: a, duration: 0.12, ease: 'power2.in' }).to(b.bird, { rotation: 0, duration: 0.22, ease: 'power2.out' });
        break;
      }
      case 'bob': // the parrot head-bob
        for (let i = 0; i < 3; i++) tl.to(b.bird, { scaleY: 0.92, duration: 0.11, ease: 'power1.inOut' }).to(b.bird, { scaleY: 1, duration: 0.13, ease: 'power1.inOut' });
        break;
      case 'lean': { // a curious lean to one side, a look, and back
        const s = Math.random() < 0.5 ? -1 : 1;
        tl.to(b.bird, { rotation: 7 * s, duration: 0.35, ease: 'power2.out' }).to(b.bird, { rotation: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.7');
        break;
      }
      case 'turn': turn(b, tl); break;
      case 'look': // glance back over the shoulder, then forward again
        tl.to(b.bird, { rotation: -6 * d, duration: 0.18 }).to(b.bird, { rotation: 0, duration: 0.3 }, '+=0.6');
        break;
      case 'fluff': // puff up, shake, settle
        tl.to(b.bird, { scaleX: 1.06 * b.flip, scaleY: 1.07, duration: 0.16, ease: 'power2.out' })
          .to(b.bird, { rotation: 3, duration: 0.045, yoyo: true, repeat: 7, ease: 'sine.inOut' })
          .to(b.bird, { scaleX: b.flip, scaleY: 1, rotation: 0, duration: 0.3, ease: 'power2.inOut' });
        break;
      case 'shuffle': { // a step or two along the edge
        const to = gsap.utils.clamp(-40, 40, b.shift + (Math.random() < 0.5 ? -1 : 1) * rnd(14, 30)); b.shift = to;
        tl.to(b.hop, { y: -9, x: to, duration: 0.24, ease: 'power1.out' }).to(b.hop, { y: 0, duration: 0.22, ease: 'bounce.out' });
        break;
      }
      case 'nuzzle': nuzzle(b, mate!, tl); break;
    }
  };
  const turn = (b: Bird, tl = gsap.timeline({ onComplete: () => rest(b) })) => {
    b.flip *= -1; b.lastTurn = performance.now();
    tl.to(b.hop, { y: -14, duration: 0.15, ease: 'power2.out' }).set(b.bird, { scaleX: b.flip }).to(b.hop, { y: 0, duration: 0.3, ease: 'bounce.out' });
    return tl;
  };
  /** the two lovebirds shuffle together, touch beaks, and step apart */
  const nuzzle = (b: Bird, m: Bird, tl: gsap.core.Timeline) => {
    m.busy = true; clearTimeout(m.timer);
    const [l, r] = b.el.offsetLeft < m.el.offsetLeft ? [b, m] : [m, b];
    // both must face each other: left one looks right, right one looks left
    const need = (x: Bird, want: number) => { if (dir(x) !== want) { x.flip *= -1; gsap.set(x.bird, { scaleX: x.flip }); } };
    need(l, 1); need(r, -1);
    const gap = Math.max(0, r.el.offsetLeft - l.el.offsetLeft + r.shift - l.shift - 100) / 2;
    const ls = l.shift, rs = r.shift;
    tl.to(l.hop, { x: ls + gap, y: -6, duration: 0.3, ease: 'power1.out' }, 0).to(r.hop, { x: rs - gap, y: -6, duration: 0.3, ease: 'power1.out' }, 0.08)
      .to([l.hop, r.hop], { y: 0, duration: 0.2, ease: 'bounce.out' })
      .to(l.bird, { rotation: 9, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' })
      .to(r.bird, { rotation: -9 * (r.front ? 0.6 : 1), duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, '<0.07')
      .to(l.hop, { x: ls, duration: 0.4, ease: 'power2.inOut' }, '+=0.5').to(r.hop, { x: rs, duration: 0.4, ease: 'power2.inOut' }, '<0.1')
      .call(() => rest(m));
  };

  /* ------------------------------------------------------------ coming into view */
  const inView = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const card = e.target as HTMLElement, list = byCard.get(card)!;
    if (e.isIntersecting) inView.add(card); else inView.delete(card);
    if (e.isIntersecting && e.intersectionRatio > 0.2) {
      list.forEach((b, i) => {
        if (b.away && !b.busy && !b.timer) arrive(b, (Number(b.el.dataset.delay) || 0.3) + i * 0.75 + rnd(0, 0.3));
        else if (b.sitting && !b.busy && !b.timer) rest(b);
      });
    }
  }), { threshold: [0, 0.25] });
  byCard.forEach((_, card) => io.observe(card));

  /* ------------------------------------------------------------ touching */
  byCard.forEach((list, card) => {
    // hovering the card: a little hop of surprise
    card.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      list.forEach((b) => {
        if (!b.sitting || b.busy) return; b.busy = true; clearTimeout(b.timer);
        gsap.timeline({ onComplete: () => rest(b) }).to(b.hop, { y: -18, duration: 0.16, ease: 'power2.out' }).to(b.hop, { y: 0, duration: 0.4, ease: 'bounce.out' });
      });
    });
    // birds facing away turn round to look at the pointer
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      list.forEach((b) => {
        if (!b.sitting || b.busy || b.front || b.mates.length || now - b.lastTurn < 1600) return;
        const r = b.el.getBoundingClientRect(), feet = r.left + r.width * b.fx;
        if ((e.clientX - feet) * dir(b) < -60) { b.busy = true; clearTimeout(b.timer); turn(b); }
      });
    });
    // tap a bird and the birds on that card take off
    list.forEach((b) => b.img.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      list.forEach((m, i) => (m.sitting || m.busy) && !m.away && gsap.delayedCall(i * 0.12, () => leave(m)));
    }));
  });

  /* ------------------------------------------------------------ the page moving under them */
  // a tiny spring per bird: fast scrolling makes it lean and crouch, and it wobbles back upright
  let lastY = window.scrollY, lastT = 0, live = 0;
  gsap.ticker.add((t) => {
    const dt = lastT ? Math.min(0.05, t - lastT) : 0; lastT = t;
    const y = window.scrollY, v = dt ? (y - lastY) / dt : 0; lastY = y;
    if (!dt) return;
    if (Math.abs(v) > 30) live = t;
    if (t - live > 3) return; // all settled: nothing to do
    for (const b of birds) {
      if (!b.sitting || !inView.has(b.card)) continue;
      const target = gsap.utils.clamp(-7, 7, v * 0.0022 * dir(b));
      b.vel += ((target - b.ang) * 140 - b.vel * 9) * dt; b.ang += b.vel * dt;
      gsap.set(b.sway, { rotation: b.ang, scaleY: 1 - Math.min(0.05, Math.abs(b.ang) * 0.006) });
    }
  });
}
