import type { QVComponent, QVPreset } from './types';

const informatikerComponents: QVComponent[] = [
  {
    id: 'ipa',
    label: 'Praktische Arbeit als IPA',
    shortLabel: 'IPA',
    weight: 40,
    fallnote: true,
    minGrade: 4,
    details: [
      { id: 'execution', label: 'Ausführung und Resultat der Arbeit', shortLabel: 'Ausführung', weight: 50 },
      { id: 'documentation', label: 'Dokumentation', shortLabel: 'Dokumentation', weight: 20 },
      { id: 'presentation', label: 'Präsentation und Fachgespräch', shortLabel: 'Präsentation', weight: 30 },
    ],
  },
  {
    id: 'abu',
    label: 'Allgemeinbildung',
    shortLabel: 'ABU',
    weight: 20,
    excludedInTracks: ['bm'],
  },
  {
    id: 'egk',
    label: 'Erweiterte Grundkompetenzen',
    shortLabel: 'eGK',
    weight: 10,
    excludedInTracks: ['bm'],
  },
  {
    id: 'ik',
    label: 'Erfahrungsnote Informatikkompetenzen',
    shortLabel: 'IK',
    weight: 30,
    fallnote: true,
    minGrade: 4,
    details: [
      { id: 'bfs', label: 'Module Berufsfachschule', shortLabel: 'BFS', weight: 80 },
      { id: 'uek', label: 'Überbetriebliche Kurse', shortLabel: 'ÜK', weight: 20 },
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
