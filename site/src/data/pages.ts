// The plain information pages (About, Products, Certifications, Contact, FAQ, Catalogue). They sit beside the
// animated site so Google has separate pages to rank and to show as sitelinks under a search for the business.
// Order here is the order of the menu, the footer links and the sitemap.
export type InfoPage = { path: string; label: string; title: string; description: string };

export const INFO_PAGES: InfoPage[] = [
  {
    path: 'about/', label: 'About us',
    title: 'About Rithwik | Kurnool Grain Trade Since 1925',
    description: 'A Kurnool family grain trade since 1925, today Rithwik Bird Feeds and Rithwik Industries: 20,000MT+ a year for 3,000+ customers across India.',
  },
  {
    path: 'bird-feeds/products/', label: 'Bird feed products',
    title: 'Bird Feeds: Foxtail Millet, Jowar & Sunflower | Rithwik',
    description: 'Every Rithwik Bird Feeds product: foxtail millet (summer and winter crop), proso, kodo, little and other millets, jowar, maize, sunflower and safflower.',
  },
  {
    path: 'human-food/products/', label: 'Human food products',
    title: 'Millets, Quinoa, Chia, Pulses & Spices | Rithwik Industries',
    description: 'Every Rithwik Industries product: millets, quinoa, chia and other super foods, oil seeds, pulses, spices and cereals, in bulk across India.',
  },
  {
    path: 'certifications/', label: 'Certifications',
    title: 'Certifications: FSSAI, APEDA, HACCP, BRCGS | Rithwik',
    description: 'Rithwik certifications and registrations: FSSAI, APEDA, HACCP, BRCGS, Halal, ISO, US FDA and Spices Board India, with GSTINs for both businesses.',
  },
  {
    path: 'contact/', label: 'Contact',
    title: 'Contact Rithwik, Kurnool | Call or WhatsApp 92455 55556',
    description: 'Call or WhatsApp 92455 55556. Office: Dhanalakshmi Nagar, near Nandyal Checkpost, Kurnool 518002. Main warehouse: Duvvur. Email and map directions.',
  },
  {
    path: 'faq/', label: 'Questions buyers ask',
    title: 'Questions Buyers Ask | Rithwik Bird Feeds & Industries',
    description: 'Best foxtail millet supplier in India, prices, bulk buying, local names of millets (korralu, kangni), delivery across India and certifications.',
  },
  {
    path: 'catalogue/', label: 'Catalogue',
    title: 'Product Catalogue (PDF) | Rithwik, Kurnool',
    description: 'Download the Rithwik product catalogue: a 7-page PDF of every bird feed and food product, certifications, where we operate and how to order.',
  },
];

export const infoPage = (path: string) => INFO_PAGES.find((p) => p.path === path)!;
