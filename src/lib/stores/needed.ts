import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { STORAGE_KEYS } from '$lib/storage-keys';

export const MAX_REMAINING = 50;

export interface NeededState {
  target: string;
  /** How many exams are still to come; each counts as one normal grade. */
  count: number;
}

export function sanitizeCount(value: unknown): number {
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_REMAINING, Math.max(1, Math.round(n)));
}

function defaults(): NeededState {
  return { target: '', count: 1 };
}

function loadInitial(): NeededState {
  if (!browser) return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.needed);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        // Migrate the older { target, futureExams: [] } shape to a plain count.
        const count = Array.isArray(parsed.futureExams)
          ? sanitizeCount(parsed.futureExams.length)
          : sanitizeCount(parsed.count);
        return { target: typeof parsed.target === 'string' ? parsed.target : '', count };
      }
    }
  } catch {
    // corrupted — fall through to defaults
  }
  return defaults();
}

export const needed = writable<NeededState>(loadInitial());

if (browser) {
  needed.subscribe((value) => {
    localStorage.setItem(STORAGE_KEYS.needed, JSON.stringify(value));
  });
}
