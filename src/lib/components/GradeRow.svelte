<script lang="ts">
  import GradeRow from './GradeRow.svelte';
  import type { GradeEntry } from '$lib/types';
  import { recomputeParentGrade, newEntry } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';

  let { entry, onchange, onremove, depth = 0 }: {
    entry: GradeEntry;
    onchange: (updated: GradeEntry) => void;
    onremove: () => void;
    depth?: number;
  } = $props();

  function emit(changes: Partial<GradeEntry>) {
    onchange({ ...entry, ...changes });
  }

  function addSubgrade() {
    const subgrades = [...entry.subgrades, newEntry()];
    const grade = recomputeParentGrade(subgrades);
    emit({ subgrades, grade });
  }

  function onSubChange(index: number, updated: GradeEntry) {
    const subgrades = entry.subgrades.map((s, i) => (i === index ? updated : s));
    const grade = recomputeParentGrade(subgrades);
    emit({ subgrades, grade });
  }

  function onSubRemove(index: number) {
    const subgrades = entry.subgrades.filter((_, i) => i !== index);
    const grade = subgrades.length > 0 ? recomputeParentGrade(subgrades) : entry.grade;
    emit({ subgrades, grade });
  }

  let indent = $derived(depth * 16);
  let treeLineLeft = $derived(indent + 6);

  let gradeNum = $derived(parseFloat(entry.grade));
  let hasSubgrades = $derived(entry.subgrades.length > 0);
  let gradeValid = $derived(!isNaN(gradeNum));
  let gradePassing = $derived(gradeValid && gradeNum >= 4.5);
  let gradeBorderline = $derived(gradeValid && gradeNum >= 4.0 && gradeNum < 4.5);
  let gradeFailing = $derived(gradeValid && gradeNum < 4.0);
</script>

<div
  class="row-wrapper"
  class:grade-pass={gradePassing}
  class:grade-borderline={gradeBorderline}
  class:grade-fail={gradeFailing}
>
  <div class="row-outer" style:padding-left="{indent + 4}px">
    <!-- Name input -->
    <input
      type="text"
      class="input-name"
      placeholder={$m.gradeRow.placeholderName}
      value={entry.name}
      oninput={(e) => emit({ name: e.currentTarget.value })}
    />

    <!-- Grade input (readonly when parent of subgrades) -->
    <input
      type="text"
      class="input-grade"
      class:readonly={hasSubgrades}
      inputmode="decimal"
      placeholder={$m.gradeRow.placeholderGrade}
      value={entry.grade}
      readonly={hasSubgrades}
      use:numericInput
      use:clampInput={{ min: 1, max: 6, decimals: 2 }}
      oninput={(e) => !hasSubgrades && emit({ grade: e.currentTarget.value })}
    />

    <!-- Weight input -->
    <div class="input-weight-wrapper">
      <input
        type="text"
        class="input-weight"
        inputmode="decimal"
        placeholder={$m.gradeRow.placeholderWeight}
        value={entry.weight}
        use:numericInput
        use:clampInput={{ min: 0, max: 100 }}
        oninput={(e) => emit({ weight: e.currentTarget.value })}
      />
      {#if entry.weight}
        <span class="weight-suffix">%</span>
      {/if}
    </div>

    <button type="button" onclick={addSubgrade}>{$m.gradeRow.addSubgrade}</button>
    <button type="button" class="btn-remove" onclick={onremove}>✕</button>
  </div>

  <!-- Subgrades tree (recursive) — expands below, not to the right -->
  {#if hasSubgrades}
    <div class="tree-panel" style:--tree-line-left="{treeLineLeft}px">
      {#each entry.subgrades as sub, i (sub.id)}
        <GradeRow
          entry={sub}
          onchange={(updated) => onSubChange(i, updated)}
          onremove={() => onSubRemove(i)}
          depth={depth + 1}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .row-wrapper {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .row-wrapper.grade-pass > .row-outer {
    background: color-mix(in srgb, var(--ctp-green) 12%, transparent);
    border-radius: 4px;
  }

  .row-wrapper.grade-borderline > .row-outer {
    background: color-mix(in srgb, var(--ctp-yellow) 12%, transparent);
    border-radius: 4px;
  }

  .row-wrapper.grade-fail > .row-outer {
    background: color-mix(in srgb, var(--ctp-red) 12%, transparent);
    border-radius: 4px;
  }

  .row-outer {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    padding: 2px 4px; /* left is overridden by inline style */
  }

  /* ── Inputs ── */
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

  .input-name   { flex: 1 1 120px; min-width: 80px; max-width: 200px; }
  .input-grade  { width: 130px; flex-shrink: 0; }

  .input-weight-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid var(--ctp-surface2);
    border-radius: 3px;
    width: 130px;
    flex-shrink: 0;
    transition: border-color 0.15s;
    background: var(--ctp-base);
  }

  @media (max-width: 600px) {
    .row-outer {
      gap: 3px;
    }
    .input-name  { max-width: none; }
    .input-grade { width: 90px; }
    .input-weight-wrapper { width: 90px; }
  }

  .input-weight-wrapper:focus-within {
    border-color: var(--ctp-lavender);
  }

  .input-weight {
    border: none !important;
    outline: none !important;
    width: 100%;
    padding: 5px 4px 5px 8px;
    font-size: 1.05rem;
    background: transparent;
    color: var(--ctp-text);
    min-width: 0;
  }

  .weight-suffix {
    padding-right: 8px;
    color: var(--ctp-overlay1);
    font-size: 1.05rem;
    user-select: none;
    flex-shrink: 0;
  }

  .row-wrapper.grade-pass .input-grade { border-color: var(--ctp-green); }
  .row-wrapper.grade-borderline .input-grade { border-color: var(--ctp-yellow); }
  .row-wrapper.grade-fail .input-grade { border-color: var(--ctp-red); }

  .input-grade.readonly {
    background: var(--ctp-surface0);
    color: var(--ctp-overlay1);
    cursor: not-allowed;
  }

  /* ── Tree panel: full-width, depth tracked via prop ── */
  .tree-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }

  .tree-panel::before {
    content: '';
    position: absolute;
    left: var(--tree-line-left);
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--ctp-surface1);
    border-radius: 1px;
    z-index: 1;
    pointer-events: none;
  }

  /* ── Buttons ── */
  .btn-remove {
    background: none;
    border: 1px solid var(--ctp-surface2);
    color: var(--ctp-overlay1);
    padding: 4px 7px;
    border-radius: 3px;
    line-height: 1;
  }

  .btn-remove:hover {
    border-color: var(--ctp-red);
    color: var(--ctp-red);
    background: none;
  }
</style>
