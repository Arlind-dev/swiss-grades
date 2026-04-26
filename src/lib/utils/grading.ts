import type { GradeEntry, RoundingKey } from '$lib/types';

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

/** Returns a CSS variable reference: green ≥ 4.5, yellow 4.0–4.49, red < 4.0. */
export function gradeColor(grade: number): string {
  if (grade >= 4.5) return 'var(--ctp-green)';
  if (grade >= 4.0) return 'var(--ctp-yellow)';
  return 'var(--ctp-red)';
}

/** Weighted average of entries that have a parseable grade. Returns null if none. */
export function computeWeightedAverage(entries: GradeEntry[]): number | null {
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
  return weightSum > 0 ? weightedSum / weightSum : null;
}

/** Recompute and format a parent grade from its subgrades. */
export function recomputeParentGrade(subgrades: GradeEntry[]): string {
  const avg = computeWeightedAverage(subgrades);
  return avg !== null ? (Math.round(avg * 100) / 100).toFixed(2) : '';
}

/** Create a blank grade entry with a unique id. */
export function newEntry(): GradeEntry {
  return { id: crypto.randomUUID(), name: '', grade: '', weight: '', subgrades: [] };
}
