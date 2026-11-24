// The edit: every shot, transition and caption of the ad, in frames at 25 fps (the Indian TV
// standard). Source footage comes from capture/record.cjs (public/footage/manifest.json lists the
// named segments of each recorded clip).
import manifest from '../public/footage/manifest.json';

export const FPS = 25;
export const W = 1920;
export const H = 1080;
const s = (seconds: number) => Math.round(seconds * FPS);

type Clip = 'open' | 'bird' | 'food';
type Manifest = Record<Clip, { segments: { name: string; from: number; frames: number }[]; clicks: { frame: number; x: number; y: number }[] }>;
const M = manifest as unknown as Manifest;

/** First frame of a named segment in its clip. */
export const segmentStart = (clip: Clip, name: string) => {
  const seg = M[clip].segments.find((x) => x.name === name);
  if (!seg) throw new Error(`no segment ${clip}/${name} in the footage manifest`);
  return seg.from;
};

/* ------------------------------------------------------------------ the opening */
// The browser window: the address is typed, the site loads, the window grows to fill the screen,
// the book opens by itself, the cursor picks Bird Feeds and the page turns.
export const OPEN = {
  typeFrom: 14, // the address is typed (frames)
  typeTo: 48,
  enter: 58,
  footage: 75, // the site appears in the window
  zoom: [105, 140] as const, // the window grows to full screen
  click: { ...M.open.clicks[0], at: 75 + M.open.clicks[0].frame }, // when and where Bird Feeds is clicked
  cursorIn: 168,
  frames: 375, // until the Bird Feeds hero has settled
};

/* ------------------------------------------------------------------ the shots */
export type Shot =
  | { kind: 'open'; frames: number }
  | { kind: 'clip'; clip: Clip; seg: string; offset: number; frames: number; caption?: string }
  | { kind: 'end'; frames: number };
export type Join = { join: 'fade' | 'iris'; frames: number };

export const EDIT: (Shot | Join)[] = [
  { kind: 'open', frames: OPEN.frames },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'about', offset: 0.2, frames: 112, caption: 'No. 1 foxtail millet supplier in India' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'legacy', offset: 0.5, frames: 92, caption: 'A family grain trade since 1925' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'packs', offset: 0.3, frames: 80 },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'birds', offset: 0.4, frames: 76, caption: 'Feeds for cage birds and aviaries' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'feeds', offset: 0.2, frames: 96, caption: '12 types of feeds in 18 grades, processed or unprocessed' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'vision', offset: 1.4, frames: 110, caption: 'From Kurnool, across India' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'bird', seg: 'certs', offset: 0.3, frames: 72 },
  // a cream circle opens onto Rithwik Industries, like the site's own page turn
  { join: 'iris', frames: 20 },
  { kind: 'clip', clip: 'food', seg: 'hero', offset: 0, frames: 110 },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'food', seg: 'about', offset: 0.3, frames: 96, caption: 'Millets, super foods, oil seeds, pulses and spices' },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'food', seg: 'packs', offset: 0.3, frames: 76 },
  { join: 'fade', frames: 12 },
  { kind: 'clip', clip: 'food', seg: 'range', offset: 0, frames: 120, caption: 'For retail packers, traders and bulk buyers' },
  { join: 'fade', frames: 15 },
  { kind: 'end', frames: 240 },
];

export const isJoin = (x: Shot | Join): x is Join => 'join' in x;

/** Where each shot starts in the finished ad (transitions overlap the shots on both sides). */
export const STARTS: number[] = (() => {
  const out: number[] = [];
  let t = 0;
  EDIT.forEach((x, i) => {
    if (isJoin(x)) return;
    const prev = EDIT[i - 1];
    if (prev && isJoin(prev)) t -= prev.frames;
    out.push(t);
    t += x.frames;
  });
  return out;
})();
export const TOTAL = (() => {
  const shots = EDIT.filter((x) => !isJoin(x)) as Shot[];
  return STARTS[STARTS.length - 1] + shots[shots.length - 1].frames;
})();
const shotIndex = (pred: (x: Shot) => boolean) => (EDIT.filter((x) => !isJoin(x)) as Shot[]).findIndex(pred);

/** Sound cues. */
export const CUES = {
  birdFeedsOpens: OPEN.click.at,
  humanFood: STARTS[shotIndex((x) => x.kind === 'clip' && x.clip === 'food')],
  endCard: STARTS[shotIndex((x) => x.kind === 'end')],
};
export const seconds = s;
