# Shashen Nethmika · Portfolio

A static portfolio with a sculptable Terrain Studio, a pointer-reactive portrait, a six-project case study explorer, and Signal Lab, a browser-based logic circuit playground.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` in a browser. Use an HTTP server so the browser can load the JavaScript modules.

## Structure

- `index.html` contains the portfolio, project catalogue, and Signal Lab.
- `pages/contact.html` contains direct contact links and social profiles.
- `assets/css/` contains the shared theme and page or feature styles.
- `assets/js/` contains the shared site controls, the home entry module, and the hero, project explorer, and Signal Lab modules.
- `assets/js/terrain/` contains the interactive terrain editor and the landscape renderer used for both the live canvas and PNG exports. Each preset keeps its own relief and undo history during the visit.
- `assets/fonts/` and `assets/images/` contain the self-hosted font, optimized portrait, and site icon.
- `images/profile.png` is the original portrait.

GitHub Pages serves the root directory from `main`. The site has no build, package installation, or backend step. Home and contact remain readable with JavaScript disabled, and motion enhancements respect the system reduced-motion setting.
