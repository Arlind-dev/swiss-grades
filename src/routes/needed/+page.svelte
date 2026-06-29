<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { m } from '$lib/i18n';
  import { grades } from '$lib/stores/grades';
  import { settings } from '$lib/stores/settings';
  import { needed, newExam, type FutureExam } from '$lib/stores/needed';
  import type { GradeEntry, RoundingKey } from '$lib/types';
  import { computeWeightedAverage, computeWeightedSums, applyRounding } from '$lib/utils/grading';
  import {
    serializeGrades,
    hydrateGrades,
    readSharePayload,
    type SharePayload
  } from '$lib/utils/share';
  import Page from '$lib/components/Page.svelte';
  import NumberField from '$lib/components/NumberField.svelte';
  import ResultBar from '$lib/components/ResultBar.svelte';
  import RoundingSelect from '$lib/components/RoundingSelect.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import Button from '$lib/components/Button.svelte';
  import StatusChip from '$lib/components/StatusChip.svelte';
  import ShortcutHint from '$lib/components/ShortcutHint.svelte';

  let target = $state(get(needed).target);
  let exams = $state<FutureExam[]>(get(needed).futureExams);
  let rounding = $state<RoundingKey>(get(settings).neededRounding);
  let focusedExam = $state(0);

  // Parent grades are derived from subgrades; normalize the pulled-in grades.
  function normalize(list: GradeEntry[]): GradeEntry[] {
    return list.map((e) => {
      const subgrades = normalize(e.subgrades);
      const avg = computeWeightedAverage(subgrades);
      return {
        ...e,
        subgrades,
        grade: subgrades.length
          ? avg !== null
            ? (Math.round(avg * 100) / 100).toFixed(2)
            : ''
          : e.grade
      };
    });
  }

  const currentSums = $derived(computeWeightedSums(normalize($grades)));
  const futureWeightSum = $derived(
    exams.reduce((sum, e) => {
      const w = parseFloat(e.weight);
      return sum + (isNaN(w) || w <= 0 ? 100 : w);
    }, 0)
  );

  $effect(() => {
    needed.set({ target, futureExams: exams });
  });
  $effect(() => {
    settings.update((s) => ({ ...s, neededRounding: rounding }));
  });

  type Result =
    | { kind: 'noGrades' }
    | { kind: 'invalidTarget' }
    | { kind: 'achieved' }
    | { kind: 'impossible'; best: string }
    | { kind: 'ok'; grade: string };

  const result = $derived.by<Result>(() => {
    if (currentSums.weightSum === 0) return { kind: 'noGrades' };
    const t = parseFloat(target);
    if (isNaN(t) || t < 1 || t > 6) return { kind: 'invalidTarget' };
    if (futureWeightSum <= 0) return { kind: 'invalidTarget' };

    const totalWeight = currentSums.weightSum + futureWeightSum;
    const g = (t * totalWeight - currentSums.weightedSum) / futureWeightSum;

    if (g <= 1) return { kind: 'achieved' };
    if (g > 6) {
      const best = (currentSums.weightedSum + 6 * futureWeightSum) / totalWeight;
      return { kind: 'impossible', best: applyRounding(best, rounding) };
    }
    return { kind: 'ok', grade: applyRounding(g, rounding) };
  });

  async function focusExam(i: number) {
    await tick();
    const rows = document.querySelectorAll<HTMLElement>('#exam-rows > li');
    const el = rows[Math.max(0, Math.min(i, rows.length - 1))];
    el?.querySelector<HTMLInputElement>('input')?.focus();
  }

  function addExam() {
    exams.push(newExam());
    focusedExam = exams.length - 1;
    focusExam(focusedExam);
  }

  function removeExam(i: number) {
    exams.splice(i, 1);
    focusedExam = Math.max(0, Math.min(focusedExam, exams.length - 1));
  }

  function removeFocused() {
    if (exams.length === 0) return;
    const i = Math.min(focusedExam, exams.length - 1);
    removeExam(i);
    if (exams.length) focusExam(focusedExam);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      addExam();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      removeFocused();
    }
  }

  function clearAll() {
    target = '';
    exams = [newExam()];
    focusedExam = 0;
  }

  onMount(() => {
    const shared = readSharePayload('needed');
    if (shared && shared.page === 'needed') {
      grades.set(hydrateGrades(shared.grades));
      target = shared.targetAverage;
      exams = shared.futureExams.map((e) => ({ id: crypto.randomUUID(), name: e.name, weight: e.weight }));
      rounding = shared.rounding;
    }
  });

  const payload = (): SharePayload => ({
    v: 1,
    page: 'needed',
    grades: serializeGrades(normalize($grades)),
    targetAverage: target,
    futureExams: exams.map((e) => ({ name: e.name, weight: e.weight })),
    rounding
  });
</script>

<svelte:head><title>{$m.needed.title} — Swiss Grades</title></svelte:head>

<Page title={$m.needed.title} subtitle={$m.needed.description}>
  <p class="-mt-4 mb-6 text-sm text-muted">
    {$m.needed.hint}
    <a class="text-accent hover:underline" href="/average">{$m.needed.hintLink}</a>
    {$m.needed.hintSuffix}
  </p>

  <div class="max-w-xs">
    <NumberField id="target" label={$m.needed.targetLabel} bind:value={target} min={1} max={6} placeholder="4.0" />
  </div>

  <h2 class="mt-6 mb-2 field-label">{$m.needed.futureExamsLabel}</h2>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul id="exam-rows" class="flex flex-col gap-2" onkeydown={onKeydown}>
    {#each exams as exam, i (exam.id)}
      <li class="flex items-center gap-2" onfocusin={() => (focusedExam = i)}>
        <input
          class="field-input min-w-0 flex-1"
          bind:value={exam.name}
          placeholder={$m.needed.examNamePlaceholder}
          autocomplete="off"
        />
        <NumberField class="w-24 shrink-0" bind:value={exam.weight} min={0} placeholder={$m.needed.weightPlaceholder} ariaLabel={$m.needed.weightPlaceholder} />
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded text-faint hover:bg-surface hover:text-fail"
          onclick={() => removeExam(i)}
          title={$m.common.close}
          aria-label={$m.common.close}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </li>
    {/each}
  </ul>
  <div class="mt-2">
    <Button variant="ghost" onclick={addExam}>{$m.needed.addExam}</Button>
  </div>

  <ResultBar>
    {#if result.kind === 'noGrades'}
      <p class="text-sm text-muted">
        {$m.needed.noGradesBefore}<a class="text-accent hover:underline" href="/average">{$m.needed.hintLink}</a>{$m.needed.noGradesAfter}
      </p>
    {:else if result.kind === 'invalidTarget'}
      <p class="text-sm" style="color: var(--ctp-yellow);">{$m.needed.invalidTarget}</p>
    {:else if result.kind === 'achieved'}
      <StatusChip tone="pass" label={$m.needed.alreadyAchieved} />
    {:else if result.kind === 'impossible'}
      <div class="flex flex-col gap-2">
        <StatusChip tone="fail" label={$m.needed.impossible} />
        <p class="text-sm text-muted">
          {$m.needed.bestAttainablePrefix}<span class="tnum font-medium text-text">{result.best}</span>
        </p>
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-muted">
              <th class="pb-1 font-medium">{$m.needed.tableExam}</th>
              <th class="pb-1 text-right font-medium">{$m.needed.tableRequired}</th>
            </tr>
          </thead>
          <tbody>
            {#each exams as exam, i (exam.id)}
              <tr class="border-t border-line/70">
                <td class="py-1.5">{exam.name || `${$m.needed.examFallback} ${i + 1}`}</td>
                <td class="tnum py-1.5 text-right font-medium">{result.grade}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="text-xs text-faint">{$m.needed.assumption}</p>
      </div>
    {/if}
  </ResultBar>

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <RoundingSelect value={rounding} onChange={(v) => (rounding = v)} />
    <div class="ml-auto flex items-center gap-2">
      <ShareButton {payload} />
      <ClearButton label={$m.needed.clearAll} confirmLabel={$m.needed.clearConfirm} onConfirm={clearAll} />
    </div>
  </div>

  <ShortcutHint
    items={[
      { keys: 'Ctrl+Enter', label: $m.needed.shortcutAdd },
      { keys: 'Ctrl+Delete', label: $m.needed.shortcutDelete }
    ]}
  />
</Page>
