# Artix Prop

Marketing site for **Artix Prop**, the prop trading program of Artix Capital. Live at **https://prop.itsash.in**.

It is a single-page Nuxt 4 site with WebGL hero scenes (three.js), scroll animation (GSAP ScrollTrigger + Lenis), and a prerendered homepage, so all content and SEO metadata are in the static HTML.

## Stack

- [Nuxt 4](https://nuxt.com): source in `app/`, built as a static site with `nuxt generate`
- [three.js](https://threejs.org) for the black-hole hero and the mountain scene
- [GSAP](https://gsap.com) ScrollTrigger + [Lenis](https://lenis.darkroom.engineering) for scroll animation and smooth scrolling
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
  pages/dev/            dev-only tools (stripped from production builds)
  components/           page sections, WebGL scenes (BlackHoleCanvas, MountainScene)
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
| Re-export the mountain image | `npm run dev`, then `npm run export:mountain -- <hex> http://localhost:3000` (or use `/dev/mountain`) → `app/assets/images/mountain.webp` |
| Re-render card icons | `npx vite tools/render --port 5199`, then `node scripts/render-assets.mjs [asset]` → `public/images/*.webp` |
| Re-render the share card | `npm run dev`, then `npm run render:og` → `public/og/artix-prop.jpg`. Bump `?v=` on `ogImage` in `app/pages/index.vue` afterwards |

### Dev helpers

- `node scripts/shot.mjs <url> <outDir> <y1,y2,...>`: screenshots at several scroll positions (`VIEWPORT=390x844` for mobile)
- `node scripts/perf.mjs <url> <from-to,...>`: scroll FPS and dropped frames per page region
- `node scripts/trace.mjs <url> <from-to,...>`: paint, raster and GPU time while scrolling

## Brand

A single neon gold accent: `--neon: #ffb800`, and `--neon-ink: #e0a000` for text on white. No multi-colour gradients.
