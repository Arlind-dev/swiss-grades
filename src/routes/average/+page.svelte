<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import { applyRounding, computeWeightedAverage, newEntry, gradeColor } from '$lib/utils/grading';
  import type { GradeEntry } from '$lib/types';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import GradeRow from '$lib/components/GradeRow.svelte';
  import { m } from '$lib/i18n';
  import { get } from 'svelte/store';
  import { focusRowInput } from '$lib/utils/focus';

  let rounding = $state($settings.averageRounding);
  $effect(() => { settings.update((s) => ({ ...s, averageRounding: rounding })); });

  let averageText = $state('');
  let averageGrade = $state<number | null>(null);

  // ── Grade list mutations ─────────────────────────────────────────────────

  function addGrade() {
    grades.update((g) => [...g, newEntry()]);
  }

  function removeGrade(id: string) {
    grades.update((g) => g.filter((e) => e.id !== id));
  }

  function updateGrade(id: string, updated: GradeEntry) {
    grades.update((g) => g.map((e) => (e.id === id ? updated : e)));
  }

  // ── Average calculation ──────────────────────────────────────────────────

  /** Fill in weight=100 for any row that has a grade but no weight. */
  function fillWeights(entry: GradeEntry): GradeEntry {
    const weight = entry.grade && !entry.weight ? '100' : entry.weight;
    const subgrades = entry.subgrades.map(fillWeights);
    return { ...entry, weight, subgrades };
  }

  function calculateAverage() {
    grades.update((g) => {
      const nonEmpty = g.filter((e) => e.grade !== '');
      return nonEmpty.map(fillWeights);
    });

    const avg = computeWeightedAverage($grades);
    if (avg === null) {
      averageText = '';
      averageGrade = null;
      return;
    }
    averageGrade = avg;
    averageText = get(m).average.resultPrefix + applyRounding(avg, rounding);
  }

  function clearAll() {
    grades.set(Array.from({ length: 10 }, newEntry));
    averageText = '';
    averageGrade = null;
  }

  // ── Drag-to-reorder ──────────────────────────────────────────────────────

  let draggableIndex = $state<number | null>(null);
  let dragSrcIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  function onHandleMouseDown(index: number) {
    draggableIndex = index;
    dragSrcIndex = index;
  }

  function onDragStart(index: number) {
    dragSrcIndex = index;
  }

  function onDragOver(index: number) {
    dragOverIndex = index;
  }

  function onDragLeave(index: number) {
    if (dragOverIndex === index) dragOverIndex = null;
  }

  function onDrop(targetIndex: number) {
    if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;
    grades.update((g) => {
      const copy = [...g];
      const [moved] = copy.splice(dragSrcIndex!, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  }

  function onDragEnd() {
    draggableIndex = null;
    dragSrcIndex = null;
    dragOverIndex = null;
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────

  function onWindowKeydown(e: KeyboardEvent) {
    // Ctrl+Enter → add new row and focus it
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addGrade();
      setTimeout(() => focusRowInput('#grade-list', '.row-outer', $grades.length - 1), 0);
    }
  }

  function onRowKeydown(e: KeyboardEvent, id: string) {
    // Ctrl+Delete → remove this row, focus adjacent row
    if (e.ctrlKey && e.key === 'Delete') {
      e.preventDefault();
      const index = $grades.findIndex((g) => g.id === id);
      removeGrade(id);
      setTimeout(() => focusRowInput('#grade-list', '.row-outer', index - 1), 0);
    }
  }

</script>

<svelte:head><title>{$m.average.title}</title></svelte:head>
<svelte:window onkeydown={onWindowKeydown} />

<h1>{$m.average.title}</h1>

<RoundingSelect bind:value={rounding} />

<div class="grade-list" id="grade-list" role="list">
  {#each $grades as entry, i (entry.id)}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="grade-item"
        role="listitem"
        class:drag-over={dragOverIndex === i && dragSrcIndex !== i}
        draggable={draggableIndex === i}
        onkeydown={(e) => onRowKeydown(e, entry.id)}
        ondragstart={() => onDragStart(i)}
      ondragover={(e) => { e.preventDefault(); onDragOver(i); }}
      ondragleave={() => onDragLeave(i)}
      ondrop={(e) => { e.preventDefault(); onDrop(i); }}
      ondragend={onDragEnd}
    >      <!-- svelte-ignore a11y_no_static_element_interactions -->      <span
        class="drag-handle"
        title={$m.average.dragHandleTitle}
        onmousedown={() => onHandleMouseDown(i)}
      >⠿</span>

      <div class="row-container">
        <GradeRow
          {entry}
          onchange={(updated) => updateGrade(entry.id, updated)}
          onremove={() => removeGrade(entry.id)}
        />
      </div>
    </div>
  {/each}
</div>

<div class="actions">
  <button type="button" onclick={addGrade}>{$m.average.addGrade}</button>
  <button type="button" onclick={calculateAverage}>{$m.average.calculateButton}</button>
  <button type="button" onclick={clearAll}>{$m.average.clearAll}</button>
</div>
<p class="shortcuts-hint">
  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> {$m.average.shortcutAdd} &nbsp;·&nbsp;
  <kbd>Ctrl</kbd>+<kbd>Del</kbd> {$m.average.shortcutDelete}
</p>

{#if averageText}
  <p class="result" style:color={averageGrade !== null ? gradeColor(averageGrade) : undefined}>
    {averageText}
  </p>
{/if}

<style>
  .grade-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .grade-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 2px;
    border-radius: 4px;
    transition: outline 0.1s;
  }

  .row-container {
    flex: 1;
    min-width: 0;
  }

  .grade-item.drag-over {
    outline: 2px dashed var(--ctp-overlay1);
    outline-offset: 1px;
  }

  .drag-handle {
    cursor: grab;
    padding: 8px 6px;
    color: var(--ctp-surface2);
    font-size: 1.2rem;
    user-select: none;
    flex-shrink: 0;
    line-height: 1;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .result {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 8px;
  }

  .shortcuts-hint {
    font-size: 0.8rem;
    color: var(--ctp-overlay1);
    margin: 4px 0 12px;
  }

  kbd {
    display: inline-block;
    padding: 1px 5px;
    font-size: 0.75rem;
    font-family: monospace;
    border: 1px solid var(--ctp-surface2);
    border-radius: 3px;
    background: var(--ctp-surface0);
    color: var(--ctp-subtext1);
  }
</style>
