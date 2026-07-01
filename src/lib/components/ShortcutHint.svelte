<script lang="ts">
  import { isMac } from '$lib/utils/platform';

  let { items }: { items: { keys: string; label: string }[] } = $props();

  function fmt(keys: string): string {
    return isMac ? keys.replace(/Ctrl/g, '⌘').replace(/Delete/g, '⌫') : keys;
  }
</script>

<p class="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted sm:flex">
  {#each items as item (item.label)}
    <span class="inline-flex items-center gap-1.5">
      <kbd class="rounded border border-line bg-surface px-2 py-0.5 text-sm font-medium text-text">
        {fmt(item.keys)}
      </kbd>
      {item.label}
    </span>
  {/each}
</p>
