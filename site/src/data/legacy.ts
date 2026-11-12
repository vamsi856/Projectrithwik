// The family's trading history, from the owner's handwritten notes (Nov 2026).
// Spellings of names and firms should be confirmed by the family.
export const LEGACY = [
  { year: 1925, person: 'Bysani Govindappa', firm: 'Sathyanarayana & Co' },
  { year: 1945, person: 'Bysani Satyanarayana', firm: 'Sathyanarayana & Co' },
  { year: 1976, person: 'Bysani SubbaRaju', firm: 'Krishna Sai Traders' },
  { year: 2011, person: 'Bysani Sudheer', firm: 'Viraanch Exports and Imports' },
  { year: 2022, person: 'Bysani Vasavi', firm: 'Rithwik Bird Feeds and Rithwik Industries' },
];
export const SINCE = LEGACY[0].year;
/** The founders of Rithwik, shown at the 2022 step on both timelines (left to right in the photo). */
export const FOUNDERS = {
  photo: 'founders-rithwik',
  /** both faces in a circle: the 2022 dot on the timeline */
  circle: 'founders-circle',
  names: ['Bysani Vasavi', 'Bysani Sudheer'],
  /** each founder's face, shown as a small app-icon tile next to the big photo */
  people: [{ name: 'Bysani Vasavi', photo: 'founder-vasavi' }, { name: 'Bysani Sudheer', photo: 'founder-sudheer' }],
};
