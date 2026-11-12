# Natural edges for the flying birds: no drawn rim, no glow. The cut-out line is pulled in
# past the sky fringe, the edge colour is taken from the feathers just inside it, and the
# edge is feathered like a real (slightly soft) photographed outline. Loose specks are dropped.
import sys, os, numpy as np, cv2
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
FW, FH, COLS = 1062, 725, 3
def nat(cell):
    a = cell[..., 3].astype(np.float32) / 255
    rgb = cell[..., :3].copy()
    solid = (a > 0.5).astype(np.uint8)
    # join up the thin tail feathers where the cut-out broke them, then keep the bird and drop loose specks
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(solid, 8)
    if n > 2:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        keep = np.isin(lab, [i for i in range(1, n) if i == big or st[i, cv2.CC_STAT_AREA] > 0.004 * st[big, cv2.CC_STAT_AREA]])
        solid = keep.astype(np.uint8)
    # pull the outline in ~2 px, past the bright sky fringe
    core = cv2.erode(solid, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    # edge colours come from the feathers just inside
    inner = cv2.erode(((a > 0.5) & (solid > 0)).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    fill = cv2.inpaint(rgb, (1 - inner).astype(np.uint8), 4, cv2.INPAINT_TELEA)
    band = cv2.GaussianBlur(inner.astype(np.float32), (0, 0), 1.5)[..., None]
    col = rgb.astype(np.float32) * band + fill.astype(np.float32) * (1 - band)
    # a touch of life, no more
    hsv = cv2.cvtColor(np.clip(col, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.06, 0, 255); hsv[..., 2] = np.clip(hsv[..., 2] * 1.04 + 3, 0, 255)
    col = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    # soft photographic edge
    alpha = cv2.GaussianBlur(core.astype(np.float32), (0, 0), 1.3)
    alpha = np.clip((alpha - 0.08) / 0.84, 0, 1)
    return np.dstack([col, (alpha * 255).astype(np.uint8)])
for name in sys.argv[3:]:
    sh = np.array(Image.open(f'{src}/{name}').convert('RGBA'))
    for r in range(sh.shape[0] // FH):
        for c in range(COLS):
            cell = sh[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW]
            if cell[..., 3].max() == 0: continue
            sh[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = nat(cell)
    Image.fromarray(sh).save(f'{dst}/{name}', quality=90, method=6, alpha_quality=95)
    print(name, os.path.getsize(f'{dst}/{name}') // 1024, 'KB')
