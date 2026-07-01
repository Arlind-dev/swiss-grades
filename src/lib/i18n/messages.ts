export type Locale = 'de' | 'en' | 'fr' | 'it';

export interface Messages {
  common: {
    close: string;
    pass: string;
    fail: string;
    emptyState: string;
    clearAll: string;
    clearConfirm: string;
  };
  nav: {
    calculator: string;
    average: string;
    needed: string;
    qv: string;
  };
  navShort: {
    calculator: string;
    average: string;
    needed: string;
    qv: string;
  };
  gradeRow: {
    placeholderName: string;
    placeholderGrade: string;
    placeholderWeight: string;
    addSubgrade: string;
  };
  rounding: {
    label: string;
    oneDecimal: string;
    twoDecimal: string;
  };
  share: {
    action: string;
    copied: string;
    failed: string;
    tooLarge: string;
    copyPrompt: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    formulaLabel: string;
    formulaNumerator: string;
    formulaDenominator: string;
    pointsLabel: string;
    maxPointsLabel: string;
    clearAll: string;
    clearConfirm: string;
    invalidInput: string;
    pointsOutOfRange: string;
    resultPrefix: string;
  };
  average: {
    title: string;
    subtitle: string;
    addGrade: string;
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
    remainingExams: string;
    clearAll: string;
    clearConfirm: string;
    invalidTarget: string;
    noGradesBefore: string;
    noGradesAfter: string;
    assumption: string;
    tableRequired: string;
    impossible: string;
    bestAttainablePrefix: string;
    alreadyAchieved: string;
  };
  qv: {
    title: string;
    description: string;
    presetLabel: string;
    trackLabel: string;
    gradeHeader: string;
    modeLabel: string;
    dispensed: string;
    showDetails: string;
    hideDetails: string;
    fallnotePass: string;
    fallnoteFail: string;
    finalGrade: string;
    rawFinalGrade: string;
    pass: string;
    fail: string;
    pending: string;
    failedFallnotenPrefix: string;
    neededGradePrefix: string;
    neededGradeSuffix: string;
    neededKnownFallnoteImpossible: string;
    neededMaxImpossible: string;
    advisory: string;
  };
  footer: {
    tagline: string;
    tools: string;
    project: string;
    source: string;
    changelog: string;
    license: string;
  };
}
