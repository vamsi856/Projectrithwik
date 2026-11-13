// Where Rithwik operates, as the client listed them (Nov 2026): Duvvur is the main warehouse.
// Shown on the India map in the Vision section of both sites. `lx/ly` place the label in map
// units (see IndiaMap.astro); `side` is which side of the label its text runs from.
// Map outline: Natural Earth admin-0 countries, India point of view (public domain).
// Spellings are the client's (Challageri, Bangarpet, Ballari, Nandyal, Rajkot).
export type Place = { name: string; lat: number; lon: number; main?: boolean; note?: string; lx?: number; ly?: number; side?: 'start' | 'end' };

export const NETWORK: Place[] = [
  { name: 'Duvvur', note: 'Main warehouse', lat: 14.8294, lon: 78.6522, main: true, lx: 252, ly: 492, side: 'start' },
  { name: 'Kurnool', lat: 15.8281, lon: 78.0373, lx: 252, ly: 418, side: 'start' },
  { name: 'Nandyal', lat: 15.4786, lon: 78.4836, lx: 252, ly: 442, side: 'start' },
  { name: 'Allagadda', lat: 15.1336, lon: 78.5133, lx: 252, ly: 466, side: 'start' },
  { name: 'Bangarpet', lat: 12.9915, lon: 78.178, lx: 252, ly: 540, side: 'start' },
  { name: 'Ballari', lat: 15.1394, lon: 76.9214, lx: 112, ly: 432, side: 'end' },
  { name: 'Challageri', lat: 14.5652, lon: 75.7166, lx: 112, ly: 474, side: 'end' }, // Chalageri, Ranibennur taluk, Haveri district
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867, side: 'end' },
  { name: 'Delhi', lat: 28.6139, lon: 77.209, side: 'start' },
  { name: 'Neemuch', lat: 24.4764, lon: 74.8624, side: 'start' },
  { name: 'Rajkot', lat: 22.3039, lon: 70.8022, side: 'start' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, side: 'start' },
];
