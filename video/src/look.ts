// The site's colours and fonts (site/src/styles/site.css and v2.css).
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

export const NAVY = '#0b1924';
export const NAVY_2 = '#132a3b';
export const NAVY_3 = '#1c3a50';
export const GOLD = '#f2b21b'; // marigold
export const BRONZE = '#a07a2c';
export const KHAKI = '#e4dfc1';
export const PAPER = '#efeadb';
export const INK = '#1c2533';
export const SKY = '#7cc4ea';

export const DISPLAY = 'Anton, Impact, sans-serif';
export const TEXT = '"Instrument Sans", Arial, sans-serif';

loadFont({ family: 'Anton', url: staticFile('fonts/anton-latin-400-normal.woff2'), weight: '400' });
for (const w of ['400', '500', '600', '700']) {
  loadFont({ family: 'Instrument Sans', url: staticFile(`fonts/instrument-sans-latin-${w}-normal.woff2`), weight: w });
}
