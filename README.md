# Artix Prop

Marketing site for **Artix Prop**, the prop trading program of Artix Capital. Live at **https://prop.itsash.in**.

It is a single-page Nuxt 4 site with WebGL hero scenes (three.js), scroll animation in plain CSS + JavaScript (GSAP only for the pinned hero), and a prerendered homepage, so all content and SEO metadata are in the static HTML.

## Stack

- [Nuxt 4](https://nuxt.com): source in `app/`, built as a static site with `nuxt generate`
- [three.js](https://threejs.org) for the orbiting-coins hero
- Native scrolling; scroll-linked effects use a tiny rAF engine in `app/utils/motion.ts` (`scrollScene`, `tween`, `onEnter`) plus CSS transitions/keyframes
- GitHub Pages hosting, served from the `docs/` folder on `main`

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploying

```bash
make deploy
```

This command:

1. builds the static site into `docs/` (`nuxt generate`)
2. stages **all** changes (`git add -A`)
3. writes a commit message with a local LLM (see below)
4. commits and pushes to `main`

GitHub Pages serves `main:/docs` at `prop.itsash.in`. To build without committing, run `make build`.

### Commit messages

`scripts/commit-msg.mjs` sends the staged diff to an OpenAI-compatible endpoint and prints the message it gets back. Build output in `docs/` is only summarized, not sent.

| Env var     | Default                    |
| ----------- | -------------------------- |
| `LLM_URL`   | `http://127.0.0.1:9694/v1` |
| `LLM_MODEL` | `router/text`              |

If the LLM can't be reached, it falls back to `Deploy YYYY-MM-DD HH:MM`.

### Domain and site URL

- `public/CNAME` holds the custom domain; it is copied into `docs/` on every build.
- `public/.nojekyll` stops GitHub's Jekyll from dropping the `docs/_nuxt` folder. Don't delete it.
- The site origin used for canonical URLs, `og:image`, the sitemap and JSON-LD defaults to `https://prop.itsash.in` in `nuxt.config.ts`. You can override it at build time with `NUXT_PUBLIC_SITE_URL`.

## Project layout

```
app/
  pages/index.vue       homepage, SEO meta and JSON-LD
  components/           page sections, WebGL scene (CoinsCanvas)
  data/                 FAQ and challenge content (FAQ is shared with FAQPage schema)
  plugins/reveal.ts     v-reveal scroll-in directive
  assets/               CSS, imported images (hashed filenames)
server/routes/          sitemap.xml and robots.txt (prerendered)
public/                 static files copied as-is (icons, images, og card, CNAME)
scripts/                asset export, deploy and performance helpers
tools/                  standalone render pages for the pre-rendered artwork
docs/                   build output served by GitHub Pages (generated, don't edit)
```

## Asset scripts

Several images are rendered stills of 3D scenes rather than live WebGL, which keeps the page light. Most scripts drive Chrome over the DevTools protocol, so start it first:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9333
```

| Task | Command |
| --- | --- |
| Re-render card icons | `npx vite tools/render --port 5199`, then `node scripts/render-assets.mjs [asset]` → `public/images/*.webp` |
| Re-cut the mascot poses | `node scripts/cut-mascots.mjs` (needs ImageMagick): sheets in `tools/mascot/` → `public/images/mascot/*.webp`. Copy the printed sizes into `app/data/mascot.ts` |
| Re-render the share card | `npm run dev`, then `npm run render:og` → `public/og/artix-prop.jpg`. Bump `?v=` on `ogImage` in `app/pages/index.vue` afterwards |

### Dev helpers

- `node scripts/shot.mjs <url> <outDir> <y1,y2,...>`: screenshots at several scroll positions (`VIEWPORT=390x844` for mobile)
- `node scripts/perf.mjs <url> <from-to,...>`: scroll FPS and dropped frames per page region
- `node scripts/trace.mjs <url> <from-to,...>`: paint, raster and GPU time while scrolling

## Brand

Child brand of [Artix Capital](https://artixcapital.com/): the header/footer use the parent's wordmark, the favicon is the parent's "X" mark, and the single accent is the parent's logo red — `--neon: #d6141c`, `--neon-ink: #b8111a` for text on white, white text on red fills (`--on-neon`). Green appears only inside the logo's "up" flag. Type is Geist / Geist Mono, as on artixcapital.com. No multi-colour gradients.

The mascot is a polar bear in a black hoodie and red scarf (`<BearMascot pose="…" />`, poses listed in `app/data/mascot.ts`). It appears in How it works (one pose per step), the FAQ, the final CTA and the 404 page.
