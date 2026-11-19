# Migration source inventory

The following TSX components replace the manually maintained portfolio and Lab UI. App Router entry points compose these components; simulation engines remain in separate `engine.ts` files.

`src/components/projects/project-motion-features.ts` contains the separately loaded Motion layout/animation features used by the project filters.

## Shared and portfolio components

- `src/components/about/about-content.tsx`
- `src/components/animations/experience.tsx`
- `src/components/contact/contact-content.tsx`
- `src/components/hero/constellation.tsx`
- `src/components/hero/hero.tsx`
- `src/components/lab/lab-dashboard.tsx`
- `src/components/lab/station-art.tsx`
- `src/components/lab/workspace.tsx`
- `src/components/layout/footer.tsx`
- `src/components/navigation/navigation.tsx`
- `src/components/projects/project-art.tsx`
- `src/components/projects/project-grid.tsx`
- `src/components/ui/lab-controls.tsx`
- `src/components/ui/magnetic-link.tsx`
- `src/components/ui/section-heading.tsx`
- `src/components/ui/site-link.tsx`

## Experiment components

- `src/features/binary-explorer/BinaryExplorer.tsx`
- `src/features/glass-studio/GlassStudio.tsx`
- `src/features/logic-circuit/LogicStudio.tsx`
- `src/features/logic-circuit/SignalChallenges.tsx`
- `src/features/motion-studio/MotionStudio.tsx`
- `src/features/network-studio/IPCalculator.tsx`
- `src/features/network-studio/NetworkEducation.tsx`
- `src/features/network-studio/NetworkStudio.tsx`
- `src/features/particle-sandbox/ParticleSandbox.tsx`

## Retired primary application source

These original files were moved under `legacy/` after the replacement passed local validation. Their contents are retained for reference and rollback; Next.js does not compile or publish that directory.

- `index.html` → `legacy/index.html`
- `pages/contact.html` → `legacy/pages/contact.html`
- `pages/lab.html` → `legacy/pages/lab.html`
- `assets/js/app.js` → `legacy/assets/js/app.js`
- `assets/js/contact.js` → `legacy/assets/js/contact.js`
- `assets/js/lab.js` → `legacy/assets/js/lab.js`
- `assets/css/about.css` → `legacy/assets/css/about.css`
- `assets/css/animations.css` → `legacy/assets/css/animations.css`
- `assets/css/contact-page.css` → `legacy/assets/css/contact-page.css`
- `assets/css/contact.css` → `legacy/assets/css/contact.css`
- `assets/css/cursor.css` → `legacy/assets/css/cursor.css`
- `assets/css/hero.css` → `legacy/assets/css/hero.css`
- `assets/css/lab-page.css` → `legacy/assets/css/lab-page.css`
- `assets/css/lab.css` → `legacy/assets/css/lab.css`
- `assets/css/main.css` → `legacy/assets/css/main.css`
- `assets/css/projects.css` → `legacy/assets/css/projects.css`

Original asset directories are also retained in `legacy/assets/`. The current application uses the preserved portrait, branding and font under `public/`, plus genuine project captures documented in `docs/project-capture-manifest.json`. No original portrait or genuine portfolio content was deleted.
