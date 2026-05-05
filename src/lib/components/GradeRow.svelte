<script lang="ts">
  import GradeRow from './GradeRow.svelte';
  import type { GradeEntry } from '$lib/types';
  import { recomputeParentGrade, newEntry } from '$lib/utils/grading';
  import { numericInput, clampInput } from '$lib/actions';
  import { m } from '$lib/i18n';
  import { PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';

  let { entry, onchange, onremove, depth = 0, removable = true }: {
    entry: GradeEntry;
    onchange: (updated: GradeEntry) => void;
    onremove: () => void;
    depth?: number;
    removable?: boolean;
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

  let small = $state(false);
  $effect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    small = mq.matches;
    const handler = (e: MediaQueryListEvent) => { small = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  let indent = $derived(depth * 16);
  let treeLineLeft = $derived(indent + 6);

  let gradeNum = $derived(parseFloat(entry.grade));
  let hasSubgrades = $derived(entry.subgrades.length > 0);
  let gradeValid = $derived(!isNaN(gradeNum));
  let gradePassing = $derived(gradeValid && gradeNum >= 4.5);
  let gradeBorderline = $derived(gradeValid && gradeNum >= 4.0 && gradeNum < 4.5);
  let gradeFailing = $derived(gradeValid && gradeNum < 4.0);
</script>

<div class="flex flex-col w-full">
  <div 
    class="flex items-center gap-2 sm:gap-4 group/row"
    style:padding-left="{depth > 0 ? 12 : 0}px"
  >
    <div class="flex-grow flex items-center gap-2 sm:gap-4">
      <!-- Name -->
      <div class="flex-grow min-w-0 hidden sm:block">
        <input
          type="text"
          class="input input-ghost input-sm w-full bg-transparent focus:bg-ctp-surface0 border-none focus:outline-none px-2 font-medium text-ctp-text placeholder:text-ctp-overlay0 transition-all rounded-lg"
          placeholder={$m.gradeRow.placeholderName}
          value={entry.name}
          oninput={(e) => emit({ name: e.currentTarget.value })}
        />
      </div>

      <!-- Grade -->
      <div class="w-20 sm:w-28 flex-shrink-0">
        <input
          type="text"
          class="input input-bordered input-sm w-full bg-ctp-mantle border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-center font-black rounded-lg"
          class:bg-ctp-surface0={hasSubgrades}
          class:opacity-50={hasSubgrades}
          class:border-ctp-green={gradePassing}
          class:border-ctp-yellow={gradeBorderline}
          class:border-ctp-red={gradeFailing}
          inputmode="decimal"
          placeholder={small ? $m.gradeRow.placeholderGradeShort : $m.gradeRow.placeholderGrade}
          value={entry.grade}
          readonly={hasSubgrades}
          use:numericInput
          use:clampInput={{ min: 1, max: 6, decimals: 2, oncommit: (v) => !hasSubgrades && emit({ grade: v, weight: entry.weight === '' && v !== '' ? '100' : entry.weight }) }}
        />
      </div>

      <!-- Weight -->
      <div class="w-16 sm:w-24 flex-shrink-0 flex items-center gap-1 bg-ctp-mantle px-2 py-1 rounded-lg border border-ctp-surface1 focus-within:border-ctp-lavender transition-all">
        <input
          type="text"
          class="bg-transparent border-none focus:outline-none w-full text-right font-bold text-ctp-text text-sm"
          inputmode="decimal"
          placeholder={small ? $m.gradeRow.placeholderWeightShort : $m.gradeRow.placeholderWeight}
          value={entry.weight}
          use:numericInput
          use:clampInput={{ min: 0, max: 100, oncommit: (v) => emit({ weight: v }) }}
        />
        <span class="text-[10px] font-black text-ctp-overlay1">%</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
      <button 
        type="button" 
        class="btn btn-ghost btn-circle btn-xs text-ctp-lavender hover:bg-ctp-lavender/10"
        onclick={addSubgrade}
        title={$m.gradeRow.addSubgrade}
      >
        <PlusOutline class="w-4 h-4" />
      </button>
      <button 
        type="button" 
        class="btn btn-ghost btn-circle btn-xs text-ctp-overlay1 hover:text-ctp-red hover:bg-ctp-red/10"
        onclick={onremove}
        disabled={!removable}
      >
        <TrashBinOutline class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  {#if hasSubgrades}
    <div class="mt-2 ml-4 border-l-2 border-ctp-surface1 pl-2 space-y-2 py-1">
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
