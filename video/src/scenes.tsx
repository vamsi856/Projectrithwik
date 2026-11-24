// The scenes: the opening in a browser window, a recorded shot, and the end card.
import React from 'react';
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { DISPLAY, GOLD, INK, KHAKI, NAVY, NAVY_2, NAVY_3, PAPER, TEXT } from './look';
import { Caption, Dust, Pointer, clamp } from './parts';
import { FPS, OPEN, segmentStart } from './timeline';

const footage = (dir: string, clip: string) => staticFile(`${dir}/${clip}.mp4`);

/* ------------------------------------------------------------------ the opening */
const URL_TEXT = 'rithwikbirdfeeds.com';
const CHROME = 88; // tab strip + toolbar, in page pixels

export const OpenScene: React.FC<{ dir: string }> = ({ dir }) => {
  const f = useCurrentFrame();
  const appear = interpolate(f, [0, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const zoom = interpolate(f, [OPEN.zoom[0], OPEN.zoom[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const s = (0.74 + appear * 0.04) * (1 - zoom) + zoom;
  const x = (1920 - 1920 * s) / 2;
  const yCentred = (1080 - (1080 + CHROME) * s) / 2 + CHROME * s;
  const y = yCentred * (1 - zoom);
  const typed = Math.round(interpolate(f, [OPEN.typeFrom, OPEN.typeTo], [0, URL_TEXT.length], clamp));
  const entered = f >= OPEN.enter;
  const caret = !entered && Math.floor(f / 8) % 2 === 0;
  const loading = interpolate(f, [OPEN.enter, OPEN.footage + 4], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const siteIn = interpolate(f, [OPEN.footage, OPEN.footage + 8], [0, 1], clamp);
  // the camera starts close on the address bar, so the address can be read on a TV, and pulls
  // back to the whole window as the site loads
  const pull = interpolate(f, [OPEN.enter - 2, OPEN.footage + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const K = 2.5, focus = { x: 470, y: 64 }, target = { x: 900, y: 560 };
  const P = { x: x + focus.x * s, y: y - CHROME * s + focus.y * s };
  const cam = K + (1 - K) * pull;
  const tx = (target.x - K * P.x) * (1 - pull), ty = (target.y - K * P.y) * (1 - pull);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${NAVY_3} 0%, ${NAVY} 70%)` }}>
      <Dust opacity={1 - zoom} />
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${cam})`, transformOrigin: '0 0' }}>
      <div style={{ position: 'absolute', left: x, top: y - CHROME * s, width: 1920, height: 1080 + CHROME, transform: `scale(${s})`, transformOrigin: '0 0', opacity: appear,
        borderRadius: 22 * (1 - zoom), overflow: 'hidden', boxShadow: `0 40px 120px rgba(0,0,0,${0.55 * (1 - zoom)})` }}>
        {/* tab strip */}
        <div style={{ height: 40, background: '#d9d4c4', display: 'flex', alignItems: 'flex-end', paddingLeft: 22, gap: 18 }}>
          <div style={{ display: 'flex', gap: 9, alignSelf: 'center' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          </div>
          <div style={{ marginLeft: 20, width: 360, height: 32, background: '#f4f1e8', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontFamily: TEXT, fontSize: 16, color: INK }}>
            {f >= OPEN.footage ? <Img src={staticFile('brand/icon-192.png')} style={{ width: 18, height: 18, borderRadius: 4 }} /> : <span style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid #9a9688` }} />}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f >= OPEN.footage ? 'Rithwik Bird Feeds & Rithwik Industries' : 'New Tab'}</span>
          </div>
        </div>
        {/* toolbar */}
        <div style={{ height: CHROME - 40, background: '#f4f1e8', display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', borderBottom: '1px solid #d9d4c4' }}>
          <svg width="74" height="20" viewBox="0 0 74 20" fill="none" stroke="#6e6a5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4 6 10l6 6" /><path d="M34 4l6 6-6 6" opacity=".45" /><path d="M66 6a6.5 6.5 0 1 0 1.6 6.4M68 3v4h-4" />
          </svg>
          <div style={{ flex: 1, maxWidth: 1180, height: 34, borderRadius: 17, background: '#e7e2d4', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', fontFamily: TEXT, fontSize: 19, color: INK }}>
            {entered && (
              <svg width="14" height="16" viewBox="0 0 14 16"><rect x="1.5" y="7" width="11" height="8" rx="2" fill="#6e6a5e" /><path d="M4 7V5a3 3 0 0 1 6 0v2" stroke="#6e6a5e" strokeWidth="2" fill="none" /></svg>
            )}
            <span>{URL_TEXT.slice(0, typed)}</span>
            <span style={{ width: 2, height: 22, background: INK, marginLeft: -8, opacity: caret ? 1 : 0 }} />
          </div>
        </div>
        {/* the page */}
        <div style={{ position: 'relative', width: 1920, height: 1080, background: '#f5f2ea', overflow: 'hidden' }}>
          {loading > 0 && f < OPEN.footage + 10 && <div style={{ position: 'absolute', left: 0, top: 0, height: 5, width: `${loading * 100}%`, background: GOLD, zIndex: 3, opacity: 1 - siteIn }} />}
          <Sequence from={OPEN.footage} layout="none">
            <div style={{ position: 'absolute', inset: 0, opacity: siteIn }}>
              <OffthreadVideo src={footage(dir, 'open')} muted style={{ width: 1920, height: 1080 }} />
            </div>
          </Sequence>
          <Pointer from={[1460, 900]} to={[OPEN.click.x, OPEN.click.y]} show={OPEN.cursorIn} arrive={OPEN.click.at - 6} click={OPEN.click.at} hide={OPEN.click.at + 14} />
        </div>
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ a recorded shot */
export const ClipShot: React.FC<{ dir: string; clip: 'bird' | 'food'; seg: string; offset: number; frames: number; caption?: string }> = ({ dir, clip, seg, offset, frames, caption }) => {
  const f = useCurrentFrame();
  // a slow push-in, like a camera move
  const push = interpolate(f, [0, frames], [1, 1.045], clamp);
  return (
    <AbsoluteFill style={{ background: clip === 'food' ? KHAKI : NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <OffthreadVideo src={footage(dir, clip)} muted trimBefore={segmentStart(clip, seg) + Math.round(offset * FPS)} style={{ width: 1920, height: 1080 }} />
      </AbsoluteFill>
      {caption && <Caption text={caption} frames={frames} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ the end card */
export const EndCard: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = (at: number) => spring({ frame: f - at, fps, config: { damping: 200, mass: 0.9 } });
  const up = (at: number, dist = 26) => ({ opacity: rise(at), transform: `translateY(${(1 - rise(at)) * dist}px)` });
  const cards = rise(4);
  const sheen = interpolate(f % 110, [20, 70], [-60, 160], clamp);
  const out = interpolate(f, [frames - 10, frames], [0, 1], clamp);
  const page = (bg: string, rot: number, dx: number, child: React.ReactNode, z: number) => (
    <div style={{ position: 'absolute', left: 360 + dx, top: 540 - 230, width: 320, height: 460, borderRadius: 18, background: bg, overflow: 'hidden', zIndex: z,
      boxShadow: '0 30px 80px rgba(0,0,0,.45)', border: `2px solid ${rot < 0 ? 'rgba(242,178,27,.55)' : 'rgba(160,122,44,.45)'}`,
      transform: `translateY(${(1 - cards) * 60}px) rotate(${rot * cards}deg)`, opacity: cards }}>{child}</div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 45%, ${NAVY_3} 0%, ${NAVY_2} 35%, ${NAVY} 80%)`, fontFamily: TEXT, color: PAPER }}>
      <Dust count={60} />
      {/* the two businesses, as the two pages of the book */}
      {page(NAVY, -7, -150, <Img src={staticFile('brand/birdfeeds-emblem.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />, 1)}
      {page(PAPER, 6, 150, <Img src={staticFile('brand/industries-emblem.png')} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 26 }} />, 2)}

      <div style={{ position: 'absolute', left: 900, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ ...up(10), fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.95, letterSpacing: '0.01em',
          backgroundImage: `linear-gradient(100deg, transparent ${sheen - 12}%, rgba(255,255,255,.85) ${sheen}%, transparent ${sheen + 12}%), linear-gradient(180deg, #ffe08a 0%, ${GOLD} 55%, #b8860b 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>RITHWIK</div>
        <div style={{ ...up(18), fontSize: 40, fontWeight: 600, marginTop: 14, letterSpacing: '0.02em' }}>Bird Feeds &amp; Industries</div>
        <div style={{ ...up(24), fontSize: 27, marginTop: 10, color: 'rgba(239,234,219,.72)' }}>Kurnool, Andhra Pradesh · trading grain since 1925</div>
        <div style={{ height: 3, width: 140 * rise(32), background: GOLD, margin: '38px 0 30px', borderRadius: 2 }} />
        <div style={{ ...up(38), fontSize: 22, fontWeight: 700, letterSpacing: '0.22em', color: GOLD }}>CALL OR WHATSAPP</div>
        <div style={{ ...up(44), fontFamily: DISPLAY, fontSize: 118, lineHeight: 1.05, color: '#fff', letterSpacing: '0.02em' }}>92455 55556</div>
        <div style={{ ...up(54), marginTop: 22, alignSelf: 'flex-start', fontSize: 31, fontWeight: 600, padding: '12px 30px 14px', borderRadius: 40, border: `2px solid ${GOLD}`, color: PAPER }}>rithwikbirdfeeds.com</div>
      </div>

      <div style={{ ...up(70, 10), position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontSize: 17, color: 'rgba(239,234,219,.45)' }}>
        Some product and bird photos: Wikimedia Commons contributors (CC BY / CC BY-SA). Full credits on rithwikbirdfeeds.com
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: out }} />
    </AbsoluteFill>
  );
};
