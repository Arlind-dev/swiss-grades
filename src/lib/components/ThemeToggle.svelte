<script lang="ts">
  import { theme } from '$lib/stores/theme';

  function toggle() {
    theme.update((t) => (t === 'mocha' ? 'latte' : 'mocha'));
  }
</script>

<button
  type="button"
  onclick={toggle}
  class="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text"
  aria-label="Toggle theme"
  title="Toggle theme"
>
  {#if $theme === 'mocha'}
    <!-- sun: switch to light -->
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  {:else}
    <!-- moon: switch to dark -->
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {/if}
</button>
