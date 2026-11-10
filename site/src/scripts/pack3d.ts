// Real-time 3D packs. Bird Feeds get a woven feed sack, Industries a kraft stand-up
// pouch with a clear window. The front label is painted on a canvas from the logo,
// the product name and the product photo, so every product gets its own pack.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

export type PackItem = { name: string; variant: string; photo?: string; c1: string; c2: string };
export type PackKind = 'sack' | 'pouch';
export type PackOptions = { kind: PackKind; logo: string; items: PackItem[]; auto?: number; drag?: boolean; onChange?: (i: number) => void };

const TW = 1024, TH = 1400;
const imgCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadImg(src?: string) {
  if (!src) return Promise.resolve(null);
  if (!imgCache.has(src)) imgCache.set(src, new Promise((res) => {
    const i = new Image(); i.crossOrigin = 'anonymous'; i.decoding = 'async';
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
  }));
  return imgCache.get(src)!;
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function fitText(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, max: number, start: number) {
  let px = start; ctx.font = font(px);
  while (ctx.measureText(text).width > max && px > 30) { px -= 4; ctx.font = font(px); }
  return px;
}
function seedPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c1: string, c2: string) {
  ctx.fillStyle = c2; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c1;
  for (let i = 0; i < 900; i++) {
    const px = x + Math.random() * w, py = y + Math.random() * h, r = 7 + Math.random() * 5;
    ctx.beginPath(); ctx.ellipse(px, py, r * 1.2, r * 0.8, Math.random() * 3, 0, 6.283); ctx.fill();
  }
}

async function paintSack(ctx: CanvasRenderingContext2D, item: PackItem, logo: HTMLImageElement | null, photo: HTMLImageElement | null, back = false) {
  const g = ctx.createLinearGradient(0, 0, TW, TH); g.addColorStop(0, '#163248'); g.addColorStop(1, '#0b1924');
  ctx.fillStyle = g; ctx.fillRect(0, 0, TW, TH);
  // woven polypropylene
  ctx.globalAlpha = 0.07; ctx.fillStyle = '#ffffff';
  for (let y = 0; y < TH; y += 9) ctx.fillRect(0, y, TW, 3);
  ctx.globalAlpha = 0.05;
  for (let x = 0; x < TW; x += 9) ctx.fillRect(x, 0, 3, TH);
  ctx.globalAlpha = 1;
  // top seal with stitching
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, TW, 96);
  ctx.strokeStyle = '#f2b21b'; ctx.lineWidth = 5; ctx.setLineDash([22, 14]);
  ctx.beginPath(); ctx.moveTo(0, 74); ctx.lineTo(TW, 74); ctx.stroke(); ctx.setLineDash([]);

  if (back) {
    ctx.fillStyle = '#f2b21b'; ctx.font = '400 150px Anton'; ctx.textAlign = 'center';
    ctx.fillText('RITHWIK', TW / 2, 560);
    ctx.fillStyle = '#7cc4ea'; ctx.font = '400 110px Anton'; ctx.fillText('BIRD FEEDS', TW / 2, 690);
    ctx.fillStyle = 'rgba(228,223,193,.8)'; ctx.font = '600 40px "Instrument Sans"';
    ['Office: Kurnool, Andhra Pradesh', 'Warehouse: Duvvur, YSR', 'WhatsApp 83097 82770', 'rithwikbirdfeeds@gmail.com'].forEach((l, i) => ctx.fillText(l, TW / 2, 860 + i * 64));
    ctx.textAlign = 'left';
    return;
  }

  // brand block
  if (logo) {
    ctx.save(); ctx.beginPath(); ctx.arc(170, 250, 96, 0, 6.283); ctx.clip();
    cover(ctx, logo, 74, 120, 192, 330); ctx.restore();
    ctx.strokeStyle = '#f2b21b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(170, 250, 96, 0, 6.283); ctx.stroke();
  }
  ctx.fillStyle = '#f2b21b'; ctx.font = '400 128px Anton'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('RITHWIK', 300, 262);
  ctx.fillStyle = '#7cc4ea'; ctx.font = '400 86px Anton'; ctx.fillText('BIRD FEEDS', 302, 350);

  // photo window
  const cx = TW / 2, cy = 735, r = 300;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.clip();
  if (photo) cover(ctx, photo, cx - r, cy - r, r * 2, r * 2); else seedPattern(ctx, cx - r, cy - r, r * 2, r * 2, item.c1, item.c2);
  const shade = ctx.createRadialGradient(cx - 90, cy - 120, 20, cx, cy, r); shade.addColorStop(0, 'rgba(255,255,255,.18)'); shade.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = shade; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.restore();
  ctx.strokeStyle = '#f2b21b'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = 'rgba(124,196,234,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r + 30, 0, 6.283); ctx.stroke();

  // name + variant
  ctx.textAlign = 'center'; ctx.fillStyle = '#e4dfc1';
  fitText(ctx, item.name.toUpperCase(), (px) => `400 ${px}px Anton`, 880, 140);
  ctx.fillText(item.name.toUpperCase(), TW / 2, 1180);
  if (item.variant) { ctx.fillStyle = '#7cc4ea'; fitText(ctx, item.variant, (px) => `600 ${px}px "Instrument Sans"`, 860, 46); ctx.fillText(item.variant, TW / 2, 1246); }
  // bottom band
  ctx.fillStyle = '#f2b21b'; ctx.fillRect(0, TH - 110, TW, 110);
  ctx.fillStyle = '#0b1924'; ctx.font = '700 38px "Instrument Sans"'; ctx.fillText('Bird feed from Kurnool, Andhra Pradesh', TW / 2, TH - 44);
  ctx.textAlign = 'left';
}

async function paintPouch(ctx: CanvasRenderingContext2D, item: PackItem, logo: HTMLImageElement | null, photo: HTMLImageElement | null, back = false) {
  ctx.fillStyle = '#c9a36b'; ctx.fillRect(0, 0, TW, TH);
  // kraft fibres
  for (let i = 0; i < 2600; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(90,60,25,.12)' : 'rgba(255,240,210,.12)';
    ctx.lineWidth = 1 + Math.random() * 1.5;
    const x = Math.random() * TW, y = Math.random() * TH, a = Math.random() * 6.28, l = 6 + Math.random() * 18;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  // top seal, tear notch and zip
  ctx.fillStyle = 'rgba(60,40,15,.18)'; ctx.fillRect(0, 0, TW, 70);
  ctx.strokeStyle = 'rgba(60,40,15,.45)'; ctx.lineWidth = 6;
  [118, 132].forEach((y) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke(); });

  if (back) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#1c2533';
    ctx.font = '400 120px Anton'; ctx.fillText('RITHWIK', TW / 2, 520);
    ctx.font = '400 92px Anton'; ctx.fillText('INDUSTRIES', TW / 2, 630);
    ctx.fillStyle = '#7a5a20'; ctx.font = 'italic 500 42px "Instrument Sans"'; ctx.fillText("Nature's grain, nurtured for you", TW / 2, 720);
    ctx.fillStyle = '#1c2533'; ctx.font = '600 38px "Instrument Sans"';
    ['Kurnool, Andhra Pradesh', 'WhatsApp 83097 82770', 'rithwikindustries@gmail.com'].forEach((l, i) => ctx.fillText(l, TW / 2, 880 + i * 62));
    ctx.textAlign = 'left';
    return;
  }

  // emblem and brand
  if (logo) { const h = 290, w = h * (logo.naturalWidth / logo.naturalHeight); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(logo, TW / 2 - w / 2, 165, w, h); ctx.globalCompositeOperation = 'source-over'; }
  ctx.textAlign = 'center'; ctx.fillStyle = '#1c2533'; ctx.font = '400 78px Anton'; ctx.fillText('RITHWIK INDUSTRIES', TW / 2, 548);
  ctx.fillStyle = '#6b4a14'; ctx.font = 'italic 500 36px "Instrument Sans"'; ctx.fillText("Nature's grain, nurtured for you", TW / 2, 598);

  // clear window
  const cx = TW / 2, cy = 860, rx = 330, ry = 205;
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.clip();
  if (photo) cover(ctx, photo, cx - rx, cy - ry, rx * 2, ry * 2); else seedPattern(ctx, cx - rx, cy - ry, rx * 2, ry * 2, item.c1, item.c2);
  const gl = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx * 0.2, cy + ry); gl.addColorStop(0, 'rgba(255,255,255,.35)'); gl.addColorStop(0.35, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,.18)');
  ctx.fillStyle = gl; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2); ctx.restore();
  ctx.strokeStyle = 'rgba(28,37,51,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(cx, cy, rx + 3, ry + 3, 0, 0, 6.283); ctx.stroke();

  // name
  ctx.fillStyle = '#1c2533';
  fitText(ctx, item.name.toUpperCase(), (px) => `400 ${px}px Anton`, 860, 128);
  ctx.fillText(item.name.toUpperCase(), TW / 2, 1185);
  if (item.variant) { ctx.fillStyle = '#5c7f4c'; fitText(ctx, item.variant, (px) => `600 ${px}px "Instrument Sans"`, 820, 44); ctx.fillText(item.variant, TW / 2, 1248); }
  ctx.fillStyle = 'rgba(28,37,51,.75)'; ctx.font = '600 32px "Instrument Sans"'; ctx.fillText('Kurnool, Andhra Pradesh', TW / 2, TH - 70);
  ctx.textAlign = 'left';
}

/** Roughness map for the pouch: the clear window is glossy, kraft is matte. */
function pouchRoughness() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 350;
  const x = c.getContext('2d')!;
  x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, 256, 350);
  x.fillStyle = '#262626'; x.beginPath(); x.ellipse(128, 860 / 4, 330 / 4, 205 / 4, 0, 0, 6.283); x.fill();
  const t = new THREE.CanvasTexture(c); return t;
}

function packGeometry(kind: PackKind, side: 1 | -1 = 1) {
  const w = 1, h = 1.37;
  const geo = new THREE.PlaneGeometry(w, h, 56, 72);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const nx = x / (w / 2), ny = y / (h / 2);
    const across = Math.pow(Math.max(0, 1 - nx * nx), kind === 'sack' ? 0.55 : 0.45);
    const along = Math.pow(Math.max(0, 1 - ny * ny), kind === 'sack' ? 0.32 : 0.22);
    let z = (kind === 'sack' ? 0.2 : 0.15) * across * along;
    if (ny > 0.86) z *= Math.max(0, (1 - ny) / 0.14); // flat top seal
    if (kind === 'pouch' && ny < -0.7) z *= 1 + (-0.7 - ny) * 1.6; // gusseted base bulges out
    // sacks pinch slightly at the top corners
    const pinch = kind === 'sack' ? 1 - 0.06 * Math.max(0, ny - 0.6) * (1 - Math.abs(nx)) : 1;
    p.setXYZ(i, x * pinch, y, z * side);
  }
  geo.computeVertexNormals();
  return geo;
}

/** True when WebGL would run on the CPU (no graphics card, or blocked). */
export function softwareGL() {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || null) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch { return true; }
}

type PackControl = { show: (i: number) => Promise<void>; next: () => Promise<void>; prev: () => Promise<void>; readonly index: number; setScrollSpin: (v: number) => void; stopAuto: () => void };

/** Light 2D version of the pack for machines without a graphics card. */
async function mountFlat(canvas: HTMLCanvasElement, opts: PackOptions): Promise<PackControl> {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  await Promise.all([document.fonts.load('400 80px Anton'), document.fonts.load('600 40px "Instrument Sans"')]).catch(() => {});
  const label = document.createElement('canvas'); label.width = TW; label.height = TH;
  const lctx = label.getContext('2d')!;
  const ctx = canvas.getContext('2d')!;
  const logo = await loadImg(opts.logo);
  const paint = opts.kind === 'sack' ? paintSack : paintPouch;
  let index = 0;
  const render = () => {
    const dpr = Math.min(devicePixelRatio, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ph = h * 0.82, pw = ph * (TW / TH), x = (w - pw) / 2, y = (h - ph) / 2 - h * 0.02;
    ctx.clearRect(0, 0, w, h);
    const sh = ctx.createRadialGradient(w / 2, y + ph + 14, 0, w / 2, y + ph + 14, pw * 0.6);
    sh.addColorStop(0, 'rgba(0,0,0,.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, y + ph - 20, w, 70);
    ctx.save(); ctx.beginPath(); (ctx as any).roundRect?.(x, y, pw, ph, 14) ?? ctx.rect(x, y, pw, ph); ctx.clip();
    ctx.drawImage(label, x, y, pw, ph);
    const g = ctx.createLinearGradient(x, 0, x + pw, 0); // pillow shading
    g.addColorStop(0, 'rgba(0,0,0,.32)'); g.addColorStop(0.18, 'rgba(255,255,255,.08)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(0.85, 'rgba(0,0,0,.1)'); g.addColorStop(1, 'rgba(0,0,0,.38)');
    ctx.fillStyle = g; ctx.fillRect(x, y, pw, ph); ctx.restore();
  };
  const draw = async (i: number) => { const it = opts.items[i]; await paint(lctx, it, logo, await loadImg(it.photo)); render(); };
  await draw(0);
  new ResizeObserver(render).observe(canvas);
  let busy = false;
  const show = async (i: number) => {
    if (busy || i === index) return; busy = true;
    index = (i + opts.items.length) % opts.items.length; opts.onChange?.(index);
    if (reduce) { await draw(index); busy = false; return; }
    await gsap.to(canvas, { rotateY: 90, duration: 0.35, ease: 'power2.in', transformPerspective: 900 });
    await draw(index);
    await gsap.to(canvas, { rotateY: 0, duration: 0.5, ease: 'back.out(1.6)' });
    busy = false;
  };
  let timer = 0;
  const startAuto = () => { if (opts.auto && !reduce) timer = window.setInterval(() => show(index + 1), opts.auto); };
  const stopAuto = () => clearInterval(timer);
  startAuto();
  return { show, next: () => show(index + 1), prev: () => show(index - 1), get index() { return index; }, setScrollSpin: () => {}, stopAuto };
}

export async function mountPack(canvas: HTMLCanvasElement, opts: PackOptions): Promise<PackControl> {
  if (softwareGL()) return mountFlat(canvas, opts);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  await Promise.all([document.fonts.load('400 80px Anton'), document.fonts.load('600 40px "Instrument Sans"'), document.fonts.load('italic 500 40px "Instrument Sans"')]).catch(() => {});

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.kind === 'sack' ? 0.9 : 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.05, 3.3);

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(opts.kind === 'sack' ? 0x7cc4ea : 0xffd9a0, 1.4); rim.position.set(-3, 1, -2); scene.add(rim);

  // front + back faces
  const mk = () => { const c = document.createElement('canvas'); c.width = TW; c.height = TH; return c; };
  const frontC = mk(), backC = mk();
  const frontT = new THREE.CanvasTexture(frontC), backT = new THREE.CanvasTexture(backC);
  [frontT, backT].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
  const matOpts = opts.kind === 'sack'
    ? { roughness: 0.82, metalness: 0, sheen: 0.18, sheenRoughness: 0.9, sheenColor: new THREE.Color(0x7cc4ea) }
    : { roughness: 1, roughnessMap: pouchRoughness(), metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5 };
  const front = new THREE.Mesh(packGeometry(opts.kind, 1), new THREE.MeshPhysicalMaterial({ map: frontT, ...matOpts }));
  const back = new THREE.Mesh(packGeometry(opts.kind, 1), new THREE.MeshPhysicalMaterial({ map: backT, ...matOpts }));
  back.rotation.y = Math.PI; // the back is the same pillow shape turned round
  const pack = new THREE.Group(); pack.add(front, back);
  const rig = new THREE.Group(); rig.add(pack); scene.add(rig);

  // soft contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d')!; const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sg.addColorStop(0, 'rgba(0,0,0,.45)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.82; scene.add(shadow);

  const [logo] = await Promise.all([loadImg(opts.logo)]);
  const paint = opts.kind === 'sack' ? paintSack : paintPouch;
  await paint(backC.getContext('2d')!, opts.items[0], logo, null, true); backT.needsUpdate = true;
  let index = 0;
  async function draw(i: number) {
    const item = opts.items[i];
    const photo = await loadImg(item.photo);
    await paint(frontC.getContext('2d')!, item, logo, photo);
    frontT.needsUpdate = true;
  }
  await draw(0);
  // warm the cache for the next few photos
  opts.items.slice(1, 6).forEach((it) => loadImg(it.photo));

  // sizing + render loop
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 3.9 : 3.3;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  size(); new ResizeObserver(size).observe(canvas);

  // Render on demand: the GPU only works while something changes (a spin, a drag,
  // scrolling, the pointer). The gentle idle float is done in CSS on the canvas.
  let visible = true, dirty = true, dragY = 0, dragV = 0, tiltX = 0, tiltY = 0, scrollSpin = 0;
  const wake = () => { dirty = true; };
  const tick = () => {
    if (!visible || document.hidden) return;
    if (Math.abs(dragV) > 1e-4) { dragY += dragV; dragV *= 0.92; dirty = true; }
    if (!dirty) return;
    dirty = false;
    rig.rotation.y = dragY + scrollSpin + tiltY - 0.25;
    rig.rotation.x = tiltX;
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(canvas);

  // pointer: tilt on hover, drag to spin
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tiltY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
    tiltX = ((e.clientY - r.top) / r.height - 0.5) * 0.25;
    wake();
  });
  canvas.addEventListener('pointerleave', () => { const o = { x: tiltX, y: tiltY }; gsap.to(o, { x: 0, y: 0, duration: 0.8, onUpdate: () => { tiltX = o.x; tiltY = o.y; wake(); } }); });
  if (opts.drag !== false) {
    let lastX = 0, dragging = false;
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; dragY += dx * 0.012; dragV = dx * 0.004; wake(); });
    const up = () => { dragging = false; canvas.style.cursor = 'grab'; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.style.cursor = 'grab';
  }

  // swap product with a full spin; the label changes when the pack is edge-on
  let busy = false;
  async function show(i: number) {
    if (busy || i === index) return;
    busy = true; index = (i + opts.items.length) % opts.items.length;
    opts.onChange?.(index);
    if (reduce) { await draw(index); wake(); busy = false; return; }
    const o = { a: 0 }; let swapped = false;
    const start = dragY;
    await new Promise<void>((done) => gsap.to(o, {
      a: Math.PI * 2, duration: 1.15, ease: 'power3.inOut',
      onUpdate: () => { dragY = start + o.a; wake(); if (!swapped && o.a > Math.PI / 2) { swapped = true; draw(index).then(wake); } },
      onComplete: () => done(),
    }));
    gsap.fromTo(rig.scale, { x: 0.94, y: 1.06 }, { x: 1, y: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)', onUpdate: wake });
    busy = false;
  }

  let timer = 0;
  const startAuto = () => { if (opts.auto && !reduce) timer = window.setInterval(() => visible && show(index + 1), opts.auto); };
  const stopAuto = () => clearInterval(timer);
  startAuto();
  canvas.addEventListener('pointerdown', () => { stopAuto(); clearTimeout((canvas as any)._resume); (canvas as any)._resume = setTimeout(startAuto, 8000); });

  // entrance: the pack drops in and settles
  if (!reduce) { gsap.from(rig.position, { y: 1.4, duration: 1.4, ease: 'bounce.out', onUpdate: wake }); gsap.from(rig.rotation, { z: 0.5, duration: 1.4, ease: 'power3.out', onUpdate: wake }); }

  return {
    show,
    next: () => show(index + 1),
    prev: () => show(index - 1),
    get index() { return index; },
    setScrollSpin: (v: number) => { scrollSpin = v; wake(); },
    stopAuto,
  };
}
