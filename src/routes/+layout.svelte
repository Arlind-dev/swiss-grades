<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { theme } from '$lib/stores/theme';
  import { locale } from '$lib/i18n';
  import { onMount } from 'svelte';

  let { children } = $props();
  let mounted = $state(false);

  onMount(() => { mounted = true; });

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
