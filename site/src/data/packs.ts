import { BIRD, FOOD, lineName } from './products';
import { photoSmall } from './photos';
import type { Product } from './products';

// One pack per line: Foxtail millet comes as four packs (summer or winter crop, processed or
// unprocessed), jowar as five, and so on. The line's name is printed on its pack.
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const packItems = (list: Product[]) => list.flatMap((p) => p.variants.map((v) => {
  const photo = v.photo === undefined ? p.photo : v.photo ?? undefined;
  const sw = v.swatch ?? p.swatch;
  return {
    id: p.variants.length > 1 ? `${p.id}-${slug(v.label)}` : p.id,
    name: p.name,
    variant: v.label,
    options: v.label,
    photo: photoSmall(photo),
    c1: sw.c1,
    c2: sw.c2,
    ask: lineName(p, v),
    gst: v.gst,
  };
}));

export const BIRD_PACKS = packItems(BIRD);
export const FOOD_PACKS = packItems(FOOD);
