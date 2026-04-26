<script lang="ts">
  import { numericInput } from '$lib/actions';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import { calculateGradeFromPoints, applyRounding, gradeColor } from '$lib/utils/grading';
  import { settings } from '$lib/stores/settings';
  import { m } from '$lib/i18n';
  import { get } from 'svelte/store';

  let points = $state($settings.calculatorPoints);
  let maxPoints = $state($settings.calculatorMaxPoints);
  let rounding = $state($settings.calculatorRounding);

  $effect(() => { settings.update((s) => ({ ...s, calculatorPoints: points })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorMaxPoints: maxPoints })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorRounding: rounding })); });

  let resultText = $state('');
  let resultGrade = $state<number | null>(null);

  function calculate() {
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);

    if (isNaN(p) || isNaN(max) || max <= 0) {
      resultText = get(m).calculator.invalidInput;
      resultGrade = null;
      return;
    }
    if (p < 0 || p > max) {
      resultText = get(m).calculator.pointsOutOfRange;
      resultGrade = null;
      return;
    }

    const grade = calculateGradeFromPoints(p, max);
    resultGrade = grade;
    resultText = get(m).calculator.resultPrefix + applyRounding(grade, rounding);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') calculate();
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

<div class="form">
  <label>
    {$m.calculator.pointsLabel}
    <input
      type="text"
      inputmode="decimal"
      bind:value={points}
      use:numericInput
      onkeydown={handleKey}
    />
  </label>

  <label>
    {$m.calculator.maxPointsLabel}
    <input
      type="text"
      inputmode="decimal"
      bind:value={maxPoints}
      use:numericInput
      onkeydown={handleKey}
    />
  </label>

  <RoundingSelect bind:value={rounding} />

  <button type="button" onclick={calculate}>{$m.calculator.calculateButton}</button>
</div>

{#if resultText}
  <p class="result" style:color={resultGrade !== null ? gradeColor(resultGrade) : undefined}>
    {resultText}
  </p>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 340px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
  }

  input[type='text'] {
    font-size: 1.1rem;
    padding: 6px 10px;
    border: 2px solid var(--ctp-surface2);
    border-radius: 3px;
    outline: none;
    background: var(--ctp-base);
    color: var(--ctp-text);
  }

  input[type='text']:focus {
    border-color: var(--ctp-lavender);
  }

  button {
    align-self: flex-start;
    margin-top: 4px;
  }

  .result {
    margin-top: 16px;
    font-size: 1.2rem;
    font-weight: 600;
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
