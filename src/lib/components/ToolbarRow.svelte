<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { RoundingKey } from '$lib/types';
  import RoundingSelect from './RoundingSelect.svelte';

  let {
    rounding = $bindable(),
    actions
  }: { rounding: RoundingKey; actions?: Snippet } = $props();
</script>

<div class="flex items-end justify-between gap-4">
  <RoundingSelect bind:value={rounding} />
  {#if actions}
    <div class="flex items-center gap-2">{@render actions()}</div>
  {/if}
</div>
