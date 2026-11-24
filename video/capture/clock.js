// Virtual time for frame-by-frame recording. Injected before any of the site's own scripts.
//
// The site animates with JavaScript (GSAP, Lenis, the macaw flock, three.js) and with CSS. A screen
// recording on a machine without a graphics card drops frames, so instead the recorder stops the
// page's clock and moves it forward exactly one frame at a time, taking a screenshot after each
// step. Every animation then comes out perfectly smooth, at any resolution, however long a frame
// takes to draw.
//
//  - performance.now(), Date.now(), setTimeout/setInterval and requestAnimationFrame all follow the
//    virtual clock, which only moves when the recorder calls __vt.advance(ms).
//  - CSS animations and transitions (and the page-turn view transition) are paused the moment they
//    appear and then set, on every frame, to how long they have run in virtual time.
//  - The site turns its 3D packs and full-resolution flock off when the browser has no graphics
//    card. Recording frame by frame, speed does not matter, so the page is told it has one.
(() => {
  const realRAF = window.requestAnimationFrame.bind(window);
  const realPerfNow = performance.now.bind(performance);
  const perf0 = realPerfNow();
  const date0 = Date.now();
  let now = 0; // virtual milliseconds since the page started
  let seq = 1;
  const timers = new Map(); // id -> { due, fn, args, every, order }
  let frameCallbacks = new Map();

  performance.now = () => perf0 + now;
  Date.now = () => date0 + now;
  const add = (fn, delay, args, every) => {
    const id = seq++;
    timers.set(id, { due: now + Math.max(0, Number(delay) || 0), fn, args, every, order: id });
    return id;
  };
  window.setTimeout = (fn, delay, ...args) => add(fn, delay, args, 0);
  window.setInterval = (fn, delay, ...args) => add(fn, Math.max(1, Number(delay) || 0), args, Math.max(1, Number(delay) || 0));
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (cb) => { const id = seq++; frameCallbacks.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { frameCallbacks.delete(id); };

  // CSS animations follow the virtual clock too
  const born = new WeakMap();
  const sync = () => {
    for (const a of document.getAnimations()) {
      let t0 = born.get(a);
      if (t0 === undefined) { t0 = now; born.set(a, t0); try { a.pause(); } catch {} }
      try { a.currentTime = (now - t0) * (a.playbackRate || 1); } catch {}
    }
  };
  // keep them pinned between frames as well, including while the page loads
  const pin = () => { sync(); realRAF(pin); };
  realRAF(pin);

  const run = (fn, args) => {
    try { typeof fn === 'function' ? fn(...args) : (0, eval)(String(fn)); } catch (e) { console.error(e); }
  };

  window.__vt = {
    now: () => now,
    realRAF,
    /** Move the clock forward by `ms`: due timers fire in order, then one animation frame runs. */
    advance(ms) {
      const target = now + ms;
      for (let guard = 0; guard < 200000; guard++) {
        let next = null;
        for (const t of timers.values()) if (t.due <= target && (!next || t.due < next.due || (t.due === next.due && t.order < next.order))) next = t;
        if (!next) break;
        now = Math.max(now, next.due);
        const id = [...timers].find(([, t]) => t === next)[0];
        if (next.every) { next.due += next.every; next.order = seq++; } else timers.delete(id);
        run(next.fn, next.args);
      }
      now = target;
      const cbs = frameCallbacks;
      frameCallbacks = new Map();
      const ts = perf0 + now;
      for (const cb of cbs.values()) run(cb, [ts]);
      sync();
    },
    sync,
    /** Resolves after the browser has drawn two real frames (so a screenshot shows the latest state). */
    painted: () => new Promise((r) => realRAF(() => realRAF(r))),
  };

  // "this browser has a graphics card": no software-rendering fallbacks (see site/src/scripts/gpu.ts)
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (attrs && attrs.failIfMajorPerformanceCaveat) attrs = { ...attrs, failIfMajorPerformanceCaveat: false };
    return getContext.call(this, type, attrs);
  };
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue;
    const getParameter = C.prototype.getParameter;
    C.prototype.getParameter = function (p) { return p === 0x9246 ? 'ANGLE (recording)' : getParameter.call(this, p); };
  }
})();
