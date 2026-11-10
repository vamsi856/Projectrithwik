import { BIRD, FOOD, lineName } from './products';
import { photoSmall } from './photos';
import type { Product } from './products';

export const packItems = (list: Product[]) => list.map((p) => ({
  id: p.id,
  name: p.name,
  variant: p.variants.length > 1 ? p.variants.map((v) => v.label).join(' / ') : p.variants[0].label,
  photo: photoSmall(p.photo),
  c1: p.swatch.c1,
  c2: p.swatch.c2,
  ask: lineName(p, p.variants[0]),
  gst: [...new Set(p.variants.map((v) => v.gst))].join(' / '),
}));

export const BIRD_PACKS = packItems(BIRD);
export const FOOD_PACKS = packItems(FOOD);
