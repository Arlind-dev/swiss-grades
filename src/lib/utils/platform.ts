import { browser } from '$app/environment';

/** True on macOS / iOS, where the modifier is ⌘ and the delete key reports 'Backspace'. */
export const isMac =
  browser && typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
