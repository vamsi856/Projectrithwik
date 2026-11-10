// Product lines come from the owner's lists (Nov 2026); grade notes such as the foxtail
// crops come from the Rithwik catalogue (PDF, Dec 2025). GST is kept for records, not shown.
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
  { id: 'grains', label: 'Jowar & maize' },
  { id: 'oilseeds', label: 'Sunflower & safflower' },
] as const;

// Bird feed lines, from the owner's list (Nov 2026).
export const BIRD: Product[] = [
  { id: 'b-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail', swatch: s('#d9b24a', '#b48a2c', 7),
    variants: [
      { label: 'Summer crop, raw', gst: '0%' },
      { label: 'Summer crop, cleaned', gst: '0%' },
      { label: 'Winter crop, raw', gst: '0%' },
      { label: 'Winter crop, cleaned', gst: '0%' },
    ] },
  { id: 'b-barnyard', name: 'Barnyard millet', group: 'millets', photo: 'barnyard', swatch: s('#e8dcb8', '#c6b78a', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-browntop', name: 'Browntop millet', group: 'millets', photo: 'browntop', swatch: s('#c59a5a', '#996e34', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-kodo', name: 'Kodo millet', group: 'millets', photo: 'kodo', swatch: s('#a9824e', '#7d5a2e', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-little', name: 'Little millet', group: 'millets', photo: 'little', swatch: s('#d8c48a', '#b29e60', 6), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-proso', name: 'Proso millet', group: 'millets', photo: 'proso', swatch: s('#e6d39a', '#c4ac68', 8),
    variants: [{ label: 'Green', gst: '0%' }, { label: 'Yellow', gst: '0%' }] },
  { id: 'b-bajra', name: 'Pearl millet', group: 'millets', photo: 'bajra', swatch: s('#9aa197', '#6e776c', 8), variants: [{ label: 'Bajra', gst: '0%' }] },
  { id: 'b-jowar', name: 'Jowar', group: 'grains', photo: 'jowar', swatch: s('#eadfc6', '#c7b896', 9),
    variants: [{ label: 'Mahendra', gst: '0%' }, { label: 'Milky white', gst: '0%' }, { label: 'Nidhi', gst: '0%' }, { label: 'Red', gst: '0%' }, { label: 'Yellow', gst: '0%' }] },
  { id: 'b-maize', name: 'Maize', group: 'grains', photo: 'maize', swatch: s('#f0e4c4', '#cdbb8d', 12), variants: [{ label: 'Whole kernel', gst: '0%' }] },
  { id: 'b-sunflower', name: 'Sunflower', group: 'oilseeds', photo: 'sf17', swatch: s('#b9b3a6', '#56514b', 11), variants: [{ label: 'Striped', gst: '5%' }] },
  { id: 'b-safflower', name: 'Safflower', group: 'oilseeds', photo: 'safflower', swatch: s('#f2ede1', '#cfc6b0', 10), variants: [{ label: 'Whole seed', gst: '5%' }] },
];

export const FOOD_GROUPS = [
  { id: 'millets', label: 'Millets', note: 'Eight millets, rich in fibre and minerals. Naturally gluten-free and good for everyday cooking.' },
  { id: 'superfoods', label: 'Super foods', note: 'Chia, quinoa in five kinds, pumpkin, hulled sunflower, flax and basil seeds.' },
  { id: 'oilseeds', label: 'Oil seeds', note: 'Sunflower, safflower, castor, groundnuts and sesame in three colours.' },
  { id: 'pulses', label: 'Pulses', note: 'Chana, toor dal, lobia, urad dal and gram for the daily kitchen.' },
  { id: 'spices', label: 'Spices', note: 'Whole spices: bay leaf, cloves, cardamom, cumin and pepper.' },
  { id: 'cereals', label: 'Cereals', note: 'Buckwheat and oats.' },
] as const;

const one = (label = ''): Product['variants'] => [{ label, gst: '' }];
const many = (...labels: string[]): Product['variants'] => labels.map((label) => ({ label, gst: '' }));

// Rithwik Industries lines, from the owner's list (Nov 2026).
export const FOOD: Product[] = [
  { id: 'f-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail', swatch: s('#d9b24a', '#b48a2c', 7), variants: one() },
  { id: 'f-barnyard', name: 'Barnyard millet', group: 'millets', photo: 'barnyard', swatch: s('#e8dcb8', '#c6b78a', 7), variants: one() },
  { id: 'f-browntop', name: 'Browntop millet', group: 'millets', photo: 'browntop', swatch: s('#c59a5a', '#996e34', 7), variants: one() },
  { id: 'f-kodo', name: 'Kodo millet', group: 'millets', photo: 'kodo', swatch: s('#a9824e', '#7d5a2e', 7), variants: one() },
  { id: 'f-little', name: 'Little millet', group: 'millets', photo: 'little', swatch: s('#d8c48a', '#b29e60', 6), variants: one() },
  { id: 'f-proso', name: 'Proso millet', group: 'millets', photo: 'proso', swatch: s('#e6d39a', '#c4ac68', 8), variants: one() },
  { id: 'f-bajra', name: 'Pearl millet', group: 'millets', photo: 'bajra', swatch: s('#9aa197', '#6e776c', 8), variants: one('Bajra') },
  { id: 'f-ragi', name: 'Ragi', group: 'millets', photo: 'ragi', swatch: s('#8a3b2b', '#5e2216', 6), variants: one('Finger millet') },

  { id: 'f-chia', name: 'Chia seeds', group: 'superfoods', photo: 'chia', swatch: s('#e9e4d8', '#bdb5a2', 5), variants: one() },
  { id: 'f-quinoa', name: 'Quinoa', group: 'superfoods', photo: 'quinoaw', swatch: s('#efe5cc', '#cdbf9b', 6), variants: many('Regular', 'Bold', 'Red', 'Black', 'Tricolor') },
  { id: 'f-pumpkin', name: 'Pumpkin seeds', group: 'superfoods', photo: 'pumpkin', swatch: s('#7f9a5a', '#556d36', 11), variants: one() },
  { id: 'f-sunhulled', name: 'Sunflower seeds', group: 'superfoods', photo: 'sunkernel', swatch: s('#d9d0bb', '#a99f86', 10), variants: one('Hulled') },
  { id: 'f-flax', name: 'Flax seeds', group: 'superfoods', photo: 'flax', swatch: s('#8a4a2c', '#5c2c16', 7), variants: one() },
  { id: 'f-basil', name: 'Basil seeds', group: 'superfoods', photo: 'basil', swatch: s('#2d2b2a', '#55514c', 5), variants: one('Sabja') },

  { id: 'f-sunflower', name: 'Sunflower', group: 'oilseeds', photo: 'blacksun', swatch: s('#2c2a2a', '#4d4a47', 11), variants: one() },
  { id: 'f-safflower', name: 'Safflower', group: 'oilseeds', photo: 'safflower', swatch: s('#f2ede1', '#cfc6b0', 10), variants: one() },
  { id: 'f-castor', name: 'Castor seeds', group: 'oilseeds', photo: 'castor', swatch: s('#8c6a58', '#4a362c', 12), variants: one() },
  { id: 'f-groundnut', name: 'Groundnuts', group: 'oilseeds', photo: 'groundnut', swatch: s('#e2b98c', '#b07f52', 12), variants: one() },
  { id: 'f-sesame', name: 'Sesame seeds', group: 'oilseeds', photo: 'sesame', swatch: s('#262423', '#4a4542', 6), variants: many('Black', 'Z-black', 'White') },

  { id: 'f-chana', name: 'Chana', group: 'pulses', photo: 'chana', swatch: s('#e9c25a', '#c29a35', 9), variants: many('White', 'Brown') },
  { id: 'f-toor', name: 'Toor dal', group: 'pulses', photo: 'toor', swatch: s('#e6b33c', '#bf8b1d', 9), variants: one() },
  { id: 'f-lobia', name: 'Lobia', group: 'pulses', photo: 'lobia', swatch: s('#ece2cb', '#3b322b', 11), variants: many('Red', 'White') },
  { id: 'f-urad', name: 'Urad dal', group: 'pulses', photo: 'urad', swatch: s('#f1ece0', '#2a2725', 8), variants: one() },
  { id: 'f-gram', name: 'Gram', group: 'pulses', photo: 'moong', swatch: s('#7d9a46', '#4f6a28', 8), variants: many('Green', 'Black') },

  { id: 'f-bayleaf', name: 'Bay leaf', group: 'spices', photo: 'bayleaf', swatch: s('#7c8a55', '#566238', 12), variants: one() },
  { id: 'f-clove', name: 'Cloves', group: 'spices', photo: 'clove', swatch: s('#6b3a25', '#43200f', 9), variants: one() },
  { id: 'f-cardamom', name: 'Cardamom', group: 'spices', photo: 'cardamom', swatch: s('#9fb06a', '#6c7d3e', 10), variants: one() },
  { id: 'f-cumin', name: 'Cumin', group: 'spices', photo: 'cumin', swatch: s('#a68457', '#735733', 7), variants: one() },
  { id: 'f-pepper', name: 'Pepper', group: 'spices', photo: 'pepper', swatch: s('#2e2a27', '#e8e0cc', 9), variants: many('Black', 'White') },

  { id: 'f-buckwheat', name: 'Buckwheat', group: 'cereals', photo: 'buckwheat', swatch: s('#a88d6a', '#7a6243', 9), variants: one() },
  { id: 'f-oats', name: 'Oats', group: 'cereals', photo: 'oats', swatch: s('#e4d3ac', '#b99f6d', 9), variants: one() },
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
