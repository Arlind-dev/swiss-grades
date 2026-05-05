import type { QVComponent, QVPreset } from './types';

const informatikerComponents: QVComponent[] = [
  {
    id: 'ipa',
    label: 'Praktische Arbeit als IPA',
    shortLabel: 'IPA',
    weight: 40,
    description: 'Ausführung und Resultat inklusive Projektmanagement 50%, Dokumentation 20%, Präsentation und Fachgespräch 30%. Dieser Bereich ist eine Fallnote.',
    roundingNote: 'Positionsnoten auf 0.5; IPA-Note auf 0.1',
    fallnote: true,
    minGrade: 4,
    details: [
      { id: 'execution', label: 'Ausführung und Resultat der Arbeit inkl. Projektmanagement', shortLabel: 'Ausführung', weight: 50, roundingNote: 'auf 0.5 gerundet' },
      { id: 'documentation', label: 'Dokumentation', shortLabel: 'Dokumentation', weight: 20, roundingNote: 'auf 0.5 gerundet' },
      { id: 'presentation', label: 'Präsentation und Fachgespräch', shortLabel: 'Präsentation', weight: 30, roundingNote: 'auf 0.5 gerundet' },
    ],
  },
  {
    id: 'abu',
    label: 'Allgemeinbildung',
    shortLabel: 'ABU',
    weight: 20,
    description: 'Erfahrungsnote ABU, Vertiefungsarbeit und Schlussprüfung zählen je 1/3.',
    roundingNote: 'ABU-Note auf 0.1',
    excludedInTracks: ['bm'],
  },
  {
    id: 'egk',
    label: 'Erweiterte Grundkompetenzen',
    shortLabel: 'eGK',
    weight: 10,
    description: 'Durchschnitt aus den acht Semesterzeugnisnoten im Bereich erweiterte Grundkompetenzen.',
    roundingNote: 'eGK-Note auf 0.5',
    excludedInTracks: ['bm'],
  },
  {
    id: 'ik',
    label: 'Erfahrungsnote Informatikkompetenzen',
    shortLabel: 'IK',
    weight: 30,
    description: 'Module der Berufsfachschule 80% und überbetriebliche Kurse 20%. Dieser Bereich ist eine Fallnote.',
    roundingNote: 'BFS/ÜK-Mittel auf 0.5; IK-Note auf 0.1',
    fallnote: true,
    minGrade: 4,
    details: [
      { id: 'bfs', label: 'Module Berufsfachschule', shortLabel: 'BFS', weight: 80, roundingNote: 'Mittel auf 0.5 gerundet' },
      { id: 'uek', label: 'Überbetriebliche Kurse', shortLabel: 'ÜK', weight: 20, roundingNote: 'Mittel auf 0.5 gerundet' },
    ],
  },
];

export const QV_PRESETS: QVPreset[] = [
  {
    id: 'informatiker-efz-applikationsentwicklung',
    label: 'EFZ Informatiker/in Applikationsentwicklung',
    shortLabel: 'Applikationsentwicklung',
    fachrichtung: 'Applikationsentwicklung',
    components: informatikerComponents,
  },
  {
    id: 'informatiker-efz-plattformentwicklung',
    label: 'EFZ Informatiker/in Plattformentwicklung',
    shortLabel: 'Plattformentwicklung',
    fachrichtung: 'Plattformentwicklung',
    components: informatikerComponents,
  },
];

export function getQVPreset(id: string): QVPreset {
  return QV_PRESETS.find((preset) => preset.id === id) ?? QV_PRESETS[0];
}
