<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { gradeColor, computeWeightedSums, applyRounding } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';
  import { focusRowInput } from '$lib/utils/focus';
  import { browser } from '$app/environment';
  import { settings } from '$lib/stores/settings';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { STORAGE_KEYS } from '$lib/storage-keys';
  import { onMount } from 'svelte';
  import { clearShareParam, createShareUrl, hydrateGrades, readSharePayload, serializeGrades } from '$lib/utils/share';
  import { scale, fade } from 'svelte/transition';
  import { PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';

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

  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  function clearAll() {
    targetAverage = '';
    futureExams = [{ id: crypto.randomUUID(), name: '', weight: '100' }];
    if (browser) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }

  function handleClearAll() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (confirmClear) {
        confirmClear = false;
        if (confirmTimer) clearTimeout(confirmTimer);
        clearAll();
      } else {
        confirmClear = true;
        confirmTimer = setTimeout(() => { confirmClear = false; }, 3000);
      }
    } else {
      clearAll();
    }
  }

  function addExam() {
    futureExams = [...futureExams, { id: crypto.randomUUID(), name: '', weight: '100' }];
  }

  function removeExam(id: string) {
    futureExams = futureExams.filter((e) => e.id !== id);
  }


  let isMac = $state(false);
  $effect(() => { if (browser) isMac = /Macintosh|Mac OS X/.test(navigator.userAgent); });

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

<div class="flex flex-col gap-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-black tracking-tight text-ctp-text">{$m.needed.title}</h1>
    <p class="text-ctp-subtext1 max-w-lg mx-auto">{$m.needed.description}</p>
    <div class="alert bg-ctp-mantle border-ctp-surface0 shadow-sm inline-flex w-auto py-2 px-4 rounded-2xl">
      <p class="text-xs font-medium text-ctp-subtext1">
        {$m.needed.hint} <a href="/average" class="text-ctp-lavender font-bold hover:underline">{$m.needed.hintLink}</a> {$m.needed.hintSuffix}
      </p>
    </div>
  </div>

  <div class="card bg-ctp-mantle shadow-xl border border-ctp-surface0">
    <div class="card-body p-6 sm:p-8">
      <div class="flex justify-between items-center gap-4 mb-8">
        <RoundingSelect bind:value={rounding} />
        <ShareButton getUrl={() => createShareUrl({
          v: 1,
          page: 'needed',
          grades: serializeGrades($grades),
          targetAverage,
          futureExams: futureExams.map(({ name, weight }) => ({ name, weight })),
          rounding
        })} />
      </div>

      <div class="grid grid-cols-1 gap-8">
        <div class="form-control w-full max-w-xs mx-auto text-center">
          <label class="label pt-0 justify-center" for="target">
            <span class="label-text font-bold text-ctp-subtext1">{$m.needed.targetLabel}</span>
          </label>
          <input
            id="target"
            type="text"
            class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-2xl font-black text-center"
            inputmode="decimal"
            placeholder="4.0"
            bind:value={targetAverage}
            use:numericInput
            use:clampInput={{ min: 1, max: 6, decimals: 2 }}
          />
        </div>

        <div class="space-y-4">
          <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1 mb-2">{$m.needed.futureExamsLabel}</p>
          <div class="flex flex-col gap-3 future-exams">
            {#each futureExams as exam (exam.id)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="flex items-center gap-3 p-2 rounded-2xl bg-ctp-base border border-ctp-surface0 transition-all hover:border-ctp-surface1" onkeydown={(e) => onExamKeydown(e, exam.id)}>
                <input
                  type="text"
                  class="input input-ghost flex-grow bg-transparent focus:bg-ctp-surface0 border-none focus:outline-none px-4 font-bold text-ctp-text"
                  autocomplete="off"
                  placeholder={$m.needed.examNamePlaceholder}
                  value={exam.name}
                  oninput={(e) => {
                    futureExams = futureExams.map((ex) =>
                      ex.id === exam.id ? { ...ex, name: e.currentTarget.value } : ex
                    );
                  }}
                />
                <div class="flex items-center gap-1 bg-ctp-mantle px-3 py-2 rounded-xl border border-ctp-surface0 w-28">
                  <input
                    type="text"
                    class="bg-transparent border-none focus:outline-none w-full text-right font-black text-ctp-text"
                    inputmode="decimal"
                    placeholder={$m.needed.weightPlaceholder}
                    bind:value={exam.weight}
                    use:numericInput
                    use:clampInput={{ min: 0, max: 100 }}
                  />
                  <span class="text-xs font-black text-ctp-overlay1">%</span>
                </div>
                <button
                  type="button"
                  class="btn btn-ghost btn-circle btn-sm text-ctp-overlay1 hover:text-ctp-red"
                  disabled={futureExams.length === 1}
                  onclick={() => removeExam(exam.id)}
                  aria-label="Remove exam"
                >✕</button>
              </div>
            {/each}
          </div>
          <button type="button" class="btn btn-outline btn-block border-ctp-surface1 text-ctp-subtext1 hover:bg-ctp-surface0" onclick={addExam}>
            <PlusOutline class="w-4 h-4" />
            {$m.needed.addExam}
          </button>
        </div>
      </div>

      <div class="card-actions justify-center mt-8 pt-6 border-t border-ctp-surface0">
        <button 
          type="button" 
          class="btn btn-ghost w-full sm:w-auto px-12 transition-all" 
          class:btn-error={confirmClear}
          class:bg-ctp-red={confirmClear}
          class:text-ctp-base={confirmClear}
          class:hover:bg-ctp-surface1={!confirmClear}
          onclick={handleClearAll}
        >
          <TrashBinOutline class="w-5 h-5" />
          {confirmClear ? $m.needed.clearConfirm : $m.needed.clearAll}
        </button>
      </div>
      
      <p class="text-center text-xs font-medium text-ctp-overlay1 mt-6 opacity-60 hidden sm:block">
        <kbd class="kbd kbd-xs bg-ctp-surface0 border-ctp-surface1">{isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd class="kbd kbd-xs bg-ctp-surface0 border-ctp-surface1">Enter</kbd> {$m.needed.shortcutAdd} 
        <span class="mx-2 opacity-30">|</span>
        <kbd class="kbd kbd-xs bg-ctp-surface0 border-ctp-surface1">{isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd class="kbd kbd-xs bg-ctp-surface0 border-ctp-surface1">{isMac ? '⌫' : 'Del'}</kbd> {$m.needed.shortcutDelete}
      </p>
    </div>
  </div>

  {#if noGradesError}
    <div class="alert alert-error bg-ctp-red/10 border-ctp-red text-ctp-red rounded-2xl shadow-lg" transition:fade>
      <span class="text-sm font-bold">
        {$m.needed.noGradesBefore}<a href="/average" class="underline mx-1">{$m.nav.average}</a>{$m.needed.noGradesAfter}
      </span>
    </div>
  {/if}

  {#if results.length > 0}
    <div class="space-y-6" transition:fade>
      <div class="flex flex-col sm:flex-row justify-between items-end gap-4 px-4">
        <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1 italic">{$m.needed.assumption}</p>
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-ctp-mantle border border-ctp-surface0 shadow-xl">
          <span class="text-xs font-black uppercase tracking-widest text-ctp-subtext1">{$m.needed.bestAttainablePrefix}</span>
          <span 
            class="text-3xl font-black tabular-nums"
            style:color={gradeColor(bestAttainable)}
          >
            {applyRounding(bestAttainable, '2')}
          </span>
        </div>
      </div>
      
      <div class="card bg-ctp-mantle shadow-2xl border-2 border-ctp-surface0 overflow-hidden">
        <table class="table table-lg w-full">
          <thead class="bg-ctp-surface0/50">
            <tr class="border-ctp-surface0">
              <th class="text-ctp-overlay1 font-black uppercase tracking-widest text-xs">{$m.needed.tableExam}</th>
              <th class="text-ctp-overlay1 font-black uppercase tracking-widest text-xs text-right">{$m.needed.tableRequired}</th>
            </tr>
          </thead>
          <tbody>
            {#each results as r}
              <tr class="border-ctp-surface0 hover:bg-ctp-base/30 transition-colors">
                <td class="font-bold text-ctp-text">{r.name}</td>
                <td class="text-right">
                  {#if r.impossible}
                    <span class="badge badge-error bg-ctp-red text-ctp-base font-black px-3 py-3 border-none">{$m.needed.impossible}</span>
                  {:else if r.alreadyAchieved}
                    <span class="badge badge-success bg-ctp-green text-ctp-base font-black px-3 py-3 border-none">{$m.needed.alreadyAchieved}</span>
                  {:else}
                    <span 
                      class="text-4xl font-black tabular-nums tracking-tighter"
                      style:color={gradeColor(Math.min(r.needed, 6.0))}
                    >
                      {applyRounding(Math.min(r.needed, 6.0), '2')}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
