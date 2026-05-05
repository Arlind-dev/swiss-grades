<script lang="ts">
  import { numericInput } from '$lib/actions';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { calculateGradeFromPoints, applyRounding, gradeColor } from '$lib/utils/grading';
  import { settings } from '$lib/stores/settings';
  import { m } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import { clearShareParam, createShareUrl, readSharePayload } from '$lib/utils/share';

  let points = $state($settings.calculatorPoints);
  let maxPoints = $state($settings.calculatorMaxPoints);
  let rounding = $state($settings.calculatorRounding);

  onMount(() => {
    const payload = readSharePayload('calculator');
    if (payload?.page !== 'calculator') return;

    points = payload.points;
    maxPoints = payload.maxPoints;
    rounding = payload.rounding;
    clearShareParam();
  });

  $effect(() => { settings.update((s) => ({ ...s, calculatorPoints: points })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorMaxPoints: maxPoints })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorRounding: rounding })); });

  let resultGrade = $derived.by(() => {
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);
    if (isNaN(p) || isNaN(max) || max <= 0 || p < 0 || p > max) return null;
    return calculateGradeFromPoints(p, max);
  });

  let pointsError = $derived.by(() => {
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);
    if (!isNaN(p) && !isNaN(max) && max > 0 && p > max) return $m.calculator.pointsOutOfRange;
    return '';
  });

  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  function clearAll() {
    points = '';
    maxPoints = '';
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


</script>

<svelte:head><title>{$m.calculator.title}</title></svelte:head>

<div class="flex flex-col gap-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-black tracking-tight text-ctp-text">{$m.calculator.title}</h1>
    
    <div class="inline-flex items-center gap-4 px-6 py-3 bg-ctp-mantle border border-ctp-surface0 rounded-2xl shadow-sm text-ctp-subtext1">
      <span class="font-bold">{$m.calculator.formulaLabel}</span>
      <div class="flex flex-col items-center">
        <span class="text-xs uppercase tracking-widest opacity-70">{$m.calculator.formulaNumerator}</span>
        <div class="h-px w-full bg-ctp-surface2 my-1"></div>
        <span class="text-xs uppercase tracking-widest opacity-70">{$m.calculator.formulaDenominator}</span>
      </div>
      <span class="font-bold">+ 1</span>
    </div>
  </div>

  <div class="card bg-ctp-mantle shadow-xl border border-ctp-surface0">
    <div class="card-body p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <RoundingSelect bind:value={rounding} />
        <ShareButton getUrl={() => createShareUrl({
          v: 1,
          page: 'calculator',
          points,
          maxPoints,
          rounding
        })} />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="form-control w-full">
          <label class="label pt-0" for="points">
            <span class="label-text font-bold text-ctp-subtext1">{$m.calculator.pointsLabel}</span>
          </label>
          <input
            id="points"
            type="text"
            inputmode="decimal"
            bind:value={points}
            use:numericInput
            placeholder="0"
            class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-lg font-bold"
          />
        </div>

        <div class="form-control w-full">
          <label class="label pt-0" for="max-points">
            <span class="label-text font-bold text-ctp-subtext1">{$m.calculator.maxPointsLabel}</span>
          </label>
          <input
            id="max-points"
            type="text"
            inputmode="decimal"
            bind:value={maxPoints}
            use:numericInput
            placeholder="100"
            class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-lg font-bold"
          />
        </div>
      </div>

      {#if pointsError}
        <div class="alert alert-error bg-ctp-red/10 border-ctp-red text-ctp-red mt-6 py-2">
          <span class="text-sm font-bold">{pointsError}</span>
        </div>
      {/if}

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
          {confirmClear ? $m.calculator.clearConfirm : $m.calculator.clearAll}
        </button>
      </div>
    </div>
  </div>

  {#if resultGrade !== null}
    <div class="card bg-ctp-mantle shadow-2xl border-2 border-ctp-surface0 overflow-hidden" transition:scale>
      <div class="p-8 text-center space-y-2">
        <span class="text-xs font-black uppercase tracking-[0.2em] text-ctp-subtext1">{$m.calculator.resultPrefix}</span>
        <div 
          class="text-8xl font-black tracking-tighter"
          style:color={gradeColor(resultGrade)}
          style:text-shadow="0 0 40px {gradeColor(resultGrade)}40"
        >
          {applyRounding(resultGrade, rounding)}
        </div>
      </div>
      <div 
        class="h-2 w-full"
        style:background={gradeColor(resultGrade)}
      ></div>
    </div>
  {/if}
</div>
