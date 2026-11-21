# Mascot sheets

Source art for the Artix polar bear mascot: three AI-generated 1536×1024 sheets, each a 4×2 grid of 384×512 tiles.

- `poses.png`: wave, thumbs-up, point, celebrate, think, desk, payout-24h, oops
- `scenes.png`: funded-200k, trophy, surf, mobile, iceberg, academy, handshake, peek
- `concepts.png`: classic, suit, geometric, climb, chibi, line-logo, astronaut, crest

`node scripts/cut-mascots.mjs` slices them into `public/images/mascot/<name>.webp` (needs ImageMagick). The tile names are listed in that script, so keep them in sync when you replace a sheet.
