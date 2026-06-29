<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, subtitle, children }: { title: string; subtitle?: string; children: Snippet } =
    $props();
</script>

<div class="flex flex-col gap-6 sm:gap-8">
  <header class="text-center space-y-2">
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-ctp-text">{title}</h1>
    {#if subtitle}
      <p class="mx-auto max-w-xl text-sm sm:text-base text-ctp-subtext1">{subtitle}</p>
    {/if}
  </header>
  {@render children()}
</div>
