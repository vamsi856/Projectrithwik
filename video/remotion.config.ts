// Remotion settings for the ad (see render.mjs for the finished files).
import { Config } from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(3);
Config.setOverwriteOutput(true);
