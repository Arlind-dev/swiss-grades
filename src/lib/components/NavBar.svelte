<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { m } from '$lib/i18n';
  import ThemeToggle from './ThemeToggle.svelte';
  import LocaleSelect from './LocaleSelect.svelte';

  const items = [
    { href: '/calculator', key: 'calculator' },
    { href: '/average', key: 'average' },
    { href: '/needed', key: 'needed' },
    { href: '/qv', key: 'qv' }
  ] as const;

  // Prerendered in the default locale; render tab labels only after hydration
  // so they don't flash the wrong language.
  let mounted = $state(false);
  onMount(() => (mounted = true));

  let open = $state(false);

  // Close the drawer on navigation.
  $effect(() => {
    $page.url.pathname;
    open = false;
  });

  function autofocus(node: HTMLElement) {
    node.focus();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') open = false;
  }}
/>

<header class="sticky top-0 z-30 border-b border-line bg-page/85 backdrop-blur">
  <div class="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
    <button
      type="button"
      class="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text sm:hidden"
      aria-label="Menu"
      aria-expanded={open}
      onclick={() => (open = true)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <a href="/average" class="shrink-0 font-semibold tracking-tight text-accent">Swiss Grades</a>

    <nav class="hidden flex-1 items-center justify-center gap-1 sm:flex" aria-label="Tools">
      {#if mounted}
        {#each items as item (item.href)}
          {@const active = $page.url.pathname === item.href}
          <a
            href={item.href}
            aria-current={active ? 'page' : undefined}
            class="rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors
              {active
              ? 'bg-accent-soft font-medium text-accent'
              : 'text-muted hover:bg-surface hover:text-text'}"
          >
            {$m.navShort[item.key]}
          </a>
        {/each}
      {/if}
    </nav>

    <div class="ml-auto flex shrink-0 items-center gap-1.5">
      <LocaleSelect />
      <ThemeToggle />
    </div>
  </div>
</header>

{#if open && mounted}
  <div class="fixed inset-0 z-40 sm:hidden">
    <button
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      aria-label={$m.common.close}
      onclick={() => (open = false)}
      transition:fade={{ duration: 150 }}
    ></button>
    <div
      class="absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col gap-1 border-r border-line bg-page p-3"
      role="dialog"
      aria-label="Menu"
      transition:fly={{ x: -280, duration: 180 }}
    >
      <div class="mb-2 flex items-center justify-between px-1">
        <span class="font-semibold text-text">Swiss Grades</span>
        <button
          type="button"
          class="grid size-8 place-items-center rounded text-muted hover:bg-surface hover:text-text"
          aria-label={$m.common.close}
          onclick={() => (open = false)}
          use:autofocus
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {#each items as item (item.href)}
        {@const active = $page.url.pathname === item.href}
        <a
          href={item.href}
          aria-current={active ? 'page' : undefined}
          onclick={() => (open = false)}
          class="rounded-md px-3 py-2 text-sm transition-colors
            {active
            ? 'bg-accent-soft font-medium text-accent'
            : 'text-muted hover:bg-surface hover:text-text'}"
        >
          {$m.nav[item.key]}
        </a>
      {/each}
    </div>
  </div>
{/if}
