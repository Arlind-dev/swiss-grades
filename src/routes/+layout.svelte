<script lang="ts">
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { theme } from '$lib/stores/theme';

  let { children } = $props();

  $effect(() => {
    document.documentElement.dataset.theme = $theme;
  });
</script>

<div class="layout">
  <NavBar />
  <main>
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
  }

  @media (max-width: 600px) {
    main {
      width: 100%;
    }
  }
</style>
