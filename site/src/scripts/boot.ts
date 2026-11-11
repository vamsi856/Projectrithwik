// The page paints first, then wakes up: the first screen (text, photo, the CSS entrance) is
// on screen before any of the motion code is even read, so it appears as fast as possible.
const wake = () => import('./main');
if (document.visibilityState === 'hidden') wake();
else requestAnimationFrame(() => setTimeout(wake, 0));
