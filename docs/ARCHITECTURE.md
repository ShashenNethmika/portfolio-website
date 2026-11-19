# Portfolio and Lab architecture

## Runtime boundaries

Next.js App Router statically renders layout, page headings, metadata, About, and the site structure during `next build`. No Node runtime, database or authentication is required after export. React client components own user interaction. Each workspace is a separate dynamic import; simulation code is not loaded as part of the homepage.

The homepage portrait is the original 45 KB WebP with explicit dimensions and priority loading. Space Grotesk is self-hosted with `next/font/local`, retaining its license. Tailwind provides component styling; the small global stylesheet contains tokens, browser defaults, focus states, reduced-motion and shared special effects. A pointer-activated, feature-detected desktop React Three Fiber constellation is optional enhancement. A static CSS grid remains readable without WebGL. Its capped 28/65 points make a small pairwise connection pass acceptable; the larger particle sandbox uses spatial hashing instead.

GSAP/ScrollTrigger owns scroll-linked reveal transforms, Lenis owns desktop wheel smoothing on portfolio routes, and Motion owns project filtering layout. Workspaces retain native scrolling. Effects clean up on route changes. No element has two animation engines controlling the same transform. CSS handles hover and small transitions. Reduced-motion disables the optional 3D and smooth scrolling and starts the particle simulation paused.

## Source layout

```text
src/
  app/                      # Static App Router pages and metadata
    about/ projects/ contact/ lab/[station]/
    pages/contact.html/     # Original route compatibility
    pages/lab.html/
  components/
    about/ animations/ contact/ hero/ lab/
    layout/ navigation/ projects/ ui/
  config/                   # Audited profile, projects, socials and station registry
  features/
    logic-circuit/          # Connected DAG evaluation and circuit editor
    binary-explorer/        # Fixed-width BigInt number systems
    particle-sandbox/       # Adaptive Canvas physics and spatial grid
    glass-studio/           # Shared preview/export styles
    network-studio/         # IPv4 math, topology, educational forwarding
    motion-studio/          # Typed SVG model, interpolation, safe export
  lib/                      # Asset paths and download utility
  stores/                   # Zustand dashboard history/pins/progress
public/
  fonts/ images/            # Original assets and genuine project captures
tests/
  unit/                     # Gate and binary boundary tests
  e2e/                      # Desktop/mobile Playwright + axe
scripts/                    # Base-path static preview and image capture
.github/workflows/pages.yml # Validated static artifact deployment
docs/                       # Audit, architecture, migration and QA results
```

Simulation engines are pure TypeScript, separated from React, and exercised by meaningful boundary tests. Circuit evaluation rejects feedback and invalid/missing inputs; the UI explicitly describes the combinational-only scope. Truth tables are bounded to eight switches and 256 rows. Editors bound graph/shape sizes, positions and exports. SVG is generated only from a Zod-validated schema with enumerated shape types and hex colors; arbitrary markup cannot enter the output.

Binary operations mask to a selected 8/16/32-bit width. Unsigned carry, subtraction borrow, and signed overflow are distinct flags. Network arithmetic uses exact nonnegative numbers up to 2^32 rather than signed JS bitwise operations. `/31` is point-to-point per RFC 3021; `/32` is a single host route. Packet journeys are an educational visualization with configured static routes and simplified shortest-path fallback, explicitly not real traffic, ARP, VLANs, or a complete IP stack.

## Browser persistence

Zustand owns recent stations, pinned favorites and completed challenge IDs, with manual post-mount hydration to avoid server/client mismatches. Workspaces own their experiment schemas and browser-storage adapters. All input from localStorage is parsed and validated; storage failures do not break the editor. No sensitive information is stored. Browser storage is local to this origin and device and can be cleared by the browser. It is not a cloud backup.

## Extension points

A backend is deliberately absent. Add Node/PostgreSQL/Prisma or Supabase only when a real feature such as cross-device saves, collaboration or authentication is introduced. Keep data-access adapters behind feature contracts, validate on the server again, and put private credentials in server-side environment variables. That deployment would require a server-capable host such as Vercel or Cloudflare and a reviewed privacy/auth model. The GitHub Pages edition must retain browser-only features and cannot host API routes, server actions, private database connections or secret-bearing email services. Contact therefore uses verified mailto/WhatsApp links and a copyable email.

## Deployment safety

Only `out/` is deployable. Legacy source is retained during replacement validation and excluded from Next's source tree. Migration work is on a separate local branch; nothing has been pushed. The workflow validates type checking, lint, unit tests, static build, E2E and dependency audit before a main-branch deployment job. Publication and post-deployment route tests remain an explicit approval step.
