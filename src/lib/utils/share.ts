import { browser } from '$app/environment';
import { QV_PRESETS } from '$lib/qv/presets';
import type { QVComponentId, QVTrack } from '$lib/qv/types';
import type { GradeEntry, RoundingKey } from '$lib/types';
import { newEntry, recomputeParentGrade } from '$lib/utils/grading';

export type SharePage = 'average' | 'calculator' | 'needed' | 'qv';

export interface SharedGradeEntry {
  name: string;
  grade: string;
  weight: string;
  subgrades: SharedGradeEntry[];
}

export type SharePayload =
  | {
      v: 1;
      page: 'average';
      grades: SharedGradeEntry[];
      rounding: RoundingKey;
    }
  | {
      v: 1;
      page: 'calculator';
      points: string;
      maxPoints: string;
      rounding: RoundingKey;
    }
  | {
      v: 1;
      page: 'needed';
      grades: SharedGradeEntry[];
      targetAverage: string;
      futureExams: { name: string; weight: string }[];
      rounding: RoundingKey;
    }
  | {
      v: 1;
      page: 'qv';
      presetId: string;
      track: QVTrack;
      componentGrades: Partial<Record<QVComponentId, string>>;
      detailEnabled: Partial<Record<QVComponentId, boolean>>;
      detailGrades: Partial<Record<QVComponentId, Record<string, string>>>;
    };

export const SHARE_PARAM = 'share';
export const MAX_SHARE_URL_LENGTH = 12000;

const MAX_GRADE_ENTRIES = 200;
const MAX_GRADE_DEPTH = 5;
const MAX_FUTURE_EXAMS = 50;
const MAX_TEXT_LENGTH = 120;
const ROUNDING_KEYS: RoundingKey[] = ['0.25', '0.5', '1', '2'];
const QV_COMPONENT_IDS = new Set<QVComponentId>(
  QV_PRESETS.flatMap((preset) => preset.components.map((component) => component.id))
);
const QV_DETAIL_IDS = new Map<QVComponentId, Set<string>>();

for (const preset of QV_PRESETS) {
  for (const component of preset.components) {
    const detailIds = QV_DETAIL_IDS.get(component.id) ?? new Set<string>();
    for (const detail of component.details ?? []) detailIds.add(detail.id);
    QV_DETAIL_IDS.set(component.id, detailIds);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isRoundingKey(value: unknown): value is RoundingKey {
  return typeof value === 'string' && ROUNDING_KEYS.includes(value as RoundingKey);
}

function isQVTrack(value: unknown): value is QVTrack {
  return value === 'regular' || value === 'bm';
}

function isQVComponentId(value: string): value is QVComponentId {
  return QV_COMPONENT_IDS.has(value as QVComponentId);
}

function sanitizeText(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > MAX_TEXT_LENGTH) return null;
  return value;
}

function isMeaningfulSharedGrade(entry: SharedGradeEntry): boolean {
  return Boolean(entry.name || entry.grade || entry.weight || entry.subgrades.length);
}

function countGradeEntries(entries: SharedGradeEntry[]): number {
  return entries.reduce((count, entry) => count + 1 + countGradeEntries(entry.subgrades), 0);
}

function sanitizeSharedGrade(value: unknown, depth: number): SharedGradeEntry | null {
  if (depth > MAX_GRADE_DEPTH || !isRecord(value)) return null;

  const name = sanitizeText(value.name);
  const grade = sanitizeText(value.grade);
  const weight = sanitizeText(value.weight);
  if (name === null || grade === null || weight === null) return null;
  if (!Array.isArray(value.subgrades)) return null;

  const subgrades = sanitizeSharedGrades(value.subgrades, depth + 1);
  if (subgrades === null) return null;

  return { name, grade, weight, subgrades };
}

function sanitizeSharedGrades(values: unknown[], depth = 1): SharedGradeEntry[] | null {
  const entries: SharedGradeEntry[] = [];

  for (const value of values) {
    const entry = sanitizeSharedGrade(value, depth);
    if (!entry) return null;
    if (isMeaningfulSharedGrade(entry)) entries.push(entry);
  }

  return entries;
}

function sanitizeFutureExams(value: unknown): { name: string; weight: string }[] | null {
  if (!Array.isArray(value) || value.length > MAX_FUTURE_EXAMS) return null;

  const exams: { name: string; weight: string }[] = [];
  for (const exam of value) {
    if (!isRecord(exam)) return null;
    const name = sanitizeText(exam.name);
    const weight = sanitizeText(exam.weight);
    if (name === null || weight === null) return null;
    exams.push({ name, weight });
  }

  return exams;
}

function sanitizeQVComponentGrades(value: unknown): Partial<Record<QVComponentId, string>> | null {
  if (!isRecord(value)) return null;

  const grades: Partial<Record<QVComponentId, string>> = {};
  for (const [componentId, grade] of Object.entries(value)) {
    if (!isQVComponentId(componentId)) return null;
    const sanitizedGrade = sanitizeText(grade);
    if (sanitizedGrade === null) return null;
    grades[componentId] = sanitizedGrade;
  }

  return grades;
}

function sanitizeQVDetailEnabled(value: unknown): Partial<Record<QVComponentId, boolean>> | null {
  if (!isRecord(value)) return null;

  const detailEnabled: Partial<Record<QVComponentId, boolean>> = {};
  for (const [componentId, enabled] of Object.entries(value)) {
    if (!isQVComponentId(componentId) || typeof enabled !== 'boolean') return null;
    detailEnabled[componentId] = enabled;
  }

  return detailEnabled;
}

function sanitizeQVDetailGrades(value: unknown): Partial<Record<QVComponentId, Record<string, string>>> | null {
  if (!isRecord(value)) return null;

  const detailGrades: Partial<Record<QVComponentId, Record<string, string>>> = {};
  for (const [componentId, componentGrades] of Object.entries(value)) {
    if (!isQVComponentId(componentId) || !isRecord(componentGrades)) return null;

    const allowedDetailIds = QV_DETAIL_IDS.get(componentId) ?? new Set<string>();
    const sanitizedComponentGrades: Record<string, string> = {};
    for (const [detailId, grade] of Object.entries(componentGrades)) {
      if (!allowedDetailIds.has(detailId)) return null;
      const sanitizedGrade = sanitizeText(grade);
      if (sanitizedGrade === null) return null;
      sanitizedComponentGrades[detailId] = sanitizedGrade;
    }

    detailGrades[componentId] = sanitizedComponentGrades;
  }

  return detailGrades;
}

function sanitizeQVPayload(value: Record<string, unknown>): SharePayload | null {
  const presetId = sanitizeText(value.presetId);
  if (presetId === null || !QV_PRESETS.some((preset) => preset.id === presetId)) return null;
  if (!isQVTrack(value.track)) return null;

  const componentGrades = sanitizeQVComponentGrades(value.componentGrades);
  const detailEnabled = sanitizeQVDetailEnabled(value.detailEnabled);
  const detailGrades = sanitizeQVDetailGrades(value.detailGrades);
  if (!componentGrades || !detailEnabled || !detailGrades) return null;

  return {
    v: 1,
    page: 'qv',
    presetId,
    track: value.track,
    componentGrades,
    detailEnabled,
    detailGrades
  };
}

function sanitizePayload(value: unknown, expectedPage: SharePage): SharePayload | null {
  if (!isRecord(value) || value.v !== 1 || value.page !== expectedPage) return null;
  if (expectedPage === 'qv') return sanitizeQVPayload(value);
  if (!isRoundingKey(value.rounding)) return null;

  if (expectedPage === 'calculator') {
    const points = sanitizeText(value.points);
    const maxPoints = sanitizeText(value.maxPoints);
    if (points === null || maxPoints === null) return null;
    return { v: 1, page: 'calculator', points, maxPoints, rounding: value.rounding };
  }

  if (!Array.isArray(value.grades)) return null;
  const grades = sanitizeSharedGrades(value.grades);
  if (grades === null || countGradeEntries(grades) > MAX_GRADE_ENTRIES) return null;

  if (expectedPage === 'average') {
    return { v: 1, page: 'average', grades, rounding: value.rounding };
  }

  const targetAverage = sanitizeText(value.targetAverage);
  const futureExams = sanitizeFutureExams(value.futureExams);
  if (targetAverage === null || futureExams === null) return null;

  return { v: 1, page: 'needed', grades, targetAverage, futureExams, rounding: value.rounding };
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + padding);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function serializeGrade(entry: GradeEntry, depth: number): SharedGradeEntry | null {
  if (depth > MAX_GRADE_DEPTH) return null;

  const subgrades = entry.subgrades
    .map((subgrade) => serializeGrade(subgrade, depth + 1))
    .filter((subgrade): subgrade is SharedGradeEntry => subgrade !== null)
    .filter(isMeaningfulSharedGrade);

  const shared: SharedGradeEntry = {
    name: entry.name,
    grade: entry.grade,
    weight: entry.weight,
    subgrades
  };

  return isMeaningfulSharedGrade(shared) ? shared : null;
}

function hydrateGrade(entry: SharedGradeEntry): GradeEntry {
  const subgrades = entry.subgrades.map(hydrateGrade);
  return {
    id: crypto.randomUUID(),
    name: entry.name,
    grade: subgrades.length ? recomputeParentGrade(subgrades) : entry.grade,
    weight: entry.weight,
    subgrades
  };
}

export function serializeGrades(entries: GradeEntry[]): SharedGradeEntry[] {
  return entries
    .map((entry) => serializeGrade(entry, 1))
    .filter((entry): entry is SharedGradeEntry => entry !== null);
}

export function hydrateGrades(entries: SharedGradeEntry[]): GradeEntry[] {
  const hydrated = entries.map(hydrateGrade);
  return hydrated.length ? hydrated : Array.from({ length: 10 }, newEntry);
}

export function createShareUrl(payload: SharePayload): string {
  if (!browser) return '';
  if (!sanitizePayload(payload, payload.page)) {
    throw new Error('Share payload exceeds supported limits.');
  }

  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM, encodeBase64Url(JSON.stringify(payload)));
  return url.toString();
}

export function clearShareParam(): void {
  if (!browser) return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has(SHARE_PARAM)) return;

  url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function readSharePayload(expectedPage: SharePage): SharePayload | null {
  if (!browser) return null;

  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(SHARE_PARAM);
  if (!encoded) return null;

  if (window.location.href.length > MAX_SHARE_URL_LENGTH) {
    clearShareParam();
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as unknown;
    const payload = sanitizePayload(parsed, expectedPage);
    if (!payload) clearShareParam();
    return payload;
  } catch {
    clearShareParam();
    return null;
  }
}
