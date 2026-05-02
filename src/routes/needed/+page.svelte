<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { gradeColor, computeWeightedSums } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';
  import { get } from 'svelte/store';
  import { focusRowInput } from '$lib/utils/focus';
  import { browser } from '$app/environment';

  const STORAGE_KEY = 'notenrechner-needed';

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
      ? saved.futureExams.map((e: { name: string; weight: string }) => ({ id: crypto.randomUUID(), name: e.name, weight: e.weight }))
      : [{ id: crypto.randomUUID(), name: '', weight: '' }]
  );

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

let results = $state<ExamResult[]>([]);
  let bestAttainable = $state(0);
  let errorText = $state('');
  let noGradesError = $state(false);
  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  function clearAll() {
    targetAverage = '';
    futureExams = [{ id: crypto.randomUUID(), name: '', weight: '' }];
    results = [];
    errorText = '';
    noGradesError = false;
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
    futureExams = [...futureExams, { id: crypto.randomUUID(), name: '', weight: '' }];
  }

  function removeExam(id: string) {
    futureExams = futureExams.filter((e) => e.id !== id);
  }

  function calculate() {
    errorText = '';
    noGradesError = false;
    results = [];

    const target = parseFloat(targetAverage);
    if (isNaN(target) || target < 1 || target > 6) {
      errorText = get(m).needed.invalidTarget;
      return;
    }

    // Require at least one grade in the store
    const hasGrades = $grades.some((e) => e.grade !== '' && !isNaN(parseFloat(e.grade)));
    if (!hasGrades) {
      noGradesError = true;
      return;
    }

    // Fill empty weights with '100' so the UI reflects what's used in the calculation
    futureExams = futureExams.map((e) => ({
      ...e,
      weight: e.weight === '' || parseFloat(e.weight) <= 0 ? '100' : e.weight,
    }));

    // Current weighted sum from the grades store (shared logic with average page)
    const { weightSum, weightedSum } = computeWeightedSums($grades);

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

    bestAttainable = totalWeight > 0
      ? (weightedSum + 6.0 * futureWeightSum) / totalWeight
      : 6.0;

    results = futureExams.map((exam) => ({
      name: exam.name || get(m).needed.examFallback,
      needed,
      impossible: needed > 6.0,
      alreadyAchieved: needed < 1.0,
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
      class="input-target"
      inputmode="decimal"
      placeholder={$m.gradeRow.placeholderGrade}
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

  <div class="actions">
    <button type="button" class="btn-calculate" onclick={calculate}>{$m.needed.calculateButton}</button>
    <button type="button" class="btn-clear" class:confirming={confirmClear} onclick={handleClearAll}>
      {confirmClear ? $m.needed.clearConfirm : $m.needed.clearAll}
    </button>
  </div>
  <p class="shortcuts-hint">
    <kbd>Ctrl</kbd>+<kbd>Enter</kbd> {$m.needed.shortcutAdd} &nbsp;|&nbsp;
    <kbd>Ctrl</kbd>+<kbd>Del</kbd> {$m.needed.shortcutDelete}
  </p>
</div>

{#if errorText}
  <p class="error">{errorText}</p>
{/if}

{#if noGradesError}
  <p class="error">{$m.needed.noGradesBefore}<a href="/average">{$m.nav.average}</a>{$m.needed.noGradesAfter}</p>
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
    <p class="results-note">{$m.needed.bestAttainablePrefix}{bestAttainable.toFixed(2)}</p>
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

  .input-target {
    width: 175px;
  }

  @media (max-width: 600px) {
    .input-target {
      width: 80px;
    }
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

  @media (pointer: coarse) {
    .input-name { display: none; }
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

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (pointer: coarse) {
    .btn-add {
      width: 100%;
      align-self: stretch;
      text-align: center;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .actions button:first-child {
      grid-column: 1 / -1;
    }
  }

  .btn-clear.confirming {
    background: var(--ctp-red);
    border-color: var(--ctp-red);
    color: var(--ctp-base);
  }

  .shortcuts-hint {
    font-size: 0.8rem;
    color: var(--ctp-overlay1);
    margin: 4px 0 0;
  }

  @media (pointer: coarse) {
    .shortcuts-hint { display: none; }
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
