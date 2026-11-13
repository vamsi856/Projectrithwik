// Product lines come from the owner's lists (Nov 2026); grade notes such as the foxtail
// crops come from the Rithwik catalogue (PDF, Dec 2025). GST is kept for records, not shown.
// `photo` is the file name (without extension) in src/assets/photos. A product without a
// matching photo falls back to its seed swatch, so the site still renders before photos arrive.

export type Swatch = { c1: string; c2: string; grain: number };
export type Product = {
  id: string;
  name: string;
  /** Catalogue lines this card covers. One entry = no variant picker. Each line also gets
   * its own pack in "Our packs". A line whose colour differs from the product photo carries
   * its own seed colours (and photo: null), so a white-sesame pack never shows black seed. */
  variants: { label: string; gst: string; photo?: string | null; swatch?: Swatch }[];
  /** Two or more independent choices (e.g. crop season x processing). Each variant label is
   * then the chosen options joined by axesLabel(), so the card shows one row per choice. */
  axes?: { name: string; options: string[] }[];
  photo?: string;
  swatch: Swatch;
  group: string;
};

const s = (c1: string, c2: string, grain: number): Swatch => ({ c1, c2, grain });
/** a line shown by its own seed colour instead of the product photo */
const tint = (label: string, gst: string, c1: string, c2: string, grain: number) => ({ label, gst, photo: null, swatch: s(c1, c2, grain) });

export const BIRD_GROUPS = [
  { id: 'millets', label: 'Millets' },
  { id: 'grains', label: 'Jowar & maize' },
  { id: 'oilseeds', label: 'Sunflower & safflower' },
] as const;

// Bird feed lines, from the owner's list (Nov 2026).
export const BIRD: Product[] = [
  { id: 'b-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail', swatch: s('#d9b24a', '#b48a2c', 7),
    variants: [
      { label: 'Summer crop', gst: '0%', photo: 'foxtail-summer-rithwik' },
      { label: 'Winter crop', gst: '0%', photo: 'foxtail-winter-rithwik' },
    ] },
  { id: 'b-barnyard', name: 'Barnyard millet', group: 'millets', photo: 'barnyard-rithwik', swatch: s('#e8dcb8', '#c6b78a', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-browntop', name: 'Browntop millet', group: 'millets', photo: 'browntop-rithwik', swatch: s('#c59a5a', '#996e34', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-kodo', name: 'Kodo millet', group: 'millets', photo: 'kodo-rithwik', swatch: s('#a9824e', '#7d5a2e', 7), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-little', name: 'Little millet', group: 'millets', photo: 'little-rithwik', swatch: s('#d8c48a', '#b29e60', 6), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-proso', name: 'Proso millet', group: 'millets', photo: 'proso-yellow-rithwik', swatch: s('#e6d39a', '#c4ac68', 8),
    variants: [{ label: 'Green', gst: '0%', photo: 'proso-green-rithwik', swatch: s('#c3c27a', '#8f8f48', 8) }, { label: 'Yellow', gst: '0%' }] },
  { id: 'b-bajra', name: 'Pearl millet', group: 'millets', photo: 'bajra-rithwik', swatch: s('#9aa197', '#6e776c', 8), variants: [{ label: 'Bajra', gst: '0%' }] },
  { id: 'b-ragi', name: 'Finger millet', group: 'millets', photo: 'ragi-rithwik', swatch: s('#c0603a', '#7a3020', 6), variants: [{ label: 'Ragi', gst: '0%' }] },
  { id: 'b-jowar', name: 'Jowar', group: 'grains', photo: 'jowar-mahendra-rithwik', swatch: s('#eadfc6', '#c7b896', 9),
    variants: [{ label: 'Mahendra', gst: '0%' }, { label: 'Milky white', gst: '0%', photo: 'jowar-milky-rithwik' }, { label: 'Nidhi', gst: '0%', photo: 'jowar-nidhi-rithwik' }, { label: 'Red', gst: '0%', photo: 'jowar-red-rithwik', swatch: s('#a4552f', '#6e3418', 9) }, { label: 'Yellow', gst: '0%', photo: 'jowar-yellow-rithwik', swatch: s('#e2c164', '#b38f34', 9) }] },
  { id: 'b-maize', name: 'Maize', group: 'grains', photo: 'maize-rithwik', swatch: s('#f2a654', '#c97a30', 12), variants: [{ label: '', gst: '0%' }] },
  { id: 'b-sunflower', name: 'Sunflower seeds', group: 'oilseeds', photo: 'sunflower-striped', swatch: s('#2f2d2b', '#bdb7aa', 11), variants: [{ label: 'Striped', gst: '5%' }] },
  { id: 'b-safflower', name: 'Safflower seeds', group: 'oilseeds', photo: 'safflower-rithwik', swatch: s('#f2ede1', '#cfc6b0', 10), variants: [{ label: '', gst: '5%' }] },
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
  { id: 'f-foxtail', name: 'Foxtail millet', group: 'millets', photo: 'foxtail-hulled-rithwik', swatch: s('#d9b24a', '#b48a2c', 7), variants: one() },
  { id: 'f-barnyard', name: 'Barnyard millet', group: 'millets', photo: 'barnyard-hulled-rithwik', swatch: s('#e8dcb8', '#c6b78a', 7), variants: one() },
  { id: 'f-browntop', name: 'Browntop millet', group: 'millets', photo: 'browntop-hulled-rithwik', swatch: s('#bfae62', '#8c7c38', 7), variants: one() },
  { id: 'f-kodo', name: 'Kodo millet', group: 'millets', photo: 'kodo-hulled-rithwik', swatch: s('#c49a4e', '#8f6a2c', 7), variants: one() },
  { id: 'f-little', name: 'Little millet', group: 'millets', photo: 'little-hulled-rithwik', swatch: s('#d8c48a', '#b29e60', 6), variants: one() },
  { id: 'f-proso', name: 'Proso millet', group: 'millets', photo: 'proso-hulled-rithwik', swatch: s('#e8cf52', '#bfa232', 8), variants: one() },
  { id: 'f-bajra', name: 'Pearl millet', group: 'millets', photo: 'bajra-rithwik', swatch: s('#9aa197', '#6e776c', 8), variants: one('Bajra') },
  { id: 'f-ragi', name: 'Ragi', group: 'millets', photo: 'ragi-rithwik', swatch: s('#c0603a', '#7a3020', 6), variants: one('Finger millet') },

  { id: 'f-chia', name: 'Chia seeds', group: 'superfoods', photo: 'chia', swatch: s('#4b4844', '#9a948a', 5), variants: [{ label: 'Black', gst: '' }, { label: 'White', gst: '', photo: 'chia-white-rithwik', swatch: s('#efe9dc', '#c4baa2', 5) }] },
  { id: 'f-quinoa', name: 'Quinoa', group: 'superfoods', photo: 'quinoa-regular-rithwik', swatch: s('#efe5cc', '#cdbf9b', 6), variants: [{ label: 'Regular', gst: '' }, { label: 'Bold', gst: '', photo: 'quinoa-bold-rithwik' }, { label: 'Red', gst: '', photo: 'quinoa-red-rithwik', swatch: s('#a0402e', '#6a2419', 6) }, { label: 'Black', gst: '', photo: 'quinoa-black-rithwik', swatch: s('#2b2826', '#4d4844', 6) }, { label: 'Tricolor', gst: '', photo: 'quinoab' }] },
  { id: 'f-pumpkin', name: 'Pumpkin seeds', group: 'superfoods', photo: 'pumpkin-rithwik', swatch: s('#7f9a5a', '#556d36', 11), variants: one() },
  { id: 'f-sunhulled', name: 'Sunflower seeds', group: 'superfoods', photo: 'sunflower-hulled-rithwik', swatch: s('#d9d0bb', '#a99f86', 10), variants: one('Hulled') },
  { id: 'f-flax', name: 'Flax seeds', group: 'superfoods', photo: 'flax', swatch: s('#8a4a2c', '#5c2c16', 7), variants: one() },
  { id: 'f-basil', name: 'Basil seeds', group: 'superfoods', photo: 'basil-rithwik', swatch: s('#2d2b2a', '#55514c', 5), variants: one('Sabja') },

  { id: 'f-sunflower', name: 'Sunflower seeds', group: 'oilseeds', photo: 'sunflower-striped', swatch: s('#2f2d2b', '#bdb7aa', 11), variants: one() },
  { id: 'f-safflower', name: 'Safflower seeds', group: 'oilseeds', photo: 'safflower-rithwik', swatch: s('#f2ede1', '#cfc6b0', 10), variants: one() },
  { id: 'f-castor', name: 'Castor seeds', group: 'oilseeds', photo: 'castor', swatch: s('#8c6a58', '#4a362c', 12), variants: one() },
  { id: 'f-groundnut', name: 'Groundnuts', group: 'oilseeds', photo: 'groundnut', swatch: s('#e2b98c', '#b07f52', 12), variants: one() },
  { id: 'f-sesame', name: 'Sesame seeds', group: 'oilseeds', photo: 'sesame', swatch: s('#262423', '#4a4542', 6), variants: [{ label: 'Black', gst: '' }, { label: 'Z-black', gst: '', photo: 'zblack-rithwik', swatch: s('#1f2230', '#3b3f52', 5) }, { label: 'White', gst: '', photo: 'sesame-white', swatch: s('#f1ead8', '#d3c7a9', 6) }] },

  { id: 'f-chana', name: 'Chana', group: 'pulses', photo: 'chana', swatch: s('#e9c25a', '#c29a35', 9), variants: [{ label: 'White', gst: '', photo: 'kabuli-rithwik', swatch: s('#e9d6a6', '#c8ad73', 11) }, { label: 'Brown', gst: '', photo: 'chana-brown', swatch: s('#8a5a34', '#5b371c', 11) }] },
  { id: 'f-toor', name: 'Toor dal', group: 'pulses', photo: 'toor', swatch: s('#e6b33c', '#bf8b1d', 9), variants: one() },
  { id: 'f-lobia', name: 'Lobia', group: 'pulses', photo: 'lobia', swatch: s('#ece2cb', '#3b322b', 11), variants: [{ label: 'Red', gst: '', photo: 'lobia-red', swatch: s('#9c4a34', '#6a2c1d', 11) }, { label: 'White', gst: '' }] },
  { id: 'f-urad', name: 'Urad dal', group: 'pulses', photo: 'urad-dal', swatch: s('#f1ece0', '#2a2725', 8), variants: one() },
  { id: 'f-gram', name: 'Gram', group: 'pulses', photo: 'moong', swatch: s('#7d9a46', '#4f6a28', 8), variants: [{ label: 'Green', gst: '' }, { label: 'Black', gst: '', photo: 'urad' }] },

  { id: 'f-bayleaf', name: 'Bay leaf', group: 'spices', photo: 'bayleaf', swatch: s('#7c8a55', '#566238', 12), variants: one() },
  { id: 'f-clove', name: 'Cloves', group: 'spices', photo: 'clove', swatch: s('#6b3a25', '#43200f', 9), variants: one() },
  { id: 'f-cardamom', name: 'Cardamom', group: 'spices', photo: 'cardamom', swatch: s('#9fb06a', '#6c7d3e', 10), variants: one() },
  { id: 'f-cumin', name: 'Cumin', group: 'spices', photo: 'cumin', swatch: s('#a68457', '#735733', 7), variants: one() },
  { id: 'f-pepper', name: 'Pepper', group: 'spices', photo: 'pepper', swatch: s('#2e2a27', '#e8e0cc', 9), variants: [{ label: 'Black', gst: '' }, { label: 'White', gst: '', photo: 'pepper-white', swatch: s('#ece2c8', '#cbbd98', 9) }] },

  { id: 'f-buckwheat', name: 'Buckwheat', group: 'cereals', photo: 'buckwheat', swatch: s('#a88d6a', '#7a6243', 9), variants: one() },
  { id: 'f-oats', name: 'Oats', group: 'cereals', photo: 'oats', swatch: s('#e4d3ac', '#b99f6d', 9), variants: one() },
];

export const lineCount = (list: Product[]) => list.reduce((n, p) => n + p.variants.length, 0);

/** Variant label from the options picked on each axis, e.g. ["Winter crop", "Processed"] -> "Winter crop, processed". */
export const axesLabel = (picked: string[]) => picked.map((v, i) => (i ? v.toLowerCase() : v)).join(', ');

/** Full name used in enquiries, e.g. "Foxtail millet (Winter crop, processed)". */
export const lineName = (p: Product, v: { label: string }) => (v.label ? `${p.name} (${v.label})` : p.name);

export const CONTACT = {
  office: '87/1404, Dhanalakshmi Nagar, near Nandyal Checkpost, Kurnool, Andhra Pradesh 518002',
  warehouse: '2/161, 2/162, Sanjivareddypalle, Duvvur, YSR district',
  whatsapp: '919245555556',
  /** the number on every Call button */
  call: { tel: '+919245555556', label: '92455 55556' },
  phones: [
    { tel: '+919245555556', label: '92455 55556', note: 'WhatsApp' },
    { tel: '+918828282823', label: '88282 82823' },
    { tel: '+917329999996', label: '73299 99996' },
  ],
  // the office pin: Dhanalakshmi Nagar (87/14xx), by Nandyal Checkpost, Kurnool 518002
  officeAt: '15.794046,78.053707',
  map: 'https://maps.google.com/maps?q=15.794046,78.053707&z=17&output=embed',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=15.794046,78.053707',
  // the warehouse pin: Sanjivareddypalle, Duvvur (14°49'45.8"N 78°39'07.9"E)
  warehouseAt: '14.829389,78.652194',
  warehouseMap: 'https://maps.google.com/maps?q=14.829389,78.652194&z=16&output=embed',
  warehouseDirections: 'https://www.google.com/maps/dir/?api=1&destination=14.829389,78.652194',
};

export const BRANDS = {
  bird: { name: 'Rithwik Bird Feeds', email: 'rithwikbirdfeeds@gmail.com', gstin: '37CCDPV9154P1ZK' },
  food: { name: 'Rithwik Industries', email: 'rithwikindustries@gmail.com', gstin: '37ABKFR7391G1ZM' },
};
