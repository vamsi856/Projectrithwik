// Real birds that sit on top of the feed cards (Bird Feeds site). Each is a cut-out from a
// free photo on Wikimedia Commons (credited with the photos). `fx`/`fy` is where the feet
// are inside the image (0..1), so the feet land exactly on the card's top edge; `face` is
// the way the beak points (1 right, -1 left), so pecks dip toward the grain in front;
// `pose: 'front'` birds face us, so they bob and lean instead of turning round.
import META from './perch-birds.json';

export type PerchBird = { w: number; h: number; fx: number; fy: number; face: number; pose?: 'front' };
export const PERCH_BIRDS = META as Record<string, PerchBird>;

/**
 * How a bird gets onto its card:
 * - 'macaw': flies in flapping (the same blue-and-gold macaw footage as the flock), lands, folds its wings
 * - 'glide': swoops in with wings up (a lovebird photographed in flight) and lands
 * - 'hop':   hops up from behind the card, as if it had been feeding on the other side
 * - 'climb': climbs up over the edge, beak first, the way big parrots do
 */
export type Arrive = 'macaw' | 'glide' | 'hop' | 'climb';
export type Perch = {
  bird: string;
  /** where the feet stand along the top edge, 0 (left) .. 1 (right) */
  x: number;
  /** on phones, if it should stand somewhere else */
  xm?: number;
  /** CSS px from the edge to the top of the head */
  tall: number;
  /** mirror the photo so the bird faces the other way */
  flip?: boolean;
  arrive?: Arrive;
};

/** which birds sit on which feed */
export const PERCHES: Record<string, Perch[]> = {
  'b-foxtail': [{ bird: 'bgmacaw', x: 0.76, tall: 124, arrive: 'macaw' }],
  'b-barnyard': [{ bird: 'finch', x: 0.7, tall: 66, arrive: 'hop' }],
  'b-browntop': [{ bird: 'budgie', x: 0.3, tall: 70, arrive: 'hop' }],
  'b-kodo': [{ bird: 'cockatiel', x: 0.27, tall: 92, arrive: 'hop' }],
  // a pair of lovebirds, facing each other
  'b-little': [
    { bird: 'lovebird', x: 0.3, tall: 72, arrive: 'glide' },
    { bird: 'lovebird2', x: 0.72, tall: 74, flip: true, arrive: 'glide' },
  ],
  // budgies and proso millet: three of them in a row, popping up one after another
  'b-proso': [
    { bird: 'budgie-y', x: 0.2, tall: 66, arrive: 'hop' },
    { bird: 'budgie-b', x: 0.5, tall: 62, arrive: 'hop' },
    { bird: 'budgie-g', x: 0.8, tall: 62, arrive: 'hop' },
  ],
  'b-bajra': [{ bird: 'conure', x: 0.3, tall: 86, arrive: 'hop' }],
  // macaws love sunflower seed: this one sits on the corner, its long tail hanging off the side
  'b-sunflower': [{ bird: 'macaw-long', x: 0.86, xm: 0.8, tall: 112, arrive: 'macaw' }],
  'b-jowar': [{ bird: 'scarlet', x: 0.36, tall: 108, arrive: 'climb' }],
  // cockatoos are mad about corn
  'b-maize': [{ bird: 'cockatoo', x: 0.7, tall: 112, arrive: 'hop' }],
  // the rose-ringed parakeet, India's own: safflower is a favourite
  'b-safflower': [{ bird: 'ringneck', x: 0.62, tall: 92, arrive: 'hop' }],
};

const GLIDE = 'lovebird-fly';
// one frame of the macaw flight sheet (the flock's footage): 1062 x 725, feet tucked at (0.6, 0.72)
const FLAP = { w: 1062, h: 725, fx: 0.6, fy: 0.72 };

const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;

/** Everything a card needs to draw a perched bird, sized in % of the bird's own box. */
export function perchLayout(p: Perch) {
  const b = PERCH_BIRDS[p.bird];
  if (!b) return null;
  const H = p.tall / b.fy, W = H * (b.w / b.h); // the box, CSS px at desktop size
  const arrive: Arrive = p.arrive ?? 'hop';
  let sprite: { kind: 'glide' | 'flap'; src?: string; left: string; top: string; width: string; height: string } | null = null;
  if (arrive === 'glide' && PERCH_BIRDS[GLIDE]) {
    // wings up, the gliding bird stands about twice as tall as it sits
    const g = PERCH_BIRDS[GLIDE], h = p.tall * 2, w = h * (g.w / g.h);
    sprite = { kind: 'glide', src: GLIDE, left: pct((b.fx * W - g.fx * w) / W), top: pct((b.fy * H - g.fy * h) / H), width: pct(w / W), height: pct(h / H) };
  } else if (arrive === 'macaw') {
    const w = p.tall * 3.4, h = (w * FLAP.h) / FLAP.w;
    sprite = { kind: 'flap', left: pct((b.fx * W - FLAP.fx * w) / W), top: pct((b.fy * H - FLAP.fy * h) / H), width: pct(w / W), height: pct(h / H) };
  }
  return {
    bird: b, arrive, sprite,
    face: b.face * (p.flip ? -1 : 1),
    style: `--x:${p.x};${p.xm != null ? `--xm:${p.xm};` : ''}--fx:${b.fx};--fy:${b.fy};--tall:${p.tall}px;--ar:${b.w / b.h}`,
  };
}
