// Festive themes switch on by date. Sankranti (Bhogi, Sankranti, Kanuma) falls in
// mid-January; the theme runs from the 10th to the 17th. Preview any time with
// ?festive=sankranti, or turn it off with ?festive=off.
import { gsap } from 'gsap';

type Theme = 'sankranti' | null;

export function activeTheme(now = new Date()): Theme {
  const q = new URLSearchParams(location.search).get('festive');
  if (q === 'off') return null;
  if (q === 'sankranti') return 'sankranti';
  const m = now.getMonth() + 1, d = now.getDate();
  if (m === 1 && d >= 10 && d <= 17) return 'sankranti';
  return null;
}

const KITE_COLOURS = [['#ff6f91', '#ffd166'], ['#ff9f1c', '#2ec4b6'], ['#ffd166', '#ef476f'], ['#06d6a0', '#ff9f1c'], ['#f15bb5', '#fee440'], ['#00bbf9', '#ff9f1c']];

function kite([a, b]: string[], tail = 4) {
  const bows = Array.from({ length: tail }, (_, i) => `<path d="M${-6 + (i % 2) * 6} ${70 + i * 16} l6 -5 l6 5 l-6 5z" fill="${i % 2 ? a : b}"/>`).join('');
  return `<svg viewBox="-40 -40 80 160" aria-hidden="true">
    <path d="M0 -36 L30 0 L0 46 L-30 0Z" fill="${a}"/>
    <path d="M0 -36 L30 0 L0 4 L-30 0Z" fill="${b}" opacity=".85"/>
    <path d="M0 -36 V46 M-30 0 H30" stroke="#3b1300" stroke-opacity=".45" stroke-width="1.6"/>
    <path class="kite-tail" d="M0 46 q-8 16 0 30 q8 16 0 30 q-8 16 0 30" fill="none" stroke="#3b1300" stroke-opacity=".35" stroke-width="1.2"/>
    ${bows}
    <path d="M0 4 L-120 260" stroke="#3b1300" stroke-opacity=".25" stroke-width="1"/>
  </svg>`;
}

export function applyFestive(reduce: boolean) {
  const theme = activeTheme();
  if (theme !== 'sankranti') return;
  document.documentElement.classList.add('fest-sankranti');

  // greeting ribbon at the top of each site, dismissable for this visit
  let closed = false; try { closed = sessionStorage.getItem('fest-closed') === '1'; } catch {}
  if (!closed) document.querySelectorAll<HTMLElement>('[data-site]').forEach((site) => {
    const r = document.createElement('div'); r.className = 'fest-ribbon'; r.setAttribute('role', 'note');
    r.innerHTML = `<span>Happy Sankranti! Wishing you a bountiful harvest from everyone at Rithwik.</span><button class="fest-ribbon__close" type="button" aria-label="Close greeting">×</button>`;
    r.querySelector('button')!.addEventListener('click', () => { document.querySelectorAll('.fest-ribbon').forEach((x) => x.remove()); try { sessionStorage.setItem('fest-closed', '1'); } catch {} });
    site.prepend(r);
  });

  // kites over the book and both heroes
  document.querySelectorAll<HTMLElement>('.stage, .bird__hero, .food-hero').forEach((host, h) => {
    const layer = document.createElement('div'); layer.className = 'kites'; layer.setAttribute('aria-hidden', 'true');
    const n = host.classList.contains('stage') ? 4 : 5;
    for (let i = 0; i < n; i++) {
      const k = document.createElement('div'); k.className = 'kite';
      k.innerHTML = kite(KITE_COLOURS[(i + h) % KITE_COLOURS.length], 3 + (i % 3));
      // keep kites in the sky above the copy: margins beside the book, top band in heroes
      if (host.classList.contains('stage')) {
        k.style.left = i % 2 ? `${88 + (i % 3) * 3}%` : `${2 + (i % 3) * 3}%`;
        k.style.top = `${10 + i * 18}%`;
      } else {
        k.style.left = `${6 + i * (88 / n)}%`;
        k.style.top = `${2 + ((i * 7 + h * 5) % 14)}%`;
      }
      k.style.transform = `scale(${0.7 + ((i * 7) % 5) / 10})`;
      layer.appendChild(k);
      if (!reduce) {
        gsap.to(k, { y: `+=${10 + i * 4}`, x: `+=${(i % 2 ? -1 : 1) * (14 + i * 3)}`, rotate: (i % 2 ? -1 : 1) * 9, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 });
        gsap.to(k.querySelector('.kite-tail'), { attr: { d: 'M0 46 q8 16 0 30 q-8 16 0 30 q8 16 0 30' }, duration: 0.9 + i * 0.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }
    }
    host.appendChild(layer);
  });
}
