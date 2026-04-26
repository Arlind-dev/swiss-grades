<script lang="ts">
  import { page } from '$app/stores';
  import { m, locale, type Locale } from '$lib/i18n';
  import { theme, type Theme } from '$lib/stores/theme';
  import MoonOutline from 'flowbite-svelte-icons/MoonOutline.svelte';
  import SunOutline from 'flowbite-svelte-icons/SunOutline.svelte';
  const locales: { value: Locale; label: string }[] = [
    { value: 'de', label: 'DE' },
    { value: 'en', label: 'EN' },
  ];

  function toggleTheme() {
    theme.update((t) => (t === 'latte' ? 'mocha' : 'latte'));
  }
</script>

<nav>
  <div class="links">
    <a href="/calculator" class:active={$page.url.pathname === '/calculator'}>{$m.nav.calculator}</a>
    <a href="/average"    class:active={$page.url.pathname === '/average'}>{$m.nav.average}</a>
    <a href="/needed"     class:active={$page.url.pathname === '/needed'}>{$m.nav.needed}</a>
  </div>
  <div class="controls">
    <button
      type="button"
      class="theme-toggle"
      title={$theme === 'latte' ? 'Switch to dark mode' : 'Switch to light mode'}
      onclick={toggleTheme}
    >{#if $theme === 'latte'}<MoonOutline class="icon" />{:else}<SunOutline class="icon" />{/if}</button>
    <div class="locale-switcher">
      {#each locales as loc}
        <button
          type="button"
          class:active={$locale === loc.value}
          onclick={() => locale.set(loc.value)}
        >{loc.label}</button>
      {/each}
    </div>
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 2px solid var(--ctp-surface1);
    padding-bottom: 8px;
  }

  .links {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  a {
    padding: 6px 14px;
    text-decoration: none;
    color: var(--ctp-subtext1);
    border-radius: 4px 4px 0 0;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
  }

  a:hover {
    background: var(--ctp-surface0);
    color: var(--ctp-text);
  }

  a.active {
    background: var(--ctp-lavender);
    color: var(--ctp-base);
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* shared size for all control buttons */
  .theme-toggle,
  .locale-switcher button {
    padding: 6px 12px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid var(--ctp-surface2);
    border-radius: 4px;
    line-height: 1;
    height: 34px;
    box-sizing: border-box;
  }

  .theme-toggle {
    background: none;
    color: var(--ctp-subtext0);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle :global(.icon) {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .theme-toggle:hover {
    border-color: var(--ctp-lavender);
    color: var(--ctp-lavender);
    background: none;
  }

  .locale-switcher {
    display: flex;
    gap: 2px;
  }

  .locale-switcher button {
    letter-spacing: 0.03em;
    background: none;
    color: var(--ctp-overlay1);
  }

  .locale-switcher button:hover {
    border-color: var(--ctp-overlay2);
    color: var(--ctp-text);
    background: none;
  }

  .locale-switcher button.active {
    background: var(--ctp-lavender);
    color: var(--ctp-base);
    border-color: var(--ctp-lavender);
  }

  @media (max-width: 600px) {
    nav {
      gap: 6px;
    }
    .links {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .links::-webkit-scrollbar {
      display: none;
    }
    a {
      padding: 6px 10px;
      font-size: 0.9rem;
      white-space: nowrap;
    }
  }
</style>
