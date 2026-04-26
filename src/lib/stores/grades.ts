import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { GradeEntry } from '$lib/types';
import { newEntry } from '$lib/utils/grading';

const STORAGE_KEY = 'notenrechner-grades';

function loadInitial(): GradeEntry[] {
  if (!browser) return Array.from({ length: 10 }, newEntry);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GradeEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted storage — fall through to default
  }
  return Array.from({ length: 10 }, newEntry);
}

export const grades = writable<GradeEntry[]>(loadInitial());

// Persist every change to localStorage
if (browser) {
  grades.subscribe((value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });
}
