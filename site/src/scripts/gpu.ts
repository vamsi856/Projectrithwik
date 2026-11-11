/** True when graphics would run on the CPU (no graphics card, or it is blocked). Asked once. */
let cached: boolean | undefined;
export function softwareGL() {
  if (cached !== undefined) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || null) as WebGLRenderingContext | null;
    if (!gl) return (cached = true);
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return (cached = /swiftshader|llvmpipe|software|basic render/i.test(name));
  } catch { return (cached = true); }
}
