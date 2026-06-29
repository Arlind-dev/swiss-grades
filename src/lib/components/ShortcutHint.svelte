<script lang="ts">
  import { browser } from '$app/environment';

  let { addLabel, deleteLabel }: { addLabel: string; deleteLabel: string } = $props();

  let isMac = $state(false);
  $effect(() => {
    if (browser) isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
  });
</script>

<div
  class="hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ctp-subtext1"
>
  <span class="inline-flex items-center gap-1.5">
    <kbd class="kbd-key">{isMac ? '⌘' : 'Ctrl'}</kbd>
    <span class="text-ctp-overlay1">+</span>
    <kbd class="kbd-key">Enter</kbd>
    <span class="ml-1">{addLabel}</span>
  </span>
  <span class="inline-flex items-center gap-1.5">
    <kbd class="kbd-key">{isMac ? '⌘' : 'Ctrl'}</kbd>
    <span class="text-ctp-overlay1">+</span>
    <kbd class="kbd-key">{isMac ? '⌫' : 'Del'}</kbd>
    <span class="ml-1">{deleteLabel}</span>
  </span>
</div>
