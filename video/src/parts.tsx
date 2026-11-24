// Small pieces shared by the scenes: gold dust, a caption, the mouse pointer.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { GOLD, NAVY, TEXT } from './look';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export { clamp };

/** Slow golden dust drifting up, as over the book on the site. */
export const Dust: React.FC<{ count?: number; opacity?: number }> = ({ count = 70, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const x = random(`x${i}`) * 1920, speed = 0.25 + random(`s${i}`) * 0.6, size = 1.2 + random(`r${i}`) * 2.6;
        const y = ((random(`y${i}`) * 1180 - f * speed) % 1180 + 1180) % 1180 - 50;
        const tw = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(f / 18 + random(`p${i}`) * 6.28));
        const sway = Math.sin(f / 40 + i) * 6;
        return <div key={i} style={{ position: 'absolute', left: x + sway, top: y, width: size, height: size, borderRadius: '50%', background: GOLD, opacity: tw, boxShadow: `0 0 ${size * 3}px ${GOLD}` }} />;
      })}
    </AbsoluteFill>
  );
};

/** A caption in the lower left: in after a moment, out before the shot ends. */
export const Caption: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [10, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = interpolate(f, [frames - 24, frames - 12], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const p = Math.min(inP, outP);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 92px 96px', pointerEvents: 'none' }}>
      <div style={{ opacity: p, transform: `translateY(${(1 - inP) * 18}px)`, display: 'flex', alignItems: 'stretch', gap: 0, borderRadius: 14, overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,.35)' }}>
        <div style={{ width: 8, background: GOLD, transform: `scaleY(${inP})`, transformOrigin: 'bottom' }} />
        <div style={{ background: 'rgba(11,25,36,.84)', color: '#f6f1e2', fontFamily: TEXT, fontWeight: 600, fontSize: 40, letterSpacing: '0.005em', padding: '20px 30px 22px 26px' }}>
          <span style={{ clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)`, display: 'inline-block' }}>{text}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** A mouse pointer that glides to a point and clicks (positions in page pixels). */
export const Pointer: React.FC<{ from: [number, number]; to: [number, number]; show: number; arrive: number; click: number; hide: number }> = ({ from, to, show, arrive, click, hide }) => {
  const f = useCurrentFrame();
  if (f < show || f > hide + 12) return null;
  const p = interpolate(f, [show, arrive], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // a soft arc, not a straight line
  const x = from[0] + (to[0] - from[0]) * p + Math.sin(p * Math.PI) * -40;
  const y = from[1] + (to[1] - from[1]) * p + Math.sin(p * Math.PI) * 30;
  const press = interpolate(f, [click - 3, click, click + 5], [1, 0.82, 1], clamp);
  const opacity = Math.min(interpolate(f, [show, show + 8], [0, 1], clamp), interpolate(f, [hide, hide + 12], [1, 0], clamp));
  const ring = interpolate(f, [click, click + 18], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {f >= click && (
        <div style={{ position: 'absolute', left: to[0] - 60, top: to[1] - 60, width: 120, height: 120, borderRadius: '50%', border: `4px solid ${GOLD}`, opacity: (1 - ring) * 0.9, transform: `scale(${0.2 + ring * 0.9})` }} />
      )}
      <svg width={44} height={56} viewBox="0 0 22 28" style={{ position: 'absolute', left: x - 3, top: y - 2, opacity, transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.35))' }}>
        <path d="M2 1.5 L2 22 L7.2 17.3 L10.6 25.4 L14 24 L10.7 16.1 L17.6 16.1 Z" fill="#fff" stroke={NAVY} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
