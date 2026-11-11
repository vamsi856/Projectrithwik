import commons from './commons.json';
import FLIGHT from './flight.json';
import SOUNDS from './sounds.json';
import PERCH from './perch-credits.json';

// Product and scene photos are served straight from Wikimedia Commons, which allows
// hotlinking. We request Wikimedia's standard thumbnail widths so every size is cached
// on their CDN, and let the browser pick one via srcset.

export type Remote = { t: string; u: string; w: number; h: number; p: string; l: string; a: string };
const DATA = commons as Record<string, Remote>;
const STEPS = [500, 960, 1280, 1920];

function thumb(u: string, width: number) {
  // https://upload.wikimedia.org/wikipedia/commons/a/ab/Name.jpg
  //   -> https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Name.jpg/960px-Name.jpg
  const m = u.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/)(.+\/)([^/]+)$/);
  if (!m) return u;
  const [, root, dir, file] = m;
  const name = /\.png$/i.test(file) ? file : file;
  return `${root}thumb/${dir}${file}/${width}px-${name}`;
}

export type Photo = { src: string; srcset: string; width: number; height: number; credit: Remote };

export function photo(key?: string): Photo | undefined {
  if (!key || !DATA[key]) return undefined;
  const r = DATA[key];
  const widths = STEPS.filter((s) => s < r.w);
  const set = widths.map((w) => `${thumb(r.u, w)} ${w}w`);
  if (r.w <= 1920) set.push(`${r.u} ${r.w}w`);
  const fallbackW = widths.includes(960) ? 960 : widths[widths.length - 1];
  return {
    src: fallbackW ? thumb(r.u, fallbackW) : r.u,
    srcset: set.join(', '),
    width: r.w,
    height: r.h,
    credit: r,
  };
}

// Flying birds in the Bird Feeds hero: frames cut from this free footage (background removed).
export const credits = [
  ...Object.entries(DATA).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  ...Object.entries(FLIGHT as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  // the birds sitting on the feed cards (cut out of these photos)
  ...Object.entries(PERCH as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
  // the birdsong and the flute (src/scripts/sound.ts)
  ...Object.entries(SOUNDS as Record<string, { t: string; a: string; l: string; p: string }>).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p })),
];

/** A ~500px version for painting onto 3D pack labels. */
export function photoSmall(key?: string) {
  if (!key || !DATA[key]) return undefined;
  const r = DATA[key];
  return r.w > 500 ? thumb(r.u, 500) : r.u;
}
