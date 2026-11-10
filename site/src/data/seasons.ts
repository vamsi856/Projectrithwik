// Typical harvest months in Andhra Pradesh (1 = January). Kharif crops are sown
// with the June-July rains and come in from September to November; rabi crops
// are sown after the monsoon and come in from January to March. Millets take
// roughly 80-90 days from sowing (ICAR-IIMR foxtail millet guide).
// The client should confirm these against their own buying seasons.

export type Crop = { name: string; months: number[]; c1: string; c2: string; note?: string };

export const BIRD_SEASONS: Crop[] = [
  { name: 'Foxtail, summer crop', months: [4, 5], c1: '#e2bd55', c2: '#b48a2c' },
  { name: 'Foxtail, winter crop', months: [1, 2], c1: '#cfa744', c2: '#a98126' },
  { name: 'Proso millet', months: [9, 10], c1: '#e6d39a', c2: '#c4ac68' },
  { name: 'Ragi', months: [10, 11], c1: '#8a3b2b', c2: '#5e2216' },
  { name: 'Pearl millet', months: [9, 10], c1: '#9aa197', c2: '#6e776c' },
  { name: 'Jowar', months: [2, 3], c1: '#eadfc6', c2: '#c7b896' },
  { name: 'Sunflower', months: [1, 2, 3], c1: '#b9b3a6', c2: '#56514b' },
  { name: 'Safflower', months: [2, 3], c1: '#f2ede1', c2: '#cfc6b0' },
  { name: 'Maize', months: [9, 10, 2, 3], c1: '#f0e4c4', c2: '#cdbb8d' },
  { name: 'Horse gram', months: [12, 1], c1: '#8b5e3c', c2: '#5f3c22' },
];

export const FOOD_SEASONS: Crop[] = [
  { name: 'Foxtail millet', months: [1, 2, 4, 5], c1: '#d9b24a', c2: '#b48a2c' },
  { name: 'Little millet', months: [10, 11], c1: '#d8c48a', c2: '#b29e60' },
  { name: 'Kodo millet', months: [10, 11], c1: '#a9824e', c2: '#7d5a2e' },
  { name: 'Barnyard millet', months: [9, 10], c1: '#e8dcb8', c2: '#c6b78a' },
  { name: 'Browntop millet', months: [9, 10], c1: '#c59a5a', c2: '#996e34' },
  { name: 'Proso millet', months: [9, 10], c1: '#e6d39a', c2: '#c4ac68' },
  { name: 'Toor dal', months: [12, 1, 2], c1: '#e6b33c', c2: '#bf8b1d' },
  { name: 'Chana dal', months: [2, 3], c1: '#e9c25a', c2: '#c29a35' },
  { name: 'Horse gram', months: [12, 1], c1: '#8b5e3c', c2: '#5f3c22' },
  { name: 'Sunflower seeds', months: [1, 2, 3], c1: '#d9d0bb', c2: '#a99f86' },
  { name: 'Safflower seeds', months: [2, 3], c1: '#f2ede1', c2: '#cfc6b0' },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
