// Birds the feeds are bought for, with the Rithwik lines a seed mix for them often
// includes. Seed is one part of a varied diet with fresh greens, fruit and pellets.
export type Bird = { id: string; name: string; latin: string; photo: string; size: string; feeds: string[]; note: string };

export const BIRDS: Bird[] = [
  { id: 'macaw', name: 'Scarlet macaw', latin: 'Ara macao', photo: 'pb-macaw', size: 'Large parrot', feeds: ['Sunflower', 'Safflower', 'Maize'], note: 'Big, strong beaks crack whole sunflower and maize with ease.' },
  { id: 'bgmacaw', name: 'Blue-and-gold macaw', latin: 'Ara ararauna', photo: 'pb-bgmacaw', size: 'Large parrot', feeds: ['Sunflower', 'Safflower', 'Maize'], note: 'Large seeds in the mix keep them busy foraging.' },
  { id: 'grey', name: 'African grey', latin: 'Psittacus erithacus', photo: 'pb-grey', size: 'Large parrot', feeds: ['Safflower', 'Sunflower', 'Jowar'], note: 'Safflower is a lighter oil seed many keepers mix with sunflower.' },
  { id: 'cockatoo', name: 'Cockatoo', latin: 'Cacatua galerita', photo: 'pb-cockatoo', size: 'Large parrot', feeds: ['Sunflower', 'Jowar', 'Maize'], note: 'A mix of oil seeds and grains suits their appetite.' },
  { id: 'conure', name: 'Sun conure', latin: 'Aratinga solstitialis', photo: 'pb-conure', size: 'Medium parrot', feeds: ['Foxtail millet', 'Proso millet', 'Safflower'], note: 'Millet base with a little safflower for variety.' },
  { id: 'cockatiel', name: 'Cockatiel', latin: 'Nymphicus hollandicus', photo: 'pb-cockatiel', size: 'Small parrot', feeds: ['Foxtail millet', 'Proso millet', 'Jowar'], note: 'Small grains and millets make up most of their seed mix.' },
  { id: 'lovebird', name: 'Lovebird', latin: 'Agapornis fischeri', photo: 'pb-lovebird', size: 'Small parrot', feeds: ['Foxtail millet', 'Proso millet', 'Safflower'], note: 'Millets with a share of safflower or sunflower.' },
  { id: 'budgie', name: 'Budgerigar', latin: 'Melopsittacus undulatus', photo: 'pb-budgie', size: 'Small parrot', feeds: ['Foxtail millet', 'Proso millet', 'Little millet'], note: 'Small millets are the heart of a budgie mix.' },
  { id: 'finch', name: 'Gouldian finch', latin: 'Chloebia gouldiae', photo: 'pb-finch', size: 'Finch', feeds: ['Proso millet', 'Foxtail millet', 'Browntop millet'], note: 'Tiny seeds like proso and browntop suit small beaks.' },
];
