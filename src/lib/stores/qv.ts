import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { STORAGE_KEYS } from '$lib/storage-keys';
import { QV_PRESETS } from '$lib/qv/presets';
import type { QVComponentId, QVTrack } from '$lib/qv/types';

export interface QVState {
  presetId: string;
  track: QVTrack;
  componentGrades: Partial<Record<QVComponentId, string>>;
  detailEnabled: Partial<Record<QVComponentId, boolean>>;
  detailGrades: Partial<Record<QVComponentId, Record<string, string>>>;
}

const STORAGE_KEY = STORAGE_KEYS.qv;

const defaults: QVState = {
  presetId: QV_PRESETS[0].id,
  track: 'regular',
  componentGrades: {},
  detailEnabled: {},
  detailGrades: {},
};

function isTrack(value: unknown): value is QVTrack {
  return value === 'regular' || value === 'bm';
}

function loadInitial(): QVState {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<QVState>;
    return {
      presetId: typeof parsed.presetId === 'string' ? parsed.presetId : defaults.presetId,
      track: isTrack(parsed.track) ? parsed.track : defaults.track,
      componentGrades: parsed.componentGrades ?? {},
      detailEnabled: parsed.detailEnabled ?? {},
      detailGrades: parsed.detailGrades ?? {},
    };
  } catch {
    return defaults;
  }
}

export const qv = writable<QVState>(loadInitial());

export function resetQV() {
  qv.set(defaults);
}

if (browser) {
  qv.subscribe((value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  });
}
