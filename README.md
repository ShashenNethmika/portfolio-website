# Shashen Nethmika — Ultra-Interactive Portfolio Web App

An award-winning caliber, highly immersive, interactive developer portfolio built with modern web technologies: **Three.js, GSAP 3 (ScrollTrigger & ScrollToPlugin), Lenis Smooth Scroll**, and custom CSS3 visual artistry.

---

## 🌟 Key Interactive Experiences

### 1. Main Portfolio SPA (`index.html`)
- **Cyberpunk 3D Particle Constellation (Three.js)**: Fluid 3D particle network reacting to cursor coordinates and forming dynamic glowing line connections.
- **Hardware-Accelerated Custom Cursor**: Lerped magnetic cursor ring with physics scaling on interactive elements.
- **3D Tilt & Specular Light Reflection**: Hero portrait card rotates in 3D perspective with moving specular glint highlight.
- **Lenis Smooth Scroll Engine**: Silky smooth scrolling synchronized with GSAP ScrollTrigger.
- **Selected Projects & CSS Art**: Category filters (`All`, `Web apps`, `Creative UI`) with pure CSS artwork (Vesak lantern, Sinhala & Tamil New Year sun/pot, Study Buddy dial, Weather Dashboard, FilmPotha 3D covers, and AI Cinema monitor).
- **The Lab Teaser Section**: Elegant homepage showcase introducing the 4 interactive playground stations with a direct launch CTA.
- **Animated Skill Progress Bars**: Interactive scroll-triggered skill meters in the About section.

---

### 2. The Lab — Creative Playground (`pages/lab.html`)
A standalone interactive playground featuring 4 distinct hands-on engineering stations:

1. **⚡ Station 1: Logic Circuit Studio**
   - 4 boolean logic circuit challenges (Fundamental Gate, Relay Switch, Parity Checker, Universal Gate).
   - Interactive inputs (A & B) with illuminated signal wires (`.lab__wire.is-active`) carrying live electric current.
   - Dynamic truth tables highlighting the active input/output row.
   - Realistic relay click audio synthesizer (using the Web Audio API with an on/off toggle!).

2. **🎛️ Station 2: 8-Bit Binary Matrix & Byte Explorer**
   - 8 individual bit switches (Bits 7 down to 0) with glowing cyan LED diodes.
   - Real-time conversion across 4 digital representations:
     - **Binary String** (`00101011`)
     - **Decimal (Base 10)** (`43`)
     - **Hexadecimal** (`0x2B`)
     - **ASCII Character** (`'+'`)
   - Bitwise operations toolbar: Invert (`NOT ~`), Shift Left (`<< 1`), Shift Right (`>> 1`), Clear (`0`), Set All (`255`), and Random Byte generator.

3. **🌊 Station 3: Kinetic Wave & Gravity Particle Sandbox**
   - Physics-driven fluid canvas running at 60 FPS.
   - 120 dynamic nodes floating in harmonic wave frequency.
   - Mouse gravitation: cursor exerts gravitational attraction/repulsion.
   - Click shockwaves: clicking anywhere unleashes kinetic energy ripples that scatter particles.
   - 4 neon color themes: Cyberpunk Cyan, Electric Purple, Sunset Amber, Matrix Green.

4. **💎 Station 4: Cyberpunk Glassmorphism Studio**
   - Real-time frosted glass UI generator with interactive sliders:
     - Backdrop Blur (`0px – 40px`)
     - Surface Opacity (`5% – 85%`)
     - Border Glow Radius (`0px – 60px`)
     - Accent Hue (`0° – 360°`)
   - Live refracted preview card reflecting blurred gradient light spheres.
   - 1-click **"Copy CSS Code"** button with instant clipboard confirmation.

---

### 3. Contact & Social Experience (`pages/contact.html`)
- 1-click "Copy email" button with animated tooltip feedback (`Copied! ✓`).
- Direct WhatsApp integration.
- 12 interactive social platform cards with hover elevation and accent border glows.

---

## 📁 File & Folder Structure

```
portfolio-website/
├── index.html                    # Main immersive portfolio landing page
├── README.md                     # Documentation & deploy instructions
├── pages/
│   ├── lab.html                  # The Lab & Playground (4 interactive stations)
│   └── contact.html              # Dedicated contact & social platforms page
└── assets/
    ├── css/
    │   ├── main.css              # Core tokens, typography, header, footer
    │   ├── cursor.css            # Custom magnetic cursor styles
    │   ├── hero.css              # Hero section, 3D canvas, tilt card
    │   ├── projects.css          # Projects grid, filters, and CSS art
    │   ├── lab.css               # Shared circuit engine & homepage teaser
    │   ├── lab-page.css          # Lab playground layout, binary matrix & studio
    │   ├── about.css             # Education timeline & animated skill bars
    │   ├── contact.css           # Contact CTA section styling
    │   ├── animations.css        # Keyframes, scroll reveals & micro-interactions
    │   └── contact-page.css      # Contact page grid & 12 social cards
    ├── js/
    │   ├── app.js                # Core homepage engine (Three.js, GSAP, Lenis)
    │   ├── lab.js                # The Lab engine (circuits, binary matrix, wave, glass)
    │   └── contact.js            # Contact page interactive script
    ├── fonts/
    │   ├── space-grotesk.woff    # Self-hosted Space Grotesk font
    │   └── OFL-Space-Grotesk.txt # Font license
    └── images/
        ├── profile.webp          # Optimized profile portrait
        └── mark.png              # Favicon / brand mark
```

---

## 🚀 How to Run Locally

You can preview the website by double-clicking `index.html` or using any local HTTP server:

### Option 1: Double-click
Simply double click `index.html` to open directly in Chrome, Edge, Firefox, or Safari.

### Option 2: VS Code Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 Deploying to GitHub Pages

1. Commit and push the contents of this folder to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add dedicated The Lab playground with 4 interactive stations"
   git push origin main
   ```
2. Your site will update automatically on:
   `https://shashennethmika.github.io/portfolio-website/`
