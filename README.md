# Shashen Nethmika — Portfolio & The Lab

A developer portfolio and six interactive engineering workspaces, built with Next.js, React and TypeScript. The site preserves Shashen's original portrait, education, projects and contact information.

**[Visit the portfolio](https://shashennethmika.github.io/portfolio-website/)** · **[Explore The Lab](https://shashennethmika.github.io/portfolio-website/lab/)** · **[Build and deployment runs](https://github.com/ShashenNethmika/portfolio-website/actions/workflows/pages.yml)**

## What is included

- Responsive portfolio with an interactive portrait, optional desktop WebGL constellation, categorized skills, project filtering and accessible project dialogs.
- Six genuine projects, five screenshots captured from their deployed applications, and the original email, WhatsApp and social destinations.
- A searchable Lab dashboard with favorites, recent stations, locally saved experiments and challenge progress.
- Keyboard and touch controls, reduced-motion support, static SEO metadata, sitemap and original-page compatibility.

| Workspace | Route beneath `/portfolio-website/` | Capabilities |
| --- | --- | --- |
| Logic Circuit Studio | `lab/logic-circuit/` | Seven gate types, connected circuits, truth tables, validation and challenges |
| Binary & Digital Systems | `lab/binary-explorer/` | 8/16/32-bit registers, conversions, signed arithmetic and bitwise operations |
| Particle & Wave Sandbox | `lab/particle-sandbox/` | Adaptive Canvas physics, gravity, attraction, waves and shockwaves |
| Glass & UI Generator | `lab/glass-studio/` | Live surface controls, presets and matching CSS/variables/TSX exports |
| Network & Data Flow | `lab/network-studio/` | Topology editor, packet journeys, IPv4 subnet calculations and lessons |
| Motion & SVG Studio | `lab/motion-studio/` | Shapes, transform keyframes, timeline and validated SVG/TSX exports |

Experiments stay in this browser's storage; clearing it removes saves and progress. Networking is an educational simulation, with no real network traffic. Contact uses email and WhatsApp; no form-delivery service is configured.

## Run locally

Install **Node.js 24 LTS** and **pnpm 11.25.0**. If pnpm is missing, install the pinned version with `npm install --global pnpm@11.25.0`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000/portfolio-website/](http://localhost:3000/portfolio-website/). No `.env` file, API keys, account or database setup is required. Exact dependencies are recorded in `package.json` and `pnpm-lock.yaml`.

The source uses Next.js App Router, React, strict TypeScript and Tailwind CSS. Three.js/React Three Fiber/Drei provide optional 3D; GSAP/ScrollTrigger, Lenis and Motion own separate animation tasks. Zustand and Zod handle shared state and validated local saves.

## Edit the content

| Change | File or directory |
| --- | --- |
| Contact details, introduction, projects, technologies and social links | `src/config/portfolio.ts` |
| Education timeline and interests | `src/components/about/about-content.tsx` |
| Hero name, role and portrait presentation | `src/components/hero/hero.tsx` |
| Lab titles, descriptions, categories and difficulty | `src/config/stations.ts` |
| Portrait, branding and project screenshots | `public/images/` |
| Fonts and font license | `public/fonts/` |
| Pages and metadata | `src/app/` |
| Shared layout and portfolio UI | `src/components/` |
| Experiment controls and independent calculation engines | `src/features/` |
| Theme tokens and browser-level effects | `src/app/globals.css` |

When changing screenshots, keep `src/components/projects/project-art.tsx` and the [capture manifest](docs/project-capture-manifest.json) consistent with their paths. The [architecture guide](docs/ARCHITECTURE.md) explains component boundaries and adding features.

## Validate and preview

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm audit
```

`pnpm test:e2e` tests the exported files and starts its own preview server on port 4173 when needed. **Build first.** Windows defaults to the installed Microsoft Edge. On Linux, first run `pnpm exec playwright install --with-deps chromium`. Set `PLAYWRIGHT_CHANNEL` to `chrome` or `msedge` to select another installed browser.

For a manual production preview:

```sh
pnpm preview
```

Open [127.0.0.1:4173/portfolio-website/](http://127.0.0.1:4173/portfolio-website/). `pnpm build` generates `out/` and the static navigation payload aliases required by GitHub Pages. `next start` does not serve this static-export configuration.

| Additional command | Purpose |
| --- | --- |
| `pnpm capture:projects` | Capture the genuine deployed project applications; review images and manifest before committing |
| `pnpm exec playwright show-report` | Open the HTML report after an E2E run |

To run Lighthouse, create `.lighthouseci/` and audit the live URL:

```sh
node -e "require('node:fs').mkdirSync('.lighthouseci',{recursive:true})"
pnpm exec lighthouse https://shashennethmika.github.io/portfolio-website/ --output=html --output=json --output-path=.lighthouseci/home
```

Add `--preset=desktop` for desktop measurements. If Chrome is unavailable on Windows, set `$env:CHROME_PATH` to the installed Edge executable in PowerShell. Take multiple isolated measurements. Reports, build output and caches are generated locally and ignored by Git.

## Deploy to GitHub Pages

GitHub Pages is configured to use **GitHub Actions**. Pushing to `main` runs `.github/workflows/pages.yml`: frozen dependency installation, type checking, lint, unit tests, static build, desktop/mobile E2E and a production dependency audit. Only a successful validation job can deploy `out/`. Pull requests validate without deploying.

The published base path is `/portfolio-website/`. Dedicated pages, all six workspaces, `/index.html`, `/pages/contact.html` and `/pages/lab.html` work as direct links. After a release, check the Actions result, navigation, portrait, station controls, browser console, sitemap and robots on the live site.

For a custom domain or renamed repository, update `next.config.ts`, `src/lib/utils.ts`, canonical/Open Graph URLs in `src/app/`, robots and sitemap together. GitHub Pages cannot host server actions, API routes or database connections. Add a server-capable deployment only when a feature needs one.

## Verification and documentation

The recorded migration release passed **31 unit tests**, **62 desktop/mobile browser tests**, and live checks of **14 entry points** without browser errors. Its Lighthouse medians were **91 desktop / 84 mobile**; accessibility, best practices and SEO were **100**. The mobile 90+ performance target remains open. These are dated lab measurements, not real-user Core Web Vitals; exact release, method and limits are preserved below.

- [Architecture and component inventory](docs/ARCHITECTURE.md)
- [Migration, audit, cleanup and remaining limitations](docs/MIGRATION_REPORT.md)
- [Machine-readable verification evidence](docs/qa-results.json)
- [Project screenshot provenance and capture instructions](docs/project-image-provenance.md)

The duplicate legacy application has been removed from the current tree. Its complete [archived source remains recoverable in Git history](https://github.com/ShashenNethmika/portfolio-website/tree/cd19a41/legacy). Original runtime assets remain in `public/`, with the font's OFL license and the repository's [MIT license](LICENSE) retained.
