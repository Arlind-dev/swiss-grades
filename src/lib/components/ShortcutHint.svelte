<script lang="ts">
  import { isMac } from '$lib/utils/platform';

  let { items }: { items: { keys: string; label: string }[] } = $props();

  function fmt(keys: string): string {
    return isMac ? keys.replace(/Ctrl/g, '⌘').replace(/Delete/g, '⌫') : keys;
  }
</script>

<p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-faint">
  {#each items as item (item.label)}
    <span class="inline-flex items-center gap-1.5">
      <kbd class="rounded border border-line px-1.5 py-0.5 text-[0.7rem] leading-none text-muted">
        {fmt(item.keys)}
      </kbd>
      {item.label}
    </span>
  {/each}
</p>
