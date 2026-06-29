import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { STORAGE_KEYS } from '$lib/storage-keys';

export interface FutureExam {
  id: string;
  name: string;
  weight: string;
}

export interface NeededState {
  target: string;
  futureExams: FutureExam[];
}

export function newExam(): FutureExam {
  return { id: crypto.randomUUID(), name: '', weight: '' };
}

function defaults(): NeededState {
  return { target: '', futureExams: [newExam()] };
}

function loadInitial(): NeededState {
  if (!browser) return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.needed);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NeededState>;
      if (parsed && typeof parsed.target === 'string' && Array.isArray(parsed.futureExams)) {
        const futureExams = parsed.futureExams
          .filter(
            (e): e is FutureExam =>
              !!e && typeof e.name === 'string' && typeof e.weight === 'string'
          )
          .map((e) => ({
            id: typeof e.id === 'string' ? e.id : crypto.randomUUID(),
            name: e.name,
            weight: e.weight
          }));
        return { target: parsed.target, futureExams: futureExams.length ? futureExams : [newExam()] };
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
