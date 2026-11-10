// Every product, note and GST rate here comes from the Rithwik catalogue (PDF, Dec 2025).
// `photo` is the file name (without extension) in src/assets/photos. A product without a
// matching photo falls back to its seed swatch, so the site still renders before photos arrive.

export type Swatch = { c1: string; c2: string; grain: number };
export type Product = {
  id: string;
  name: string;
  /** Catalogue lines this card covers. One entry = no variant picker. */
  variants: { label: string; gst: string }[];
  photo?: string;
  swatch: Swatch;
  group: string;
};

const s = (c1: string, c2: string, grain: number): Swatch => ({ c1, c2, grain });

export const BIRD_GROUPS = [
  { id: 'millets', label: 'Millets' },
  { id: 'oilseeds', label: 'Sunflower & safflower' },
  { id: 'grains', label: 'Jowar, bajra & maize' },
  { id: 'pulses', label: 'Horse gram' },
] as const;

export const BIRD: Product[] = [
  { id: 'b-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail', swatch: s('#d9b24a', '#b48a2c', 7),
    variants: [
      { label: 'Summer crop, raw', gst: '0%' },
      { label: 'Summer crop, cleaned', gst: '0%' },
      { label: 'Winter crop, raw', gst: '0%' },
      { label: 'Winter crop, cleaned', gst: '0%' },
    ] },
  { id: 'b-proso', name: 'Proso millet', group: 'millets', photo: 'proso', swatch: s('#e6d39a', '#c4ac68', 8),
    variants: [{ label: 'Raw', gst: '0%' }, { label: 'White, Sortex cleaned', gst: '0%' }] },
  { id: 'b-ragi', name: 'Ragi', group: 'millets', photo: 'ragi', swatch: s('#8a3b2b', '#5e2216', 6),
    variants: [{ label: 'Finger millet', gst: '0%' }] },
  { id: 'b-blacksun', name: 'Black sunflower', group: 'oilseeds', photo: 'blacksun', swatch: s('#2c2a2a', '#4d4a47', 11),
    variants: [{ label: 'Oil-type seed', gst: '5%' }] },
  { id: 'b-sf17', name: 'Sunflower SF-17', group: 'oilseeds', photo: 'sf17', swatch: s('#b9b3a6', '#56514b', 11),
    variants: [{ label: 'Imported, striped', gst: '5%' }] },
  { id: 'b-safflower', name: 'Safflower', group: 'oilseeds', photo: 'safflower', swatch: s('#f2ede1', '#cfc6b0', 10),
    variants: [{ label: 'Whole seed', gst: '5%' }] },
  { id: 'b-bajra', name: 'Pearl millet', group: 'grains', photo: 'bajra', swatch: s('#9aa197', '#6e776c', 8),
    variants: [{ label: 'Bajra', gst: '5%' }] },
  { id: 'b-jowar', name: 'Jowar', group: 'grains', photo: 'jowar', swatch: s('#eadfc6', '#c7b896', 9),
    variants: [{ label: 'Nidi CH5, cleaned', gst: '0%' }, { label: 'Milky', gst: '0%' }, { label: 'Mahendra', gst: '0%' }] },
  { id: 'b-maize', name: 'White maize', group: 'grains', photo: 'maize', swatch: s('#f0e4c4', '#cdbb8d', 12),
    variants: [{ label: 'Whole kernel', gst: '0%' }] },
  { id: 'b-horsegram', name: 'Horse gram', group: 'pulses', photo: 'horsegram', swatch: s('#8b5e3c', '#5f3c22', 9),
    variants: [{ label: 'Regular', gst: '0%' }, { label: 'Raw', gst: '0%' }] },
];

export const FOOD_GROUPS = [
  { id: 'millets', label: 'Millets', note: 'Rich in fibre, antioxidants and essential nutrients. A good fit for gluten-free diets, weight management and digestive health.' },
  { id: 'seeds', label: 'Seeds & super foods', note: 'Chia, flax, pumpkin and sesame, plus quinoa in three colours.' },
  { id: 'pantry', label: 'Dals, pulses & spices', note: 'Everyday dals and pulses, with whole spices and tea.' },
] as const;

export const FOOD: Product[] = [
  { id: 'f-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail', swatch: s('#d9b24a', '#b48a2c', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-little', name: 'Little millet', group: 'millets', photo: 'little', swatch: s('#d8c48a', '#b29e60', 6), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-kodo', name: 'Kodo millet', group: 'millets', photo: 'kodo', swatch: s('#a9824e', '#7d5a2e', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-barnyard', name: 'Barnyard millet', group: 'millets', photo: 'barnyard', swatch: s('#e8dcb8', '#c6b78a', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-proso', name: 'Proso millet', group: 'millets', photo: 'proso', swatch: s('#e6d39a', '#c4ac68', 8), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-browntop', name: 'Browntop millet', group: 'millets', photo: 'browntop', swatch: s('#c59a5a', '#996e34', 7), variants: [{ label: '', gst: '0%' }] },

  { id: 'f-chia', name: 'Chia seeds', group: 'seeds', photo: 'chia', swatch: s('#e9e4d8', '#bdb5a2', 5), variants: [{ label: 'White', gst: '5%' }] },
  { id: 'f-flax', name: 'Flax seeds', group: 'seeds', photo: 'flax', swatch: s('#8a4a2c', '#5c2c16', 7), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-pumpkin', name: 'Pumpkin seeds', group: 'seeds', photo: 'pumpkin', swatch: s('#7f9a5a', '#556d36', 11), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-sunflower', name: 'Sunflower seeds', group: 'seeds', photo: 'sunkernel', swatch: s('#d9d0bb', '#a99f86', 10), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-basil', name: 'Basil seeds', group: 'seeds', photo: 'basil', swatch: s('#2d2b2a', '#55514c', 5), variants: [{ label: 'Sabja', gst: '5%' }] },
  { id: 'f-safflower', name: 'Safflower seeds', group: 'seeds', photo: 'safflower', swatch: s('#f2ede1', '#cfc6b0', 10), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-sesame', name: 'Sesame seeds', group: 'seeds', photo: 'sesame', swatch: s('#262423', '#4a4542', 6), variants: [{ label: 'Z-black', gst: '5%' }] },
  { id: 'f-quinoa-w', name: 'White quinoa', group: 'seeds', photo: 'quinoaw', swatch: s('#efe5cc', '#cdbf9b', 6), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-quinoa-b', name: 'Black quinoa', group: 'seeds', photo: 'quinoab', swatch: s('#3a302b', '#5e524b', 6), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-quinoa-r', name: 'Red quinoa', group: 'seeds', photo: 'quinoar', swatch: s('#a3473a', '#76281e', 6), variants: [{ label: '', gst: '0%' }] },

  { id: 'f-toor', name: 'Toor dal', group: 'pantry', photo: 'toor', swatch: s('#e6b33c', '#bf8b1d', 9), variants: [{ label: 'Raw', gst: '5%' }] },
  { id: 'f-chana', name: 'Chana dal', group: 'pantry', photo: 'chana', swatch: s('#e9c25a', '#c29a35', 9), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-lobia', name: 'Lobia', group: 'pantry', photo: 'lobia', swatch: s('#ece2cb', '#3b322b', 11), variants: [{ label: 'Black-eyed beans', gst: '5%' }] },
  { id: 'f-horsegram', name: 'Horse gram', group: 'pantry', photo: 'horsegram', swatch: s('#8b5e3c', '#5f3c22', 9), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-buckwheat', name: 'Buckwheat', group: 'pantry', photo: 'buckwheat', swatch: s('#a88d6a', '#7a6243', 9), variants: [{ label: '', gst: '0%' }] },
  { id: 'f-clove', name: 'Clove', group: 'pantry', photo: 'clove', swatch: s('#6b3a25', '#43200f', 9),
    variants: [{ label: 'Madagascar', gst: '5%' }, { label: 'Lalpari', gst: '5%' }] },
  { id: 'f-bayleaf', name: 'Bay leaf', group: 'pantry', photo: 'bayleaf', swatch: s('#7c8a55', '#566238', 12), variants: [{ label: '', gst: '5%' }] },
  { id: 'f-tea', name: 'Black chai', group: 'pantry', photo: 'tea', swatch: s('#3b2a22', '#5b4337', 5), variants: [{ label: '', gst: '5%' }] },
];

export const lineCount = (list: Product[]) => list.reduce((n, p) => n + p.variants.length, 0);

/** Full name used in enquiries, e.g. "Foxtail millet (Winter crop, cleaned)". */
export const lineName = (p: Product, v: { label: string }) => (v.label ? `${p.name} (${v.label})` : p.name);

export const CONTACT = {
  office: '87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost, Kurnool, Andhra Pradesh 518002',
  warehouse: '2/161, 2/162, Sanjivareddypalle, Duvvur, YSR district',
  whatsapp: '918309782770',
  phones: [
    { tel: '+918309782770', label: '83097 82770', note: 'WhatsApp' },
    { tel: '+918828282823', label: '88282 82823' },
    { tel: '+917329999996', label: '73299 99996' },
    { tel: '+919245555556', label: '92455 55556' },
  ],
  map: 'https://maps.google.com/maps?q=Nandyal%20Checkpost%2C%20Kurnool%2C%20Andhra%20Pradesh%20518002&z=15&output=embed',
};

export const BRANDS = {
  bird: { name: 'Rithwik Bird Feeds', email: 'rithwikbirdfeeds@gmail.com', gstin: '37CCDPV9154P1ZK' },
  food: { name: 'Rithwik Industries', email: 'rithwikindustries@gmail.com', gstin: '37ABKFR7391G1ZM' },
};
