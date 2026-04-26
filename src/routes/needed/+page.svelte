<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { gradeColor } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';
  import { get } from 'svelte/store';
  import { focusRowInput } from '$lib/utils/focus';

  interface FutureExam {
    id: string;
    name: string;
    weight: string;
  }

  let targetAverage = $state('');
  let futureExams = $state<FutureExam[]>([{ id: crypto.randomUUID(), name: '', weight: '' }]);

  interface ExamResult {
    name: string;
    needed: number;
    impossible: boolean;
    alreadyAchieved: boolean;
  }

let results = $state<ExamResult[]>([]);
  let errorText = $state('');

  function addExam() {
    futureExams = [...futureExams, { id: crypto.randomUUID(), name: '', weight: '' }];
  }

  function removeExam(id: string) {
    futureExams = futureExams.filter((e) => e.id !== id);
  }

  function calculate() {
    errorText = '';
    results = [];

    const target = parseFloat(targetAverage);
    if (isNaN(target) || target < 1 || target > 6) {
      errorText = get(m).needed.invalidTarget;
      return;
    }

    // Current weighted sum from the grades store
    let weightSum = 0;
    let weightedSum = 0;
    for (const entry of $grades) {
      const gradeVal = parseFloat(entry.grade);
      if (isNaN(gradeVal)) continue;
      const weightVal = parseFloat(entry.weight);
      const weight = isNaN(weightVal) || weightVal <= 0 ? 100 : weightVal;
      weightedSum += gradeVal * weight;
      weightSum += weight;
    }

    // Total weight of all future exams
    const futureWeightSum = futureExams.reduce((sum, e) => {
      const w = parseFloat(e.weight);
      return sum + (isNaN(w) || w <= 0 ? 100 : w);
    }, 0);

    // Solve: (weightedSum + X * futureWeightSum) / (weightSum + futureWeightSum) = target
    const totalWeight = weightSum + futureWeightSum;
    const needed = weightSum === 0 && futureWeightSum === 0
      ? target
      : (target * totalWeight - weightedSum) / futureWeightSum;

    results = futureExams.map((exam) => ({
      name: exam.name || get(m).needed.examFallback,
      needed,
      impossible: needed > 6.0,
      alreadyAchieved: needed < 1.0
    }));
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') calculate();
  }

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addExam();
      setTimeout(() => focusRowInput('.future-exams', '.exam-row', futureExams.length - 1), 0);
    }
  }

  function onExamKeydown(e: KeyboardEvent, id: string) {
    if (e.ctrlKey && e.key === 'Delete') {
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

<h1>{$m.needed.title}</h1>
<p>{$m.needed.description}</p>
<p class="hint">
  {$m.needed.hint} <a href="/average">{$m.needed.hintLink}</a> {$m.needed.hintSuffix}
</p>

<div class="form">
  <label>
    {$m.needed.targetLabel}
    <input
      type="text"
      inputmode="decimal"
      bind:value={targetAverage}
      use:numericInput
      use:clampInput={{ min: 1, max: 6, decimals: 2 }}
      onkeydown={handleKey}
    />
  </label>

  <div class="future-exams">
    <p class="section-label">{$m.needed.futureExamsLabel}</p>
    {#each futureExams as exam (exam.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="exam-row" onkeydown={(e) => onExamKeydown(e, exam.id)}>
        <input
          type="text"
          class="input-name"
          placeholder={$m.needed.examNamePlaceholder}
          bind:value={exam.name}
        />
        <div class="input-weight-wrapper">
          <input
            type="text"
            class="input-weight"
            inputmode="decimal"
            placeholder={$m.needed.weightPlaceholder}
            bind:value={exam.weight}
            use:numericInput
            use:clampInput={{ min: 0, max: 100 }}
          />
          {#if exam.weight}
            <span class="weight-suffix">%</span>
          {/if}
        </div>
        <button
          type="button"
          class="btn-remove"
          disabled={futureExams.length === 1}
          onclick={() => removeExam(exam.id)}
        >✕</button>
      </div>
    {/each}
    <button type="button" class="btn-add" onclick={addExam}>{$m.needed.addExam}</button>
  </div>

  <button type="button" class="btn-calculate" onclick={calculate}>{$m.needed.calculateButton}</button>
  <p class="shortcuts-hint">
    <kbd>Ctrl</kbd>+<kbd>Enter</kbd> {$m.needed.shortcutAdd} &nbsp;·&nbsp;
    <kbd>Ctrl</kbd>+<kbd>Del</kbd> {$m.needed.shortcutDelete}
  </p>
</div>

{#if errorText}
  <p class="error">{errorText}</p>
{/if}

{#if results.length > 0}
  <div class="results">
    <p class="results-note">{$m.needed.assumption}</p>
    <table>
      <thead>
        <tr>
          <th>{$m.needed.tableExam}</th>
          <th>{$m.needed.tableRequired}</th>
        </tr>
      </thead>
      <tbody>
        {#each results as r}
          <tr>
            <td>{r.name}</td>
            <td>
              {#if r.impossible}
                <span class="verdict" style:color={gradeColor(1)}>{$m.needed.impossible}</span>
              {:else if r.alreadyAchieved}
                <span class="verdict" style:color={gradeColor(6)}>{$m.needed.alreadyAchieved}</span>
              {:else}
                <span class="grade" style:color={gradeColor(r.needed)}>
                  {r.needed.toFixed(2)}
                </span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .hint {
    color: var(--ctp-subtext0);
    font-size: 0.9rem;
    margin-top: -8px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
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
    transition: border-color 0.15s;
  }

  input[type='text']:focus {
    border-color: var(--ctp-lavender);
  }

  .section-label {
    font-weight: 600;
    margin: 0 0 6px;
    color: var(--ctp-subtext1);
  }

  .future-exams {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .exam-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .input-name {
    width: 200px;
  }

  .input-weight-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid var(--ctp-surface2);
    border-radius: 3px;
    background: var(--ctp-base);
    transition: border-color 0.15s;
    width: 150px;
  }

  .input-weight-wrapper:focus-within {
    border-color: var(--ctp-lavender);
  }

  .input-weight {
    border: none !important;
    outline: none !important;
    padding: 5px 4px 5px 8px;
    font-size: 1.05rem;
    background: transparent;
    color: var(--ctp-text);
    width: 100%;
    min-width: 0;
  }

  .weight-suffix {
    padding-right: 8px;
    color: var(--ctp-overlay1);
    font-size: 1.05rem;
    user-select: none;
    flex-shrink: 0;
  }

  .btn-remove {
    background: none;
    border: 1px solid var(--ctp-surface2);
    color: var(--ctp-overlay1);
    padding: 4px 8px;
    border-radius: 3px;
  }

  .btn-remove:hover:not(:disabled) {
    border-color: var(--ctp-red);
    color: var(--ctp-red);
    background: none;
  }

  .btn-remove:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-add {
    align-self: flex-start;
    background: none;
    border: 1px dashed var(--ctp-overlay1);
    color: var(--ctp-subtext0);
    padding: 4px 10px;
    border-radius: 3px;
  }

  .btn-add:hover {
    border-color: var(--ctp-lavender);
    color: var(--ctp-lavender);
    background: none;
  }

  .btn-calculate {
    align-self: flex-start;
  }

  .shortcuts-hint {
    font-size: 0.8rem;
    color: var(--ctp-overlay1);
    margin: 4px 0 0;
  }

  kbd {
    background: var(--ctp-surface0);
    border: 1px solid var(--ctp-surface2);
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--ctp-subtext1);
  }

  .error {
    color: var(--ctp-red);
    margin-top: 8px;
  }

  .results {
    margin-top: 16px;
    max-width: 480px;
  }

  .results-note {
    font-size: 0.85rem;
    color: var(--ctp-overlay1);
    margin-bottom: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
  }

  th {
    text-align: left;
    padding: 6px 12px;
    border-bottom: 2px solid var(--ctp-surface1);
    font-weight: 600;
    color: var(--ctp-subtext0);
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--ctp-surface0);
    color: var(--ctp-text);
  }

  .grade {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .verdict {
    font-weight: 600;
  }
</style>
