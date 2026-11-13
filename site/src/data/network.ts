// Where Rithwik operates, as the client listed them (Nov 2026): Duvvur is the main warehouse.
// Shown on the India map in the Vision section of both sites. `lx/ly` place the label in map
// units (see IndiaMap.astro); `side` is which side of the label its text runs from.
// Map outline: Natural Earth admin-0 countries, India point of view (public domain).
// Spellings are the client's (Challageri, Bangarpet, Ballari, Nandyal, Rajkot).
export type Place = { name: string; lat: number; lon: number; main?: boolean; note?: string; dx?: number; dy?: number; side?: 'start' | 'end' | 'middle'; zoom?: boolean };

export const NETWORK: Place[] = [
  // dx/dy: where the name sits, in map units from the pin's point. `zoom`: the places around Kurnool sit
  // too close together at India scale, so they are shown in a magnified circle beside the map.
  { name: 'Duvvur', note: 'Main warehouse', lat: 14.8294, lon: 78.6522, main: true, dx: -16, dy: -2, side: 'end', zoom: true },
  { name: 'Kurnool', lat: 15.8281, lon: 78.0373, dx: -10, dy: -6, side: 'end', zoom: true },
  { name: 'Nandyal', lat: 15.4786, lon: 78.4836, dx: 10, dy: -6, side: 'start', zoom: true },
  { name: 'Allagadda', lat: 15.1336, lon: 78.5133, dx: 10, dy: -4, side: 'start', zoom: true },
  { name: 'Bangarpet', lat: 12.9915, lon: 78.178, dx: 9, dy: 2, side: 'start' },
  { name: 'Ballari', lat: 15.1394, lon: 76.9214, dx: -9, dy: -4, side: 'end' },
  { name: 'Challageri', lat: 14.5652, lon: 75.7166, dx: 0, dy: 15, side: 'middle' }, // Chalageri, Ranibennur taluk, Haveri district
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867, dx: 9, dy: -8, side: 'start' },
  { name: 'Delhi', lat: 28.6139, lon: 77.209, dx: 10, dy: -6, side: 'start' },
  { name: 'Neemuch', lat: 24.4764, lon: 74.8624, dx: 10, dy: -6, side: 'start' },
  { name: 'Rajkot', lat: 22.3039, lon: 70.8022, dx: 10, dy: -6, side: 'start' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, dx: 10, dy: -6, side: 'start' },
];
