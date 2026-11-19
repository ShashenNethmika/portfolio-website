# Project image provenance

Repository trees were inspected read-only through the connected GitHub API on 19 November 2026. The portfolio's original checkout contains only the portrait and brand mark; its original project previews are CSS artwork.

| Project repository | Inspected main tree SHA | Image assets found in repository | Screenshot status |
| --- | --- | --- | --- |
| [Vesak Card Generator](https://github.com/ShashenNethmika/Vesak-Card-Generator) | `2f00b2aa034ae4073e8a2c2a7722fadb35bef21f` | Six original greeting-card templates, `Wish 01.png` through `Wish 06.png`, plus a donation QR image. No UI screenshot. | Captured, visually reviewed, optimized to WebP |
| [Sinhala & Tamil New Year Wish](https://github.com/ShashenNethmika/Sinhala-and-Tamil-New-Year-Wish) | `eef0694809c57a1d02fb67e8b5cbc1fc1f852caf` | Original greeting artwork `Post.jpg`, plus a donation QR image. No UI screenshot. | Captured, visually reviewed, optimized to WebP |
| [Study Buddy Timer](https://github.com/ShashenNethmika/Study-Buddy-Timer) | `ef5d2d014d92aceedacbfe1b371e7aba22c7bc2a` | No image files. | Captured, visually reviewed, optimized to WebP |
| [Weather Forecast](https://github.com/ShashenNethmika/Weather-Forecast) | `4b4d03282be735a5d5f8547c463eb0c91f91da26` | No image files. | Captured, visually reviewed, optimized to WebP |
| [FilmPotha](https://github.com/ShashenNethmika/FilmPotha) | `6d33a5f080b477c4e4ca72728af2aeb942a18ce8` | No image files. | Captured, visually reviewed, optimized to WebP |

The greeting-card artwork and donation QR images are not presented as screenshots of the applications. No AI Cinema screenshot is available from the supplied portfolio; its creative preview is explicitly artwork.

## Reproducing authentic captures

After installing project dependencies, run `node --experimental-strip-types scripts/capture-project-demos.ts`. Windows uses the installed Microsoft Edge. Other systems use Playwright Chromium; `PLAYWRIGHT_CHANNEL` can override the browser channel.

The script visits each repository's verified GitHub Pages homepage and requires HTTP success, the inspected source's exact page title, the expected application control, a loaded local stylesheet, and no broken visible images. It captures the real application at 1280 × 850 without replacing content or mocking API responses. The New Year application is exercised with the owner's name and its own Generate button. Failed captures are omitted rather than substituted with artwork or error pages.

Successful files are saved to `public/images/projects/<project-slug>.webp` when Next's existing Sharp dependency is available and conversion reduces size; otherwise the verified PNG is retained. This changes encoding only. The generated `docs/project-capture-manifest.json` records source URLs, inspected tree SHA, actions, timestamp, actual file paths, byte counts, the original PNG's SHA-256, and any failures. Review the resulting screenshots before using them in project cards. The script does not modify any remote project.
