<script lang="ts">
  import { numericInput } from '$lib/actions';
  import Page from '$lib/components/Page.svelte';
  import ToolbarRow from '$lib/components/ToolbarRow.svelte';
  import ClearButton from '$lib/components/ClearButton.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import ShareButton from '$lib/components/ShareButton.svelte';
  import { calculateGradeFromPoints, applyRounding } from '$lib/utils/grading';
  import { settings } from '$lib/stores/settings';
  import { m } from '$lib/i18n';
  import { onMount } from 'svelte';
  import { clearShareParam, createShareUrl, readSharePayload } from '$lib/utils/share';

  let points = $state($settings.calculatorPoints);
  let maxPoints = $state($settings.calculatorMaxPoints);
  let rounding = $state($settings.calculatorRounding);

  onMount(() => {
    const payload = readSharePayload('calculator');
    if (payload?.page !== 'calculator') return;

    points = payload.points;
    maxPoints = payload.maxPoints;
    rounding = payload.rounding;
    clearShareParam();
  });

  $effect(() => { settings.update((s) => ({ ...s, calculatorPoints: points })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorMaxPoints: maxPoints })); });
  $effect(() => { settings.update((s) => ({ ...s, calculatorRounding: rounding })); });

  let resultGrade = $derived.by(() => {
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);
    if (isNaN(p) || isNaN(max) || max <= 0 || p < 0 || p > max) return null;
    return calculateGradeFromPoints(p, max);
  });

  let pointsError = $derived.by(() => {
    const p = parseFloat(points);
    const max = parseFloat(maxPoints);
    if (!isNaN(p) && !isNaN(max) && max > 0 && p > max) return $m.calculator.pointsOutOfRange;
    return '';
  });

  let resultLabel = $derived($m.calculator.resultPrefix.replace(/:\s*$/, ''));

  function clearAll() {
    points = '';
    maxPoints = '';
  }
</script>

<svelte:head><title>{$m.calculator.title}</title></svelte:head>

<Page title={$m.calculator.title}>
  <div class="flex items-center justify-center gap-3 text-sm text-ctp-subtext1">
    <span class="font-semibold">{$m.calculator.formulaLabel}</span>
    <span class="flex flex-col items-center leading-tight">
      <span class="text-xs">{$m.calculator.formulaNumerator}</span>
      <span class="my-0.5 h-px w-full bg-ctp-surface2"></span>
      <span class="text-xs">{$m.calculator.formulaDenominator}</span>
    </span>
    <span class="font-semibold">+ 1</span>
  </div>

  <div class="card bg-ctp-mantle">
    <div class="card-body p-5 sm:p-6 space-y-6">
      <ToolbarRow bind:rounding actions={shareAction} />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label pt-0" for="points">
            <span class="label-text font-semibold text-ctp-subtext1">{$m.calculator.pointsLabel}</span>
          </label>
          <input
            id="points"
            type="text"
            inputmode="decimal"
            bind:value={points}
            use:numericInput
            placeholder="0"
            class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-lg font-semibold font-mono"
          />
        </div>

        <div class="form-control w-full">
          <label class="label pt-0" for="max-points">
            <span class="label-text font-semibold text-ctp-subtext1">{$m.calculator.maxPointsLabel}</span>
          </label>
          <input
            id="max-points"
            type="text"
            inputmode="decimal"
            bind:value={maxPoints}
            use:numericInput
            placeholder="100"
            class="input input-bordered w-full bg-ctp-base border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-all text-lg font-semibold font-mono"
          />
        </div>
      </div>

      {#if pointsError}
        <div class="alert bg-ctp-red/10 border-ctp-red text-ctp-red py-2">
          <span class="text-sm font-semibold">{pointsError}</span>
        </div>
      {/if}

      {#if resultGrade !== null}
        <ResultDisplay
          label={resultLabel}
          value={applyRounding(resultGrade, rounding)}
          grade={resultGrade}
          showStatus
          passLabel={$m.common.pass}
          failLabel={$m.common.fail}
        />
      {:else}
        <EmptyState>{$m.common.emptyState}</EmptyState>
      {/if}

      <div class="flex justify-center border-t border-ctp-surface0 pt-5">
        <ClearButton
          onConfirm={clearAll}
          label={$m.common.clearAll}
          confirmLabel={$m.common.clearConfirm}
          class="w-full sm:w-auto px-12"
        />
      </div>
    </div>
  </div>
</Page>

{#snippet shareAction()}
  <ShareButton getUrl={() => createShareUrl({
    v: 1,
    page: 'calculator',
    points,
    maxPoints,
    rounding
  })} />
{/snippet}
