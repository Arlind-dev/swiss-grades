<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    width = 'narrow',
    children
  }: {
    title: string;
    subtitle?: string;
    width?: 'narrow' | 'wide';
    children: Snippet;
  } = $props();
</script>

<div class="mx-auto w-full px-4 py-6 sm:py-10 {width === 'wide' ? 'max-w-4xl' : 'max-w-2xl'}">
  <header class="mb-6">
    <h1 class="text-xl font-semibold tracking-tight text-text">{title}</h1>
    {#if subtitle}
      <p class="mt-1 text-sm text-muted">{subtitle}</p>
    {/if}
  </header>
  {@render children()}
</div>
