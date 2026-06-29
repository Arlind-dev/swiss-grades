<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { theme } from '$lib/stores/theme';
  import { locale } from '$lib/i18n';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();

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
  <main class="w-full flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
