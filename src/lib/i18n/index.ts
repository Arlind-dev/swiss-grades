import { writable, derived } from 'svelte/store';
import { de } from './de';
import { en } from './en';
import { fr } from './fr';
import { it } from './it';
import { so } from './so';
import { ru } from './ru';
import { tr } from './tr';
import type { Messages } from './messages';
import { STORAGE_KEYS } from '$lib/storage-keys';

export type Locale = 'de' | 'en' | 'fr' | 'it' | 'so' | 'ru' | 'tr';
export type { Messages };

const catalogs: Record<Locale, Messages> = { de, en, fr, it, so, ru, tr };

function isLocale(value: string | null | undefined): value is Locale {
  return value === 'de' || value === 'en' || value === 'fr' || value === 'it' || value === 'so' || value === 'ru' || value === 'tr';
}

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.locale);
    if (isLocale(stored)) return stored;
    const browser = navigator.language.split('-')[0];
    if (isLocale(browser)) return browser;
  } catch {}
  return 'de';
}

const _locale = writable<Locale>(typeof window !== 'undefined' ? detectLocale() : 'de');

/** Active locale. Set this to switch language everywhere. */
export const locale = {
  ..._locale,
  set(value: Locale) {
    try { localStorage.setItem(STORAGE_KEYS.locale, value); } catch {}
    _locale.set(value);
  }
};

/** Derived messages object — reactive, fully typed. */
export const m = derived(_locale, ($locale) => catalogs[$locale]);
