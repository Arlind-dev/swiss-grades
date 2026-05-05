export type QVTrack = 'regular' | 'bm';

export type QVComponentId = 'ipa' | 'abu' | 'egk' | 'ik';

export interface QVDetailComponent {
  id: string;
  label: string;
  shortLabel: string;
  weight: number;
  roundingNote?: string;
}

export interface QVComponent {
  id: QVComponentId;
  label: string;
  shortLabel: string;
  weight: number;
  description?: string;
  roundingNote?: string;
  fallnote?: boolean;
  minGrade?: number;
  details?: QVDetailComponent[];
  excludedInTracks?: QVTrack[];
}

export interface QVPreset {
  id: string;
  label: string;
  shortLabel: string;
  fachrichtung: string;
  components: QVComponent[];
}

export type QVGradeMap = Partial<Record<QVComponentId, number | null | undefined>>;

export interface QVEvaluation {
  activeComponents: QVComponent[];
  activeWeightSum: number;
  rawFinalGrade: number | null;
  finalGrade: number | null;
  passed: boolean | null;
  missingComponentIds: QVComponentId[];
  failedFallnoten: QVComponentId[];
  finalGradeFailed: boolean;
}

export interface QVNeededGrade {
  missingComponentIds: QVComponentId[];
  grade: number | null;
  impossible: boolean;
  reason: 'known-fallnote' | 'max-grade' | null;
}
