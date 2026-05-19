export type QVTrack = string;

export type QVComponentId = string;

export type QVRoundingStep = 0.1 | 0.5 | 1;

export interface QVSource {
  label: string;
  href: string;
}

export interface QVOverviewItem {
  id: string;
  title: string;
  text: string;
}

export interface QVTrackOption {
  id: QVTrack;
  label: string;
  note?: string;
  excludedComponentIds?: QVComponentId[];
}

export interface QVDetailComponent {
  id: string;
  label: string;
  shortLabel: string;
  weight: number;
  roundingNote?: string;
}

export interface QVComponentMode {
  id: string;
  label: string;
  description?: string;
  details?: QVDetailComponent[];
  resultRounding?: QVRoundingStep;
  excluded?: boolean;
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
  detailModes?: QVComponentMode[];
  defaultDetailModeId?: string;
  detailResultRounding?: QVRoundingStep;
  excludedInTracks?: QVTrack[];
}

export interface QVPreset {
  id: string;
  label: string;
  shortLabel: string;
  fachrichtung: string;
  description: string;
  overviewItems: QVOverviewItem[];
  sources: QVSource[];
  tracks: QVTrackOption[];
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
