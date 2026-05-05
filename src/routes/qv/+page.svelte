<script lang="ts">
  import { qv, resetQV } from '$lib/stores/qv';
  import { QV_PRESETS, getQVPreset } from '$lib/qv/presets';
  import type { QVComponent, QVComponentId, QVTrack } from '$lib/qv/types';
  import { clampInput, numericInput } from '$lib/actions';
  import { gradeColor } from '$lib/utils/grading';
  import { computeComponentGrade, computeNeededGrade, evaluateQV } from '$lib/utils/qv';
  import { m } from '$lib/i18n';

  const sources = [
    { label: 'ICT-Berufsbildung', href: 'https://www.ict-berufsbildung.ch/grundbildung/ict-lehren/informatiker-in-efz' },
    { label: 'QV Ausführungsbestimmungen', href: 'https://www.ict-berufsbildung.ch/resources/Informatiker-EFZ_Ausfuehrungsbestimmungen_QV_202406121.pdf' },
    { label: 'ICT-BZ QV 2026', href: 'https://ict-bz.ch/download/qv-2026-prasentation-infoveranstaltung-applikation-und-plattformentwicklung' },
    { label: 'BBZBL BiVo 2021', href: 'https://www.bbzbl.ch/wp-content/uploads/2021/07/Qualifikationsverfahren-QV-BiVo-2021.pdf' },
  ];

  let preset = $derived(getQVPreset($qv.presetId));
  let componentGrades = $derived.by(() => {
    const grades: Partial<Record<QVComponentId, number | null>> = {};
    for (const component of preset.components) {
      const detailGrade = $qv.detailEnabled[component.id]
        ? computeComponentGrade(component, parseDetailGrades(component.id))
        : null;
      grades[component.id] = detailGrade ?? parseGrade($qv.componentGrades[component.id]);
    }
    return grades;
  });
  let evaluation = $derived(evaluateQV(preset, $qv.track, componentGrades));
  let needed = $derived(computeNeededGrade(preset, $qv.track, componentGrades));

  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  function parseGrade(value: string | undefined): number | null {
    const parsed = parseFloat(value ?? '');
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseDetailGrades(componentId: QVComponentId): Partial<Record<string, number | null>> {
    const values = $qv.detailGrades[componentId] ?? {};
    return Object.fromEntries(
      Object.entries(values).map(([id, value]) => [id, parseGrade(value)])
    );
  }

  function setPreset(presetId: string) {
    qv.update((state) => ({ ...state, presetId }));
  }

  function setTrack(track: QVTrack) {
    qv.update((state) => ({ ...state, track }));
  }

  function setComponentGrade(componentId: QVComponentId, value: string) {
    qv.update((state) => ({
      ...state,
      componentGrades: { ...state.componentGrades, [componentId]: value },
    }));
  }

  function setDetailEnabled(componentId: QVComponentId, enabled: boolean) {
    qv.update((state) => ({
      ...state,
      detailEnabled: { ...state.detailEnabled, [componentId]: enabled },
    }));
  }

  function setDetailGrade(componentId: QVComponentId, detailId: string, value: string) {
    qv.update((state) => ({
      ...state,
      detailGrades: {
        ...state.detailGrades,
        [componentId]: {
          ...(state.detailGrades[componentId] ?? {}),
          [detailId]: value,
        },
      },
    }));
  }

  function componentInputValue(component: QVComponent): string {
    if ($qv.detailEnabled[component.id]) {
      const grade = componentGrades[component.id];
      return typeof grade === 'number' ? grade.toFixed(1) : '';
    }
    return $qv.componentGrades[component.id] ?? '';
  }

  function detailInputValue(componentId: QVComponentId, detailId: string): string {
    return $qv.detailGrades[componentId]?.[detailId] ?? '';
  }

  function displayWeight(component: QVComponent): string {
    if (evaluation.activeWeightSum <= 0) return '0';
    const weight = (component.weight / evaluation.activeWeightSum) * 100;
    return Number.isInteger(weight) ? String(weight) : weight.toFixed(2);
  }

  function componentNames(ids: QVComponentId[]): string {
    return ids
      .map((id) => preset.components.find((component) => component.id === id)?.shortLabel ?? id)
      .join(', ');
  }

  function handleClearAll() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (confirmClear) {
        confirmClear = false;
        if (confirmTimer) clearTimeout(confirmTimer);
        resetQV();
      } else {
        confirmClear = true;
        confirmTimer = setTimeout(() => { confirmClear = false; }, 3000);
      }
    } else {
      resetQV();
    }
  }
</script>

<svelte:head><title>{$m.qv.title}</title></svelte:head>

<div class="qv-page">
  <h1>{$m.qv.title}</h1>
  <p class="intro">{$m.qv.description}</p>

  <section class="controls" aria-label={$m.qv.presetLabel}>
    <p class="section-label">{$m.qv.presetLabel}</p>
    <div class="segmented">
      {#each QV_PRESETS as item}
        <button
          type="button"
          class:active={$qv.presetId === item.id}
          aria-pressed={$qv.presetId === item.id}
          onclick={() => setPreset(item.id)}
        >{item.shortLabel}</button>
      {/each}
    </div>
  </section>

  <section class="controls" aria-label={$m.qv.trackLabel}>
    <p class="section-label">{$m.qv.trackLabel}</p>
    <div class="segmented">
      <button
        type="button"
        class:active={$qv.track === 'regular'}
        aria-pressed={$qv.track === 'regular'}
        onclick={() => setTrack('regular')}
      >{$m.qv.regularTrack}</button>
      <button
        type="button"
        class:active={$qv.track === 'bm'}
        aria-pressed={$qv.track === 'bm'}
        onclick={() => setTrack('bm')}
      >{$m.qv.bmTrack}</button>
    </div>
  </section>

  {#if $qv.track === 'bm'}
    <p class="mode-note">{$m.qv.bmWeightNote}</p>
  {/if}

  <section class="components" aria-label={preset.label}>
    <div class="component-header" aria-hidden="true">
      <span>{$m.qv.componentHeader}</span>
      <span>{$m.qv.gradeHeader}</span>
      <span>{$m.qv.weightHeader}</span>
      <span>{$m.qv.statusHeader}</span>
    </div>

    {#each evaluation.activeComponents as component (component.id)}
      {@const grade = componentGrades[component.id]}
      {@const hasGrade = typeof grade === 'number' && grade >= 1 && grade <= 6}
      {@const failedFallnote = component.fallnote && hasGrade && grade < (component.minGrade ?? 4)}
      <div class="component-block">
        <div class="component-row">
          <div class="component-name">
            <strong>{component.label}</strong>
            <span>{component.shortLabel}</span>
          </div>
          <input
            type="text"
            class="input-grade"
            class:readonly={$qv.detailEnabled[component.id]}
            inputmode="decimal"
            placeholder={$m.gradeRow.placeholderGradeShort}
            value={componentInputValue(component)}
            readonly={$qv.detailEnabled[component.id]}
            use:numericInput
            use:clampInput={{ min: 1, max: 6, decimals: 2, oncommit: (value) => !$qv.detailEnabled[component.id] && setComponentGrade(component.id, value) }}
          />
          <span class="weight">{displayWeight(component)}%</span>
          <span
            class="status"
            class:ok={component.fallnote && hasGrade && !failedFallnote}
            class:fail={failedFallnote}
            class:neutral={!component.fallnote || !hasGrade}
          >
            {#if component.fallnote}
              {#if !hasGrade}
                {$m.qv.fallnotePending}
              {:else if failedFallnote}
                {$m.qv.fallnoteFail}
              {:else}
                {$m.qv.fallnotePass}
              {/if}
            {:else}
              {$m.qv.noFallnote}
            {/if}
          </span>

          {#if component.details?.length}
            <button
              type="button"
              class="btn-detail"
              onclick={() => setDetailEnabled(component.id, !$qv.detailEnabled[component.id])}
            >
              {$qv.detailEnabled[component.id] ? $m.qv.hideDetails : $m.qv.showDetails}
            </button>
          {:else}
            <span class="detail-placeholder"></span>
          {/if}
        </div>

        {#if $qv.detailEnabled[component.id] && component.details?.length}
          <div class="details">
            {#each component.details as detail (detail.id)}
              <label class="detail-row">
                <span>{detail.label}</span>
                <input
                  type="text"
                  inputmode="decimal"
                  placeholder={$m.gradeRow.placeholderGradeShort}
                  value={detailInputValue(component.id, detail.id)}
                  use:numericInput
                  use:clampInput={{ min: 1, max: 6, decimals: 2, oncommit: (value) => setDetailGrade(component.id, detail.id, value) }}
                />
                <span>{detail.weight}%</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </section>

  <section class="result-panel" aria-live="polite">
    <div class="result-line">
      <span>{$m.qv.finalGrade}</span>
      {#if evaluation.finalGrade !== null}
        <span class="grade-chip" style:--chip-color={gradeColor(evaluation.finalGrade)}>
          {evaluation.finalGrade.toFixed(1)}
        </span>
      {:else}
        <span class="placeholder">{$m.qv.missingFields}</span>
      {/if}
    </div>

    <p
      class="verdict"
      class:pass={evaluation.passed === true}
      class:fail={evaluation.passed === false}
      class:pending={evaluation.passed === null}
    >
      {#if evaluation.passed === true}
        {$m.qv.pass}
      {:else if evaluation.passed === false}
        {$m.qv.fail}
      {:else}
        {$m.qv.pending}
      {/if}
    </p>

    {#if evaluation.failedFallnoten.length > 0}
      <p class="issue">{$m.qv.failedFallnotenPrefix}{componentNames(evaluation.failedFallnoten)}</p>
    {/if}

    {#if needed}
      {#if needed.impossible}
        <p class="issue">
          {needed.reason === 'known-fallnote' ? $m.qv.neededKnownFallnoteImpossible : $m.qv.neededMaxImpossible}
        </p>
      {:else if needed.grade !== null}
        <p class="needed">
          {$m.qv.neededGradePrefix}
          <span class="grade-chip" style:--chip-color={gradeColor(needed.grade)}>{needed.grade.toFixed(1)}</span>
          {$m.qv.neededGradeSuffix}
          <span class="muted">({componentNames(needed.missingComponentIds)})</span>
        </p>
      {/if}
    {/if}
  </section>

  <div class="actions">
    <button type="button" class="btn-clear" class:confirming={confirmClear} onclick={handleClearAll}>
      {confirmClear ? $m.qv.clearConfirm : $m.qv.clearAll}
    </button>
  </div>

  <p class="source-note">
    {$m.qv.advisory}
    {#each sources as source, index}
      <a href={source.href} target="_blank" rel="noreferrer">{source.label}</a>{index < sources.length - 1 ? ', ' : '.'}
    {/each}
  </p>
</div>

<style>
  .qv-page {
    max-width: 900px;
  }

  .intro,
  .mode-note,
  .source-note {
    max-width: 760px;
  }

  .controls {
    margin-bottom: 14px;
  }

  .section-label {
    font-weight: 600;
    color: var(--ctp-subtext1);
    margin: 0 0 6px;
  }

  .segmented {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .segmented button {
    background: none;
    border-color: var(--ctp-surface2);
    color: var(--ctp-subtext1);
  }

  .segmented button.active {
    background: var(--ctp-lavender);
    border-color: var(--ctp-lavender);
    color: var(--ctp-base);
  }

  .mode-note {
    color: var(--ctp-subtext0);
    font-size: 0.9rem;
    margin: 0 0 12px;
  }

  .components {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .component-header,
  .component-row {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 100px 80px 140px auto;
    gap: 8px;
    align-items: center;
  }

  .component-header {
    padding: 0 4px;
    color: var(--ctp-overlay1);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .component-block {
    border-top: 1px solid var(--ctp-surface0);
    padding-top: 6px;
  }

  .component-name {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .component-name strong {
    color: var(--ctp-text);
    font-size: 0.98rem;
  }

  .component-name span,
  .muted {
    color: var(--ctp-overlay1);
    font-size: 0.8rem;
  }

  .input-grade,
  .detail-row input {
    width: 100%;
  }

  .input-grade.readonly {
    background: var(--ctp-surface0);
    color: var(--ctp-overlay1);
    cursor: not-allowed;
  }

  .weight {
    color: var(--ctp-subtext0);
    font-weight: 600;
    text-align: right;
  }

  .status {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--status-color);
    background: color-mix(in srgb, var(--status-color) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
    border-radius: 10px;
    padding: 2px 8px;
    text-align: center;
  }

  .status.ok { --status-color: var(--ctp-green); }
  .status.fail { --status-color: var(--ctp-red); }
  .status.neutral { --status-color: var(--ctp-overlay1); }

  .btn-detail {
    background: none;
    color: var(--ctp-subtext0);
    white-space: nowrap;
  }

  .detail-placeholder {
    width: 1px;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 6px 0 2px 22px;
    padding-left: 10px;
    border-left: 2px solid var(--ctp-surface1);
  }

  .detail-row {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 100px 52px;
    gap: 8px;
    align-items: center;
    margin: 0;
  }

  .detail-row span:first-child {
    color: var(--ctp-subtext1);
  }

  .detail-row span:last-child {
    color: var(--ctp-subtext0);
    font-weight: 600;
    text-align: right;
  }

  .result-panel {
    margin-top: 18px;
    border-top: 2px solid var(--ctp-surface1);
    padding-top: 14px;
  }

  .result-line {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .grade-chip {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 700;
    color: var(--chip-color);
    background: color-mix(in srgb, var(--chip-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--chip-color) 35%, transparent);
  }

  .placeholder {
    color: var(--ctp-overlay1);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .verdict {
    font-size: 1rem;
    font-weight: 700;
    margin: 8px 0;
  }

  .verdict.pass { color: var(--ctp-green); }
  .verdict.fail { color: var(--ctp-red); }
  .verdict.pending { color: var(--ctp-subtext0); }

  .issue {
    color: var(--ctp-red);
    margin: 6px 0;
  }

  .needed {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin: 6px 0;
  }

  .actions {
    margin-top: 14px;
  }

  .btn-clear.confirming {
    background: var(--ctp-red);
    border-color: var(--ctp-red);
    color: var(--ctp-base);
  }

  .source-note {
    color: var(--ctp-overlay1);
    font-size: 0.8rem;
    margin-top: 16px;
  }

  @media (max-width: 760px) {
    .component-header {
      display: none;
    }

    .component-row {
      grid-template-columns: 1fr 86px 64px;
    }

    .status {
      grid-column: 1 / -1;
      justify-self: start;
    }

    .btn-detail,
    .detail-placeholder {
      grid-column: 1 / -1;
      justify-self: start;
    }
  }

  @media (max-width: 520px) {
    .component-row {
      grid-template-columns: 1fr 82px;
    }

    .weight {
      grid-column: 1 / -1;
      text-align: left;
    }

    .details {
      margin-left: 0;
    }

    .detail-row {
      grid-template-columns: 1fr 82px;
    }

    .detail-row span:last-child {
      grid-column: 1 / -1;
      text-align: left;
    }
  }
</style>
