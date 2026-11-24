import React from 'react';
import { Composition } from 'remotion';
import { Ad, type AdProps } from './Ad';
import { FPS, H, TOTAL, W } from './timeline';

// Two versions of the same ad, one per soundtrack. 1920x1080 at 25 fps; render with --scale=2 for 4K.
export const Root: React.FC = () => (
  <>
    <Composition id="RithwikAd-Birdsong" component={Ad} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ soundtrack: 'birdsong', footage: 'footage' } satisfies AdProps} />
    <Composition id="RithwikAd-Calm" component={Ad} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{ soundtrack: 'calm', footage: 'footage' } satisfies AdProps} />
  </>
);
