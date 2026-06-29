<script lang="ts">
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import { applyRounding, computeWeightedAverage, newEntry } from '$lib/utils/grading';
  import type { GradeEntry } from '$lib/types';
  import Page from '$lib/components/Page.svelte';
  import ToolbarRow from '$lib/components/ToolbarRow.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import GradeRow from '$lib/components/GradeRow.svelte';
  import ShortcutHint from '$lib/components/ShortcutHint.svelte';
  import { m } from '$lib/i18n';
  import { focusRowInput } from '$lib/utils/focus';
  import { browser } from '$app/environment';
  import { buildCsvFilename, downloadCsv, formatGradesAsCsv, hasExportableGradeEntries } from '$lib/utils/export';
  import { FileCsvOutline, PlusOutline } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { clearShareParam, createShareUrl, hydrateGrades, readSharePayload, serializeGrades } from '$lib/utils/share';

  let rounding = $state($settings.averageRounding);
  $effect(() => { settings.update((s) => ({ ...s, averageRounding: rounding })); });

  onMount(() => {
    const payload = readSharePayload('average');
    if (payload?.page !== 'average') return;

    grades.set(hydrateGrades(payload.grades));
    rounding = payload.rounding;
    clearShareParam();
  });

  let averageGrade = $derived(computeWeightedAverage($grades));
  let validCount = $derived($grades.filter((e) => !isNaN(parseFloat(e.grade))).length);
  let hasCsvExportRows = $derived(hasExportableGradeEntries($grades));

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

  function exportCsv() {
    if (!browser || !hasCsvExportRows) return;
    const csv = formatGradesAsCsv($grades, {
      labels: $m.average.csv,
      averageGrade: averageGrade !== null ? applyRounding(averageGrade, rounding) : null,
    });
    downloadCsv(buildCsvFilename(), csv);
  }

  // ── Average calculation is fully reactive via $derived above ───────────

  function clearAll() {
    grades.set(Array.from({ length: 10 }, newEntry));
  }

  let resultLabel = $derived($m.average.resultPrefix.replace(/:\s*$/, ''));

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

<Page title={$m.average.title}>
  <div class="card bg-ctp-mantle">
    <div class="card-body p-5 sm:p-6">
      <div class="mb-6">
        <ToolbarRow bind:rounding actions={toolActions} />
      </div>

      <div class="flex flex-col gap-2.5 mb-6" id="grade-list" role="list">
        {#each $grades as entry, i (entry.id)}
          {@const gradeNum = parseFloat(entry.grade)}
          {@const delta = !isNaN(gradeNum) && averageGrade !== null && validCount >= 2 ? gradeNum - averageGrade : null}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-ctp-base border border-ctp-surface0 transition-all hover:border-ctp-surface1 group"
              role="listitem"
              class:border-ctp-lavender={dragOverIndex === i && dragSrcIndex !== i}
              class:bg-ctp-surface0={dragOverIndex === i && dragSrcIndex !== i}
              draggable={draggableIndex === i}
              onkeydown={(e) => onRowKeydown(e, entry.id)}
              ondragstart={() => onDragStart(i)}
              ondragover={(e) => { e.preventDefault(); onDragOver(i); }}
              ondragleave={() => onDragLeave(i)}
              ondrop={(e) => { e.preventDefault(); onDrop(i); }}
              ondragend={onDragEnd}
            >
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span
                class="cursor-grab active:cursor-grabbing p-1 text-ctp-surface2 hover:text-ctp-subtext0 transition-colors hidden sm:block"
                title={$m.average.dragHandleTitle}
                onmousedown={() => onHandleMouseDown(i)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
              </span>

              <div class="flex-grow min-w-0">
                <GradeRow
                  {entry}
                  removable={$grades.length > 1}
                  onchange={(updated) => updateGrade(entry.id, updated)}
                  onremove={() => removeGrade(entry.id)}
                />
              </div>
              
              {#if delta !== null}
                {@const deltaClass =
                  delta > 0.005
                    ? 'bg-ctp-green/15 text-ctp-green'
                    : delta < -0.005
                      ? 'bg-ctp-red/15 text-ctp-red'
                      : 'bg-ctp-surface1 text-ctp-overlay1'}
                <div
                  class="hidden sm:flex items-center justify-center min-w-[3.5rem] px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums font-mono {deltaClass}"
                >
                  {delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(2)}
                </div>
              {/if}
            </div>
        {/each}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-ctp-surface0">
        <button type="button" class="btn btn-outline border-ctp-surface1 text-ctp-subtext1 hover:border-ctp-lavender hover:text-ctp-lavender hover:bg-transparent" onclick={addGrade}>
          <PlusOutline class="w-5 h-5" />
          {$m.average.addGrade}
        </button>
        <ClearButton
          onConfirm={clearAll}
          label={$m.common.clearAll}
          confirmLabel={$m.common.clearConfirm}
        />
      </div>

      <div class="mt-5">
        <ShortcutHint addLabel={$m.average.shortcutAdd} deleteLabel={$m.average.shortcutDelete} />
      </div>
    </div>
  </div>

  {#if averageGrade !== null}
    <ResultDisplay
      label={resultLabel}
      value={applyRounding(averageGrade, rounding)}
      grade={averageGrade}
      showStatus
      passLabel={$m.common.pass}
      failLabel={$m.common.fail}
    />
  {:else}
    <EmptyState>{$m.common.emptyState}</EmptyState>
  {/if}
</Page>

{#snippet toolActions()}
  <button
    type="button"
    class="btn btn-ghost btn-circle btn-sm text-ctp-subtext1 hover:bg-ctp-surface0"
    onclick={exportCsv}
    disabled={!hasCsvExportRows}
    aria-label={$m.average.exportCsvTitle}
    title={$m.average.exportCsvTitle}
  >
    <FileCsvOutline class="w-5 h-5" />
  </button>
  <ShareButton getUrl={() => createShareUrl({
    v: 1,
    page: 'average',
    grades: serializeGrades($grades),
    rounding
  })} />
{/snippet}
