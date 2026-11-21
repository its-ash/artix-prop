# Artix Prop — Mascot Specification

Canonical brand mascot specification for **Artix Prop** (`prop.itsash.in`), part of the **Artix Group**. Use this file as the single source of truth when generating new poses, scenes, or marketing visuals.

## Character Identity
- **Species**: Stylized 3D polar bear (Arctic / Artix motif).
- **Art Style**: Commercial 3D collectible / Pixar-grade clean vinyl-matte render. Smooth matte snow-white fur, sharp friendly-confident expression, dark expressive eyes, rounded ears, black nose, sturdy athletic proportions.
- **Group Consistency**: Shares the exact base character model, face, and cyber-jacket silhouette with **Artix Capital** and **Artix Global**. Only the accent palette, chest `X` emblem colors, and holographic props change per firm.

## Color Palette
| Role | Hex | Usage |
| :--- | :--- | :--- |
| Canvas / Background | `#050506` | Pure matte obsidian studio stage for cutouts |
| Outfit Base | `#0a0b0d` / `#14171c` | Matte obsidian jacket, carbon-hex shirt, tailored pants, dark sneakers |
| Primary Accent | `#b6f500` | Glowing cyber-jacket piping, cuff/waist metallic trim, holographic UI props, rim light |
| Highlight Accent | `#c8ff3a` / `#d4ff66` | Bright neon-lime light edges and hologram highlights |

## Outfit & Emblem
- **Jacket**: Open obsidian-black futuristic cyber-bomber jacket with geometric glowing **Neon Lime (`#b6f500`)** seam piping, structured collar, and brushed lime-metallic cuff/hem bands.
- **Inner Shirt**: Fitted dark matte carbon-hex sci-fi tech-shirt with subtle neon-lime base accents.
- **Chest Logo**: Exact **Artix `X`** mark (`public/icon-512.png`) centered on the shirt chest:
  - Bold white diagonal slash (`\`, top-left to bottom-right)
  - Faceted origami downward triangle (top-right) in Neon Lime (`#8fc400` / `#3d5200`)
  - Faceted origami upward triangle (bottom-left) in Bright Neon Lime (`#b6f500` / `#d4ff66`)
- **Lower Body**: Fitted matte obsidian-black pants and sleek dark sneakers.

## Existing Poses (`public/images/mascot/`)
| Pose | File | Dimensions | Usage |
| :--- | :--- | :--- | :--- |
| `artix-bear` | `artix-bear.webp` | `408 × 720` | Standalone hero / brand stance |
| `think` | `think.webp` | `306 × 463` | `HowItWorks.vue` — Step 01 (Choose challenge) |
| `desk` | `desk.webp` | `327 × 465` | `HowItWorks.vue` — Step 02 (Hit target) |
| `funded-200k` | `funded-200k.webp` | `319 × 450` | `HowItWorks.vue` — Step 03 ($200K funded) |
| `payout-24h` | `payout-24h.webp` | `331 × 454` | `HowItWorks.vue` — Step 04 (24h payout) |
| `academy` | `academy.webp` | `385 × 473` | `FaqSection.vue` — FAQ helper |
| `peek` | `peek.webp` | `424 × 322` | `FinalCta.vue` — Peeking over card edge |
| `oops` | `oops.webp` | `409 × 473` | `error.vue` — 404 / error state |
| `wave` | `wave.webp` | `337 × 471` | Friendly greeting / onboarding |

## Wiring
- **Component**: `app/components/BearMascot.vue`
- **Pose Registry**: `app/data/mascot.ts`

## Prompt Template (New Poses)
```text
Stylized 3D commercial render of the Artix Prop polar bear mascot (matching ../mascots/final/artix-prop-mascot.jpg):
smooth matte snow-white fur, confident friendly expression, obsidian-black cyber-trimmed bomber jacket with glowing Neon Lime (#b6f500) piping and brushed lime cuffs, dark carbon-hex sci-fi inner shirt featuring the exact Artix "X" logo (white diagonal slash with neon-lime faceted triangles) centered on the chest, matte black pants, dark sneakers.
Pose: <DESCRIBE POSE AND NEON-LIME HOLOGRAPHIC PROP>.
Background: solid flat pure black (#050506) with soft neon-lime rim lighting, no text captions, no borders, generous margin for transparent cutout.
```
