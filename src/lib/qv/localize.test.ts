import { describe, expect, test } from 'bun:test';
import { QV_PRESETS } from './presets';
import { getMissingQVTranslationPaths, localizeQVPreset, localizeQVPresets } from './localize';
import type { Locale } from '../i18n/messages';
import type { QVPreset } from './types';

const informatikerPreset = QV_PRESETS[0];
const nonGermanLocales = ['en', 'fr', 'it'] as const satisfies readonly Exclude<Locale, 'de'>[];

function componentById(preset: QVPreset, id: string) {
  const component = preset.components.find((entry) => entry.id === id);
  if (!component) throw new Error(`Missing component ${id}`);
  return component;
}

function modeById(preset: QVPreset, componentId: string, modeId: string) {
  const mode = componentById(preset, componentId).detailModes?.find((entry) => entry.id === modeId);
  if (!mode) throw new Error(`Missing mode ${componentId}.${modeId}`);
  return mode;
}

function detailById(preset: QVPreset, componentId: string, detailId: string, modeId?: string) {
  const details = modeId
    ? modeById(preset, componentId, modeId).details
    : componentById(preset, componentId).details;
  const detail = details?.find((entry) => entry.id === detailId);
  if (!detail) throw new Error(`Missing detail ${componentId}.${modeId ? `${modeId}.` : ''}${detailId}`);
  return detail;
}

function structuralSnapshot(presets: QVPreset[]) {
  return presets.map((preset) => ({
    id: preset.id,
    sources: preset.sources,
    tracks: preset.tracks.map((track) => ({
      id: track.id,
      excludedComponentIds: track.excludedComponentIds ?? [],
    })),
    overviewItems: preset.overviewItems.map((item) => item.id),
    components: preset.components.map((component) => ({
      id: component.id,
      weight: component.weight,
      fallnote: component.fallnote ?? false,
      minGrade: component.minGrade ?? null,
      excludedInTracks: component.excludedInTracks ?? [],
      defaultDetailModeId: component.defaultDetailModeId ?? null,
      detailResultRounding: component.detailResultRounding ?? null,
      details: component.details?.map((detail) => ({
        id: detail.id,
        weight: detail.weight,
      })) ?? [],
      detailModes: component.detailModes?.map((mode) => ({
        id: mode.id,
        resultRounding: mode.resultRounding ?? null,
        excluded: mode.excluded ?? false,
        details: mode.details?.map((detail) => ({
          id: detail.id,
          weight: detail.weight,
        })) ?? [],
      })) ?? [],
    })),
  }));
}

describe('QV preset localization', () => {
  test('German localization returns the canonical preset data unchanged', () => {
    expect(localizeQVPreset(informatikerPreset, 'de')).toBe(informatikerPreset);
    expect(localizeQVPresets(QV_PRESETS, 'de')).toBe(QV_PRESETS);
  });

  test('all non-German locales have complete QV preset translation coverage', () => {
    for (const locale of nonGermanLocales) {
      expect(getMissingQVTranslationPaths(locale)).toEqual([]);
    }
  });

  test('Informatiker eGK component and input modes are translated', () => {
    const localized = localizeQVPreset(informatikerPreset, 'en');
    const egk = componentById(localized, 'egk');

    expect(egk.label).toBe('Extended basic competencies');
    expect(egk.description?.includes('Mathematics and English')).toBe(true);
    expect(modeById(localized, 'egk', 'official-semester-grades').label).toBe('Official: eight semester report grades');
    expect(modeById(localized, 'egk', 'subject-finals').label).toBe('Simplified: Mathematics and English');
    expect(detailById(localized, 'egk', 'math', 'subject-finals').label).toBe('Mathematics');
    expect(detailById(localized, 'egk', 'english', 'subject-finals').label).toBe('English');
  });

  test('ABU special modes are translated', () => {
    const localized = localizeQVPreset(informatikerPreset, 'en');

    expect(modeById(localized, 'abu', 'efz-standard').label).toBe('Regular 3-/4-year EFZ');
    expect(modeById(localized, 'abu', 'bm-transfer-late').label).toBe('BM transfer in the penultimate school semester');
    expect(modeById(localized, 'abu', 'outside-regular-education').label).toBe('Admission outside the education program');
    expect(modeById(localized, 'abu', 'repeat-without-abu-school').label).toBe('Repeat without ABU lessons');
    expect(modeById(localized, 'abu', 'dispensed').label).toBe('ABU dispensed');
  });

  test('non-Informatiker no-eGK copy is translated in all non-German locales', () => {
    const nonInformatikerPresets = QV_PRESETS.filter((preset) => !preset.id.includes('informatiker'));

    for (const locale of nonGermanLocales) {
      const localized = localizeQVPresets(nonInformatikerPresets, locale);
      const allCopy = JSON.stringify(localized);
      expect(allCopy.includes('Keine separate eGK-Komponente')).toBe(false);
    }
  });

  test('source labels and URLs are preserved', () => {
    for (const locale of nonGermanLocales) {
      const localized = localizeQVPresets(QV_PRESETS, locale);
      expect(localized.map((preset) => preset.sources)).toEqual(QV_PRESETS.map((preset) => preset.sources));
    }
  });

  test('localized presets preserve calculation and storage identifiers', () => {
    for (const locale of nonGermanLocales) {
      expect(structuralSnapshot(localizeQVPresets(QV_PRESETS, locale))).toEqual(structuralSnapshot(QV_PRESETS));
    }
  });
});
