import type {
  QVComponent,
  QVEvaluation,
  QVGradeMap,
  QVNeededGrade,
  QVPreset,
  QVTrack,
} from '../qv/types';

const PASSING_GRADE = 4;
const MAX_GRADE = 6;
const MIN_GRADE = 1;

export function roundToTenth(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

export function roundToHalf(value: number): number {
  return Math.round((value + Number.EPSILON) * 2) / 2;
}

export function isValidGrade(value: number | null | undefined): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

export function getActiveComponents(preset: QVPreset, track: QVTrack): QVComponent[] {
  const trackOption = preset.tracks.find((option) => option.id === track) ?? preset.tracks[0];
  const excludedComponentIds = new Set(trackOption?.excludedComponentIds ?? []);

  return preset.components.filter((component) => (
    !excludedComponentIds.has(component.id)
    && !component.excludedInTracks?.includes(track)
  ));
}

export function computeComponentGrade(
  component: QVComponent,
  detailGrades: Partial<Record<string, number | null | undefined>>
): number | null {
  if (!component.details?.length) return null;

  let weightedSum = 0;
  let weightSum = 0;
  for (const detail of component.details) {
    const grade = detailGrades[detail.id];
    if (!isValidGrade(grade)) return null;
    weightedSum += grade * detail.weight;
    weightSum += detail.weight;
  }

  return weightSum > 0 ? roundToTenth(weightedSum / weightSum) : null;
}

export function computeQVFinalGrade(
  preset: QVPreset,
  track: QVTrack,
  grades: QVGradeMap
): { rawFinalGrade: number; finalGrade: number; activeWeightSum: number } | null {
  const activeComponents = getActiveComponents(preset, track);
  let weightedSum = 0;
  let activeWeightSum = 0;

  for (const component of activeComponents) {
    const grade = grades[component.id];
    if (!isValidGrade(grade)) return null;
    weightedSum += grade * component.weight;
    activeWeightSum += component.weight;
  }

  if (activeWeightSum <= 0) return null;

  const rawFinalGrade = weightedSum / activeWeightSum;
  return {
    rawFinalGrade,
    finalGrade: roundToTenth(rawFinalGrade),
    activeWeightSum,
  };
}

export function evaluateQV(preset: QVPreset, track: QVTrack, grades: QVGradeMap): QVEvaluation {
  const activeComponents = getActiveComponents(preset, track);
  const activeWeightSum = activeComponents.reduce((sum, component) => sum + component.weight, 0);
  const missingComponentIds = activeComponents
    .filter((component) => !isValidGrade(grades[component.id]))
    .map((component) => component.id);
  const failedFallnoten = activeComponents
    .filter((component) => component.fallnote && isValidGrade(grades[component.id]) && grades[component.id]! < (component.minGrade ?? PASSING_GRADE))
    .map((component) => component.id);
  const final = computeQVFinalGrade(preset, track, grades);
  const finalGradeFailed = final !== null && final.finalGrade < PASSING_GRADE;
  const passed = missingComponentIds.length > 0
    ? null
    : failedFallnoten.length === 0 && final !== null && !finalGradeFailed;

  return {
    activeComponents,
    activeWeightSum,
    rawFinalGrade: final?.rawFinalGrade ?? null,
    finalGrade: final?.finalGrade ?? null,
    passed,
    missingComponentIds,
    failedFallnoten,
    finalGradeFailed,
  };
}

export function computeNeededGrade(
  preset: QVPreset,
  track: QVTrack,
  grades: QVGradeMap,
  targetGrade = PASSING_GRADE
): QVNeededGrade | null {
  const activeComponents = getActiveComponents(preset, track);
  const missingComponents = activeComponents.filter((component) => !isValidGrade(grades[component.id]));
  if (missingComponents.length === 0) return null;

  const knownFallnoteFailed = activeComponents.some((component) => (
    component.fallnote
    && isValidGrade(grades[component.id])
    && grades[component.id]! < (component.minGrade ?? PASSING_GRADE)
  ));

  if (knownFallnoteFailed) {
    return {
      missingComponentIds: missingComponents.map((component) => component.id),
      grade: null,
      impossible: true,
      reason: 'known-fallnote',
    };
  }

  let knownWeightedSum = 0;
  let totalWeight = 0;
  let missingWeight = 0;

  for (const component of activeComponents) {
    totalWeight += component.weight;
    const grade = grades[component.id];
    if (isValidGrade(grade)) {
      knownWeightedSum += grade * component.weight;
    } else {
      missingWeight += component.weight;
    }
  }

  if (missingWeight <= 0 || totalWeight <= 0) return null;

  const neededForFinal = (targetGrade * totalWeight - knownWeightedSum) / missingWeight;
  const missingFallnoteMinimum = missingComponents.some((component) => component.fallnote)
    ? PASSING_GRADE
    : MIN_GRADE;
  const needed = Math.max(neededForFinal, missingFallnoteMinimum);

  if (needed > MAX_GRADE) {
    return {
      missingComponentIds: missingComponents.map((component) => component.id),
      grade: null,
      impossible: true,
      reason: 'max-grade',
    };
  }

  return {
    missingComponentIds: missingComponents.map((component) => component.id),
    grade: roundToTenth(Math.max(MIN_GRADE, needed)),
    impossible: false,
    reason: null,
  };
}
