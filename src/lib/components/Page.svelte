<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    children
  }: {
    title: string;
    subtitle?: string;
    children: Snippet;
  } = $props();
</script>

<div class="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
  <header class="mb-6">
    <h1 class="text-xl font-semibold tracking-tight text-text">{title}</h1>
    {#if subtitle}
      <p class="mt-1 text-sm text-muted">{subtitle}</p>
    {/if}
  </header>
  {@render children()}
</div>
