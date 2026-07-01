<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { m, locale } from '$lib/i18n';
  import { numericInput, clampInput } from '$lib/actions';
  import { qv, type QVState } from '$lib/stores/qv';
  import { QV_PRESETS, getQVPreset } from '$lib/qv/presets';
  import { localizeQVPreset, localizeQVPresets } from '$lib/qv/localize';
  import type { QVComponent } from '$lib/qv/types';
  import {
    getTrackComponents,
    getComponentDetails,
    isComponentExcluded,
    computeComponentGrade,
    evaluateQV,
    computeNeededGrade
  } from '$lib/utils/qv';
  import { readSharePayload, type SharePayload } from '$lib/utils/share';
  import Page from '$lib/components/Page.svelte';
  import ResultBar from '$lib/components/ResultBar.svelte';
  import StatusChip from '$lib/components/StatusChip.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import Button from '$lib/components/Button.svelte';

  let state = $state<QVState>(get(qv));

  $effect(() => {
    qv.set(state);
  });

  const preset = $derived(localizeQVPreset(getQVPreset(state.presetId), $locale));
  const presetOptions = $derived(localizeQVPresets(QV_PRESETS, $locale));
  const components = $derived(getTrackComponents(preset, state.track));
  const activeTrack = $derived(preset.tracks.find((t) => t.id === state.track) ?? preset.tracks[0]);

  // Share of the active weight (so BM / dispensed tracks read correctly).
  function formatWeight(pct: number): string {
    return Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  }

  function numMap(rec: Record<string, string> = {}): Record<string, number | undefined> {
    const out: Record<string, number | undefined> = {};
    for (const [k, v] of Object.entries(rec)) {
      const n = parseFloat(v);
      out[k] = isNaN(n) ? undefined : n;
    }
    return out;
  }

  function effectiveGrade(c: QVComponent): number | undefined {
    const modeId = state.componentModes[c.id];
    if (isComponentExcluded(c, modeId)) return undefined;
    const details = getComponentDetails(c, modeId);
    if (state.detailEnabled[c.id] && details.length) {
      return computeComponentGrade(c, numMap(state.detailGrades[c.id]), modeId) ?? undefined;
    }
    const n = parseFloat(state.componentGrades[c.id] ?? '');
    return isNaN(n) ? undefined : n;
  }

  const gradeMap = $derived.by(() => {
    const map: Record<string, number | undefined> = {};
    for (const c of components) map[c.id] = effectiveGrade(c);
    return map;
  });

  const evaluation = $derived(evaluateQV(preset, state.track, gradeMap, state.componentModes));
  const neededGrade = $derived(computeNeededGrade(preset, state.track, gradeMap, state.componentModes));

  const finalTone = $derived(
    evaluation.passed === true ? 'pass' : evaluation.passed === false ? 'fail' : 'neutral'
  );
  const finalStatus = $derived(
    evaluation.passed === true ? $m.qv.pass : evaluation.passed === false ? $m.qv.fail : $m.qv.pending
  );

  const failedLabels = $derived(
    evaluation.failedFallnoten
      .map((id) => components.find((c) => c.id === id)?.shortLabel ?? id)
      .join(', ')
  );

  function setPreset(id: string) {
    const p = getQVPreset(id);
    state = {
      presetId: id,
      track: p.tracks[0].id,
      componentGrades: {},
      detailEnabled: {},
      detailGrades: {},
      componentModes: {}
    };
  }

  function setComponentGrade(id: string, v: string) {
    state.componentGrades = { ...state.componentGrades, [id]: v };
  }
  function setDetailGrade(cid: string, did: string, v: string) {
    const next = { ...(state.detailGrades[cid] ?? {}), [did]: v };
    state.detailGrades = { ...state.detailGrades, [cid]: next };
  }
  function setMode(id: string, modeId: string) {
    state.componentModes = { ...state.componentModes, [id]: modeId };
  }
  function toggleDetails(id: string) {
    state.detailEnabled = { ...state.detailEnabled, [id]: !state.detailEnabled[id] };
  }

  function clearAll() {
    setPreset(state.presetId);
  }

  onMount(() => {
    const shared = readSharePayload('qv');
    if (shared && shared.page === 'qv') {
      state = {
        presetId: shared.presetId,
        track: shared.track,
        componentGrades: shared.componentGrades,
        detailEnabled: shared.detailEnabled,
        detailGrades: shared.detailGrades,
        componentModes: shared.componentModes ?? {}
      };
    }
  });

  const payload = (): SharePayload => ({
    v: 1,
    page: 'qv',
    presetId: state.presetId,
    track: state.track,
    componentGrades: state.componentGrades,
    detailEnabled: state.detailEnabled,
    detailGrades: state.detailGrades,
    componentModes: state.componentModes
  });
</script>

<svelte:head><title>{$m.qv.title} — Swiss Grades</title></svelte:head>

<Page title={$m.qv.title} subtitle={$m.qv.description} width="wide">
  <!-- preset + track selectors -->
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label for="qv-preset" class="field-label">{$m.qv.presetLabel}</label>
      <select
        id="qv-preset"
        class="field-input"
        value={state.presetId}
        onchange={(e) => setPreset(e.currentTarget.value)}
      >
        {#each presetOptions as p (p.id)}
          <option value={p.id}>{p.label}</option>
        {/each}
      </select>
    </div>
    {#if preset.tracks.length > 1}
      <div>
        <label for="qv-track" class="field-label">{$m.qv.trackLabel}</label>
        <select
          id="qv-track"
          class="field-input"
          value={state.track}
          onchange={(e) => (state = { ...state, track: e.currentTarget.value })}
        >
          {#each preset.tracks as t (t.id)}
            <option value={t.id}>{t.label}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
  {#if activeTrack.note}
    <p class="mt-2 text-xs text-muted">{activeTrack.note}</p>
  {/if}

  <!-- components -->
  <div class="mt-6 divide-y divide-line">
    {#each components as c (c.id)}
      {@const modeId = state.componentModes[c.id]}
      {@const excluded = isComponentExcluded(c, modeId)}
      {@const details = getComponentDetails(c, modeId)}
      {@const expanded = !!state.detailEnabled[c.id] && details.length > 0}
      {@const grade = gradeMap[c.id]}
      <div class="py-3">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div class="w-full min-w-0 sm:w-auto sm:flex-1">
            <div
              class="font-medium text-text {c.description ? 'cursor-help' : ''}"
              title={c.description}
            >
              {c.label}
            </div>
            {#if c.roundingNote}
              <div class="text-xs text-faint">{c.roundingNote}</div>
            {/if}
          </div>

          {#if c.detailModes && c.detailModes.length}
            <select
              class="field-input h-8 w-auto max-w-[11rem] text-xs"
              value={modeId ?? c.detailModes.find((md) => md.id === c.defaultDetailModeId)?.id ?? c.detailModes[0].id}
              onchange={(e) => setMode(c.id, e.currentTarget.value)}
              aria-label={$m.qv.modeLabel}
            >
              {#each c.detailModes as md (md.id)}
                <option value={md.id}>{md.label}</option>
              {/each}
            </select>
          {/if}

          {#if excluded}
            <span class="text-sm text-muted">{$m.qv.dispensed}</span>
          {:else if expanded}
            <input
              class="field-input tnum w-20 shrink-0 text-muted"
              value={grade !== undefined ? grade.toFixed(1) : '—'}
              disabled
              aria-label={c.label}
            />
          {:else}
            <input
              class="field-input tnum w-20 shrink-0"
              value={state.componentGrades[c.id] ?? ''}
              oninput={(e) => setComponentGrade(c.id, e.currentTarget.value)}
              placeholder={$m.qv.gradeHeader}
              inputmode="decimal"
              autocomplete="off"
              aria-label={c.label}
              use:numericInput
              use:clampInput={{ min: 1, max: 6 }}
            />
          {/if}

          <span class="tnum w-14 shrink-0 text-right text-sm text-muted">
            {excluded || evaluation.activeWeightSum <= 0
              ? '—'
              : `${formatWeight((c.weight / evaluation.activeWeightSum) * 100)}%`}
          </span>

          <!-- status -->
          <div class="ml-auto shrink-0 text-right sm:ml-0 sm:w-28">
            {#if excluded}
              <span class="text-xs text-faint">{$m.qv.dispensed}</span>
            {:else if grade === undefined}
              <span class="text-xs text-faint" aria-hidden="true">—</span>
            {:else if c.fallnote && grade < (c.minGrade ?? 4)}
              <StatusChip tone="fail" label={$m.qv.fallnoteFail} />
            {:else if c.fallnote}
              <StatusChip tone="pass" label={$m.qv.fallnotePass} />
            {/if}
          </div>
        </div>

        {#if details.length > 0 && !excluded}
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="ghost" onclick={() => toggleDetails(c.id)}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-transform {expanded ? 'rotate-180' : ''}"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              {expanded ? $m.qv.hideDetails : $m.qv.showDetails}
            </Button>
          </div>
          {#if expanded}
            <div class="mt-2 grid gap-2 rounded-md border border-line bg-surface p-3 sm:grid-cols-2">
              {#each details as d (d.id)}
                <label class="flex items-center justify-between gap-2 text-sm">
                  <span class="min-w-0 truncate text-muted" title={d.label}>{d.shortLabel}</span>
                  <input
                    class="field-input tnum w-20 shrink-0"
                    value={state.detailGrades[c.id]?.[d.id] ?? ''}
                    oninput={(e) => setDetailGrade(c.id, d.id, e.currentTarget.value)}
                    inputmode="decimal"
                    autocomplete="off"
                    aria-label={d.label}
                    use:numericInput
                    use:clampInput={{ min: 1, max: 6 }}
                  />
                </label>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  <!-- result -->
  <ResultBar>
    {#if evaluation.finalGrade !== null}
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div class="flex items-baseline gap-2">
            <span class="text-sm text-muted">{$m.qv.finalGrade}</span>
            <span
              class="tnum text-lg font-semibold"
              style="color: {finalTone === 'pass' ? 'var(--ctp-green)' : 'var(--ctp-red)'};"
            >
              {evaluation.finalGrade.toFixed(1)}
            </span>
            {#if evaluation.rawFinalGrade !== null}
              <span class="text-xs text-faint">
                ({$m.qv.rawFinalGrade} {evaluation.rawFinalGrade.toFixed(2)})
              </span>
            {/if}
          </div>
          <StatusChip tone={finalTone} label={finalStatus} />
        </div>
        {#if evaluation.failedFallnoten.length}
          <p class="text-sm" style="color: var(--ctp-red);">
            {$m.qv.failedFallnotenPrefix}{failedLabels}
          </p>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        <StatusChip tone="neutral" label={$m.qv.pending} />
        {#if neededGrade}
          {#if neededGrade.impossible}
            <p class="text-sm" style="color: var(--ctp-yellow);">
              {neededGrade.reason === 'known-fallnote'
                ? $m.qv.neededKnownFallnoteImpossible
                : $m.qv.neededMaxImpossible}
            </p>
          {:else if neededGrade.grade !== null}
            <p class="text-sm text-muted">
              {$m.qv.neededGradePrefix}<span class="tnum font-medium text-text">{neededGrade.grade.toFixed(1)}</span>{$m.qv.neededGradeSuffix}
            </p>
          {/if}
        {/if}
      </div>
    {/if}
  </ResultBar>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <div class="ml-auto flex items-center gap-2">
      <ShareButton {payload} />
      <ClearButton label={$m.common.clearAll} confirmLabel={$m.common.clearConfirm} onConfirm={clearAll} />
    </div>
  </div>

  <!-- overview / reference -->
  {#if preset.overviewItems.length}
    <dl class="mt-8 grid gap-x-6 gap-y-3 border-t border-line pt-6 text-sm sm:grid-cols-2">
      {#each preset.overviewItems as item (item.id)}
        <div>
          <dt class="font-medium text-text">{item.title}</dt>
          <dd class="mt-0.5 text-muted">{item.text}</dd>
        </div>
      {/each}
    </dl>
  {/if}

  <p class="mt-6 text-xs text-faint">
    {$m.qv.advisory}
    {#each preset.sources as src, i (src.href)}<a
        class="text-faint underline hover:text-muted"
        href={src.href}
        target="_blank"
        rel="noreferrer">{src.label}</a
      >{#if i < preset.sources.length - 1}, {/if}{/each}
  </p>
</Page>
