# Shashen Nethmika — Portfolio & The Lab

A statically exported Next.js portfolio with six interactive engineering workspaces. Original profile, projects, portrait, education and contact destinations are preserved. No account, backend or secret is required.

## Local development

Requires Node.js 24 LTS and pnpm 11.25.0. All versions are pinned in `package.json` and `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000/portfolio-website/`. The repository base path is enabled during development too.

## Validate the production export

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview
```

The last command serves **the actual exported files** at `http://127.0.0.1:4173/portfolio-website/`, including direct route requests and old HTML entry points. `next start` is not used for `output: 'export'`.

In another terminal:

```sh
# Windows uses the installed Microsoft Edge. Linux CI uses Chromium.
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit --prod
```

Set `PLAYWRIGHT_CHANNEL=chrome` or `msedge` to select another installed Chromium-family browser. See the migration report for actual executed results; test scripts alone do not establish verification.

## Workspaces

| Route | Experiment |
| --- | --- |
| `/lab/logic-circuit/` | Connected combinational circuits, seven gate types, truth tables and challenges |
| `/lab/binary-explorer/` | 8/16/32-bit signed and unsigned BigInt arithmetic and number systems |
| `/lab/particle-sandbox/` | Adaptive particle physics, spatial hashing, gravity and waves |
| `/lab/glass-studio/` | Surface generator with exact CSS, variables and TSX exports |
| `/lab/network-studio/` | IPv4 subnet math, topology editor, educational packet forwarding |
| `/lab/motion-studio/` | SVG shapes, transform keyframes, timeline and safe SVG/TSX exports |

Saved work stays in this browser's storage. It is not synchronized or backed up. Zod validates stored models. The network workspace is a teaching simulation and does not generate real network traffic. Circuit feedback/sequential logic, real network stacks, cloud collaboration and authentication are outside this static edition.

## GitHub Pages deployment

Production is `https://shashennethmika.github.io/portfolio-website/`. `next.config.ts` sets static export, `/portfolio-website` base path, trailing slashes, and static-compatible images. Exported files live in ignored `out/`.

The authorized migration is deployed. GitHub Pages is configured to use **GitHub Actions**. The [verified release workflow](https://github.com/ShashenNethmika/portfolio-website/actions/runs/44499146951) passed all checks and deployed the exported artifact. See [the release report](docs/MIGRATION_REPORT.md#verified-production-release--19-november-2026) for live route and Lighthouse results.

For subsequent releases:

1. Run the validation commands above and review the change.
2. Push the approved change to `main`. `.github/workflows/pages.yml` installs locked packages, checks types/lint/unit tests, builds, runs desktop/mobile E2E, audits production dependencies, and deploys `out/` only after validation passes. Pull requests validate without deploying.
3. Check the Actions run and every deployed page, all six station direct URLs, legacy `/index.html`, `/pages/contact.html`, `/pages/lab.html`, portrait, sitemap and robots. Check browser errors and production Lighthouse results.

A future custom domain requires revisiting `basePath`, asset helper, canonical URLs and sitemap. Server actions, API routes, private keys and database connections cannot run on GitHub Pages. A real contact form or cross-device saves would require a separately configured service or server-capable hosting; the current contact UI uses the preserved email and WhatsApp.

## Documentation

- [Audit and preservation record](docs/AUDIT.md)
- [Architecture and extension decisions](docs/ARCHITECTURE.md)
- [Migration report and QA results](docs/MIGRATION_REPORT.md)
- [Genuine project image provenance](docs/project-image-provenance.md)

The previous manually maintained site is preserved in Git history and under `legacy/`. It is not part of the exported application. Original font licensing is retained under `public/fonts/`; the repository's original MIT license is retained.
