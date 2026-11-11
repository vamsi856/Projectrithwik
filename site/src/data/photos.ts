import commons from './commons.json';
import FLIGHT from './flight.json';
import SOUNDS from './sounds.json';
import PERCH from './perch-credits.json';

import SIZES from './photo-sizes.json';

// Product and scene photos come from Wikimedia Commons (credited in the photo credits) and
// are served from this site, in AVIF with a WebP fallback, at a few widths each (made by
// the photo build step from the Commons originals). Self-hosting keeps them fast, cached,
// cookie-free, and safe from Commons' rate limits.

/** `local`: our own crop of the Commons file, served from this site (public/), when only part of the photo is wanted */
/** `own`: a photo Rithwik supplied (no outside credit needed) */
export type Remote = { t: string; u: string; w: number; h: number; p: string; l: string; a: string; local?: string; own?: boolean };
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const DATA = commons as Record<string, Remote>;
const SIZE = SIZES as Record<string, { w: number; h: number; widths: number[] }>;

export type Photo = { src: string; srcset: string; avif: string; width: number; height: number; credit: Remote };

const file = (key: string, w: number, ext: 'avif' | 'webp') => `${BASE}img/${key}-${w}.${ext}`;

export function photo(key?: string): Photo | undefined {
  if (!key || !DATA[key] || !SIZE[key]) return undefined;
  const r = DATA[key], z = SIZE[key];
  const fallback = z.widths.includes(800) ? 800 : z.widths[z.widths.length - 1];
  return {
    src: file(key, fallback, 'webp'),
    srcset: z.widths.map((w) => `${file(key, w, 'webp')} ${w}w`).join(', '),
    avif: z.widths.map((w) => `${file(key, w, 'avif')} ${w}w`).join(', '),
    width: z.w,
    height: z.h,
    credit: r,
  };
}

// Flying birds in the Bird Feeds hero: frames cut from this free footage (background removed).
export const credits = [
  ...Object.entries(DATA).filter(([, r]) => !r.own).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  ...Object.entries(FLIGHT as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  // the birds sitting on the feed cards (cut out of these photos)
  ...Object.entries(PERCH as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  // the birdsong and the flute (src/scripts/sound.ts)
  ...Object.entries(SOUNDS as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
];

/** A ~500px version for painting onto 3D pack labels. */
export function photoSmall(key?: string) {
  if (!key || !SIZE[key]) return undefined;
  return file(key, SIZE[key].widths[0], 'webp');
}
