<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import { applyRounding, computeWeightedAverage, newEntry, gradeColor } from '$lib/utils/grading';
  import type { GradeEntry } from '$lib/types';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import GradeRow from '$lib/components/GradeRow.svelte';
  import { m } from '$lib/i18n';
  import { focusRowInput } from '$lib/utils/focus';
  import { browser } from '$app/environment';

  let rounding = $state($settings.averageRounding);
  let isMac = $state(false);
  $effect(() => { if (browser) isMac = /Macintosh|Mac OS X/.test(navigator.userAgent); });
  $effect(() => { settings.update((s) => ({ ...s, averageRounding: rounding })); });

  let averageGrade = $derived(computeWeightedAverage($grades));
  let averageText = $derived(
    averageGrade !== null ? $m.average.resultPrefix + applyRounding(averageGrade, rounding) : ''
  );
  let validCount = $derived($grades.filter((e) => !isNaN(parseFloat(e.grade))).length);

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

  // ── Average calculation is fully reactive via $derived above ───────────

  function clearAll() {
    grades.set(Array.from({ length: 10 }, newEntry));
  }

  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

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
    // Ctrl+Enter / Cmd+Enter → add new row and focus it
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      addGrade();
      setTimeout(() => focusRowInput('#grade-list', '.row-outer', $grades.length - 1), 0);
    }
  }

  function onRowKeydown(e: KeyboardEvent, id: string) {
    // Ctrl+Delete / Cmd+Backspace → remove this row, focus adjacent row
    if ((e.ctrlKey && e.key === 'Delete') || (e.metaKey && e.key === 'Backspace')) {
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
    {@const gradeNum = parseFloat(entry.grade)}
    {@const delta = !isNaN(gradeNum) && averageGrade !== null && validCount >= 2 ? gradeNum - averageGrade : null}
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
          removable={$grades.length > 1}
          onchange={(updated) => updateGrade(entry.id, updated)}
          onremove={() => removeGrade(entry.id)}
        />
      </div>
      {#if delta !== null}
        <span
          class="delta"
          class:positive={delta > 0.005}
          class:negative={delta < -0.005}
          class:neutral={Math.abs(delta) <= 0.005}
        >{delta >= 0 ? '+' : ''}{delta.toFixed(2)}</span>
      {/if}
    </div>
  {/each}
</div>

<div class="actions">
  <button type="button" class="btn-add" onclick={addGrade}>{$m.average.addGrade}</button>
</div>
<div class="actions">
  <button type="button" class="btn-clear" class:confirming={confirmClear} onclick={handleClearAll}>
    {confirmClear ? $m.average.clearConfirm : $m.average.clearAll}
  </button>
</div>
<p class="shortcuts-hint">
  <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd>Enter</kbd> {$m.average.shortcutAdd} &nbsp;|&nbsp;
  <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd>{isMac ? '⌫' : 'Del'}</kbd> {$m.average.shortcutDelete}
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

  @media (pointer: coarse) {
    .drag-handle { display: none; }
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    align-items: flex-start;
  }

  .btn-add {
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

  .result {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 8px;
  }

  .delta {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    white-space: nowrap;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 8px;
  }

  .delta.positive {
    color: var(--ctp-green);
    background: color-mix(in srgb, var(--ctp-green) 15%, transparent);
  }

  .delta.negative {
    color: var(--ctp-red);
    background: color-mix(in srgb, var(--ctp-red) 15%, transparent);
  }

  .delta.neutral {
    color: var(--ctp-overlay1);
    background: color-mix(in srgb, var(--ctp-overlay1) 15%, transparent);
  }

  .shortcuts-hint {
    font-size: 0.8rem;
    color: var(--ctp-overlay1);
    margin: 4px 0 12px;
  }

  @media (pointer: coarse) {
    .shortcuts-hint { display: none; }
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
