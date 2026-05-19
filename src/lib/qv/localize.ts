import type { Locale } from '../i18n/messages';
import { QV_PRESETS } from './presets';
import type {
  QVComponent,
  QVComponentMode,
  QVDetailComponent,
  QVOverviewItem,
  QVPreset,
  QVTrackOption,
} from './types';
import { QV_PATH_TRANSLATIONS, QV_TEXT_TRANSLATIONS, type QVTranslationLocale } from './translations';

type CandidatePaths = string | string[];

function isTranslatedLocale(locale: Locale): locale is QVTranslationLocale {
  return locale === 'en' || locale === 'fr' || locale === 'it';
}

function pathList(paths: CandidatePaths): string[] {
  return Array.isArray(paths) ? paths : [paths];
}

function translate(locale: QVTranslationLocale, paths: CandidatePaths, value: string): string {
  const pathTranslations = QV_PATH_TRANSLATIONS[locale];
  for (const path of pathList(paths)) {
    const translated = pathTranslations[path];
    if (translated !== undefined) return translated;
  }

  return QV_TEXT_TRANSLATIONS[locale][value] ?? value;
}

function hasTranslation(locale: QVTranslationLocale, paths: CandidatePaths, value: string | undefined): boolean {
  if (!value) return true;
  const pathTranslations = QV_PATH_TRANSLATIONS[locale];
  return pathList(paths).some((path) => pathTranslations[path] !== undefined)
    || QV_TEXT_TRANSLATIONS[locale][value] !== undefined;
}

function localizeOverviewItem(locale: QVTranslationLocale, presetId: string, item: QVOverviewItem): QVOverviewItem {
  const basePath = `overviewItems.${presetId}.${item.id}`;
  const genericPath = `overviewItems.${item.id}`;
  return {
    ...item,
    title: translate(locale, [`${basePath}.title`, `${genericPath}.title`], item.title),
    text: translate(locale, [`${basePath}.text`, `${genericPath}.text`], item.text),
  };
}

function localizeTrack(locale: QVTranslationLocale, presetId: string, track: QVTrackOption): QVTrackOption {
  const basePath = `tracks.${presetId}.${track.id}`;
  const genericPath = `tracks.${track.id}`;
  return {
    ...track,
    label: translate(locale, [`${basePath}.label`, `${genericPath}.label`], track.label),
    note: track.note ? translate(locale, [`${basePath}.note`, `${genericPath}.note`], track.note) : undefined,
  };
}

function localizeDetail(
  locale: QVTranslationLocale,
  paths: {
    componentId: string;
    detailId: string;
    modeId?: string;
  },
  detail: QVDetailComponent
): QVDetailComponent {
  const prefixPaths = paths.modeId
    ? [
        `details.${paths.componentId}.${paths.modeId}.${paths.detailId}`,
        `details.${paths.modeId}.${paths.detailId}`,
        `details.${paths.componentId}.${paths.detailId}`,
        `details.${paths.detailId}`,
      ]
    : [
        `details.${paths.componentId}.${paths.detailId}`,
        `details.${paths.detailId}`,
      ];

  return {
    ...detail,
    label: translate(locale, prefixPaths.map((path) => `${path}.label`), detail.label),
    shortLabel: translate(locale, prefixPaths.map((path) => `${path}.shortLabel`), detail.shortLabel),
    roundingNote: detail.roundingNote
      ? translate(locale, prefixPaths.map((path) => `${path}.roundingNote`), detail.roundingNote)
      : undefined,
  };
}

function localizeMode(locale: QVTranslationLocale, componentId: string, mode: QVComponentMode): QVComponentMode {
  const basePath = `detailModes.${componentId}.${mode.id}`;
  const genericPath = `detailModes.${mode.id}`;
  return {
    ...mode,
    label: translate(locale, [`${basePath}.label`, `${genericPath}.label`], mode.label),
    description: mode.description
      ? translate(locale, [`${basePath}.description`, `${genericPath}.description`], mode.description)
      : undefined,
    details: mode.details?.map((detail) => localizeDetail(locale, {
      componentId,
      modeId: mode.id,
      detailId: detail.id,
    }, detail)),
  };
}

function localizeComponent(locale: QVTranslationLocale, component: QVComponent): QVComponent {
  const basePath = `components.${component.id}`;
  return {
    ...component,
    label: translate(locale, `${basePath}.label`, component.label),
    shortLabel: translate(locale, `${basePath}.shortLabel`, component.shortLabel),
    description: component.description ? translate(locale, `${basePath}.description`, component.description) : undefined,
    roundingNote: component.roundingNote ? translate(locale, `${basePath}.roundingNote`, component.roundingNote) : undefined,
    details: component.details?.map((detail) => localizeDetail(locale, {
      componentId: component.id,
      detailId: detail.id,
    }, detail)),
    detailModes: component.detailModes?.map((mode) => localizeMode(locale, component.id, mode)),
  };
}

export function localizeQVPreset(preset: QVPreset, locale: Locale): QVPreset {
  if (!isTranslatedLocale(locale)) return preset;

  const basePath = `presets.${preset.id}`;
  return {
    ...preset,
    label: translate(locale, `${basePath}.label`, preset.label),
    shortLabel: translate(locale, `${basePath}.shortLabel`, preset.shortLabel),
    fachrichtung: translate(locale, `${basePath}.fachrichtung`, preset.fachrichtung),
    description: translate(locale, `${basePath}.description`, preset.description),
    overviewItems: preset.overviewItems.map((item) => localizeOverviewItem(locale, preset.id, item)),
    tracks: preset.tracks.map((track) => localizeTrack(locale, preset.id, track)),
    components: preset.components.map((component) => localizeComponent(locale, component)),
  };
}

export function localizeQVPresets(presets: QVPreset[], locale: Locale): QVPreset[] {
  if (!isTranslatedLocale(locale)) return presets;
  return presets.map((preset) => localizeQVPreset(preset, locale));
}

function addMissing(missing: string[], locale: QVTranslationLocale, paths: CandidatePaths, value: string | undefined): void {
  if (hasTranslation(locale, paths, value)) return;
  missing.push(pathList(paths)[0]);
}

function collectDetailMissing(
  missing: string[],
  locale: QVTranslationLocale,
  paths: {
    componentId: string;
    detailId: string;
    modeId?: string;
  },
  detail: QVDetailComponent
): void {
  const prefixPaths = paths.modeId
    ? [
        `details.${paths.componentId}.${paths.modeId}.${paths.detailId}`,
        `details.${paths.modeId}.${paths.detailId}`,
        `details.${paths.componentId}.${paths.detailId}`,
        `details.${paths.detailId}`,
      ]
    : [
        `details.${paths.componentId}.${paths.detailId}`,
        `details.${paths.detailId}`,
      ];

  addMissing(missing, locale, prefixPaths.map((path) => `${path}.label`), detail.label);
  addMissing(missing, locale, prefixPaths.map((path) => `${path}.shortLabel`), detail.shortLabel);
  addMissing(missing, locale, prefixPaths.map((path) => `${path}.roundingNote`), detail.roundingNote);
}

function collectModeMissing(
  missing: string[],
  locale: QVTranslationLocale,
  componentId: string,
  mode: QVComponentMode
): void {
  const basePath = `detailModes.${componentId}.${mode.id}`;
  const genericPath = `detailModes.${mode.id}`;
  addMissing(missing, locale, [`${basePath}.label`, `${genericPath}.label`], mode.label);
  addMissing(missing, locale, [`${basePath}.description`, `${genericPath}.description`], mode.description);

  for (const detail of mode.details ?? []) {
    collectDetailMissing(missing, locale, {
      componentId,
      modeId: mode.id,
      detailId: detail.id,
    }, detail);
  }
}

function collectComponentMissing(missing: string[], locale: QVTranslationLocale, component: QVComponent): void {
  const basePath = `components.${component.id}`;
  addMissing(missing, locale, `${basePath}.label`, component.label);
  addMissing(missing, locale, `${basePath}.shortLabel`, component.shortLabel);
  addMissing(missing, locale, `${basePath}.description`, component.description);
  addMissing(missing, locale, `${basePath}.roundingNote`, component.roundingNote);

  for (const detail of component.details ?? []) {
    collectDetailMissing(missing, locale, {
      componentId: component.id,
      detailId: detail.id,
    }, detail);
  }

  for (const mode of component.detailModes ?? []) {
    collectModeMissing(missing, locale, component.id, mode);
  }
}

export function getMissingQVTranslationPaths(locale: QVTranslationLocale): string[] {
  const missing: string[] = [];

  for (const preset of QV_PRESETS) {
    const presetPath = `presets.${preset.id}`;
    addMissing(missing, locale, `${presetPath}.label`, preset.label);
    addMissing(missing, locale, `${presetPath}.shortLabel`, preset.shortLabel);
    addMissing(missing, locale, `${presetPath}.fachrichtung`, preset.fachrichtung);
    addMissing(missing, locale, `${presetPath}.description`, preset.description);

    for (const track of preset.tracks) {
      const basePath = `tracks.${preset.id}.${track.id}`;
      const genericPath = `tracks.${track.id}`;
      addMissing(missing, locale, [`${basePath}.label`, `${genericPath}.label`], track.label);
      addMissing(missing, locale, [`${basePath}.note`, `${genericPath}.note`], track.note);
    }

    for (const item of preset.overviewItems) {
      const basePath = `overviewItems.${preset.id}.${item.id}`;
      const genericPath = `overviewItems.${item.id}`;
      addMissing(missing, locale, [`${basePath}.title`, `${genericPath}.title`], item.title);
      addMissing(missing, locale, [`${basePath}.text`, `${genericPath}.text`], item.text);
    }

    for (const component of preset.components) {
      collectComponentMissing(missing, locale, component);
    }
  }

  return Array.from(new Set(missing)).sort();
}
