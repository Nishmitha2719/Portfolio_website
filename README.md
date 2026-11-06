# Nishmitha Shetty: portfolio (v2)

A dependency-free static site: plain HTML, CSS and JavaScript with a hand-written WebGL shader and a canvas particle engine. No build step. Deploy the folder as-is to Vercel, Netlify or GitHub Pages.

## Files

- `index.html`: page structure, SEO metadata and the research section's static figures
- `css/site.css`: design tokens, layout, animation and responsive rules
- `js/data.js`: **all content** (projects, skills, timeline, contact links, publication)
- `js/visuals.js`: the project-specific generative SVG artwork
- `js/background.js`: nebula shader and the particle system that forms the name and morphs per section
- `js/app.js`: cursor, magnetic buttons, nav, skills constellation, project filter and detail panel, research charts, timeline
- `assets/portrait.jpg`: cropped from `src/assets/profile-photo.jpg`

## Fill in when available

In `js/data.js`:

- `publication.title`: the exact IEEE paper title (it replaces the descriptive heading in Study 1)
- `publication.url`: the IEEE Xplore / DOI link (a "Read on IEEE Xplore" link and a panel button appear automatically)
- any project's `links`: add `["GitHub", "https://..."]` or `["Live demo", "https://..."]` and the buttons appear; nothing is shown while a link is missing

## Run locally

    python3 -m http.server 8000

then open http://localhost:8000.

## Accessibility and performance

- Respects `prefers-reduced-motion` (static particles, no scrubbing or count-ups)
- Custom cursor only on fine pointers; keyboard focus is visible throughout; the project panel traps focus and closes on Escape
- Shader renders at half resolution; particle count drops on small screens; animation pauses when the tab is hidden or a figure is off-screen
- Projects are deep-linkable: `#canopycare`, `#rf-drone-detection` and so on
