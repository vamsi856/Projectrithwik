// Registrations shown on the site. An entry only appears when `number` is filled
// in, so nothing is ever claimed that the business doesn't actually hold.
// To add one: put the registration or licence number in `number`, then rebuild.

export type Registration = { id: string; name: string; body: string; number: string; for: ('bird' | 'food')[] };

export const REGISTRATIONS: Registration[] = [
  { id: 'gst-bird', name: 'GST registration', body: 'Goods and Services Tax, Government of India', number: '37CCDPV9154P1ZK', for: ['bird'] },
  { id: 'gst-food', name: 'GST registration', body: 'Goods and Services Tax, Government of India', number: '37ABKFR7391G1ZM', for: ['food'] },
  { id: 'fssai', name: 'FSSAI licence', body: 'Food Safety and Standards Authority of India', number: '', for: ['food'] },
  { id: 'apeda', name: 'APEDA registration', body: 'Agricultural and Processed Food Products Export Development Authority', number: '', for: ['bird', 'food'] },
  { id: 'iec', name: 'Import Export Code', body: 'Directorate General of Foreign Trade', number: '', for: ['bird', 'food'] },
  { id: 'udyam', name: 'Udyam (MSME) registration', body: 'Ministry of MSME, Government of India', number: '', for: ['bird', 'food'] },
];

export const held = (site: 'bird' | 'food') => REGISTRATIONS.filter((r) => r.number.trim() && r.for.includes(site));
