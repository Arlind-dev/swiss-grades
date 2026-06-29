<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavLink from '$lib/components/NavLink.svelte';
  import {
    CloseOutline,
    ScaleBalancedOutline,
    ArrowsRepeatOutline,
    FlagOutline,
    GraduationCapOutline,
  } from 'flowbite-svelte-icons';

  const tools = [
    { href: '/average', key: 'average', Icon: ScaleBalancedOutline },
    { href: '/calculator', key: 'calculator', Icon: ArrowsRepeatOutline },
    { href: '/needed', key: 'needed', Icon: FlagOutline },
    { href: '/qv', key: 'qv', Icon: GraduationCapOutline },
  ] as const;
  import { m, locale } from '$lib/i18n';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  import { KNOWN_STORAGE_KEYS } from '$lib/storage-keys';

  let { children } = $props();
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    try {
      Object.keys(localStorage)
        .filter((k) => !KNOWN_STORAGE_KEYS.has(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  });

  function closeDrawer() {
    const drawer = document.getElementById('nav-drawer');
    if (drawer instanceof HTMLInputElement) {
      drawer.checked = false;
    }
  }

  $effect(() => {
    document.documentElement.dataset.theme = $theme;
  });

  $effect(() => {
    document.documentElement.lang = $locale;
  });
</script>

<div class="drawer">
  <input id="nav-drawer" type="checkbox" class="drawer-toggle" />
  
  <div class="drawer-content flex flex-col min-h-screen bg-ctp-base text-ctp-text">
    <NavBar />
    
    <main class="flex-grow container mx-auto max-w-5xl px-4 py-8 opacity-0 transition-opacity duration-300" class:opacity-100={mounted}>
      {#if mounted}
        {@render children()}
      {/if}
    </main>

    <Footer />
  </div>

  <div class="drawer-side z-50">
    <label for="nav-drawer" aria-label="close sidebar" class="drawer-overlay backdrop-blur-sm bg-ctp-crust/50 transition-all"></label>
    <div class="menu p-4 w-80 min-h-full bg-ctp-mantle text-ctp-text shadow-2xl">
      <div class="flex items-center justify-between mb-8 px-2">
        <span class="text-xl font-bold italic tracking-tight text-ctp-lavender">Swiss Grades</span>
        <label for="nav-drawer" class="btn btn-ghost btn-sm btn-circle">
          <CloseOutline class="w-5 h-5" />
        </label>
      </div>

      <ul class="space-y-1">
        {#each tools as tool}
          <li>
            <NavLink
              href={tool.href}
              label={$m.nav[tool.key]}
              Icon={tool.Icon}
              onclick={closeDrawer}
              class="w-full gap-3 py-3 text-base"
            />
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
