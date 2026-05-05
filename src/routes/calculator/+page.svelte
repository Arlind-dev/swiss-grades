<script lang="ts">
  import { numericInput } from '$lib/actions';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { calculateGradeFromPoints, applyRounding, gradeColor } from '$lib/utils/grading';
  import { settings } from '$lib/stores/settings';
  import { m } from '$lib/i18n';
  import { onMount } from 'svelte';
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

<h1>{$m.calculator.title}</h1>

<div class="formula">
  <span class="frac-label">{$m.calculator.formulaLabel}</span>
  <span class="frac">
    <span class="num">{$m.calculator.formulaNumerator}</span>
    <span class="line"></span>
    <span class="den">{$m.calculator.formulaDenominator}</span>
  </span>
  <span class="frac-rest">+ 1</span>
</div>

<RoundingSelect bind:value={rounding} />

<ShareButton getUrl={() => createShareUrl({
  v: 1,
  page: 'calculator',
  points,
  maxPoints,
  rounding
})} />

<div class="form">
  <label>
    {$m.calculator.pointsLabel}
    <input
      type="text"
      inputmode="decimal"
      bind:value={points}
      use:numericInput
    />
  </label>

  <label>
    {$m.calculator.maxPointsLabel}
    <input
      type="text"
      inputmode="decimal"
      bind:value={maxPoints}
      use:numericInput
    />
  </label>

  <div class="actions">
    <button type="button" class="btn-clear" class:confirming={confirmClear} onclick={handleClearAll}>
      {confirmClear ? $m.calculator.clearConfirm : $m.calculator.clearAll}
    </button>
  </div>
</div>

{#if pointsError}
  <p class="error">{pointsError}</p>
{/if}

{#if resultGrade !== null}
  <p class="result">
    {$m.calculator.resultPrefix}<span class="grade-chip" style:--chip-color={gradeColor(resultGrade)}>{applyRounding(resultGrade, rounding)}</span>
  </p>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 340px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .form {
      max-width: 100%;
    }
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
  }

  input[type='text'] {
    font-size: 1.05rem;
    padding: 5px 8px;
    border: 2px solid var(--ctp-surface2);
    border-radius: 3px;
    outline: none;
    background: var(--ctp-base);
    color: var(--ctp-text);
  }

  input[type='text']:focus {
    border-color: var(--ctp-lavender);
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  @media (pointer: coarse) {
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .actions button:first-child {
      grid-column: 1 / -1;
    }
    .btn-clear {
      grid-column: 1 / -1;
    }
  }

  .btn-clear.confirming {
    background: var(--ctp-red);
    border-color: var(--ctp-red);
    color: var(--ctp-base);
  }

  .error {
    color: var(--ctp-red);
    margin-top: 8px;
  }

  .result {
    margin-top: 16px;
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .grade-chip {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 700;
    color: var(--chip-color);
    background: color-mix(in srgb, var(--chip-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--chip-color) 35%, transparent);
  }

  .formula {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 1rem;
    color: var(--ctp-subtext1);
  }

  .frac-label {
    white-space: nowrap;
  }

  .frac {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .num {
    padding: 0 6px 5px;
    white-space: nowrap;
  }

  .line {
    border-top: 1.5px solid var(--ctp-subtext1);
    line-height: 0;
  }

  .den {
    padding: 2px 6px 0;
    white-space: nowrap;
  }

  .frac-rest {
    white-space: nowrap;
  }
</style>
