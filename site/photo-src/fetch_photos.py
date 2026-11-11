import json, re, sys, time, os, urllib.request, urllib.error
d = json.load(open('/home/claude/Projectrithwik/site/src/data/commons.json'))
UA = 'RithwikSiteBuilder/1.0 (https://vamsi856.github.io/Projectrithwik/; noreply@anthropic.com)'
OUT = '/home/claude/photo-src'
def thumb(u, w):
    m = re.match(r'^(https://upload\.wikimedia\.org/wikipedia/commons/)(.+/)([^/]+)$', u)
    root, dr, f = m.groups()
    return f'{root}thumb/{dr}{f}/{w}px-{f}'
for k, r in d.items():
    if r.get('local'): continue
    ext = '.png' if r['u'].lower().endswith('.png') else '.jpg'
    path = f'{OUT}/{k}{ext}'
    if os.path.exists(path) and os.path.getsize(path) > 1000: continue
    url = thumb(r['u'], 1280) if r['w'] > 1280 else r['u']
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            data = urllib.request.urlopen(req, timeout=60).read()
            open(path, 'wb').write(data); print('ok', k, len(data) // 1024, 'KB', flush=True); break
        except urllib.error.HTTPError as e:
            wait = 5 * (attempt + 1) if e.code == 429 else 3
            print('http', e.code, k, 'retry in', wait, flush=True); time.sleep(wait)
        except Exception as e:
            print('err', k, e, flush=True); time.sleep(4)
    time.sleep(1.2)
print('done')
