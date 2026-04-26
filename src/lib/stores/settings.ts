import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { RoundingKey } from '$lib/types';

export interface Settings {
  calculatorRounding: RoundingKey;
  averageRounding: RoundingKey;
  calculatorPoints: string;
  calculatorMaxPoints: string;
}

const STORAGE_KEY = 'notenrechner-settings';

const defaults: Settings = {
  calculatorRounding: '2',
  averageRounding: '2',
  calculatorPoints: '',
  calculatorMaxPoints: ''
};

function loadInitial(): Settings {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // corrupted — fall through
  }
  return defaults;
}

export const settings = writable<Settings>(loadInitial());

if (browser) {
  settings.subscribe((value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });
}
