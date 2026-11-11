# Builds the self-hosted photo set: every product/scene photo at a few widths, as AVIF and WebP.
import json, os, sys
from PIL import Image, ImageOps
SITE = '/home/claude/Projectrithwik/site'
d = json.load(open(f'{SITE}/src/data/commons.json'))
OUT = f'{SITE}/public/img'
WIDTHS = [480, 800, 1280]
man = {}
for k, r in d.items():
    if r.get('local'):
        src = f"{SITE}/photo-src/" + r["local"].split("/")[-1]
    else:
        src = next((f'/home/claude/photo-src/{k}{e}' for e in ('.jpg', '.png') if os.path.exists(f'/home/claude/photo-src/{k}{e}')), None)
    if not src or not os.path.exists(src):
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
json.dump(man, open(f'{SITE}/src/data/photo-sizes.json', 'w'), indent=0, sort_keys=True)
tot = sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))
print(len(man), 'photos', round(tot / 1e6, 1), 'MB')
