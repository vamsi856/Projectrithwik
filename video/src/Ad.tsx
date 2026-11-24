// The ad: the shots of timeline.ts joined by transitions, with one of two soundtracks.
//   birdsong  the site's own sounds: its dawn chorus as Bird Feeds opens (softly before, over the
//             book), the page turn, then the site's calm Human Food music
//   calm      one plain, calm piece all the way through (audio/synth.js)
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { iris } from '@remotion/transitions/iris';
import { NAVY } from './look';
import { clamp } from './parts';
import { ClipShot, EndCard, OpenScene } from './scenes';
import { CUES, EDIT, FPS, H, TOTAL, W, isJoin } from './timeline';

export type AdProps = { soundtrack: 'birdsong' | 'calm'; footage?: string };

const smooth = (frames: number) => linearTiming({ durationInFrames: frames, easing: Easing.inOut(Easing.cubic) });

const Soundtrack: React.FC<{ kind: AdProps['soundtrack'] }> = ({ kind }) => {
  if (kind === 'calm') {
    return <Audio src={staticFile('audio/calm.wav')} volume={(f) => interpolate(f, [0, 10, TOTAL - 45, TOTAL - 2], [0, 1, 1, 0], clamp)} />;
  }
  const hf = CUES.humanFood - 20; // the music starts just before Human Food appears
  return (
    <>
      {/* the dawn chorus: soft under the browser and the book, full as Bird Feeds opens, gone by Human Food */}
      <Audio src={staticFile('audio/birds.mp3')} trimBefore={10 * FPS}
        volume={(f) => interpolate(f, [0, 50, 75, 110, CUES.birdFeedsOpens - 4, CUES.birdFeedsOpens + 30, hf, hf + 45], [0, 0.3, 0.3, 0.48, 0.48, 1, 1, 0], clamp)} />
      <Sequence from={CUES.birdFeedsOpens}><Audio src={staticFile('audio/page-turn.wav')} volume={0.55} /></Sequence>
      <Sequence from={hf}>
        <Audio src={staticFile('audio/human-food.wav')} volume={(f) => interpolate(f, [0, 45, TOTAL - hf - 45, TOTAL - hf - 2], [0, 0.95, 0.95, 0], clamp)} />
      </Sequence>
    </>
  );
};

export const Ad: React.FC<AdProps> = ({ soundtrack, footage = 'footage' }) => (
  <AbsoluteFill style={{ background: NAVY }}>
    <TransitionSeries>
      {EDIT.map((x, i) => {
        if (isJoin(x)) {
          return (
            x.join === 'iris'
              ? <TransitionSeries.Transition key={i} timing={smooth(x.frames)} presentation={iris({ width: W, height: H })} />
              : <TransitionSeries.Transition key={i} timing={smooth(x.frames)} presentation={fade()} />
          );
        }
        return (
          <TransitionSeries.Sequence key={i} durationInFrames={x.frames}>
            {x.kind === 'open' && <OpenScene dir={footage} />}
            {x.kind === 'clip' && <ClipShot dir={footage} clip={x.clip as 'bird' | 'food'} seg={x.seg} offset={x.offset} frames={x.frames} caption={x.caption} />}
            {x.kind === 'end' && <EndCard frames={x.frames} />}
          </TransitionSeries.Sequence>
        );
      })}
    </TransitionSeries>
    <Soundtrack kind={soundtrack} />
  </AbsoluteFill>
);
