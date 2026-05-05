import type { CsvExportLabels } from '$lib/utils/export';

export interface Messages {
  nav: {
    calculator: string;
    average: string;
    needed: string;
  };
  gradeRow: {
    placeholderName: string;
    placeholderGrade: string;
    placeholderGradeShort: string;
    placeholderWeight: string;
    placeholderWeightShort: string;
    addSubgrade: string;
  };
  rounding: {
    label: string;
    oneDecimal: string;
    twoDecimal: string;
  };
  calculator: {
    title: string;
    formulaLabel: string;
    formulaNumerator: string;
    formulaDenominator: string;
    pointsLabel: string;
    maxPointsLabel: string;
    calculateButton: string;
    clearAll: string;
    clearConfirm: string;
    invalidInput: string;
    pointsOutOfRange: string;
    resultPrefix: string;
  };
  average: {
    title: string;
    addGrade: string;
    exportCsv: string;
    exportCsvTitle: string;
    calculateButton: string;
    clearAll: string;
    clearConfirm: string;
    shortcutAdd: string;
    shortcutDelete: string;
    dragHandleTitle: string;
    resultPrefix: string;
    csv: CsvExportLabels;
  };
  needed: {
    title: string;
    description: string;
    hint: string;
    hintLink: string;
    hintSuffix: string;
    targetLabel: string;
    futureExamsLabel: string;
    examNamePlaceholder: string;
    weightPlaceholder: string;
    addExam: string;
    calculateButton: string;
    shortcutAdd: string;
    shortcutDelete: string;
    clearAll: string;
    clearConfirm: string;
    invalidTarget: string;
    noGradesBefore: string;
    noGradesAfter: string;
    assumption: string;
    tableExam: string;
    tableRequired: string;
    impossible: string;
    bestAttainablePrefix: string;
    alreadyAchieved: string;
    examFallback: string;
  };
}
