<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { theme } from '$lib/stores/theme';
  import { locale } from '$lib/i18n';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();

  // The static build is prerendered in the default locale; render tool content
  // only after hydration so non-German users don't see a flash of the wrong
  // language.
  let mounted = $state(false);
  onMount(() => (mounted = true));

  $effect(() => {
    if (!browser) return;
    document.documentElement.dataset.theme = $theme;
    document.documentElement.style.background = $theme === 'mocha' ? '#1E1E2E' : '#FFFFFF';
  });

  $effect(() => {
    if (!browser) return;
    document.documentElement.lang = $locale;
  });
</script>

<div class="flex min-h-dvh flex-col">
  <NavBar />
  <main
    class="w-full flex-1 transition-opacity duration-150"
    class:opacity-0={!mounted}
    aria-busy={!mounted}
  >
    {#if mounted}{@render children()}{/if}
  </main>
  <Footer />
</div>
