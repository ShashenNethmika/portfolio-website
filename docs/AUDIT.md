# Migration audit — 19 November 2026

## Sources inspected

Local commit `d162fd9` is a snapshot of a later standalone four-station HTML Lab, not the same implementation currently on GitHub. Remote HEAD verified read-only: `0cf3c3ea5901a270e2c247211fabfa79a7a798f5`. The published website and remote tree were fetched and compared. Remote source copies are kept ignored under `docs/audit/` for inspection, not shipped.

The local tree has three HTML files, ten CSS files (~3,473 lines), three IIFE scripts (~1,800 lines), a self-hosted Space Grotesk font with OFL license, 960×960 portrait WebP (45,166 bytes), and PNG brand mark. No existing workflow, server, contact service, or configured Git remote was present locally. Branches `main` and `migration/nextjs-transformation` existed before this work. This records the initial audit state. After successful replacement validation, the original application was archived under legacy/; later main-branch publication was explicitly authorized by the owner.

Inspected homepage, Lab and contact markup, application/contact/Lab scripts, base tokens, page styling and animation selectors. Compared remote `index.html`, contact, project explorer, hero motion, Signal Lab, home/site scripts, glow module and referenced styles. The README's claims were not taken as proof.

## Preserved content and behavior

- Shashen Nethmika; ICT undergraduate/creative developer; University of Ruhuna, B.ICT (Hons), Batch 10; A/L technology stream (Engineering Technology, ICT, Science for Technology); O/L completed.
- Original portrait, brand image, local font and license. No generated replacement portrait.
- Six projects and exact repository destinations: Vesak Card Generator, Sinhala & Tamil New Year Wish, Study Buddy Timer, Weather Forecast App, FilmPotha Movie Hub, Shashen’s AI Cinema. Remote descriptions and goal/approach text preserved. AI Cinema links to profile repository list because no standalone repo is supplied.
- Original web/interface, media, electronics skills. No proficiency percentages or invented job experience. Newly used application technologies are described as tools used in this application; networking is explicitly educational exploration. No backend/database proficiency is asserted.
- Email `iamshashennethmika@gmail.com`, WhatsApp `94740066592`, all twelve social platforms plus Linktree. No configured form backend was found.
- Project filters, details dialog, interactive lantern palette and focus-timer preview from production; all four local stations plus two new stations.
- Legacy `index.html`, homepage section hashes, `pages/contact.html`, and `pages/lab.html` entry points handled by generated export compatibility routes.

## Findings

1. Local homepage globally loads Three r128, GSAP 3.12.5, ScrollTrigger, ScrollToPlugin and Lenis from CDNs. The remote version instead uses native ES modules and Canvas. Replacement bundles mutually compatible package versions, defers WebGL, and code-splits each workspace.
2. Local loader is a randomized counter; it delays access without measuring readiness. Removed in the new UI.
3. Local cursor, Lenis, hero and Lab maintain separate RAF loops with no teardown; the particle station renders while hidden. Replacement cancels or disables rendering on pause/offscreen/hidden and cleans up listeners.
4. Particle connections are quadratic; the pointer force can divide by zero at exact overlap. Spatial hashing and guarded normalized forces replace these.
5. Glass shadow appends hex alpha to `hsl(...)` (`hsl(...)55`), invalid CSS. Export and preview also use different shadow alpha. Both now share one style source with valid HSLA.
6. Local logic cards are isolated two-input gates, not an actual circuit editor. They lack NOT/XNOR, arbitrary wiring, saved circuits, graph validation and whole-circuit truth tables. The replacement is a bounded connected combinational graph editor.
7. Binary is an eight-switch integer array. No signed/32-bit arithmetic, second operand, complete conversions or overflow semantics. Replacement uses BigInt and width masks.
8. Local skill percentages are unsubstantiated. Replaced by meaningful categories and factual tool descriptions.
9. Local Lab/contact navigation uses inconsistent header classes relative to homepage; shared React navigation replaces this duplication.
10. There is no Terrain implementation or reference in the local snapshot or inspected production source. It is absent from the replacement.
11. No real project screenshots or verified demo URLs are supplied. Existing symbolic artwork is reinterpreted as native SVG UI previews, labeled as previews. No fabricated screenshots, demo links or external iframe executions.

## GitHub Pages

No workflow exists in the audited source. The new implementation uses `output: 'export'`, repository `basePath`, unoptimized existing WebP, trailing slash routes, static sitemap/robots, and an Actions workflow that runs validation before deployment on main. Remote state was read only. GitHub settings and post-deployment route behavior require an approved deployment and cannot be claimed verified locally.
