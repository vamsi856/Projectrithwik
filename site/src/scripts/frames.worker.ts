// Cuts a bird sprite sheet into one bitmap per frame (plus a smaller, high-quality copy of
// each) away from the page, so loading the birds never makes scrolling or tapping stutter.
// The bitmaps are handed back to the page without copying.
type Job = { id: number; src: string; fw: number; fh: number; cols: number; count: number; hs: number; lite: boolean };

self.onmessage = async (e: MessageEvent<Job>) => {
  const { id, src, fw, fh, cols, count, hs, lite } = e.data;
  try {
    const blob = await (await fetch(src)).blob();
    const sheet = await createImageBitmap(blob);
    const hw = Math.round(fw * hs), hh = Math.round(fh * hs);
    const frames: { full: ImageBitmap | null; half: ImageBitmap | null }[] = [];
    const moved: ImageBitmap[] = [];
    for (let i = 0; i < count; i++) {
      const sx = (i % cols) * fw, sy = Math.floor(i / cols) * fh;
      const full = lite ? null : await createImageBitmap(sheet, sx, sy, fw, fh);
      let half: ImageBitmap | null = null;
      try { half = await createImageBitmap(sheet, sx, sy, fw, fh, { resizeWidth: hw, resizeHeight: hh, resizeQuality: 'high' }); } catch { /* full only */ }
      frames.push({ full, half });
      if (full) moved.push(full);
      if (half) moved.push(half);
    }
    sheet.close();
    (self as unknown as Worker).postMessage({ id, frames }, moved);
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
