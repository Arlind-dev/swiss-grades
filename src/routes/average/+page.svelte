<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { m } from '$lib/i18n';
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import type { GradeEntry, RoundingKey } from '$lib/types';
  import { computeWeightedAverage, applyRounding, newEntry } from '$lib/utils/grading';
  import {
    formatGradesAsCsv,
    buildCsvFilename,
    downloadCsv,
    hasExportableGradeEntries
  } from '$lib/utils/export';
  import {
    serializeGrades,
    hydrateGrades,
    readSharePayload,
    type SharePayload
  } from '$lib/utils/share';
  import Page from '$lib/components/Page.svelte';
  import GradeRow from '$lib/components/GradeRow.svelte';
  import ResultBar from '$lib/components/ResultBar.svelte';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import Button from '$lib/components/Button.svelte';
  import ShortcutHint from '$lib/components/ShortcutHint.svelte';

  let entries = $state<GradeEntry[]>(get(grades));
  let rounding = $state<RoundingKey>(get(settings).averageRounding);
  let focusedTop = $state(0);
  let topDrag = $state<number | null>(null);

  // Parent grades are always derived from subgrades; normalize before any use.
  function normalize(list: GradeEntry[]): GradeEntry[] {
    return list.map((e) => {
      const subgrades = normalize(e.subgrades);
      const avg = computeWeightedAverage(subgrades);
      return {
        ...e,
        subgrades,
        grade: subgrades.length ? (avg !== null ? (Math.round(avg * 100) / 100).toFixed(2) : '') : e.grade
      };
    });
  }

  const normalized = $derived(normalize(entries));
  const average = $derived(computeWeightedAverage(normalized));
  const averageDisplay = $derived(average !== null ? applyRounding(average, rounding) : null);
  const averageNum = $derived(averageDisplay !== null ? parseFloat(averageDisplay) : null);
  const canExport = $derived(hasExportableGradeEntries(normalized));

  const tone = $derived(
    averageNum === null ? 'neutral' : averageNum >= 4.5 ? 'pass' : averageNum >= 4 ? 'warn' : 'fail'
  );

  // Persist normalized entries + rounding.
  $effect(() => {
    grades.set(normalized);
  });
  $effect(() => {
    settings.update((s) => ({ ...s, averageRounding: rounding }));
  });

  onMount(() => {
    const shared = readSharePayload('average');
    if (shared && shared.page === 'average') {
      entries = hydrateGrades(shared.grades);
      rounding = shared.rounding;
    }
  });

  function move(list: GradeEntry[], from: number, to: number) {
    if (from === to) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  }

  async function focusTop(i: number) {
    await tick();
    const rows = document.querySelectorAll<HTMLElement>('#avg-rows > li[data-row]');
    const el = rows[Math.max(0, Math.min(i, rows.length - 1))];
    el?.querySelector<HTMLInputElement>('input')?.focus();
  }

  function addGrade() {
    entries.push(newEntry());
    focusedTop = entries.length - 1;
    focusTop(focusedTop);
  }

  function removeFocused() {
    if (entries.length === 0) return;
    const i = Math.min(focusedTop, entries.length - 1);
    entries.splice(i, 1);
    focusedTop = Math.max(0, i - 1);
    if (entries.length) focusTop(focusedTop);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      addGrade();
    } else if (e.key === 'Delete' || (e.metaKey && e.key === 'Backspace')) {
      e.preventDefault();
      removeFocused();
    }
  }

  function clearAll() {
    entries = Array.from({ length: 5 }, newEntry);
    focusedTop = 0;
  }

  function exportCsv() {
    const csv = formatGradesAsCsv(normalized, {
      labels: $m.average.csv,
      averageGrade: averageDisplay
    });
    downloadCsv(buildCsvFilename(), csv);
  }

  const payload = (): SharePayload => ({
    v: 1,
    page: 'average',
    grades: serializeGrades(normalized),
    rounding
  });
</script>

<svelte:head><title>{$m.average.title} — Swiss Grades</title></svelte:head>

<Page title={$m.average.title} subtitle={$m.average.subtitle}>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul id="avg-rows" class="divide-y divide-line/70" onkeydown={onKeydown}>
    {#each entries as entry, i (entry.id)}
      <GradeRow
        {entry}
        index={i}
        onFocusIn={() => (focusedTop = i)}
        onRemove={() => {
          entries.splice(i, 1);
          focusedTop = Math.max(0, Math.min(focusedTop, entries.length - 1));
        }}
        onDragStart={() => (topDrag = i)}
        onDragDrop={() => {
          if (topDrag !== null) move(entries, topDrag, i);
          topDrag = null;
        }}
      />
    {/each}
  </ul>

  <div class="mt-2">
    <Button variant="ghost" onclick={addGrade}>{$m.average.addGrade}</Button>
  </div>

  {#if averageDisplay !== null}
    <ResultBar
      label={$m.average.resultPrefix}
      value={averageDisplay}
      {tone}
      statusLabel={averageNum !== null && averageNum >= 4 ? $m.common.pass : $m.common.fail}
    />
  {:else}
    <ResultBar emptyText={$m.common.emptyState} />
  {/if}

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <RoundingSelect value={rounding} onChange={(v) => (rounding = v)} />
    <div class="ml-auto flex flex-wrap items-center gap-2">
      <Button variant="secondary" onclick={exportCsv} disabled={!canExport} title={$m.average.exportCsvTitle}>
        {$m.average.exportCsv}
      </Button>
      <ShareButton {payload} />
      <ClearButton label={$m.average.clearAll} confirmLabel={$m.average.clearConfirm} onConfirm={clearAll} />
    </div>
  </div>

  <ShortcutHint
    items={[
      { keys: 'Ctrl+Enter', label: $m.average.shortcutAdd },
      { keys: 'Ctrl+Delete', label: $m.average.shortcutDelete }
    ]}
  />
</Page>
