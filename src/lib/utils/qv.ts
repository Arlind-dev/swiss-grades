import type {
  QVComponent,
  QVComponentId,
  QVComponentMode,
  QVDetailComponent,
  QVEvaluation,
  QVGradeMap,
  QVNeededGrade,
  QVPreset,
  QVRoundingStep,
  QVTrack,
} from '../qv/types';

const PASSING_GRADE = 4;
const MAX_GRADE = 6;
const MIN_GRADE = 1;

type QVComponentModeMap = Partial<Record<QVComponentId, string>>;

export function roundToStep(value: number, step: QVRoundingStep): number {
  const factor = 1 / step;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return Number(rounded.toFixed(step === 1 ? 0 : 1));
}

export function roundToTenth(value: number): number {
  return roundToStep(value, 0.1);
}

export function roundToHalf(value: number): number {
  return roundToStep(value, 0.5);
}

export function isValidGrade(value: number | null | undefined): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

export function getComponentMode(component: QVComponent, modeId?: string): QVComponentMode | null {
  if (!component.detailModes?.length) return null;

  return (
    component.detailModes.find((mode) => mode.id === modeId)
    ?? component.detailModes.find((mode) => mode.id === component.defaultDetailModeId)
    ?? component.detailModes[0]
  );
}

export function getComponentDetails(component: QVComponent, modeId?: string): QVDetailComponent[] {
  const mode = getComponentMode(component, modeId);
  return mode ? (mode.details ?? []) : (component.details ?? []);
}

export function isComponentExcluded(component: QVComponent, modeId?: string): boolean {
  return getComponentMode(component, modeId)?.excluded === true;
}

export function getTrackComponents(preset: QVPreset, track: QVTrack): QVComponent[] {
  const trackOption = preset.tracks.find((option) => option.id === track) ?? preset.tracks[0];
  const excludedComponentIds = new Set(trackOption?.excludedComponentIds ?? []);

  return preset.components.filter((component) => (
    !excludedComponentIds.has(component.id)
    && !component.excludedInTracks?.includes(track)
  ));
}

export function getActiveComponents(
  preset: QVPreset,
  track: QVTrack,
  componentModes: QVComponentModeMap = {}
): QVComponent[] {
  return getTrackComponents(preset, track)
    .filter((component) => !isComponentExcluded(component, componentModes[component.id]));
}

export function computeComponentGrade(
  component: QVComponent,
  detailGrades: Partial<Record<string, number | null | undefined>>,
  modeId?: string
): number | null {
  if (isComponentExcluded(component, modeId)) return null;

  const details = getComponentDetails(component, modeId);
  if (!details.length) return null;

  let weightedSum = 0;
  let weightSum = 0;
  for (const detail of details) {
    const grade = detailGrades[detail.id];
    if (!isValidGrade(grade)) return null;
    weightedSum += grade * detail.weight;
    weightSum += detail.weight;
  }

  const mode = getComponentMode(component, modeId);
  const rounding = mode?.resultRounding ?? component.detailResultRounding ?? 0.1;
  return weightSum > 0 ? roundToStep(weightedSum / weightSum, rounding) : null;
}

export function computeQVFinalGrade(
  preset: QVPreset,
  track: QVTrack,
  grades: QVGradeMap,
  componentModes: QVComponentModeMap = {}
): { rawFinalGrade: number; finalGrade: number; activeWeightSum: number } | null {
  const activeComponents = getActiveComponents(preset, track, componentModes);
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

export function evaluateQV(
  preset: QVPreset,
  track: QVTrack,
  grades: QVGradeMap,
  componentModes: QVComponentModeMap = {}
): QVEvaluation {
  const activeComponents = getActiveComponents(preset, track, componentModes);
  const activeWeightSum = activeComponents.reduce((sum, component) => sum + component.weight, 0);
  const missingComponentIds = activeComponents
    .filter((component) => !isValidGrade(grades[component.id]))
    .map((component) => component.id);
  const failedFallnoten = activeComponents
    .filter((component) => component.fallnote && isValidGrade(grades[component.id]) && grades[component.id]! < (component.minGrade ?? PASSING_GRADE))
    .map((component) => component.id);
  const final = computeQVFinalGrade(preset, track, grades, componentModes);
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
  componentModes: QVComponentModeMap | number = {},
  targetGrade = PASSING_GRADE
): QVNeededGrade | null {
  const resolvedComponentModes = typeof componentModes === 'number' ? {} : componentModes;
  const resolvedTargetGrade = typeof componentModes === 'number' ? componentModes : targetGrade;
  const activeComponents = getActiveComponents(preset, track, resolvedComponentModes);
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

  const neededForFinal = (resolvedTargetGrade * totalWeight - knownWeightedSum) / missingWeight;
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
