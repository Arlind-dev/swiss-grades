import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { STORAGE_KEYS } from '$lib/storage-keys';
import { getQVPreset, QV_PRESETS } from '$lib/qv/presets';
import type { QVTrack } from '$lib/qv/types';

export interface QVState {
  presetId: string;
  track: QVTrack;
  componentGrades: Record<string, string>;
  detailEnabled: Record<string, boolean>;
  detailGrades: Record<string, Record<string, string>>;
  componentModes: Record<string, string>;
}

const STORAGE_KEY = STORAGE_KEYS.qv;
const defaultPreset = QV_PRESETS[0];
const defaultTrack = defaultPreset.tracks[0].id;

const defaults: QVState = {
  presetId: defaultPreset.id,
  track: defaultTrack,
  componentGrades: {},
  detailEnabled: {},
  detailGrades: {},
  componentModes: {},
};

function sanitizePresetId(value: unknown): string {
  return typeof value === 'string' && QV_PRESETS.some((preset) => preset.id === value)
    ? value
    : defaults.presetId;
}

function sanitizeTrack(presetId: string, value: unknown): QVTrack {
  const preset = getQVPreset(presetId);
  return typeof value === 'string' && preset.tracks.some((track) => track.id === value)
    ? value
    : preset.tracks[0].id;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === 'boolean')
  );
}

function isNestedStringRecord(value: unknown): value is Record<string, Record<string, string>> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(isStringRecord)
  );
}

function sanitizeComponentModes(presetId: string, value: unknown): Record<string, string> {
  if (!isStringRecord(value)) return {};

  const preset = getQVPreset(presetId);
  const componentModes: Record<string, string> = {};
  for (const [componentId, modeId] of Object.entries(value)) {
    const component = preset.components.find((entry) => entry.id === componentId);
    if (component?.detailModes?.some((mode) => mode.id === modeId)) {
      componentModes[componentId] = modeId;
    }
  }

  return componentModes;
}

function loadInitial(): QVState {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<QVState>;
    const presetId = sanitizePresetId(parsed.presetId);
    return {
      presetId,
      track: sanitizeTrack(presetId, parsed.track),
      componentGrades: isStringRecord(parsed.componentGrades) ? parsed.componentGrades : {},
      detailEnabled: isBooleanRecord(parsed.detailEnabled) ? parsed.detailEnabled : {},
      detailGrades: isNestedStringRecord(parsed.detailGrades) ? parsed.detailGrades : {},
      componentModes: sanitizeComponentModes(presetId, parsed.componentModes),
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
