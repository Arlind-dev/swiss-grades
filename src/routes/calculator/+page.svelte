<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { m } from '$lib/i18n';
  import { settings } from '$lib/stores/settings';
  import { calculateGradeFromPoints, applyRounding } from '$lib/utils/grading';
  import { readSharePayload, type SharePayload } from '$lib/utils/share';
  import type { RoundingKey } from '$lib/types';
  import Page from '$lib/components/Page.svelte';
  import NumberField from '$lib/components/NumberField.svelte';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import ResultBar from '$lib/components/ResultBar.svelte';

  const init = get(settings);
  let points = $state(init.calculatorPoints);
  let maxPoints = $state(init.calculatorMaxPoints);
  let rounding = $state<RoundingKey>(init.calculatorRounding);

  // Persist inputs + rounding back to settings.
  $effect(() => {
    settings.update((s) => ({
      ...s,
      calculatorPoints: points,
      calculatorMaxPoints: maxPoints,
      calculatorRounding: rounding
    }));
  });

  onMount(() => {
    const shared = readSharePayload('calculator');
    if (shared && shared.page === 'calculator') {
      points = shared.points;
      maxPoints = shared.maxPoints;
      rounding = shared.rounding;
    }
  });

  type Result =
    | { kind: 'empty' }
    | { kind: 'invalid' }
    | { kind: 'outOfRange' }
    | { kind: 'ok'; value: string; grade: number };

  const result = $derived.by<Result>(() => {
    if (points.trim() === '' || maxPoints.trim() === '') return { kind: 'empty' };
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);
    if (isNaN(p) || isNaN(max) || max <= 0) return { kind: 'invalid' };
    if (p < 0 || p > max) return { kind: 'outOfRange' };
    const raw = calculateGradeFromPoints(p, max);
    const value = applyRounding(raw, rounding);
    return { kind: 'ok', value, grade: parseFloat(value) };
  });

  const tone = $derived(
    result.kind === 'ok'
      ? result.grade >= 4.5
        ? 'pass'
        : result.grade >= 4
          ? 'warn'
          : 'fail'
      : 'neutral'
  );

  function clear() {
    points = '';
    maxPoints = '';
  }

  const payload = (): SharePayload => ({
    v: 1,
    page: 'calculator',
    points,
    maxPoints,
    rounding
  });
</script>

<svelte:head><title>{$m.calculator.title} — Swiss Grades</title></svelte:head>

<Page title={$m.calculator.title} subtitle={$m.calculator.subtitle}>
  <!-- formula -->
  <div class="mb-6 flex items-center gap-3 text-sm text-muted">
    <span>{$m.calculator.formulaLabel}</span>
    <span class="inline-flex flex-col text-center leading-tight">
      <span class="px-2">{$m.calculator.formulaNumerator}</span>
      <span class="border-t border-line px-2 pt-0.5">{$m.calculator.formulaDenominator}</span>
    </span>
    <span>+ 1</span>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField id="points" label={$m.calculator.pointsLabel} bind:value={points} placeholder="0" />
    <NumberField
      id="max-points"
      label={$m.calculator.maxPointsLabel}
      bind:value={maxPoints}
      placeholder="0"
    />
  </div>

  {#if result.kind === 'ok'}
    <ResultBar
      label={$m.calculator.resultPrefix}
      value={result.value}
      {tone}
      statusLabel={result.grade >= 4 ? $m.common.pass : $m.common.fail}
    />
  {:else if result.kind === 'empty'}
    <ResultBar emptyText={$m.common.emptyState} />
  {:else}
    <ResultBar>
      <p class="text-sm" style="color: var(--ctp-yellow);">
        {result.kind === 'invalid' ? $m.calculator.invalidInput : $m.calculator.pointsOutOfRange}
      </p>
    </ResultBar>
  {/if}

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <RoundingSelect value={rounding} onChange={(v) => (rounding = v)} />
    <div class="ml-auto flex items-center gap-2">
      <ShareButton {payload} />
      <ClearButton
        label={$m.calculator.clearAll}
        confirmLabel={$m.calculator.clearConfirm}
        onConfirm={clear}
      />
    </div>
  </div>
</Page>
