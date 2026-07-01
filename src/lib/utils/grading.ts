import type { GradeEntry, RoundingKey } from '$lib/types';

export type Tone = 'pass' | 'warn' | 'fail' | 'neutral';

/** A grade of 4 is the Swiss passing threshold. */
export function isPassing(grade: number): boolean {
  return grade >= 4;
}

/** Grade → status tone: pass ≥ 4.5, warn ≥ 4 (scraped), fail below. */
export function gradeTone(grade: number | null): Tone {
  if (grade === null) return 'neutral';
  if (grade >= 4.5) return 'pass';
  if (grade >= 4) return 'warn';
  return 'fail';
}

/** Tone → CSS color variable; `neutral` falls back to the caller's default. */
export function toneColor(tone: Tone, neutral = 'var(--muted)'): string {
  if (tone === 'pass') return 'var(--ctp-green)';
  if (tone === 'fail') return 'var(--ctp-red)';
  if (tone === 'warn') return 'var(--ctp-yellow)';
  return neutral;
}

/** Swiss grading formula: (points × 5 / maxPoints) + 1 */
export function calculateGradeFromPoints(points: number, maxPoints: number): number {
  return (points * 5) / maxPoints + 1;
}

export function applyRounding(value: number, key: RoundingKey): string {
  if (key === '0.25') return (Math.round(value * 4) / 4).toFixed(2);
  if (key === '0.5') return (Math.round(value * 2) / 2).toFixed(1);
  if (key === '1') return (Math.round(value * 10) / 10).toFixed(1);
  return (Math.round(value * 100) / 100).toFixed(2);
}

/** Returns the raw weighted sums for entries that have a parseable grade. */
export function computeWeightedSums(entries: GradeEntry[]): { weightSum: number; weightedSum: number } {
  let weightSum = 0;
  let weightedSum = 0;
  for (const entry of entries) {
    const gradeVal = parseFloat(entry.grade);
    if (isNaN(gradeVal)) continue;
    const weightVal = parseFloat(entry.weight);
    const weight = isNaN(weightVal) || weightVal <= 0 ? 100 : weightVal;
    weightedSum += gradeVal * weight;
    weightSum += weight;
  }
  return { weightSum, weightedSum };
}

/** Weighted average of entries that have a parseable grade. Returns null if none. */
export function computeWeightedAverage(entries: GradeEntry[]): number | null {
  const { weightSum, weightedSum } = computeWeightedSums(entries);
  return weightSum > 0 ? weightedSum / weightSum : null;
}

/** Recompute and format a parent grade from its subgrades. */
export function recomputeParentGrade(subgrades: GradeEntry[]): string {
  const avg = computeWeightedAverage(subgrades);
  return avg !== null ? (Math.round(avg * 100) / 100).toFixed(2) : '';
}

/** Recursively resolve parent grades from subgrades, leaving leaf grades as typed. */
export function normalizeGrades(entries: GradeEntry[]): GradeEntry[] {
  return entries.map((e) => {
    const subgrades = normalizeGrades(e.subgrades ?? []);
    return { ...e, subgrades, grade: subgrades.length ? recomputeParentGrade(subgrades) : e.grade };
  });
}

/** Create a blank grade entry with a unique id. */
export function newEntry(): GradeEntry {
  return { id: crypto.randomUUID(), name: '', grade: '', weight: '', subgrades: [] };
}
