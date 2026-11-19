# Architecture

## Rendering and deployment

Next.js App Router generates a static application during `pnpm build`. Server Components compose page structure, content and metadata at build time. Client Components own browser interaction; no server runtime or database is required after export.

`next.config.ts` sets `output: 'export'`, `/portfolio-website` as the base path, trailing slashes and static-compatible images. The build then runs `scripts/prepare-export.mjs` to add flat aliases for nested Next segment payloads. These aliases prevent observed client-navigation 404s on GitHub Pages, which supplies no application rewrite server. `scripts/serve.mjs` previews the actual exported files beneath the same base path.

`main` is deployed through `.github/workflows/pages.yml`. Type checking, lint, unit tests, the production build, browser tests and dependency audit must pass before the Pages deploy job. Only `out/` is published. Source, documentation, test reports and dependencies are not uploaded as website files.

## Source map

```text
src/
  app/                         Static pages, layout, metadata, sitemap and robots
    about/ contact/ projects/
    lab/[station]/             Six routes generated from the station registry
    pages/contact.html/        Original URL compatibility
    pages/lab.html/
  components/
    about/ animations/ contact/ hero/ lab/
    layout/ navigation/ projects/ ui/
  config/                      Profile/project data and typed station registry
  features/                    One UI and pure engine per experiment
    logic-circuit/ binary-explorer/ particle-sandbox/
    glass-studio/ network-studio/ motion-studio/
  lib/                         Base-path assets and validation of saved experiments
  stores/                      Dashboard history, favorites and challenge progress
public/
  fonts/ images/               Original assets, licenses and project screenshots
scripts/                       Static preview, export aliases and image capture
tests/unit/                    Logic, binary, persistence and challenge tests
tests/e2e/                     Portfolio, routes, workspaces, rendering and axe checks
docs/                          Architecture, migration and dated verification evidence
```

Feature engine tests also live beside `src/features/*/engine.ts`. Configuration remains typed where supported. Versions are pinned in `package.json` and `pnpm-lock.yaml`.

## Component inventory

Paths below are relative to `src/components/`:

| Area | Components |
| --- | --- |
| About and contact | `about/about-content.tsx`, `contact/contact-content.tsx` |
| Site shell | `navigation/navigation.tsx`, `layout/footer.tsx` |
| Hero | `hero/hero.tsx`, `hero/constellation.tsx` |
| Portfolio projects | `projects/project-grid.tsx`, `projects/project-art.tsx` |
| Lab dashboard and shell | `lab/lab-dashboard.tsx`, `lab/station-art.tsx`, `lab/workspace.tsx` |
| Shared interaction | `animations/experience.tsx`, `ui/magnetic-link.tsx`, `ui/site-link.tsx`, `ui/section-heading.tsx` |

The separately loaded `projects/project-motion-features.ts` supplies Motion's filtering/layout features.

| Feature directory under `src/features/` | React components |
| --- | --- |
| `logic-circuit/` | `LogicStudio.tsx`, `SignalChallenges.tsx` |
| `binary-explorer/` | `BinaryExplorer.tsx` |
| `particle-sandbox/` | `ParticleSandbox.tsx` |
| `glass-studio/` | `GlassStudio.tsx` |
| `network-studio/` | `NetworkStudio.tsx`, `IPCalculator.tsx`, `NetworkEducation.tsx` |
| `motion-studio/` | `MotionStudio.tsx` |

`src/components/lab/workspace.tsx` dynamically imports only the selected station. Keep calculations and serialization in each feature's `engine.ts`, rather than combining unrelated simulations into the dashboard.

## Animation and rendering ownership

The original 960px portrait is prioritized with explicit dimensions. Space Grotesk is self-hosted through `next/font/local`, with its OFL license retained. Project screenshots are lazy-loaded WebP assets.

- React Three Fiber/Drei provides the optional desktop constellation after pointer interaction. Touch devices, reduced-motion preferences and unsupported WebGL retain the static field. Its capped 28/65 points use a small pairwise connection pass.
- GSAP/ScrollTrigger controls portfolio reveals; Lenis handles desktop portfolio scrolling. Workspaces keep native gestures. Effects clean up on route changes and suspend where appropriate.
- Motion handles project filtering. Its larger feature bundle loads when the filter controls enter view or receive interaction. Initial cards remain server-rendered.
- CSS handles small hover and entrance transitions. Reduced motion disables optional movement and starts particles paused. The regular pointer and native links remain usable.
- The particle sandbox owns its Canvas loop, uses spatial hashing, caps DPR, adapts quality and stops recurring frames when paused, hidden or offscreen.

No element has multiple animation engines controlling the same transform. Internal links disable automatic prefetch by default so visiting the portfolio does not download every station.

## Engine contracts

| Engine | Model and boundaries |
| --- | --- |
| Logic | Acyclic combinational graphs; seven gate types; up to 32 nodes, eight switches and 256 truth rows; 2–4 inputs for multi-input gates; rejects missing inputs and feedback |
| Binary | BigInt arithmetic masked to 8/16/32 bits; distinct unsigned carry, subtraction borrow and signed overflow; signed interpretation uses two's complement |
| Particles | Creative spring/wave model, 40–650 particles, bounded forces and nearby grid connections; no claim of fluid-solver accuracy |
| Glass | One validated style source drives preview and CSS/variables/TSX; illustrative scene decorations are excluded from surface exports |
| Network | Exact IPv4 arithmetic through 2^32, including `/0`, `/31` and `/32`; up to 24 topology nodes; longest-prefix static routes and simplified shortest-path fallback; educational packets only |
| Motion | Up to 20 shapes and 40 keys per shape, 1–20 second timeline, linear keyframe interpolation; validated SVG/SMIL and TSX generation |

User values are bounded and schema-validated. SVG accepts enumerated shapes and validated colors/numbers, with no arbitrary markup execution. `/31` follows point-to-point semantics; `/32` represents one host route. Network forwarding does not implement a full IP stack, ARP or VLANs.

## Persistence and security

Zustand owns dashboard favorites, recent stations and completed challenge IDs. Manual post-mount hydration avoids server/client mismatches. Each workspace owns its experiment schema and browser-storage adapter; `src/lib/saved-experiments.ts` validates the dashboard's saved-experiment detection.

Stored content is validated with Zod before use. Storage failures leave the editors usable. Saves are local to the origin, browser and device; they are not synchronized or backed up. No sensitive information or API keys belong in localStorage.

This edition requires no environment-variable setup or secret-bearing services. Optional tooling accepts `PLAYWRIGHT_CHANNEL`, preview `PORT` and Lighthouse `CHROME_PATH`. A configured contact form, authentication or cross-device saves would require a real service. Add data-access adapters and server-side validation when such a feature exists; private credentials must remain server-side on a suitable host. GitHub Pages cannot execute those services.

## Maintenance

Update shared contact/project data in `src/config/`, the hero and education narrative in their portfolio components, assets in `public/` and tests alongside the affected feature. The README lists exact edit locations. A new station needs a typed registry entry, a feature module and engine, a dynamic workspace import, and meaningful engine/interaction tests. `generateStaticParams` creates registered station routes during export.

Generated `next-env.d.ts`, `.next/`, `out/`, test reports and caches are ignored. Run the README's validation commands to reproduce them. The old HTML/CSS/JS app is recoverable from the [archived Git snapshot](https://github.com/ShashenNethmika/portfolio-website/tree/cd19a41/legacy); it is no longer duplicated in the current source tree.
