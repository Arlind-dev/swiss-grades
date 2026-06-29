<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { gradeColor, computeWeightedSums, applyRounding } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';
  import ShortcutHint from '$lib/components/ShortcutHint.svelte';
  import { focusRowInput } from '$lib/utils/focus';
  import { browser } from '$app/environment';
  import { settings } from '$lib/stores/settings';
  import Page from '$lib/components/Page.svelte';
  import ToolbarRow from '$lib/components/ToolbarRow.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import StatusChip from '$lib/components/StatusChip.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { STORAGE_KEYS } from '$lib/storage-keys';
  import { onMount } from 'svelte';
  import { clearShareParam, createShareUrl, hydrateGrades, readSharePayload, serializeGrades } from '$lib/utils/share';
  import { fade } from 'svelte/transition';
  import { PlusOutline } from 'flowbite-svelte-icons';

  const STORAGE_KEY = STORAGE_KEYS.needed;

  let rounding = $state($settings.neededRounding);
  $effect(() => { settings.update((s) => ({ ...s, neededRounding: rounding })); });

  interface FutureExam {
    id: string;
    name: string;
    weight: string;
  }

  function loadSaved() {
    if (!browser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  const saved = loadSaved();
  let targetAverage = $state<string>(saved?.targetAverage ?? '');
  let futureExams = $state<FutureExam[]>(
    saved?.futureExams?.length
      ? saved.futureExams.map((e: { name: string; weight: string }) => ({ id: crypto.randomUUID(), name: e.name, weight: e.weight || '100' }))
      : [{ id: crypto.randomUUID(), name: '', weight: '100' }]
  );

  onMount(() => {
    const payload = readSharePayload('needed');
    if (payload?.page !== 'needed') return;

    grades.set(hydrateGrades(payload.grades));
    targetAverage = payload.targetAverage;
    futureExams = payload.futureExams.length
      ? payload.futureExams.map((exam) => ({ id: crypto.randomUUID(), name: exam.name, weight: exam.weight || '100' }))
      : [{ id: crypto.randomUUID(), name: '', weight: '100' }];
    rounding = payload.rounding;
    clearShareParam();
  });

  $effect(() => {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        targetAverage,
        futureExams: futureExams.map(({ name, weight }) => ({ name, weight })),
      }));
    } catch {}
  });

  interface ExamResult {
    name: string;
    needed: number;
    impossible: boolean;
    alreadyAchieved: boolean;
  }

let results = $derived.by((): ExamResult[] => {
    const target = parseFloat(targetAverage);
    if (isNaN(target) || target < 1 || target > 6) return [];

    const hasGrades = $grades.some((e) => e.grade !== '' && !isNaN(parseFloat(e.grade)));
    if (!hasGrades) return [];

    const { weightSum, weightedSum } = computeWeightedSums($grades);

    const futureWeightSum = futureExams.reduce((sum, e) => {
      const w = parseFloat(e.weight);
      return sum + (isNaN(w) || w <= 0 ? 100 : w);
    }, 0);

    const totalWeight = weightSum + futureWeightSum;
    const needed = weightSum === 0 && futureWeightSum === 0
      ? target
      : (target * totalWeight - weightedSum) / futureWeightSum;

    // impossible = even scoring 6.0 in all future exams won't reach the target after rounding
    const rawBest = totalWeight > 0 ? (weightedSum + 6.0 * futureWeightSum) / totalWeight : 6.0;
    const impossible = parseFloat(applyRounding(rawBest, rounding)) < target;
    const alreadyAchieved = needed < 1.0;

    return futureExams.map((exam) => ({
      name: exam.name || $m.needed.examFallback,
      needed,
      impossible,
      alreadyAchieved,
    }));
  });

  let bestAttainable = $derived.by(() => {
    const hasGrades = $grades.some((e) => e.grade !== '' && !isNaN(parseFloat(e.grade)));
    if (!hasGrades) return 0;
    const { weightSum, weightedSum } = computeWeightedSums($grades);
    const futureWeightSum = futureExams.reduce((sum, e) => {
      const w = parseFloat(e.weight);
      return sum + (isNaN(w) || w <= 0 ? 100 : w);
    }, 0);
    const totalWeight = weightSum + futureWeightSum;
    return totalWeight > 0 ? (weightedSum + 6.0 * futureWeightSum) / totalWeight : 6.0;
  });

  let noGradesError = $derived.by(() => {
    const target = parseFloat(targetAverage);
    if (isNaN(target) || target < 1 || target > 6) return false;
    return !$grades.some((e) => e.grade !== '' && !isNaN(parseFloat(e.grade)));
  });

  function clearAll() {
    targetAverage = '';
    futureExams = [{ id: crypto.randomUUID(), name: '', weight: '100' }];
    if (browser) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }

  function addExam() {
    futureExams = [...futureExams, { id: crypto.randomUUID(), name: '', weight: '100' }];
  }

  function removeExam(id: string) {
    futureExams = futureExams.filter((e) => e.id !== id);
  }


  function onWindowKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addExam();
      setTimeout(() => focusRowInput('.future-exams', '.exam-row', futureExams.length - 1), 0);
    }
  }

  function onExamKeydown(e: KeyboardEvent, id: string) {
    if ((e.ctrlKey && e.key === 'Delete') || (e.metaKey && e.key === 'Backspace')) {
      e.preventDefault();
      if (futureExams.length > 1) {
        const index = futureExams.findIndex((ex) => ex.id === id);
        removeExam(id);
        setTimeout(() => focusRowInput('.future-exams', '.exam-row', index - 1), 0);
      }
    }
  }
</script>

<svelte:head><title>{$m.needed.title}</title></svelte:head>
<svelte:window onkeydown={onWindowKeydown} />

<Page title={$m.needed.title}>
  <p class="-mt-2 text-center text-xs text-ctp-subtext1">
    {$m.needed.hint}
    <a href="/average" class="text-ctp-lavender font-semibold hover:underline">{$m.needed.hintLink}</a>
    {$m.needed.hintSuffix}
  </p>

  <div class="card bg-ctp-mantle">
    <div class="card-body p-5 sm:p-6 space-y-6">
      <ToolbarRow bind:rounding actions={shareAction} />

      <div class="form-control w-full max-w-xs mx-auto text-center">
        <label class="label pt-0 justify-center" for="target">
          <span class="label-text font-semibold text-ctp-subtext1">{$m.needed.targetLabel}</span>
        </label>
        <input
          id="target"
          type="text"
          class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-2xl font-semibold text-center font-mono"
          inputmode="decimal"
          placeholder="4.0"
          bind:value={targetAverage}
          use:numericInput
          use:clampInput={{ min: 1, max: 6, decimals: 2 }}
        />
      </div>

      <div class="space-y-3">
        <p class="section-label">{$m.needed.futureExamsLabel}</p>
        <div class="flex flex-col gap-2.5 future-exams">
          {#each futureExams as exam (exam.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="exam-row flex flex-col gap-2 rounded-xl bg-ctp-base border border-ctp-surface0 p-2.5 transition-all hover:border-ctp-surface1 sm:flex-row sm:items-center sm:gap-3"
              onkeydown={(e) => onExamKeydown(e, exam.id)}
            >
              <input
                type="text"
                class="input input-ghost w-full sm:flex-grow bg-transparent focus:bg-ctp-surface0 border-none focus:outline-none px-3 font-medium text-ctp-text rounded-lg"
                autocomplete="off"
                placeholder={$m.needed.examNamePlaceholder}
                value={exam.name}
                oninput={(e) => {
                  futureExams = futureExams.map((ex) =>
                    ex.id === exam.id ? { ...ex, name: e.currentTarget.value } : ex
                  );
                }}
              />
              <div class="flex items-center gap-2">
                <div class="flex flex-grow items-center gap-1 rounded-xl border border-ctp-surface0 bg-ctp-mantle px-3 py-2 sm:w-28 sm:flex-grow-0">
                  <input
                    type="text"
                    class="w-full border-none bg-transparent text-right font-semibold text-ctp-text font-mono focus:outline-none"
                    inputmode="decimal"
                    placeholder={$m.needed.weightPlaceholder}
                    bind:value={exam.weight}
                    use:numericInput
                    use:clampInput={{ min: 0, max: 100 }}
                  />
                  <span class="text-xs font-semibold text-ctp-overlay1">%</span>
                </div>
                <button
                  type="button"
                  class="btn btn-ghost btn-circle btn-sm text-ctp-overlay1 hover:text-ctp-red shrink-0"
                  disabled={futureExams.length === 1}
                  onclick={() => removeExam(exam.id)}
                  aria-label="Remove exam"
                >✕</button>
              </div>
            </div>
          {/each}
        </div>
        <button type="button" class="btn btn-outline btn-block border-ctp-surface1 text-ctp-subtext1 hover:border-ctp-lavender hover:text-ctp-lavender hover:bg-transparent" onclick={addExam}>
          <PlusOutline class="w-4 h-4" />
          {$m.needed.addExam}
        </button>
      </div>

      <div class="flex justify-center border-t border-ctp-surface0 pt-5">
        <ClearButton
          onConfirm={clearAll}
          label={$m.common.clearAll}
          confirmLabel={$m.common.clearConfirm}
          class="w-full sm:w-auto px-12"
        />
      </div>

      <ShortcutHint addLabel={$m.needed.shortcutAdd} deleteLabel={$m.needed.shortcutDelete} />
    </div>
  </div>

  {#if noGradesError}
    <div class="alert bg-ctp-red/10 border-ctp-red text-ctp-red rounded-xl" transition:fade>
      <span class="text-sm font-semibold">
        {$m.needed.noGradesBefore}<a href="/average" class="underline mx-1">{$m.nav.average}</a>{$m.needed.noGradesAfter}
      </span>
    </div>
  {:else if results.length > 0}
    {@const r = results[0]}
    {@const neededValue = Math.min(r.needed, 6.0)}
    <div class="card bg-ctp-mantle" transition:fade>
      <div class="card-body p-5 sm:p-6 space-y-4">
        {#if r.impossible}
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ctp-surface0 bg-ctp-base px-5 py-4">
            <span class="section-label">{$m.needed.tableRequired}</span>
            <StatusChip variant="error">{$m.needed.impossible}</StatusChip>
          </div>
        {:else if r.alreadyAchieved}
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ctp-surface0 bg-ctp-base px-5 py-4">
            <span class="section-label">{$m.needed.tableRequired}</span>
            <StatusChip variant="success">{$m.needed.alreadyAchieved}</StatusChip>
          </div>
        {:else}
          <ResultDisplay
            label={$m.needed.tableRequired}
            value={applyRounding(neededValue, '2')}
            grade={neededValue}
          />
        {/if}
        <p class="text-xs text-ctp-overlay1">{$m.needed.assumption}</p>
        <p class="text-xs text-ctp-subtext1">
          {$m.needed.bestAttainablePrefix}
          <span class="font-mono font-semibold tabular-nums" style:color={gradeColor(bestAttainable)}>
            {applyRounding(bestAttainable, '2')}
          </span>
        </p>
      </div>
    </div>
  {:else}
    <EmptyState>{$m.common.emptyState}</EmptyState>
  {/if}
</Page>

{#snippet shareAction()}
  <ShareButton getUrl={() => createShareUrl({
    v: 1,
    page: 'needed',
    grades: serializeGrades($grades),
    targetAverage,
    futureExams: futureExams.map(({ name, weight }) => ({ name, weight })),
    rounding
  })} />
{/snippet}
