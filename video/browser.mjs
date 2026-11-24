// The Chromium used to render: the one already on this machine if there is one (saves a download),
// otherwise Remotion fetches its own.
import fs from 'node:fs';

const candidates = [process.env.REMOTION_BROWSER, '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'];
export const browserExecutable = candidates.find((p) => p && fs.existsSync(p)) ?? null;
