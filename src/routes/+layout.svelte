<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { theme } from '$lib/stores/theme';
  import { locale } from '$lib/i18n';
  import { onMount } from 'svelte';

  const KNOWN_KEYS = new Set([
    'swiss-grades-theme',
    'swiss-grades-locale',
    'swiss-grades-grades',
    'swiss-grades-settings',
    'swiss-grades-needed',
  ]);

  let { children } = $props();
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    try {
      Object.keys(localStorage)
        .filter((k) => !KNOWN_KEYS.has(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  });

  $effect(() => {
    document.documentElement.dataset.theme = $theme;
  });

  $effect(() => {
    document.documentElement.lang = $locale;
  });
</script>

<div class="layout">
  <NavBar />
  <main class:invisible={!mounted}>
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .layout {
    max-width: 900px;
    margin: 0 auto;
  }

  main {
    width: fit-content;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    main {
      width: 100%;
    }
  }

  main.invisible {
    visibility: hidden;
  }
</style>
