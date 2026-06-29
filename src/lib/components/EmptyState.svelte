<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, icon }: { children: Snippet; icon?: Snippet } = $props();
</script>

<div
  class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ctp-surface1 bg-ctp-base/40 px-6 py-10 text-center"
>
  {#if icon}
    <div class="text-ctp-overlay0">{@render icon()}</div>
  {/if}
  <p class="max-w-xs text-sm font-medium text-ctp-subtext0">{@render children()}</p>
</div>
