<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { m } from '$lib/i18n';
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import { needed, sanitizeCount, MAX_REMAINING } from '$lib/stores/needed';
  import type { GradeEntry, RoundingKey } from '$lib/types';
  import { computeWeightedAverage, computeWeightedSums, applyRounding } from '$lib/utils/grading';
  import {
    serializeGrades,
    hydrateGrades,
    readSharePayload,
    type SharePayload
  } from '$lib/utils/share';
  import Page from '$lib/components/Page.svelte';
  import NumberField from '$lib/components/NumberField.svelte';
  import ResultBar from '$lib/components/ResultBar.svelte';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import StatusChip from '$lib/components/StatusChip.svelte';

  // Each remaining exam counts as one normal grade (weight 100).
  const EXAM_WEIGHT = 100;

  let target = $state(get(needed).target);
  let count = $state(get(needed).count);
  let rounding = $state<RoundingKey>(get(settings).neededRounding);

  function normalize(list: GradeEntry[]): GradeEntry[] {
    return list.map((e) => {
      const subgrades = normalize(e.subgrades);
      const avg = computeWeightedAverage(subgrades);
      return {
        ...e,
        subgrades,
        grade: subgrades.length
          ? avg !== null
            ? (Math.round(avg * 100) / 100).toFixed(2)
            : ''
          : e.grade
      };
    });
  }

  const currentSums = $derived(computeWeightedSums(normalize($grades)));
  const futureWeightSum = $derived(count * EXAM_WEIGHT);

  $effect(() => {
    needed.set({ target, count });
  });
  $effect(() => {
    settings.update((s) => ({ ...s, neededRounding: rounding }));
  });

  function setCount(n: number) {
    count = sanitizeCount(n);
  }

  type Result =
    | { kind: 'noGrades' }
    | { kind: 'invalidTarget' }
    | { kind: 'achieved' }
    | { kind: 'impossible'; best: string }
    | { kind: 'ok'; grade: string };

  const result = $derived.by<Result>(() => {
    if (currentSums.weightSum === 0) return { kind: 'noGrades' };
    const t = parseFloat(target);
    if (isNaN(t) || t < 1 || t > 6) return { kind: 'invalidTarget' };

    const totalWeight = currentSums.weightSum + futureWeightSum;
    const g = (t * totalWeight - currentSums.weightedSum) / futureWeightSum;

    if (g <= 1) return { kind: 'achieved' };
    if (g > 6) {
      const best = (currentSums.weightedSum + 6 * futureWeightSum) / totalWeight;
      return { kind: 'impossible', best: applyRounding(best, rounding) };
    }
    return { kind: 'ok', grade: applyRounding(g, rounding) };
  });

  function clearAll() {
    target = '';
    count = 1;
  }

  onMount(() => {
    const shared = readSharePayload('needed');
    if (shared && shared.page === 'needed') {
      grades.set(hydrateGrades(shared.grades));
      target = shared.targetAverage;
      count = sanitizeCount(shared.futureExams.length || 1);
      rounding = shared.rounding;
    }
  });

  const payload = (): SharePayload => ({
    v: 1,
    page: 'needed',
    grades: serializeGrades(normalize($grades)),
    targetAverage: target,
    futureExams: Array.from({ length: count }, () => ({ name: '', weight: '' })),
    rounding
  });
</script>

<svelte:head><title>{$m.needed.title} — Swiss Grades</title></svelte:head>

<Page title={$m.needed.title} subtitle={$m.needed.description}>
  <p class="-mt-4 mb-6 text-sm text-muted">
    {$m.needed.hint}
    <a class="text-accent hover:underline" href="/average">{$m.needed.hintLink}</a>
    {$m.needed.hintSuffix}
  </p>

  <div class="flex flex-wrap items-end gap-x-8 gap-y-4">
    <div class="w-28">
      <NumberField
        id="target"
        label={$m.needed.targetLabel}
        bind:value={target}
        min={1}
        max={6}
        decimals={2}
        placeholder="4.00"
      />
    </div>

    <div>
      <span class="field-label">{$m.needed.remainingExams}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-md border border-input-line text-muted transition-colors hover:border-accent hover:text-text disabled:opacity-40"
          onclick={() => setCount(count - 1)}
          disabled={count <= 1}
          aria-label="−"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <input
          class="field-input tnum w-14 text-center"
          value={count}
          inputmode="numeric"
          aria-label={$m.needed.remainingExams}
          oninput={(e) => {
            const n = parseInt(e.currentTarget.value, 10);
            if (Number.isFinite(n)) setCount(n);
          }}
        />
        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-md border border-input-line text-muted transition-colors hover:border-accent hover:text-text disabled:opacity-40"
          onclick={() => setCount(count + 1)}
          disabled={count >= MAX_REMAINING}
          aria-label="+"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  </div>

  <ResultBar>
    {#if result.kind === 'noGrades'}
      <p class="text-sm text-muted">
        {$m.needed.noGradesBefore}<a class="text-accent hover:underline" href="/average">{$m.needed.hintLink}</a>{$m.needed.noGradesAfter}
      </p>
    {:else if result.kind === 'invalidTarget'}
      <p class="text-sm" style="color: var(--ctp-yellow);">{$m.needed.invalidTarget}</p>
    {:else if result.kind === 'achieved'}
      <StatusChip tone="pass" label={$m.needed.alreadyAchieved} />
    {:else if result.kind === 'impossible'}
      <div class="flex flex-col gap-2">
        <StatusChip tone="fail" label={$m.needed.impossible} />
        <p class="text-sm text-muted">
          {$m.needed.bestAttainablePrefix}<span class="tnum font-medium text-text">{result.best}</span>
        </p>
      </div>
    {:else}
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-2">
          <span class="text-sm text-muted">{$m.needed.tableRequired}</span>
          <span class="tnum text-lg font-semibold text-text">{result.grade}</span>
        </div>
        <p class="text-xs text-faint">{$m.needed.assumption}</p>
      </div>
    {/if}
  </ResultBar>

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <RoundingSelect value={rounding} onChange={(v) => (rounding = v)} />
    <div class="ml-auto flex items-center gap-2">
      <ShareButton {payload} />
      <ClearButton label={$m.needed.clearAll} confirmLabel={$m.needed.clearConfirm} onConfirm={clearAll} />
    </div>
  </div>
</Page>
