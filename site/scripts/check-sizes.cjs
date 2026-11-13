// Checks the site at 13 screen widths (phones to big desktops) on the book, Bird Feeds and
// Rithwik Industries: nothing may spill sideways, and the header buttons must not overlap
// or fall off screen. Run against a preview build:
//   npm run build && npx astro preview --port 4331     (in one terminal)
//   node scripts/check-sizes.cjs                        (in another; needs: npx playwright install chromium)
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:4331/Projectrithwik/';
const W = [320, 360, 390, 414, 600, 760, 761, 768, 820, 1024, 1280, 1440, 1920];
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const w of W) {
    const p = await b.newPage({ viewport: { width: w, height: w < 700 ? 800 : 900 }, isMobile: w < 700, hasTouch: w < 1100 });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    for (const v of ['', '#bird-feeds', '#human-food']) {
      await p.goto(BASE + v, { waitUntil: 'load' }); await p.waitForTimeout(1500);
      // scroll to the bottom to catch anything that overflows late
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      let ov = 0;
      for (let y = 0; y < H; y += 900) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); ov = Math.max(ov, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)); }
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
      const r = await p.evaluate(() => {
        const site = document.querySelector('[data-site]:not([hidden])'); if (!site) return { overlap: false, offscreen: [] };
        const bar = site.querySelector('.sbar'); const R = (e) => e.getBoundingClientRect();
        const items = ['.sbar__brand', '.sbar__call', '.sbar__book', '.sbar__menu'].map((s) => { const e = bar.querySelector(s); return getComputedStyle(e).display === 'none' ? null : [s, Math.round(R(e).left), Math.round(R(e).right), Math.round(R(e).top)]; }).filter(Boolean);
        let overlap = false; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (items[i][2] > items[j][1] && items[j][2] > items[i][1] && items[i][3] === items[j][3]) overlap = true;
        return { overlap, offscreen: items.filter((x) => x[2] > innerWidth || x[1] < 0).map((x) => x[0]) };
      });
      const ok = ov === 0 && !r.overlap && !r.offscreen.length;
      if (!ok) bad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${w}px ${v || 'book'}${ov ? ` spills ${ov}px sideways` : ''}${r.overlap ? ' header overlaps' : ''}${r.offscreen.length ? ' off screen: ' + r.offscreen : ''}`);
    }
    if (errs.length) { bad++; console.log(`FAIL ${w}px script errors:`, errs); }
    await p.close();
  }
  await b.close();
  console.log(bad ? `${bad} problem(s)` : 'all good');
  process.exit(bad ? 1 : 0);
})();
