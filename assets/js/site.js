/* Rithwik site: book intro, page-turn navigation, flocks, seed fall, catalogue filters, WhatsApp enquiries. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const WA = '918309782770';

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    if (window.SplitText) gsap.registerPlugin(SplitText);
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, immediate = false) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { immediate, duration: 1.2 });
    else el.scrollIntoView({ behavior: immediate || reduce ? 'auto' : 'smooth' });
  };

  /* ---------- the book ---------- */
  const stage = $('#top');
  const cover = $('#cover');
  const coverFront = $('#openBook');
  const coverBack = $('.cover__back');
  const hint = $('#stageHint');
  let opened = false;

  const openBook = () => {
    if (opened) return;
    opened = true;
    stage.classList.add('is-open');
    coverFront.setAttribute('tabindex', '-1');
    coverFront.setAttribute('aria-hidden', 'true');
    coverBack.setAttribute('tabindex', '0');
    hint.textContent = 'Pick a page to step inside.';
    startFlock($('.page__flock'));
  };
  coverFront.addEventListener('click', openBook);
  // open on its own shortly after the page settles
  const autoOpen = () => setTimeout(openBook, reduce ? 0 : 1100);
  if (document.readyState === 'complete') autoOpen();
  else addEventListener('load', autoOpen, { once: true });

  /* ---------- page turn into a chapter ---------- */
  const turn = $('#turn');
  const enter = (id, pageEl) => {
    const target = document.getElementById(id);
    if (!hasGsap || reduce) { scrollToEl(target, true); return; }
    const r = pageEl.getBoundingClientRect();
    const bg = id === 'bird-feeds' ? '#0b1924' : '#e4dfc1';
    gsap.set(turn, {
      visibility: 'visible', left: r.left, top: r.top, width: r.width, height: r.height,
      background: bg, borderRadius: 8, clipPath: 'inset(0% 0% 0% 0%)', rotateY: 0, transformPerspective: 1600,
    });
    gsap.timeline()
      .to(turn, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.8, ease: 'power3.inOut' })
      .add(() => { scrollToEl(target, true); ScrollTrigger.refresh(); })
      .to(turn, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'power3.inOut' }, '+=0.05')
      .set(turn, { visibility: 'hidden' });
  };
  $$('[data-enter]').forEach((a) => a.addEventListener('click', (e) => {
    if (!opened) { e.preventDefault(); openBook(); return; }
    e.preventDefault();
    enter(a.dataset.enter, a);
  }));

  /* back to the book */
  $$('[data-book]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToEl(stage);
  }));

  /* in-page links */
  $$('a[href^="#"]:not([data-enter]):not([data-book]):not([data-product])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
      if (t.id === 'bird-feeds') t.setAttribute('tabindex', '-1');
    });
  });

  /* ---------- flocks ---------- */
  const UP = 'M-32 -9 Q-17 -17 0 2 Q17 -17 32 -9 Q17 -8 0 7 Q-17 -8 -32 -9Z';
  const DOWN = 'M-30 11 Q-17 3 0 2 Q17 3 30 11 Q17 5 0 7 Q-17 5 -30 11Z';
  const NS = 'http://www.w3.org/2000/svg';
  const flockColours = ['#f2b21b', '#7cc4ea', '#e4dfc1', '#f2b21b', '#7cc4ea'];

  function buildFlock(svg) {
    if (svg.dataset.built) return svg._tweens || [];
    svg.dataset.built = '1';
    const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number);
    const n = +svg.dataset.flock;
    const tweens = [];
    for (let i = 0; i < n; i++) {
      const g = document.createElementNS(NS, 'g');
      const p = document.createElementNS(NS, 'path');
      const s = 0.35 + Math.random() * (w > 600 ? 0.9 : 0.45);
      p.setAttribute('d', UP);
      p.setAttribute('fill', flockColours[i % flockColours.length]);
      p.setAttribute('opacity', (0.55 + s * 0.4).toFixed(2));
      p.setAttribute('transform', `scale(${s.toFixed(2)})`);
      g.appendChild(p);
      svg.appendChild(g);
      const y = h * (0.12 + Math.random() * 0.6);
      if (reduce || !hasGsap) {
        g.setAttribute('transform', `translate(${(w * (0.15 + Math.random() * 0.7)).toFixed(0)} ${y.toFixed(0)})`);
        continue;
      }
      const flight = gsap.to(g, {
        motionPath: {
          path: [
            { x: -60, y },
            { x: w * 0.3, y: y - h * 0.08 * Math.random() - 10 },
            { x: w * 0.65, y: y + h * 0.1 * Math.random() },
            { x: w + 60, y: y - h * 0.12 },
          ],
          curviness: 1.3,
        },
        duration: 9 + Math.random() * 9 - s * 3,
        ease: 'none', repeat: -1,
        delay: -Math.random() * 14,
        paused: true,
      });
      const flap = gsap.to(p, {
        attr: { d: DOWN }, duration: 0.16 + Math.random() * 0.14,
        repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true,
      });
      tweens.push(flight, flap);
    }
    svg._tweens = tweens;
    return tweens;
  }
  function startFlock(svg) {
    if (!svg) return;
    buildFlock(svg).forEach((t) => t.play());
  }

  const heroFlock = $('.bird__flock');
  if (heroFlock) {
    const tw = buildFlock(heroFlock);
    if (hasGsap && tw.length) {
      ScrollTrigger.create({
        trigger: '.bird__hero', start: 'top bottom', end: 'bottom top',
        onToggle: (self) => tw.forEach((t) => (self.isActive ? t.play() : t.pause())),
      });
    }
  }

  /* ---------- seed fall (bird hero) ---------- */
  const canvas = $('#seedfall');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    const colours = ['#d9b24a', '#e6d39a', '#f2ede1', '#8a3b2b', '#2c2a2a', '#b9b3a6'];
    let seeds = [], W = 0, H = 0, raf = 0, running = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, W / 16));
      seeds = Array.from({ length: count }, () => spawn(true));
    };
    const spawn = (anywhere) => ({
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -10,
      vy: 0.25 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.03,
      s: 1.4 + Math.random() * 2.4,
      c: colours[(Math.random() * colours.length) | 0],
      a: 0.25 + Math.random() * 0.45,
    });
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of seeds) {
        p.y += p.vy; p.x += p.vx; p.r += p.vr;
        if (p.y > H + 10) Object.assign(p, spawn(false));
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.25, p.s * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    size();
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; tick(); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }

  /* ---------- scroll-linked motion ---------- */
  if (hasGsap && !reduce) {
    if (window.SplitText) {
      $$('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'words,lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.07,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }),
        });
      });
    }

    $$('.ghost').forEach((g) => {
      const centred = g.classList.contains('ghost--enq');
      if (centred) gsap.set(g, { x: 0, xPercent: -50 });
      gsap.fromTo(g, { xPercent: centred ? -40 : 6 }, {
        xPercent: centred ? -60 : -12, ease: 'none',
        scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    $$('.shelf__photo img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -12 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ---------- header ---------- */
  const bar = $('#bar');
  const navLinks = $$('[data-nav]');
  const setCurrent = (id) => navLinks.forEach((a) => a.classList.toggle('is-current', a.dataset.nav === id));
  if (hasGsap) {
    ScrollTrigger.create({
      trigger: '#bird-feeds', start: 'top 70%',
      onEnter: () => bar.classList.add('is-shown'),
      onLeaveBack: () => bar.classList.remove('is-shown'),
    });
    ['bird-feeds', 'human-food', 'enquire'].forEach((id) => {
      ScrollTrigger.create({
        trigger: '#' + id, start: 'top 40px', end: 'bottom 40px',
        onToggle: (self) => {
          if (!self.isActive) return;
          setCurrent(id);
          bar.classList.toggle('is-food', id === 'human-food');
        },
      });
    });
  } else {
    bar.classList.add('is-shown');
  }

  /* ---------- feed filter ---------- */
  const feeds = $$('#feedList .feed');
  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    $$('.chip').forEach((c) => { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-pressed', c === chip); });
    const f = chip.dataset.filter;
    const shown = [];
    feeds.forEach((li) => {
      const on = f === 'all' || li.dataset.group === f;
      li.classList.toggle('is-hidden', !on);
      if (on) shown.push(li);
    });
    if (hasGsap && !reduce) gsap.from(shown, { opacity: 0, y: 14, duration: 0.45, stagger: 0.035, ease: 'power2.out', clearProps: 'all' });
    ScrollTrigger.refresh();
  }));

  /* ---------- enquiry form ---------- */
  const form = $('#enqForm');
  const select = $('#productSelect');
  const groups = $$('optgroup', select);
  const syncGroups = () => {
    const div = form.division.value;
    groups.forEach((g) => {
      const on = g.dataset.division === div;
      g.disabled = !on; g.hidden = !on;
    });
    const cur = select.selectedOptions[0];
    if (!cur || cur.parentElement.disabled) {
      const first = groups.find((g) => !g.disabled)?.querySelector('option');
      if (first) first.selected = true;
    }
  };
  $$('input[name="division"]', form).forEach((r) => r.addEventListener('change', syncGroups));
  syncGroups();

  $$('[data-product]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const radio = $(`input[name="division"][value="${a.dataset.division}"]`, form);
    if (radio) { radio.checked = true; syncGroups(); }
    const opt = [...select.options].find((o) => o.textContent === a.dataset.product && !o.parentElement.disabled);
    if (opt) opt.selected = true;
    scrollToEl($('#enquire'));
    setTimeout(() => form.name.focus({ preventScroll: true }), reduce ? 0 : 1200);
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#formError');
    const name = form.name.value.trim();
    if (!name) {
      err.hidden = false; form.name.setAttribute('aria-invalid', 'true'); form.name.focus();
      return;
    }
    err.hidden = true; form.name.removeAttribute('aria-invalid');
    const lines = [
      `Hello ${form.division.value},`,
      `I'm ${name}. I'd like a price for ${select.value}.`,
      form.qty.value.trim() && `Quantity: ${form.qty.value.trim()}`,
      form.msg.value.trim(),
    ].filter(Boolean);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  form.name.addEventListener('input', () => { if (form.name.value.trim()) { $('#formError').hidden = true; form.name.removeAttribute('aria-invalid'); } });

  $('#year').textContent = new Date().getFullYear();

  if (hasGsap) {
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }
  document.body.classList.remove('is-loading');
})();
