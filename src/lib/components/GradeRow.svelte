<script lang="ts">
  import { m } from '$lib/i18n';
  import type { GradeEntry } from '$lib/types';
  import { newEntry, recomputeParentGrade } from '$lib/utils/grading';
  import NumberField from './NumberField.svelte';
  import GradeRow from './GradeRow.svelte';

  let {
    entry,
    index,
    depth = 0,
    onRemove,
    onDragStart,
    onDragDrop,
    onFocusIn
  }: {
    entry: GradeEntry;
    index: number;
    depth?: number;
    onRemove: () => void;
    onDragStart: () => void;
    onDragDrop: () => void;
    onFocusIn?: () => void;
  } = $props();

  const isSub = $derived(depth > 0);
  const hasSubs = $derived(entry.subgrades.length > 0);
  const parentGrade = $derived(hasSubs ? recomputeParentGrade(entry.subgrades) : '');

  // Reorder state for this entry's own subgrade list.
  let subDrag = $state<number | null>(null);

  function move(list: GradeEntry[], from: number, to: number) {
    if (from === to) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  }

  function addSub() {
    entry.subgrades.push(newEntry());
  }
</script>

<li
  data-row
  class="flex flex-wrap items-center gap-2 py-1"
  onfocusin={onFocusIn}
  ondragover={(e) => e.preventDefault()}
  ondrop={(e) => {
    e.preventDefault();
    onDragDrop();
  }}
>
  <button
    type="button"
    class="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded text-faint hover:text-muted active:cursor-grabbing"
    draggable="true"
    ondragstart={onDragStart}
    aria-label={$m.average.dragHandleTitle}
    title={$m.average.dragHandleTitle}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
    </svg>
  </button>

  <input
    class="field-input min-w-0 flex-1 basis-40"
    bind:value={entry.name}
    placeholder={$m.gradeRow.placeholderName}
    autocomplete="off"
  />

  {#if hasSubs}
    <input
      class="field-input tnum w-20 shrink-0 text-muted"
      value={parentGrade || '—'}
      disabled
      aria-label={$m.gradeRow.placeholderGrade}
    />
  {:else}
    <NumberField
      class="w-20 shrink-0"
      bind:value={entry.grade}
      min={1}
      max={6}
      placeholder={isSub ? $m.gradeRow.placeholderGradeShort : $m.gradeRow.placeholderGrade}
      ariaLabel={$m.gradeRow.placeholderGrade}
    />
  {/if}

  <NumberField
    class="w-20 shrink-0"
    bind:value={entry.weight}
    min={0}
    placeholder={isSub ? $m.gradeRow.placeholderWeightShort : $m.gradeRow.placeholderWeight}
    ariaLabel={$m.gradeRow.placeholderWeight}
  />

  <div class="flex shrink-0 items-center">
    {#if depth < 4}
      <button
        type="button"
        class="grid size-8 place-items-center rounded text-faint hover:bg-surface hover:text-accent"
        onclick={addSub}
        title={$m.gradeRow.addSubgrade}
        aria-label={$m.gradeRow.addSubgrade}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    {/if}
    <button
      type="button"
      class="grid size-8 place-items-center rounded text-faint hover:bg-surface hover:text-fail"
      onclick={onRemove}
      title={$m.common.close}
      aria-label={$m.common.close}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
</li>

{#if hasSubs}
  <li class="ml-3 border-l border-line pl-3">
    <ul>
      {#each entry.subgrades as sub, i (sub.id)}
        <GradeRow
          entry={sub}
          index={i}
          depth={depth + 1}
          onRemove={() => entry.subgrades.splice(i, 1)}
          onDragStart={() => (subDrag = i)}
          onDragDrop={() => {
            if (subDrag !== null) move(entry.subgrades, subDrag, i);
            subDrag = null;
          }}
        />
      {/each}
    </ul>
  </li>
{/if}
