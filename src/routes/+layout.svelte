<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import { theme } from '$lib/stores/theme';

  let { children } = $props();

  $effect(() => {
    document.documentElement.dataset.theme = $theme;
  });
</script>

<NavBar />

<main>
  {@render children()}
</main>

<style>
  main {
    width: fit-content;
  }

  @media (max-width: 600px) {
    main {
      width: 100%;
    }
  }
</style>
