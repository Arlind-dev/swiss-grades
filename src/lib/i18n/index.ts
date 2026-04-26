import { writable, derived } from 'svelte/store';
import { de } from './de';
import { en } from './en';
import type { Messages } from './messages';

export type Locale = 'de' | 'en';
export type { Messages };

const catalogs: Record<Locale, Messages> = { de, en };

/** Active locale. Set this to switch language everywhere. */
export const locale = writable<Locale>('de');

/** Derived messages object — reactive, fully typed. */
export const m = derived(locale, ($locale) => catalogs[$locale]);
