<script lang="ts">
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
</script>

<header class="sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur">
  <div class="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
    <a href="/average" class="hidden shrink-0 font-semibold tracking-tight text-text sm:block">
      Swiss Grades
    </a>
    <nav class="nav-scroll flex flex-1 items-center gap-1 overflow-x-auto" aria-label="Tools">
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
          <span class="hidden md:inline">{$m.nav[item.key]}</span>
          <span class="md:hidden">{$m.navShort[item.key]}</span>
        </a>
      {/each}
    </nav>
    <div class="flex shrink-0 items-center gap-1.5">
      <LocaleSelect />
      <ThemeToggle />
    </div>
  </div>
</header>

<style>
  .nav-scroll {
    scrollbar-width: none;
  }
  .nav-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
