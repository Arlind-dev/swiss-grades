<script lang="ts">
  import { gradeColor } from '$lib/utils/grading';
  import StatusChip from './StatusChip.svelte';

  let {
    label,
    value,
    grade,
    showStatus = false,
    passLabel,
    failLabel
  }: {
    label: string;
    value: string;
    grade: number | null;
    showStatus?: boolean;
    passLabel?: string;
    failLabel?: string;
  } = $props();

  let color = $derived(grade !== null ? gradeColor(grade) : 'var(--ctp-overlay1)');
  let passing = $derived(grade !== null && grade >= 4);
</script>

<div
  class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-ctp-surface0 bg-ctp-base px-5 py-4"
>
  <span class="section-label">{label}</span>
  <div class="flex items-center gap-3">
    <span class="font-mono text-3xl sm:text-4xl font-bold tabular-nums leading-none" style:color>
      {value}
    </span>
    {#if showStatus && grade !== null}
      <StatusChip variant={passing ? 'success' : 'error'}>
        {passing ? passLabel : failLabel}
      </StatusChip>
    {/if}
  </div>
</div>
