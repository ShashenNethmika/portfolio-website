# Portfolio and engineering Lab migration

## Original architecture and preservation

The local snapshot used three manually maintained HTML pages, ten stylesheets, three vanilla JavaScript entry points, CDN Three.js/GSAP/Lenis, a local font, portrait and brand mark. GitHub production had a different ES-module/Canvas version with an inline connected Signal Lab. Both were audited; see [AUDIT.md](AUDIT.md) for the source commits and defects.

Preserved Shashen Nethmika's identity, introduction, original 960×960 portrait, University of Ruhuna education, all six projects, project descriptions/repository links, email, WhatsApp and thirteen social/link destinations. No employment, awards or proficiency scores were invented. The original four connected Signal Lab challenges remain playable alongside the half-adder challenge. Existing project palette/timer previews remain available.

Terrain was absent from the inspected sources and is absent from the new application.

## New stack and architecture

- Next.js 16.4.6 App Router, React 19.3.1, TypeScript 6.0.3 in strict mode.
- Tailwind CSS 4.3.5, reusable TSX components and a small global token/effect stylesheet.
- Three.js, React Three Fiber and Drei for optional desktop constellation rendering.
- GSAP/ScrollTrigger and Lenis for portfolio scrolling; Motion for project filtering. Distinct engines own distinct effects.
- Zustand dashboard state, Zod runtime validation, browser-only experiment persistence.
- ESLint 9.39.5, Vitest 5.1.1, Playwright 1.65.1, axe-core accessibility audits and Lighthouse.

TypeScript 7 and ESLint 10 were initially selected from stable tags, then replaced with the latest compatible 6.0/9 releases after peer checks and real compiler/linter execution showed their incompatibility with the installed Next lint plugins. The finalized lockfile records exact versions. No backend, account system, database or secret-bearing contact service is needed.

`src/app` holds build-time Server Components and metadata. Interaction is confined to client components. Each Lab UI loads independently through `src/components/lab/workspace.tsx`. Pure engines remain separate from controls. See [ARCHITECTURE.md](ARCHITECTURE.md) for extension boundaries.

## Source structure and principal components

| Path | Responsibility |
| --- | --- |
| `src/app/layout.tsx`, `src/app/page.tsx` | Shared shell, SEO and portfolio composition |
| `src/app/about`, `src/app/projects`, `src/app/contact` | Dedicated portfolio routes |
| `src/app/lab/[station]/page.tsx` | Six statically generated station routes |
| `src/app/pages/*.html/page.tsx` | Original entry-point compatibility |
| `src/components/navigation/navigation.tsx` | Mobile navigation, active route/section, Escape handling |
| `src/components/hero/{hero,constellation}.tsx` | Prominent real portrait, tilt and adaptive 3D field |
| `src/components/projects/{project-grid,project-art}.tsx` | Filters, native dialog, screenshots and interactive previews |
| `src/components/about/about-content.tsx` | Audited education, interests and categorized technologies |
| `src/components/contact/contact-content.tsx` | Email copy, WhatsApp and original social links |
| `src/components/lab/{lab-dashboard,station-art,workspace}.tsx` | Search, filters, pins/history/saves, previews and workspace shell |
| `src/components/animations/experience.tsx` | Optional scroll enhancement and cursor cleanup |
| `src/features/logic-circuit` | Seven gates, DAG editor, ports, validation, truth tables and challenges |
| `src/features/binary-explorer` | BigInt registers, conversions, signed arithmetic and flags |
| `src/features/particle-sandbox` | Spring/wave physics, spatial hash and visibility-aware Canvas |
| `src/features/glass-studio` | Design controls, local presets and exact CSS/variables/TSX exports |
| `src/features/network-studio` | Topology, packet journey, subnet calculator and OSI/TCP-IP lessons |
| `src/features/motion-studio` | SVG shapes, transform keys, timeline, presets and safe code exports |
| `src/config`, `src/stores`, `src/lib` | Audited data, shared state, save validation and asset paths |
| `public/fonts`, `public/images` | Original licensed assets and verified WebP project screenshots |
| `tests/unit`, `src/features/*/engine.test.ts`, `tests/e2e` | Algorithm boundaries, interaction and browser verification |

## Working feature scope

Logic supports actual multi-gate combinational graphs, 2–4 input gates, NOT/XNOR, port or inspector wiring, keyboard movement, live signal feedback, bounded truth tables, cycle/missing-input validation, named save/load, four original challenges, half-adder verification and opt-in audio.

Binary supports 8/16/32-bit A/B editors, decimal/hex/octal/ASCII bytes, signed/unsigned interpretation, two's complement, AND/OR/XOR/NOT, logical/arithmetic shifts, increment/decrement, addition/subtraction, unsigned carry, borrow and signed overflow.

Particles support gravity, pointer attraction/repulsion, density, speed, amplitude/frequency, shockwaves, themes, mouse/touch, fullscreen, pause/reset, FPS, local setup saves, adaptive quality and real rendering suspension. Nearby connections use a spatial hash and DPR is capped.

Glass supports surface/scene controls, built-in and named presets, reduced-motion-aware tilt, blur/opacity/radius/border/glow/shadow/hue/saturation, exact shared preview/export styles, copy and downloads. Decorative backdrop objects are illustrative and intentionally excluded from exported surface styles.

Network supports draggable/keyboard-editable computers, switches, routers and servers, cables, static routes, source/destination, animated or stepped packets, loop/unreachable validation, accurate IPv4/CIDR/mask/broadcast/host math including `/0`, `/31` and `/32`, binary representation, lessons and a subnet challenge.

Motion supports five shape types, layers, direct/keyboard movement, position/rotation/scale/opacity keyframes, seeking, play/pause, duration retiming, presets, preview speed/loop controls, local saves, a composition challenge, static/animated SVG and TSX exports.

## Assets and legacy source

Five genuine deployed applications were captured without mocked content, visually inspected, encoded to WebP, and integrated into project cards. Provenance, source commits, capture actions, file hashes and byte sizes are in [project-capture-manifest.json](project-capture-manifest.json). There is no supplied dedicated AI Cinema repository/screenshot; its original creative artwork and profile repository link remain, rather than fabricating evidence.

Legacy HTML/CSS/JS is preserved under `legacy/` for rollback, outside Next's source and exported output. The original font license and repository MIT license are retained. No genuine content was discarded. Root manual pages are retired as primary source. Retired paths are index.html, pages/contact.html, pages/lab.html, assets/css/*, assets/js/*, assets/fonts/* and assets/images/*; their exact originals now live at legacy/index.html, legacy/pages/* and legacy/assets/*.

## Performance, accessibility and security

No fake loading counter or globally downloaded CDN engines. The 45 KB portrait is prioritized with explicit dimensions, the font is self-hosted, project images are lazy-loaded, and static pages are generated at build time. WebGL loads on first desktop pointer activity; touch/reduced-motion visitors keep the lightweight field. Workspaces are code-split, rendering stops offscreen/hidden/paused, event handlers clean up, and optional animation failure falls back to native navigation.

Accessibility fixes found through browser testing include native project-button names, explicit range labels (nested output elements had captured implicit labels), larger separated circuit ports, readable muted text, named keyboard-scroll regions and preserved dialog focus. Navigation uses native links and the regular pointer remains available. No accessibility rule is suppressed to obtain passing results.

Stored content is Zod-validated and rendered as text/typed geometry. SVG export only accepts enumerated shapes and validated colors/numbers. No arbitrary HTML execution, secrets, sensitive browser storage or backend credentials. Production and full dependency audits found no known vulnerabilities; peer checks report no issues.

## Verification results

- Strict TypeScript: passed as part of the production build.
- Production static build: passed; all application routes, metadata, sitemap and robots generated.
- Unit tests: 31 passed across eight test files.
- ESLint: passed with zero warnings; standalone route type generation and `tsc --noEmit` passed.
- Desktop/mobile Playwright: 62 passed, including 26 automated accessibility route audits (13 routes × two viewports). No console/page errors in interaction and normal-motion tests. Six focused navigation/WebGL regressions also passed after the final prefetch optimization.
- Full and production dependency audits: no known vulnerabilities. Peer checks: no issues.
- Final Lighthouse measurements are appended below after the isolated performance run.
- Real-browser checks cover portrait decoding, project dialog/filtering, all six stations, saves, clipboard, SVG parsing, original routes, challenge progress, invalid persistence, normal/reduced motion and Canvas rendering suspension.

## GitHub Pages deployment

`next.config.ts` configures `output: 'export'`, repository `basePath`, trailing slashes and static images. `pnpm build` also runs `scripts/prepare-export.mjs`, which adds flat aliases for the nested segment-prefetch payloads emitted by Next 16. This was required to eliminate observed browser 404s on a host without rewrite support; original payloads are retained.

`.github/workflows/pages.yml` installs the frozen lockfile, checks types/lint/unit tests, builds the actual `out/` artifact, runs desktop/mobile browser audits, audits dependencies and only then deploys. GitHub Pages must use the Actions build source. The static preview server mirrors the repository base path; exported routes are tested directly.

## Deliberate boundaries

This is an educational combinational circuit and networking environment, not a sequential electronics solver or real network stack. Particle physics is a creative spring/wave model, not a fluid solver. Motion uses linear keyframes and native SMIL exports. Browser saves remain on this device; no cloud backup/auth/collaboration is claimed. A real contact form and backend services are not configured because no provider is supplied. AI Cinema retains artwork rather than an invented screenshot.

## Final local measurements — 19 November 2026

Lighthouse desktop performance **93**; mobile performance **90 median** across three isolated simulated-mobile runs (**90, 80, 91**). Accessibility, best practices and SEO scored **100**. Mobile LCP was 1.2–1.3 seconds and CLS was 0; TBT varied from 320–810 ms. Desktop LCP was 1.6 seconds and TBT 70 ms. These are lab measurements against the real static export, not field Core Web Vitals or a guarantee for every device/network. Earlier diagnostic runs exposed deferred 3D and prefetch costs; desktop WebGL now waits for pointer activity, mobile keeps the static field, route prefetch is intentional, and hero entrances do not wait on scroll libraries.

The five verified WebP screenshots total **279,796 bytes**, versus **1,739,652 bytes** for the original lossless captures (about **84% smaller**). No profile replacement or image-generation service was used.

Machine-readable results are in [qa-results.json](qa-results.json). Full local HTML/JSON Lighthouse reports remain under `.lighthouseci/`; the Playwright HTML report is `playwright-report/index.html`. GitHub deployment and post-publication verification are recorded after the release run.
