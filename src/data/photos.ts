import commons from './commons.json';

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

export const credits = Object.entries(DATA).map(([key, r]) => ({ key, title: r.t, author: r.a, license: r.l, source: r.p }));
