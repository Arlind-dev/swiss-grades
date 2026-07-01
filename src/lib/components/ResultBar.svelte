<script lang="ts">
  import type { Snippet } from 'svelte';
  import StatusChip from './StatusChip.svelte';
  import { toneColor, type Tone } from '$lib/utils/grading';

  let {
    label,
    value = null,
    tone = 'neutral',
    statusLabel,
    emptyText,
    children
  }: {
    label?: string;
    value?: string | null;
    tone?: Tone;
    statusLabel?: string;
    emptyText?: string;
    children?: Snippet;
  } = $props();

  const color = $derived(toneColor(tone, 'var(--text)'));
</script>

<section class="mt-6 rounded-lg border border-line bg-surface px-4 py-3.5" aria-live="polite">
  {#if children}
    {@render children()}
  {:else if value !== null}
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div class="flex items-baseline gap-2">
        {#if label}<span class="text-sm text-muted">{label}</span>{/if}
        <span class="tnum text-lg font-semibold" style="color: {color};">{value}</span>
      </div>
      {#if statusLabel}<StatusChip {tone} label={statusLabel} />{/if}
    </div>
  {:else}
    <p class="text-sm text-muted">{emptyText}</p>
  {/if}
</section>
