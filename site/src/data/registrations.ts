// Certifications and registrations shown on the site. Only entries with `held: true`
// appear. BRCGS, US FDA, APEDA and Organic are listed on Rithwik Industries' earlier
// website (quantumpixel-qp.github.io/rithvik-organic); the owner confirmed they hold them,
// and FSSAI as well. Spices Board, HACCP, India Organic and Halal marks were supplied by the
// owner (Nov 2026) with their logos. GST stays in the footer and facts rather than as a seal.
//
// To finish an entry, add the certificate or licence `number`, and put a photo or scan
// of the certificate in site/public/certs/ and its file name in `photo`.
// `logo` is for the official mark file the certifying body supplies to holders.
// Never add the US FDA logo: the FDA does not allow it to be used by businesses.

export type Registration = {
  id: string;
  name: string;
  mark: string;          // short text in the centre of the seal
  status: 'Certified' | 'Registered' | 'Licensed';
  body: string;          // who issues it
  what: string;          // one line on what it means for a buyer
  number?: string;
  photo?: string;        // file in public/certs/
  logo?: string;         // official mark file in public/certs/, where the scheme allows it
  held: boolean;
  for: ('bird' | 'food')[];
};

export const REGISTRATIONS: Registration[] = [
  { id: 'gst-bird', name: 'GST registration', mark: 'GST', status: 'Registered', body: 'Goods and Services Tax, Government of India', what: 'Registered business; GST invoices on every order.', number: '37CCDPV9154P1ZK', held: false, for: ['bird'] },
  { id: 'gst-food', name: 'GST registration', mark: 'GST', status: 'Registered', body: 'Goods and Services Tax, Government of India', what: 'Registered business; GST invoices on every order.', number: '37ABKFR7391G1ZM', held: false, for: ['food'] },
  { id: 'spices', name: 'Spices Board India', mark: 'SPICES', status: 'Registered', body: 'Spices Board, Ministry of Commerce, Government of India', what: 'Registered with the Spices Board to trade and export spices.', logo: 'spices-board.png', held: true, for: ['food'] },
  { id: 'haccp', name: 'HACCP', mark: 'HACCP', status: 'Certified', body: 'Hazard Analysis and Critical Control Points', what: 'Food safety hazards are identified and controlled at every step, from intake to packing.', logo: 'haccp.png', held: true, for: ['food'] },
  { id: 'fssai', name: 'FSSAI', mark: 'FSSAI', status: 'Licensed', body: 'Food Safety and Standards Authority of India', what: 'Licensed to handle and sell food in India.', logo: 'fssai.png', held: true, for: ['food'] },
  { id: 'apeda', name: 'APEDA', mark: 'APEDA', status: 'Registered', body: 'Agricultural and Processed Food Products Export Development Authority', what: 'Registered with India’s export authority for agricultural produce.', logo: 'apeda.png', held: true, for: ['food'] },
  { id: 'organic', name: 'India Organic', mark: 'ORGANIC', status: 'Certified', body: 'National Programme for Organic Production (NPOP)', what: 'Certified organic products, for buyers who need organic supply.', logo: 'india-organic.png', held: true, for: ['food'] },
  { id: 'halal', name: 'Halal', mark: 'HALAL', status: 'Certified', body: 'Jamiat Ulama-i-Hind Halal Trust', what: 'Halal certified, for buyers in the Gulf and other markets that ask for it.', logo: 'halal.png', held: true, for: ['food'] },
  { id: 'brcgs', name: 'BRCGS', mark: 'BRCGS', status: 'Certified', body: 'BRCGS Global Standard for Food Safety', what: 'Food safety and quality system audited to a standard many UK and EU buyers require.', held: true, for: ['food'] },
  { id: 'usfda', name: 'US FDA', mark: 'US FDA', status: 'Registered', body: 'U.S. Food and Drug Administration, food facility registration', what: 'Facility registered with the FDA, needed to ship food to the United States.', held: true, for: ['food'] },
  { id: 'iec', name: 'Import Export Code', mark: 'IEC', status: 'Registered', body: 'Directorate General of Foreign Trade', what: 'Cleared to import and export from India.', held: false, for: ['bird', 'food'] },
  { id: 'udyam', name: 'Udyam (MSME)', mark: 'MSME', status: 'Registered', body: 'Ministry of MSME, Government of India', what: 'Registered small enterprise.', held: false, for: ['bird', 'food'] },
];

export const held = (site: 'bird' | 'food') => REGISTRATIONS.filter((r) => r.held && r.for.includes(site));
