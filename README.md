# Projectrithwik

Website for **Rithwik Bird Feeds** and **Rithwik Industries**, Kurnool.

The site opens as a book. The cover turns to show two pages, Bird Feeds and Human Food, and each page opens a complete site of its own: header, intro, products with photos, vision and mission, how to order, contact form and footer. `#bird-feeds` and `#human-food` link straight to each site.

## Stack

- [Astro 5](https://astro.build) (static output, TypeScript)
- GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) and Lenis smooth scrolling
- cobe WebGL globe for the vision section
- Native View Transitions API for switching between the book and the two sites
- Product photos from Wikimedia Commons (free licences, credited on the site)

## Layout

- `site/` is the Astro source.
- The repository root holds the built website (`index.html`, `_astro/`, ...), which GitHub Pages serves from `main`.

## Editing products

Everything is in `site/src/data/products.ts`: names, crop or grade options, GST rates and swatch colours. Photo links and credits are in `site/src/data/commons.json`.

## Commands

```
cd site
npm install
npm run dev       # local preview at http://localhost:4321/Projectrithwik
npm run build     # builds and copies the site to the repository root
```

Commit and push after `npm run build`; GitHub Pages picks it up in a minute or two.
