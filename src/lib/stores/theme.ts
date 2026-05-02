import { writable } from 'svelte/store';
import { STORAGE_KEYS } from '$lib/storage-keys';

export type Theme = 'latte' | 'mocha';

function loadTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'latte';
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === 'latte' || stored === 'mocha') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mocha' : 'latte';
}

export const theme = writable<Theme>(loadTheme());

theme.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.theme, value);
  }
});
