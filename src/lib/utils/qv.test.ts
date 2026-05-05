import { describe, expect, test } from 'bun:test';
import { QV_PRESETS } from '../qv/presets';
import {
  computeComponentGrade,
  computeNeededGrade,
  computeQVFinalGrade,
  evaluateQV,
} from './qv';

const preset = QV_PRESETS[0];
const ipa = preset.components.find((component) => component.id === 'ipa')!;
const ik = preset.components.find((component) => component.id === 'ik')!;

describe('QV Informatiker/in EFZ calculations', () => {
  test('regular all 4.0 passes', () => {
    const result = evaluateQV(preset, 'regular', { ipa: 4, abu: 4, egk: 4, ik: 4 });
    expect(result.finalGrade).toBe(4);
    expect(result.passed).toBe(true);
  });

  test('regular IPA below 4.0 fails even with a high final grade', () => {
    const result = evaluateQV(preset, 'regular', { ipa: 3.9, abu: 6, egk: 6, ik: 6 });
    expect(result.finalGrade).toBeGreaterThanOrEqual(4);
    expect(result.failedFallnoten).toEqual(['ipa']);
    expect(result.passed).toBe(false);
  });

  test('regular IK below 4.0 fails even with a high final grade', () => {
    const result = evaluateQV(preset, 'regular', { ipa: 6, abu: 6, egk: 6, ik: 3.9 });
    expect(result.finalGrade).toBeGreaterThanOrEqual(4);
    expect(result.failedFallnoten).toEqual(['ik']);
    expect(result.passed).toBe(false);
  });

  test('regular raw 3.95 rounds to 4.0 and passes when fallnoten pass', () => {
    const result = evaluateQV(preset, 'regular', { ipa: 4, abu: 4, egk: 3.5, ik: 4 });
    expect(result.rawFinalGrade).toBeCloseTo(3.95);
    expect(result.finalGrade).toBe(4);
    expect(result.passed).toBe(true);
  });

  test('BM mode normalizes IPA 40 and IK 30 over 70', () => {
    const result = computeQVFinalGrade(preset, 'bm', { ipa: 5, ik: 4 });
    expect(result?.rawFinalGrade).toBeCloseTo((5 * 40 + 4 * 30) / 70);
    expect(result?.finalGrade).toBe(4.6);
  });

  test('BM mode with IPA 4.0 and IK 4.0 passes', () => {
    const result = evaluateQV(preset, 'bm', { ipa: 4, ik: 4 });
    expect(result.finalGrade).toBe(4);
    expect(result.passed).toBe(true);
  });

  test('BM mode with a fallnote below 4.0 fails', () => {
    const result = evaluateQV(preset, 'bm', { ipa: 3.9, ik: 6 });
    expect(result.failedFallnoten).toEqual(['ipa']);
    expect(result.passed).toBe(false);
  });

  test('IPA detail calculation uses 50/20/30', () => {
    const result = computeComponentGrade(ipa, {
      execution: 5,
      documentation: 4,
      presentation: 3,
    });
    expect(result).toBe(4.2);
  });

  test('IK detail calculation uses 80/20', () => {
    const result = computeComponentGrade(ik, { bfs: 4.5, uek: 5.5 });
    expect(result).toBe(4.7);
  });

  test('needed grade respects fallnoten', () => {
    const needed = computeNeededGrade(preset, 'regular', { abu: 6, egk: 6, ik: 6 });
    expect(needed?.missingComponentIds).toEqual(['ipa']);
    expect(needed?.grade).toBe(4);
    expect(needed?.impossible).toBe(false);
  });

  test('needed grade respects max grade 6.0', () => {
    const needed = computeNeededGrade(preset, 'regular', { ipa: 4, ik: 4, abu: 1 });
    expect(needed?.missingComponentIds).toEqual(['egk']);
    expect(needed?.grade).toBeNull();
    expect(needed?.impossible).toBe(true);
    expect(needed?.reason).toBe('max-grade');
  });
});
