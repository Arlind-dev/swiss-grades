export const STORAGE_KEYS = {
  theme:    'swiss-grades-theme',
  locale:   'swiss-grades-locale',
  grades:   'swiss-grades-grades',
  settings: 'swiss-grades-settings',
  needed:   'swiss-grades-needed',
} as const;

export const KNOWN_STORAGE_KEYS: Set<string> = new Set(Object.values(STORAGE_KEYS));
