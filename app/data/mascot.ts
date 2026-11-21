// The Artix polar bear. Each pose is a transparent WebP in public/images/mascot/<pose>.webp,
// cut from the sheets in tools/mascot/ by `node scripts/cut-mascots.mjs`, which prints these sizes.
export const mascot = {
  'artix-bear': { w: 408, h: 720, alt: 'The Artix Prop polar bear mascot' },
  // poses
  wave: { w: 337, h: 471, alt: 'The Artix polar bear waving hello' },
  'thumbs-up': { w: 428, h: 435, alt: 'The Artix polar bear giving a thumbs up' },
  point: { w: 544, h: 435, alt: 'The Artix polar bear pointing to the side' },
  celebrate: { w: 453, h: 480, alt: 'The Artix polar bear celebrating with both fists raised' },
  think: { w: 306, h: 463, alt: 'The Artix polar bear thinking next to a chart' },
  desk: { w: 327, h: 465, alt: 'The Artix polar bear trading at a desk with two monitors' },
  'payout-24h': { w: 331, h: 454, alt: 'The Artix polar bear holding a 24h stopwatch' },
  oops: { w: 409, h: 473, alt: 'The Artix polar bear holding a broken chart' },
  // scenes
  'funded-200k': { w: 319, h: 450, alt: 'The Artix polar bear holding a $200K funded card' },
  trophy: { w: 403, h: 480, alt: 'The Artix polar bear on a first-place podium with a trophy' },
  surf: { w: 526, h: 423, alt: 'The Artix polar bear surfing a rising chart' },
  mobile: { w: 447, h: 452, alt: 'The Artix polar bear showing the trading app on a phone' },
  iceberg: { w: 408, h: 452, alt: 'The Artix polar bear relaxing on an iceberg with a laptop' },
  academy: { w: 385, h: 473, alt: 'The Artix polar bear beside a holographic FAQ panel' },
  handshake: { w: 492, h: 417, alt: 'The Artix polar bear shaking hands with a trader' },
  peek: { w: 424, h: 322, alt: 'The Artix polar bear peeking over the edge' },
  // concepts
  classic: { w: 419, h: 480, alt: 'The Artix polar bear in a red scarf' },
  suit: { w: 385, h: 480, alt: 'The Artix polar bear in a suit holding a tablet' },
  geometric: { w: 448, h: 446, alt: 'Low-poly Artix polar bear head' },
  climb: { w: 446, h: 480, alt: 'The Artix polar bear climbing a rising arrow' },
  chibi: { w: 447, h: 465, alt: 'Chibi Artix polar bear holding an X coin' },
  'line-logo': { w: 452, h: 411, alt: 'Artix polar bear logo mark with a rising arrow' },
  astronaut: { w: 500, h: 457, alt: 'The Artix polar bear as an astronaut' },
  crest: { w: 455, h: 431, alt: 'Artix Prop polar bear crest' }
} as const

export type MascotPose = keyof typeof mascot
