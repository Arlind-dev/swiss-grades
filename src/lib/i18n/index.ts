import { writable, derived } from 'svelte/store';
import { de } from './de';
import { en } from './en';
import { fr } from './fr';
import { it } from './it';
import type { Messages } from './messages';

export type Locale = 'de' | 'en' | 'fr' | 'it';
export type { Messages };

const catalogs: Record<Locale, Messages> = { de, en, fr, it };

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem('notenrechner-locale');
    if (stored === 'de' || stored === 'en' || stored === 'fr' || stored === 'it') return stored;
    const browser = navigator.language.split('-')[0];
    if (browser === 'de' || browser === 'en' || browser === 'fr' || browser === 'it') return browser;
  } catch {}
  return 'de';
}

const _locale = writable<Locale>(typeof window !== 'undefined' ? detectLocale() : 'de');

/** Active locale. Set this to switch language everywhere. */
export const locale = {
  ..._locale,
  set(value: Locale) {
    try { localStorage.setItem('notenrechner-locale', value); } catch {}
    _locale.set(value);
  }
};

/** Derived messages object — reactive, fully typed. */
export const m = derived(_locale, ($locale) => catalogs[$locale]);
