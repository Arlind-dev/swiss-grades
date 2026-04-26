<script lang="ts">
  import { page } from '$app/stores';
  import { m, locale, type Locale } from '$lib/i18n';
  import { theme, type Theme } from '$lib/stores/theme';
  import MoonOutline from 'flowbite-svelte-icons/MoonOutline.svelte';
  import SunOutline from 'flowbite-svelte-icons/SunOutline.svelte';
  import BarsOutline from 'flowbite-svelte-icons/BarsOutline.svelte';
  import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';

  const locales: { value: Locale; label: string }[] = [
    { value: 'de', label: 'DE' },
    { value: 'en', label: 'EN' },
    { value: 'fr', label: 'FR' },
    { value: 'it', label: 'IT' },
  ];

  let menuOpen = $state(false);
  let localeOpen = $state(false);

  function toggleTheme() {
    theme.update((t) => (t === 'latte' ? 'mocha' : 'latte'));
  }

  $effect(() => {
    $page.url.pathname;
    menuOpen = false;
    localeOpen = false;
  });
</script>

<nav>
  <div class="bar">
    <button
      type="button"
      class="hamburger"
      aria-label="Toggle menu"
      onclick={() => (menuOpen = !menuOpen)}
    >
      {#if menuOpen}<CloseOutline class="icon" />{:else}<BarsOutline class="icon" />{/if}
    </button>

    <div class="links" class:open={menuOpen}>
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
        <button
          type="button"
          class="locale-toggle"
          onclick={() => (localeOpen = !localeOpen)}
          aria-label="Select language"
        >{$locale.toUpperCase()}</button>
        {#if localeOpen}
          <div class="locale-dropdown">
            {#each locales as loc}
              <button
                type="button"
                class:active={$locale === loc.value}
                onclick={() => { locale.set(loc.value); localeOpen = false; }}
              >{loc.label}</button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
  nav {
    margin-bottom: 24px;
    border-bottom: 2px solid var(--ctp-surface1);
    padding-bottom: 8px;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  /* ── Desktop links ── */
  .links {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  a {
    padding: 6px 14px;
    text-decoration: none;
    color: var(--ctp-subtext1);
    border-radius: 4px 4px 0 0;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }

  a:hover {
    background: var(--ctp-surface0);
    color: var(--ctp-text);
  }

  a.active {
    background: var(--ctp-lavender);
    color: var(--ctp-base);
  }

  /* ── Controls ── */
  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* shared size for all control buttons */
  .hamburger,
  .theme-toggle {
    padding: 6px 12px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid var(--ctp-surface2);
    border-radius: 4px;
    line-height: 1;
    height: 34px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger {
    display: none;
    background: none;
    color: var(--ctp-subtext0);
  }

  .hamburger:hover {
    border-color: var(--ctp-lavender);
    color: var(--ctp-lavender);
    background: none;
  }

  .hamburger :global(.icon),
  .theme-toggle :global(.icon) {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .theme-toggle {
    background: none;
    color: var(--ctp-subtext0);
  }

  .theme-toggle:hover {
    border-color: var(--ctp-lavender);
    color: var(--ctp-lavender);
    background: none;
  }

  .locale-switcher {
    position: relative;
  }

  .locale-toggle {
    padding: 6px 12px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid var(--ctp-surface2);
    border-radius: 4px;
    line-height: 1;
    height: 34px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.03em;
    background: none;
    color: var(--ctp-overlay1);
  }

  .locale-toggle:hover {
    border-color: var(--ctp-overlay2);
    color: var(--ctp-text);
    background: none;
  }

  .locale-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--ctp-mantle);
    border: 1px solid var(--ctp-surface1);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 200;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 60px;
  }

  .locale-dropdown button {
    padding: 6px 12px;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.03em;
    border: none;
    border-radius: 4px;
    background: none;
    color: var(--ctp-subtext1);
    text-align: center;
  }

  .locale-dropdown button:hover {
    background: var(--ctp-surface0);
    color: var(--ctp-text);
  }

  .locale-dropdown button.active {
    background: var(--ctp-lavender);
    color: var(--ctp-base);
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .hamburger {
      display: flex;
    }

    .links {
      display: none;
      position: absolute;
      top: calc(100% + 2px);
      left: 0;
      right: 0;
      flex-direction: column;
      gap: 2px;
      background: var(--ctp-mantle);
      border: 1px solid var(--ctp-surface1);
      border-radius: 6px;
      padding: 6px;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .links.open {
      display: flex;
    }

    a {
      padding: 10px 14px;
      border-radius: 4px;
    }

    nav {
      position: relative;
    }
  }
</style>
