import { writable } from 'svelte/store';

export type Theme = 'latte' | 'mocha';

function loadTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'latte';
  const stored = localStorage.getItem('swiss-grades-theme');
  if (stored === 'latte' || stored === 'mocha') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mocha' : 'latte';
}

export const theme = writable<Theme>(loadTheme());

theme.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('swiss-grades-theme', value);
  }
});
