# Migration snapshot — not deployment-ready

Source implementation is saved on `codex/portfolio-lab-migration`. Original HTML/CSS/JavaScript remains available for rollback. Next.js App Router source lives in `src/`, original visual assets are copied to `public/`, and six independent Lab feature directories contain UI and calculation engines.

See `AUDIT.md` for preserved content and original defects, and `ARCHITECTURE.md` for components, runtime boundaries and deployment decisions. No legacy source files have been removed. Terrain is absent from the replacement.

## Verification still required

Dependency installation was interrupted by repeated registry transfer timeouts. The existing `pnpm-lock.yaml` is incomplete and must be regenerated successfully before using frozen installs or CI. Type checking, lint, unit tests, E2E, production build, visual QA, Lighthouse, dependency audit and real project screenshot captures have not completed. Prepared test suites are not passing-test evidence.

The source includes all six station implementations, portfolio routes, compatibility routes, contact links and local persistence. Their behavior must still be verified in a browser. No deployment or post-deployment route verification has occurred. This branch is a review/backup snapshot, not a release.

## Next validation steps

1. Complete `pnpm install` and finalize the lockfile.
2. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and fix failures.
3. Build with `pnpm build`; run `pnpm test:e2e` against the static output.
4. Capture and review genuine project screenshots; audit performance and dependencies.
5. Review and approve before merging to main or changing GitHub Pages settings.

The workflow in `.github/workflows/pages.yml` is configured for the exported `out/` directory and the `/portfolio-website` base path. Publishing remains a separate approved step. No backend, authentication, database, secret-bearing service or live email form has been introduced.
