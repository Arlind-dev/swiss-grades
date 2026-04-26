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
    formula: string;
    pointsLabel: string;
    maxPointsLabel: string;
    calculateButton: string;
    invalidInput: string;
    pointsOutOfRange: string;
    resultPrefix: string;
  };
  average: {
    title: string;
    addGrade: string;
    calculateButton: string;
    clearAll: string;
    clearConfirm: string;
    shortcutAdd: string;
    shortcutDelete: string;
    dragHandleTitle: string;
    resultPrefix: string;
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
    invalidTarget: string;
    noGradesBefore: string;
    noGradesAfter: string;
    assumption: string;
    tableExam: string;
    tableRequired: string;
    impossible: string;
    alreadyAchieved: string;
    examFallback: string;
  };
}
