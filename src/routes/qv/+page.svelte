<script lang="ts">
  import { qv, resetQV } from '$lib/stores/qv';
  import { QV_PRESETS, getQVPreset, getQVTrack } from '$lib/qv/presets';
  import type { QVComponent, QVComponentId, QVComponentMode, QVTrack } from '$lib/qv/types';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { clampInput, numericInput } from '$lib/actions';
  import { gradeColor } from '$lib/utils/grading';
  import {
    computeComponentGrade,
    computeNeededGrade,
    evaluateQV,
    getComponentDetails,
    getComponentMode,
    getTrackComponents,
    isComponentExcluded,
    isValidGrade,
  } from '$lib/utils/qv';
  import { locale, m } from '$lib/i18n';
  import { localizeQVPreset, localizeQVPresets } from '$lib/qv/localize';
  import { onMount } from 'svelte';
  import { clearShareParam, createShareUrl, readSharePayload } from '$lib/utils/share';
  import { slide, fade, scale } from 'svelte/transition';
  import { 
    InfoCircleOutline, 
    TrashBinOutline, 
    ChevronDownOutline, 
    ChevronUpOutline,
    ShieldCheckOutline,
    ChartPieOutline,
    AdjustmentsHorizontalOutline,
    BriefcaseOutline,
    TerminalOutline,
    BookOutline,
    CartOutline,
    UsersGroupOutline,
    TruckOutline,
    HeartOutline,
    CloseOutline
  } from 'flowbite-svelte-icons';

  const overviewStyles = [
    { icon: ShieldCheckOutline, color: 'text-ctp-green', bg: 'bg-ctp-green/10' },
    { icon: ChartPieOutline, color: 'text-ctp-blue', bg: 'bg-ctp-blue/10' },
    { icon: AdjustmentsHorizontalOutline, color: 'text-ctp-mauve', bg: 'bg-ctp-mauve/10' },
    { icon: BriefcaseOutline, color: 'text-ctp-peach', bg: 'bg-ctp-peach/10' },
  ];

  let basePreset = $derived(getQVPreset($qv.presetId));
  let preset = $derived(localizeQVPreset(basePreset, $locale));
  let selectablePresets = $derived(localizeQVPresets(QV_PRESETS, $locale));
  let activeTrack = $derived(getQVTrack(preset, $qv.track));
  let visibleComponents = $derived(getTrackComponents(preset, $qv.track));
  let componentGrades = $derived.by(() => {
    const grades: Record<string, number | null> = {};
    for (const component of preset.components) {
      const modeId = $qv.componentModes[component.id];
      if (isComponentExcluded(component, modeId)) {
        grades[component.id] = null;
        continue;
      }

      if ($qv.detailEnabled[component.id]) {
        grades[component.id] = computeComponentGrade(component, parseDetailGrades(component.id), modeId);
      } else {
        grades[component.id] = parseGrade($qv.componentGrades[component.id]);
      }
    }
    return grades;
  });
  let evaluation = $derived(evaluateQV(preset, $qv.track, componentGrades, $qv.componentModes));
  let needed = $derived(computeNeededGrade(preset, $qv.track, componentGrades, $qv.componentModes));
  let overviewItems = $derived(
    preset.overviewItems.map((item, index) => ({
      ...item,
      ...overviewStyles[index % overviewStyles.length],
    }))
  );

  let progress = $derived.by(() => {
    const active = evaluation.activeComponents;
    if (active.length === 0) return 0;
    const completed = active.filter((c) => isValidGrade(componentGrades[c.id])).length;
    return (completed / active.length) * 100;
  });

  let showPresetModal = $state(false);
  let showInfo = $state(false);
  let confirmClear = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  let activePresetIcon = $derived(getPresetIcon($qv.presetId));

  onMount(() => {
    const payload = readSharePayload('qv');
    if (payload?.page !== 'qv') return;

    qv.set({
      presetId: payload.presetId,
      track: payload.track,
      componentGrades: payload.componentGrades,
      detailEnabled: payload.detailEnabled,
      detailGrades: payload.detailGrades,
      componentModes: payload.componentModes ?? {},
    });
    clearShareParam();
  });

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

  function filterQVMap<T>(values: Record<string, T> | undefined, allowedIds: Set<string>): Record<string, T> {
    return Object.fromEntries(
      Object.entries(values ?? {}).filter(([componentId]) => allowedIds.has(componentId))
    ) as Record<string, T>;
  }

  function setPreset(presetId: string) {
    const nextPreset = getQVPreset(presetId);
    qv.update((state) => {
      const componentIds = new Set(nextPreset.components.map((component) => component.id));
      const track = nextPreset.tracks.some((option) => option.id === state.track)
        ? state.track
        : nextPreset.tracks[0].id;

      return {
        ...state,
        presetId: nextPreset.id,
        track,
        componentGrades: filterQVMap(state.componentGrades, componentIds),
        detailEnabled: filterQVMap(state.detailEnabled, componentIds),
        detailGrades: filterQVMap(state.detailGrades, componentIds),
        componentModes: filterQVMap(state.componentModes, componentIds),
      };
    });
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

  function setComponentMode(componentId: QVComponentId, modeId: string) {
    qv.update((state) => ({
      ...state,
      componentModes: { ...state.componentModes, [componentId]: modeId },
    }));
  }

  function selectedComponentMode(component: QVComponent): QVComponentMode | null {
    return getComponentMode(component, $qv.componentModes[component.id]);
  }

  function componentHasDetailControls(component: QVComponent): boolean {
    return Boolean(component.detailModes?.length || component.details?.length);
  }

  function componentInputValue(component: QVComponent): string {
    const modeId = $qv.componentModes[component.id];
    if (isComponentExcluded(component, modeId)) return '';
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
    if (isComponentExcluded(component, $qv.componentModes[component.id])) return '—';
    if (evaluation.activeWeightSum <= 0) return '0';
    const weight = (component.weight / evaluation.activeWeightSum) * 100;
    return Number.isInteger(weight) ? String(weight) : weight.toFixed(2);
  }

  function displayDetailWeight(weight: number): string {
    return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
  }

  function componentNames(ids: QVComponentId[]): string {
    return ids
      .map((id) => preset.components.find((component) => component.id === id)?.shortLabel ?? id)
      .join(', ');
  }

  function getPresetIcon(id: string) {
    if (id.includes('informatiker')) return TerminalOutline;
    if (id.includes('kaufmann')) return BookOutline;
    if (id.includes('detailhandel')) return CartOutline;
    if (id.includes('betreuung')) return UsersGroupOutline;
    if (id.includes('logistiker')) return TruckOutline;
    return HeartOutline;
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

<div class="flex flex-col gap-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-black tracking-tight text-ctp-text">{$m.qv.title}</h1>
    <p class="text-ctp-subtext1 max-w-lg mx-auto">{$m.qv.description}</p>
  </div>

  <div class="card bg-ctp-mantle shadow-xl border border-ctp-surface0 overflow-visible">
    <div class="card-body p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div class="space-y-4 w-full sm:w-auto">
          <div>
            <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1 mb-2">{$m.qv.presetLabel}</p>
            <button
              type="button"
              class="flex items-center justify-between w-full max-w-xl p-4 bg-ctp-base border-2 border-ctp-surface1 rounded-2xl hover:border-ctp-lavender transition-all text-left group"
              onclick={() => (showPresetModal = true)}
            >
              <div class="flex items-center gap-4">
                <div class="p-2.5 rounded-xl bg-ctp-mantle border border-ctp-surface0 group-hover:border-ctp-lavender/30 transition-all">
                  <activePresetIcon class="w-6 h-6 text-ctp-lavender"></activePresetIcon>
                </div>
                <div>
                  <span class="block font-black text-ctp-text leading-tight">{preset.label}</span>
                  <span class="text-xs font-bold text-ctp-overlay1 tracking-widest uppercase">{preset.fachrichtung}</span>
                </div>
              </div>
              <ChevronDownOutline class="w-5 h-5 text-ctp-overlay1 group-hover:text-ctp-lavender transition-all" />
            </button>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-ctp-subtext1">{preset.description}</p>
          </div>

          <div>
            <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1 mb-2">{$m.qv.trackLabel}</p>
            <div class="join w-full">
              {#each preset.tracks as track}
                <button
                  type="button"
                  class="btn join-item btn-sm flex-grow sm:flex-grow-0 min-w-[6rem] transition-all"
                  class:bg-ctp-lavender={$qv.track === track.id}
                  class:text-ctp-base={$qv.track === track.id}
                  class:bg-ctp-base={$qv.track !== track.id}
                  class:text-ctp-text={$qv.track !== track.id}
                  class:border-ctp-surface1={$qv.track !== track.id}
                  onclick={() => setTrack(track.id)}
                >{track.label}</button>
              {/each}
            </div>
          </div>
        </div>

        <ShareButton getUrl={() => createShareUrl({
          v: 1,
          page: 'qv',
          presetId: $qv.presetId,
          track: $qv.track,
          componentGrades: $qv.componentGrades,
          detailEnabled: $qv.detailEnabled,
          detailGrades: $qv.detailGrades,
          componentModes: $qv.componentModes,
        })} />
      </div>

      {#if activeTrack.note}
        <div class="alert bg-ctp-surface0/30 border-ctp-surface1 mt-6 rounded-2xl py-3 shadow-inner" transition:fade>
          <InfoCircleOutline class="w-5 h-5 text-ctp-lavender" />
          <span class="text-sm font-medium text-ctp-subtext1">{activeTrack.note}</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <button
        type="button"
        class="btn btn-ghost btn-xs text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text gap-2 rounded-lg"
        onclick={() => (showInfo = !showInfo)}
      >
        <InfoCircleOutline class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">
          {showInfo ? $m.qv.hideDetails : $m.qv.showDetails}
        </span>
      </button>

      <div class="flex items-center gap-3">
        <div class="hidden sm:block text-[10px] font-black uppercase tracking-widest text-ctp-overlay1">
          {Math.round(progress)}% {$m.qv.pending}
        </div>
        <progress 
          class="progress progress-primary w-32 sm:w-48 bg-ctp-surface0" 
          value={progress} 
          max="100"
        ></progress>
      </div>
    </div>

    {#if showInfo}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" transition:slide>
        {#each overviewItems as item}
          <div class="rounded-2xl border border-ctp-surface0 bg-ctp-mantle p-5 shadow-lg transition-all hover:border-ctp-surface1 hover:shadow-xl flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl {item.bg} border border-ctp-surface0/50 flex-shrink-0">
                <item.icon class="w-5 h-5 {item.color}" />
              </div>
              <h2 class="text-xs font-black uppercase tracking-widest text-ctp-overlay1 leading-tight">{item.title}</h2>
            </div>
            <p class="text-sm leading-relaxed text-ctp-subtext1 font-medium">{item.text}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="flex flex-col gap-4">
    <div class="sticky top-16 z-10 bg-ctp-base/90 backdrop-blur-md py-4 hidden sm:grid grid-cols-[minmax(0,1fr)_8rem_6rem_8rem_6rem] gap-4 px-8 text-xs font-black uppercase tracking-widest text-ctp-overlay1 border-b border-ctp-surface0/50">
      <span>{$m.qv.componentHeader}</span>
      <span class="text-center">{$m.qv.gradeHeader}</span>
      <span class="text-center">{$m.qv.weightHeader}</span>
      <span class="text-center">{$m.qv.statusHeader}</span>
      <span></span>
    </div>

    {#each visibleComponents as component (component.id)}
      {@const selectedMode = selectedComponentMode(component)}
      {@const detailItems = getComponentDetails(component, $qv.componentModes[component.id])}
      {@const componentExcluded = isComponentExcluded(component, $qv.componentModes[component.id])}
      {@const grade = componentGrades[component.id]}
      {@const hasGrade = typeof grade === 'number' && grade >= 1 && grade <= 6}
      {@const failedFallnote = component.fallnote && hasGrade && grade < (component.minGrade ?? 4)}
      
      <div class="card bg-ctp-mantle border border-ctp-surface0 shadow-lg overflow-hidden group hover:border-ctp-surface1 transition-all">
        <div class="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_8rem_6rem_8rem_6rem] items-center gap-4">
          <div class="w-full sm:w-auto text-center sm:text-left">
            <strong class="text-lg block font-black text-ctp-text">{component.label}</strong>
            <span class="text-xs font-bold text-ctp-overlay1 tracking-widest uppercase">{component.shortLabel}</span>
            {#if component.description}
              <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ctp-subtext1">{component.description}</p>
            {/if}
            {#if component.roundingNote}
              <p class="mt-1 text-xs font-bold text-ctp-overlay1">{component.roundingNote}</p>
            {/if}
          </div>

          <div class="w-32 sm:w-auto">
            <input
              type="text"
              class="input input-bordered input-md w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-center font-black text-xl"
              class:bg-ctp-surface0={ $qv.detailEnabled[component.id] || componentExcluded }
              class:opacity-50={ $qv.detailEnabled[component.id] || componentExcluded }
              inputmode="decimal"
              placeholder="—"
              value={componentInputValue(component)}
              readonly={$qv.detailEnabled[component.id] || componentExcluded}
              disabled={componentExcluded}
              use:numericInput
              use:clampInput={{ min: 1, max: 6, decimals: 2, oncommit: (value) => !$qv.detailEnabled[component.id] && !componentExcluded && setComponentGrade(component.id, value) }}
            />
          </div>

          <div class="text-center">
            <span class="badge bg-ctp-base border-ctp-surface1 text-ctp-subtext0 font-black px-4 py-3">{displayWeight(component)}%</span>
          </div>

          <div class="text-center w-full sm:w-auto">
            <span
              class="badge border-none font-black uppercase tracking-tighter text-xs px-4 py-3 w-full sm:w-28"
              class:bg-ctp-green={!componentExcluded && component.fallnote && hasGrade && !failedFallnote}
              class:bg-ctp-red={!componentExcluded && failedFallnote}
              class:text-ctp-base={!componentExcluded && component.fallnote && hasGrade}
              class:bg-ctp-surface0={componentExcluded || !component.fallnote || !hasGrade}
              class:text-ctp-overlay1={componentExcluded || !component.fallnote || !hasGrade}
            >
              {#if componentExcluded}
                {$m.qv.dispensed}
              {:else if component.fallnote}
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
          </div>

          <div class="flex justify-center w-full min-w-0 sm:w-auto">
            {#if componentHasDetailControls(component)}
              <button
                type="button"
                class="btn btn-ghost btn-xs h-auto min-h-8 w-full max-w-24 gap-1 px-2 py-1 whitespace-normal normal-case text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text"
                aria-expanded={$qv.detailEnabled[component.id]}
                onclick={() => setDetailEnabled(component.id, !$qv.detailEnabled[component.id])}
              >
                <span class="min-w-0 text-center text-[10px] font-black uppercase leading-none tracking-normal break-words">
                  {$qv.detailEnabled[component.id] ? $m.qv.hideDetails : $m.qv.showDetails}
                </span>
                {#if $qv.detailEnabled[component.id]}
                  <ChevronUpOutline class="h-4 w-4 shrink-0" />
                {:else}
                  <ChevronDownOutline class="h-4 w-4 shrink-0" />
                {/if}
              </button>
            {/if}
          </div>
        </div>

        {#if $qv.detailEnabled[component.id] && componentHasDetailControls(component)}
          <div class="bg-ctp-base/40 border-t border-ctp-surface0 px-6 py-6 space-y-4" transition:slide>
            {#if component.detailModes?.length}
              <div class="space-y-3">
                <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1">{$m.qv.modeLabel}</p>
                <div class="grid gap-2 md:grid-cols-2">
                  {#each component.detailModes as mode (mode.id)}
                    <button
                      type="button"
                      class="flex flex-col gap-1 rounded-xl border p-3 text-left transition-all {selectedMode?.id === mode.id ? 'border-ctp-lavender bg-ctp-lavender/10' : 'border-ctp-surface1 bg-ctp-base'}"
                      onclick={() => setComponentMode(component.id, mode.id)}
                    >
                      <span class="text-sm font-black text-ctp-text leading-tight">{mode.label}</span>
                      {#if mode.description}
                        <span class="text-xs font-bold leading-relaxed text-ctp-overlay1">{mode.description}</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            {#if !componentExcluded && detailItems.length}
              <div class="space-y-4">
                {#if component.detailModes?.length}
                  <p class="text-xs font-black uppercase tracking-widest text-ctp-overlay1">{$m.qv.partGrades}</p>
                {/if}
                {#each detailItems as detail (detail.id)}
                  <div class="flex flex-col sm:grid sm:grid-cols-[1fr_8rem_6rem] items-center gap-4">
                    <div class="w-full sm:w-auto text-center sm:text-left">
                      <span class="text-sm font-bold text-ctp-subtext1">{detail.label}</span>
                      {#if detail.roundingNote}
                        <p class="mt-1 text-xs font-bold text-ctp-overlay1">{detail.roundingNote}</p>
                      {/if}
                    </div>
                    <div class="w-24 sm:w-auto">
                      <input
                        type="text"
                        class="input input-bordered input-sm w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-center font-black"
                        inputmode="decimal"
                        placeholder="—"
                        value={detailInputValue(component.id, detail.id)}
                        use:numericInput
                        use:clampInput={{ min: 1, max: 6, decimals: 2, oncommit: (value) => setDetailGrade(component.id, detail.id, value) }}
                      />
                    </div>
                    <span class="text-xs font-black text-ctp-overlay1 tracking-widest uppercase">{displayDetailWeight(detail.weight)}%</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="space-y-6">
    <div class="card bg-ctp-mantle shadow-2xl border-2 border-ctp-surface0 overflow-hidden" transition:scale>
      <div class="p-8 sm:p-12 flex flex-col items-center gap-6">
        <div class="text-center space-y-2">
          <span class="text-xs font-black uppercase tracking-[0.3em] text-ctp-subtext1">{$m.qv.finalGrade}</span>
          {#if evaluation.finalGrade !== null}
            <div 
              class="text-9xl font-black tracking-tighter"
              style:color={gradeColor(evaluation.finalGrade)}
              style:text-shadow="0 0 50px {gradeColor(evaluation.finalGrade)}40"
            >
              {evaluation.finalGrade.toFixed(1)}
            </div>
            {#if evaluation.rawFinalGrade !== null}
              <p class="text-sm font-bold text-ctp-overlay1">
                {$m.qv.rawFinalGrade}: {evaluation.rawFinalGrade.toFixed(2)} · {$m.qv.roundedFinalGrade}
              </p>
            {/if}
          {:else}
            <div class="badge bg-ctp-surface0 border-none text-ctp-overlay1 font-black px-6 py-4 uppercase tracking-widest">
              {$m.qv.missingFields}
            </div>
          {/if}
        </div>

        <div
          class="px-8 py-3 rounded-full font-black text-xl uppercase tracking-widest shadow-lg"
          class:bg-ctp-green={evaluation.passed === true}
          class:bg-ctp-red={evaluation.passed === false}
          class:text-ctp-base={evaluation.passed !== null}
          class:bg-ctp-surface1={evaluation.passed === null}
          class:text-ctp-subtext1={evaluation.passed === null}
        >
          {#if evaluation.passed === true}
            {$m.qv.pass}
          {:else if evaluation.passed === false}
            {$m.qv.fail}
          {:else}
            {$m.qv.pending}
          {/if}
        </div>

        {#if evaluation.failedFallnoten.length > 0}
          <div class="alert alert-error bg-ctp-red/10 border-ctp-red text-ctp-red rounded-2xl max-w-lg">
            <span class="text-sm font-bold text-center w-full">
              {$m.qv.failedFallnotenPrefix} <strong>{componentNames(evaluation.failedFallnoten)}</strong>
            </span>
          </div>
        {/if}

        {#if needed && !needed.impossible && needed.grade !== null}
          <div class="flex flex-col items-center gap-2 p-6 rounded-3xl bg-ctp-base border border-ctp-surface0 shadow-inner w-full max-w-md" transition:fade>
            <span class="text-xs font-black uppercase tracking-widest text-ctp-overlay1">{$m.qv.neededGradePrefix}</span>
            <div class="flex items-center gap-3">
              <span class="text-5xl font-black tabular-nums" style:color={gradeColor(needed.grade)}>{needed.grade.toFixed(1)}</span>
              <span class="text-xs font-bold text-ctp-subtext1 uppercase tracking-tighter leading-tight">{$m.qv.neededGradeSuffix}</span>
            </div>
            <span class="text-[10px] font-black text-ctp-overlay1 uppercase tracking-widest opacity-50">({componentNames(needed.missingComponentIds)})</span>
          </div>
        {:else if needed?.impossible}
           <div class="alert alert-error bg-ctp-red/10 border-ctp-red text-ctp-red rounded-2xl max-w-lg">
            <span class="text-sm font-bold text-center w-full">
              {needed.reason === 'known-fallnote' ? $m.qv.neededKnownFallnoteImpossible : $m.qv.neededMaxImpossible}
            </span>
          </div>
        {/if}
      </div>
      {#if evaluation.finalGrade !== null}
        <div class="h-3 w-full" style:background={gradeColor(evaluation.finalGrade)}></div>
      {/if}
    </div>

    <div class="flex justify-center pt-4">
      <button 
        type="button" 
        class="btn btn-ghost px-12 transition-all rounded-2xl" 
        class:btn-error={confirmClear}
        class:bg-ctp-red={confirmClear}
        class:text-ctp-base={confirmClear}
        class:hover:bg-ctp-surface1={!confirmClear}
        onclick={handleClearAll}
      >
        <TrashBinOutline class="w-5 h-5" />
        {confirmClear ? $m.qv.clearConfirm : $m.qv.clearAll}
      </button>
    </div>

    <div class="card bg-ctp-crust/50 border border-ctp-surface0 p-6 rounded-3xl">
      <p class="text-xs font-bold text-ctp-overlay1 mb-4">{$m.qv.advisory}</p>
      <div class="flex flex-wrap gap-x-6 gap-y-2">
        {#each preset.sources as source}
          <a href={source.href} target="_blank" rel="noreferrer" class="text-xs font-bold text-ctp-blue hover:text-ctp-lavender transition-colors underline decoration-dotted underline-offset-4">
            {source.label}
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if showPresetModal}
  <div class="modal modal-open" transition:fade={{ duration: 200 }}>
    <div class="modal-box max-w-4xl bg-ctp-base border border-ctp-surface0 p-0 overflow-hidden shadow-2xl" transition:scale={{ duration: 200, start: 0.95 }}>
      <div class="p-6 border-b border-ctp-surface0 flex items-center justify-between bg-ctp-mantle">
        <h3 class="text-xl font-black text-ctp-text">{$m.qv.presetLabel}</h3>
        <button type="button" class="btn btn-ghost btn-sm btn-circle" onclick={() => (showPresetModal = false)}>
          <CloseOutline class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each selectablePresets as item}
            {@const ItemIcon = getPresetIcon(item.id)}
            <button
              type="button"
              class="flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left group/item {$qv.presetId === item.id ? 'border-ctp-lavender bg-ctp-lavender/5' : 'border-ctp-surface0 hover:border-ctp-lavender/50'}"
              onclick={() => { setPreset(item.id); showPresetModal = false; }}
            >
              <div class="flex items-center gap-4 mb-3">
                <div class="p-3 rounded-xl bg-ctp-mantle border border-ctp-surface0 group-hover/item:border-ctp-lavender/30 transition-all">
                  <ItemIcon class="w-6 h-6 text-ctp-lavender"></ItemIcon>
                </div>
                <div>
                  <span class="block font-black text-ctp-text leading-tight">{item.shortLabel}</span>
                  <span class="text-[10px] font-black text-ctp-overlay1 tracking-[0.2em] uppercase">{item.fachrichtung}</span>
                </div>
              </div>
              <p class="text-xs leading-relaxed text-ctp-subtext1 font-medium">{item.description}</p>
            </button>
          {/each}
        </div>
      </div>
    </div>
    <button type="button" class="modal-backdrop bg-ctp-crust/80 backdrop-blur-sm" aria-label={$m.common.close} onclick={() => (showPresetModal = false)}>{$m.common.close}</button>
  </div>
{/if}

<style>
</style>
