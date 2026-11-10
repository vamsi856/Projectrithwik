# Projectrithwik

Website for **Rithwik Bird Feeds** and **Rithwik Industries**, Kurnool.

The site opens as a book. The cover turns to show two pages, Bird Feeds and Human Food, and each page opens a complete site of its own: header, intro, products with photos, vision and mission, how to order, contact form and footer. `#bird-feeds` and `#human-food` link straight to each site.

## Stack

- [Astro 5](https://astro.build) (static output, TypeScript)
- GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) and Lenis smooth scrolling
- cobe WebGL globe for the vision section
- Native View Transitions API for switching between the book and the two sites
- Product photos from Wikimedia Commons (free licences, credited on the site)

## Editing products

Everything is in `src/data/products.ts`: names, crop or grade options, GST rates and swatch colours. Photo links and credits are in `src/data/commons.json`.

## Commands

```
npm install
npm run dev       # local preview at http://localhost:4321/Projectrithwik
npm run build     # static site in dist/
npm run deploy    # build and publish dist/ to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch.
