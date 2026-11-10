# Projectrithwik

Website for **Rithwik Bird Feeds** and **Rithwik Industries**, Kurnool.

The site opens as a book. The cover turns to show two pages: Bird Feeds on the left, Human Food on the right. Clicking a page turns you into that catalogue. Below the book are the bird feed list, the human food range (millets, seeds and super foods, dals, pulses and spices), and a price-enquiry form that sends the request on WhatsApp.

## Files

- `index.html`: the page (generated, see below)
- `assets/css/site.css`, `assets/js/site.js`: styles and behaviour
- `assets/vendor/`: GSAP (ScrollTrigger, SplitText, MotionPath) and Lenis, served locally
- `assets/fonts/`: Anton and Instrument Sans, self-hosted
- `assets/img/`: logos cut from the catalogue, product photos
- `assets/Rithwik-Catalogue.pdf`: the downloadable catalogue

## Changing products

Product names, notes, GST rates and swatch colours live in `src/build.py`. Edit them, then run:

```
python3 src/build.py
```

That rewrites `index.html` from `src/index.tpl.html`.

## Running locally

Any static server works:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
