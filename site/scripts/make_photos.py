# Builds the self-hosted photo set: every photo in src/data/commons.json at a few widths
# (480/800/1280), as AVIF and WebP, into public/img, and writes src/data/photo-sizes.json.
# Run from anywhere: python3 site/scripts/make_photos.py   (needs: pip install pillow pillow-heif)
# Existing files are never overwritten: to redo a photo, delete public/img/<key>-* first.
# Client photos live in site/photo-src/<file>.webp (commons entry has own:true, local:'photos/<file>.webp').
import json, os
from PIL import Image, ImageOps
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(f'{SITE}/src/data/commons.json'))
SIZES = f'{SITE}/src/data/photo-sizes.json'
old = json.load(open(SIZES)) if os.path.exists(SIZES) else {}
OUT = f'{SITE}/public/img'
WIDTHS = [480, 800, 1280]
man = {}
for k, r in d.items():
    if r.get('local'):
        src = f"{SITE}/photo-src/" + r["local"].split("/")[-1]
    else:
        src = None  # stock photo: its original isn't kept in the repo, only the sizes already made
    if not src or not os.path.exists(src):
        # already built earlier: keep it as it is
        if k in old and all(os.path.exists(f'{OUT}/{k}-{w}.webp') for w in old[k]['widths']):
            man[k] = old[k]; continue
        print('MISSING', k); continue
    im = Image.open(src); im = ImageOps.exif_transpose(im)
    alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alpha else 'RGB')
    ws = [w for w in WIDTHS if w < im.width] + ([im.width] if im.width <= WIDTHS[-1] else [])
    ws = sorted(set(min(w, im.width) for w in ws))
    for w in ws:
        h = round(im.height * w / im.width)
        r2 = im.resize((w, h), Image.LANCZOS) if w != im.width else im
        for ext, kw in (('webp', dict(quality=78, method=6)), ('avif', dict(quality=58, speed=5))):
            p = f'{OUT}/{k}-{w}.{ext}'
            if not os.path.exists(p): r2.save(p, ext.upper(), **kw)
    man[k] = {'w': im.width, 'h': im.height, 'widths': ws}
json.dump(man, open(SIZES, 'w'), indent=0, sort_keys=True)
tot = sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))
print(len(man), 'photos', round(tot / 1e6, 1), 'MB')
