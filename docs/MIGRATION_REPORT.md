# Portfolio and Lab migration report

This report records the implemented migration, its source audit, the verified release and subsequent repository cleanup. Current setup and deployment instructions are in [README.md](../README.md); component boundaries and exact component paths are in [ARCHITECTURE.md](ARCHITECTURE.md).

## Original application and audit

Two actual implementations were inspected: local snapshot `d162fd9` and the original remote source `0cf3c3ea5901a270e2c247211fabfa79a7a798f5`. Their HTML, CSS, JavaScript, assets, navigation, contact destinations and interactive behavior were compared directly. README descriptions were not treated as evidence of working features.

The local app contained three HTML pages, ten stylesheets, three vanilla JavaScript entry points, CDN Three.js/GSAP/Lenis, an original 960×960 portrait, a brand mark and a locally licensed font. Remote production used ES modules/Canvas and a connected Signal Lab with four challenges. No contact-form service, backend or Terrain implementation was found.

| Audit finding | Implemented replacement |
| --- | --- |
| Simulated loading counter and globally downloaded CDN engines | Immediate static content, packaged dependencies and deferred optional graphics |
| Independent animation loops without complete teardown | Route cleanup and visibility/pause-aware simulation loops |
| Quadratic particle connections and unguarded zero-distance pointer force | Spatial hashing and bounded force calculations |
| Isolated logic cards and limited binary controls | Connected combinational circuits and fixed-width BigInt registers |
| Invalid glass shadow alpha and differing preview/export styles | One validated style generator for both preview and exports |
| Unsupported skill percentages | Factual technology categories without invented proficiency scores |
| Repeated headers and inconsistent page navigation | Shared responsive React navigation and original URL compatibility |
| No project UI screenshots in the original assets | Five verified captures of the genuine deployed applications |

## New stack and architectural decisions

The source now uses Next.js 16.4.6 App Router, React 19.3.1, TypeScript 6.0.3 strict mode and Tailwind CSS 4.3.5. Other locked dependencies provide Three.js/R3F/Drei, GSAP/ScrollTrigger, Lenis, Motion, Zustand and Zod. ESLint, Vitest, Playwright, axe-core and Lighthouse support quality checks. `package.json` and `pnpm-lock.yaml` are authoritative for exact versions.

Pages are statically generated. Interaction stays in Client Components; six independent workspaces load dynamically. Pure simulation engines are separate from React presentation. Animation engines own different tasks, with optional WebGL and project-filter features deferred until needed. There is no unnecessary backend or database.

`next.config.ts` preserves GitHub Pages compatibility through static export, `/portfolio-website` base path, trailing slashes and static images. `scripts/prepare-export.mjs` adds aliases for observed Next segment-payload paths that otherwise produced navigation 404s on static hosting. The normal build includes this step.

The full folder tree, created component inventory, calculation boundaries and extension points are maintained in [ARCHITECTURE.md](ARCHITECTURE.md).

## Preserved content and implemented features

Shashen Nethmika's original portrait, ICT undergraduate/creative-developer introduction, University of Ruhuna education, school education, interests, technologies, six projects, descriptions, repository destinations, email, WhatsApp and social links are preserved. No employment, awards, qualifications or skill percentages were fabricated. The original font and repository licenses remain. Terrain is absent from the application.

Portfolio work includes the responsive hero and portrait tilt, optional adaptive desktop constellation, categorized About/skills content, genuine project screenshots, category filters, native details dialogs, original palette/timer previews, email copy, social/WhatsApp links and accessible mobile navigation. Dedicated About, Projects, Contact and Lab pages work alongside original homepage section links and HTML entry points.

| Station | Working functionality |
| --- | --- |
| Logic Circuit Studio | Seven gates, 2–4 input gates, actual multi-gate wiring through ports or inspector, pointer/keyboard movement, live signals, cycle/input validation, truth tables, save/load/reset, explanations, original four Signal challenges, half-adder verification and opt-in sound |
| Binary & Digital Systems | A/B 8/16/32-bit registers, decimal/hex/octal/ASCII, signed/unsigned interpretation, two's complement, bitwise operations, shifts, increment/decrement, arithmetic, carry/borrow/overflow and local saves |
| Particle & Wave Sandbox | Gravity, attraction/repulsion, density/speed, wave amplitude/frequency, shockwaves, themes, pointer/touch, pause/reset/fullscreen, FPS, adaptive quality, DPR control, spatial grid, local setup saves and rendering suspension |
| Glass & UI Generator | Background/gradient, blur, opacity, radius, border, hue/saturation, glow/shadow, tilt, presets/custom presets, live preview and matching CSS/variables/TSX copy/download |
| Network & Data Flow | Draggable/keyboard topology with routers/switches/computers/servers, cables, static routes, source/destination, animated/stepped educational packets, loop/unreachable validation, IPv4/CIDR/mask/broadcast/usable-host math, binary display, OSI/TCP-IP lessons and subnet challenge |
| Motion & SVG Studio | Five shape types, layers, pointer/keyboard editing, position/rotation/scale/opacity keys, seeking/play/pause, duration retiming, presets, speed/loop controls, local saves, composition challenge and validated SVG/TSX exports |

The dashboard supplies search, categories, difficulty, distinct previews, favorites, recent stations, saved-experiment detection and meaningful challenge progress. Workspaces include instructions, help, controls and live results without loading unrelated simulations.

## Asset provenance

Five real deployed project UIs were captured, visually checked and encoded to WebP. The files total 279,796 bytes compared with 1,739,652 bytes for the lossless captures, about 84% smaller. The original portrait remains 45,166 bytes. No generated portrait or fabricated screenshot was used.

[Project image provenance](project-image-provenance.md) records source repositories and capture prerequisites. [The capture manifest](project-capture-manifest.json) records URLs, inspected source SHAs, timestamps, actions, sizes and source-image hashes. AI Cinema retains its original artwork/profile link because no dedicated repository/screenshot was supplied.

## Legacy retirement and repository cleanup

The replacement was built and validated separately before publishing to `main`. The unrelated local and remote histories were joined with a history-preserving merge; no force push was required. Initial migration source was archived while the replacement was validated.

After successful deployment, the owner's cleanup request retired the duplicate `legacy/` directory from the current tree. Every original archive file remains recoverable in [commit cd19a41](https://github.com/ShashenNethmika/portfolio-website/tree/cd19a41/legacy). The portrait, mark, font and OFL license in `public/` were hash-compared with that archive before removal and were unchanged.

Retired archived files:

```text
legacy/README.original.md
legacy/index.html
legacy/pages/contact.html
legacy/pages/lab.html
legacy/assets/css/about.css
legacy/assets/css/animations.css
legacy/assets/css/contact-page.css
legacy/assets/css/contact.css
legacy/assets/css/cursor.css
legacy/assets/css/hero.css
legacy/assets/css/lab-page.css
legacy/assets/css/lab.css
legacy/assets/css/main.css
legacy/assets/css/projects.css
legacy/assets/js/app.js
legacy/assets/js/contact.js
legacy/assets/js/lab.js
legacy/assets/fonts/OFL-Space-Grotesk.txt
legacy/assets/fonts/space-grotesk.woff
legacy/assets/images/mark.png
legacy/assets/images/profile.webp
```

Additional cleanup removes the unreachable `src/components/ui/lab-controls.tsx`, the unused `downloadText` export in `src/lib/utils.ts`, unused `.text-outline`/`.lab-input` styles, and the comment-only `.env.example`. Generated `next-env.d.ts` is no longer tracked and is regenerated by Next. Redundant `docs/AUDIT.md` and `docs/SOURCE_INVENTORY.md` are consolidated into this report and the architecture inventory. Obsolete ignored audit downloads, temporary scripts, package archives and partial test artifacts are removed; useful current assets, all required dependencies and the three maintenance/build scripts are retained.

## Verification evidence — 19 November 2026 release

Application release `6dbbd80bf402bf4c565913c264879cca7fe9cb0f` passed the [complete GitHub Actions workflow](https://github.com/ShashenNethmika/portfolio-website/actions/runs/44499146951) and deployed successfully:

- Clean frozen dependency installation, strict TypeScript, zero-warning ESLint and production static build.
- 31 unit tests across eight files and 62 desktop/mobile browser tests.
- Automated accessibility checks across 13 routes at two viewports, plus normal/reduced-motion interactions, save validation, keyboard controls, clipboard, SVG parsing and actual particle-frame suspension checks.
- No known vulnerabilities in production/full dependency audits; no peer dependency issues.
- Four focused gallery/portrait regressions passed after the final lazy-animation change.
- A post-deployment browser verified 14 entry points, all with HTTP 200 and expected content, with no console/page errors. Mobile navigation, project dialog, legacy-index navigation, original portrait decoding, sitemap and robots also passed.

The exact route list, release SHA, workflow link, timestamps and measurements are retained in [qa-results.json](qa-results.json). Cleanup validation is recorded separately there so these original performance results are not misrepresented as a fresh measurement.

## Performance and accessibility

The application prioritizes the real portrait, self-hosts its font, lazy-loads project imagery, splits stations, defers optional desktop WebGL and project layout features, disables automatic cross-route prefetch and stops hidden simulations. Event handlers and animation loops clean up. Accessibility improvements include explicit control labels, separated circuit ports, readable muted colors, keyboard-scroll regions and native dialog focus behavior. No accessibility rules were suppressed to obtain passing results.

Final production Lighthouse performance medians were **91 desktop** (91, 93, 73) and **84 mobile** (67, 85, 84), from three sequential isolated headless Edge measurements per preset with simulated throttling. Accessibility, best practices and SEO scored **100** in every run. Mobile LCP was 1.7/1.5/1.9 seconds, TBT 2,830/460/320 ms, and CLS 0. These are dated lab measurements against the released artifact, not real-user Core Web Vitals. Earlier local scores are not the final live score.

Generated Lighthouse/Playwright reports are ignored and are not promised on a fresh clone. The README documents how to reproduce them; the committed JSON evidence and linked successful CI run remain available.

## Deployment and remaining limitations

The site is published at [shashennethmika.github.io/portfolio-website](https://shashennethmika.github.io/portfolio-website/). GitHub Pages uses the Actions build source. The workflow validates the exported artifact before deployment. [README.md](../README.md#deploy-to-github-pages) provides release and post-deployment checks.

- **The mobile 90+ Lighthouse target is not consistently achieved.** Main-thread blocking remains variable; the recorded live median is 84.
- No contact-form service, authentication, database, cloud saves or collaboration is configured. Email/WhatsApp and browser-local persistence work without those services.
- Logic is combinational and networking is an explicitly educational visualization; sequential electronics and real network traffic are outside this edition.
- Motion uses linear keyframes and native SMIL exports; particles use a creative spring/wave model.
- AI Cinema has no supplied dedicated screenshot/repository.
- Windows Edge and Linux Chromium, with desktop/mobile emulation, were tested. Physical iOS/Android testing and real-user performance collection were not performed.

Server-dependent features should introduce a real service and server-side validation only when required. Private credentials must stay on a server-capable host; they cannot be put in the GitHub Pages client or browser storage.
