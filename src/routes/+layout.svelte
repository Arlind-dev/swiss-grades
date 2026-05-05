<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { page } from '$app/stores';
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
        <span class="text-xl font-black italic tracking-tighter text-ctp-lavender">Swiss Grades</span>
        <label for="nav-drawer" class="btn btn-ghost btn-sm btn-circle">
          <CloseOutline class="w-5 h-5" />
        </label>
      </div>
      
      <ul class="space-y-1">
        <li>
          <a href="/calculator" 
             class="flex items-center gap-3 p-3 rounded-xl transition-all font-bold"
             class:bg-ctp-surface0={ $page.url.pathname === '/calculator' }
             class:text-ctp-lavender={ $page.url.pathname === '/calculator' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/calculator' }
             onclick={closeDrawer}>
            {$m.nav.calculator}
          </a>
        </li>
        <li>
          <a href="/average" 
             class="flex items-center gap-3 p-3 rounded-xl transition-all font-bold"
             class:bg-ctp-surface0={ $page.url.pathname === '/average' }
             class:text-ctp-lavender={ $page.url.pathname === '/average' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/average' }
             onclick={closeDrawer}>
            {$m.nav.average}
          </a>
        </li>
        <li>
          <a href="/needed" 
             class="flex items-center gap-3 p-3 rounded-xl transition-all font-bold"
             class:bg-ctp-surface0={ $page.url.pathname === '/needed' }
             class:text-ctp-lavender={ $page.url.pathname === '/needed' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/needed' }
             onclick={closeDrawer}>
            {$m.nav.needed}
          </a>
        </li>
        <li>
          <a href="/qv" 
             class="flex items-center gap-3 p-3 rounded-xl transition-all font-bold"
             class:bg-ctp-surface0={ $page.url.pathname === '/qv' }
             class:text-ctp-lavender={ $page.url.pathname === '/qv' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/qv' }
             onclick={closeDrawer}>
            {$m.nav.qv}
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
