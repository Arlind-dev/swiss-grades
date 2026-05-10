<script lang="ts">
  import { page } from '$app/stores';
  import { tick } from 'svelte';
  import { m, locale, type Locale } from '$lib/i18n';
  import { theme } from '$lib/stores/theme';
  import {
    BarsOutline,
    CheckOutline,
    ChevronDownOutline,
    MoonOutline,
    SunOutline,
  } from 'flowbite-svelte-icons';

  const locales: { value: Locale; name: string }[] = [
    { value: 'de', name: 'Deutsch' },
    { value: 'en', name: 'English' },
    { value: 'fr', name: 'Français' },
    { value: 'it', name: 'Italiano' },
  ];

  let localeOpen = $state(false);
  let localeButton: HTMLButtonElement | undefined;
  const selectedLocale = $derived(locales.find((loc) => loc.value === $locale) ?? locales[0]);

  function toggleTheme() {
    theme.update((t) => (t === 'latte' ? 'mocha' : 'latte'));
  }

  function closeLocaleMenu({ focusTrigger = false } = {}) {
    localeOpen = false;
    if (focusTrigger) localeButton?.focus();
  }

  async function openLocaleMenu() {
    localeOpen = true;
    await tick();
    document.querySelector<HTMLButtonElement>('[data-active-locale="true"]')?.focus();
  }

  function toggleLocaleMenu() {
    if (localeOpen) {
      closeLocaleMenu();
      return;
    }
    void openLocaleMenu();
  }

  function selectLocale(value: Locale) {
    locale.set(value);
    closeLocaleMenu();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleLocaleToggleKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    void openLocaleMenu();
  }

  function moveLocaleFocus(direction: 1 | -1) {
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-locale-option]'));
    if (!options.length) return;

    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = currentIndex === -1
      ? 0
      : (currentIndex + direction + options.length) % options.length;

    options[nextIndex]?.focus();
  }

  function handleLocaleMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLocaleMenu({ focusTrigger: true });
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveLocaleFocus(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const options = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-locale-option]'));
      options[event.key === 'Home' ? 0 : options.length - 1]?.focus();
    }
  }

  function handleWindowClick(event: MouseEvent) {
    if (!localeOpen) return;
    if (event.target instanceof Element && event.target.closest('[data-locale-menu]')) return;
    closeLocaleMenu();
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && localeOpen) {
      closeLocaleMenu({ focusTrigger: true });
    }
  }

  $effect(() => {
    $page.url.pathname;
    localeOpen = false;
  });
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

<nav class="sticky top-0 z-40 w-full border-b border-ctp-surface0 bg-ctp-base/80 backdrop-blur-md">
  <div class="container mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
    <div class="flex items-center gap-2">
      <label for="nav-drawer" class="btn btn-ghost btn-circle sm:hidden">
        <BarsOutline class="h-5 w-5" />
      </label>
      <a href="/" class="text-xl font-black italic tracking-tighter text-ctp-lavender">Swiss Grades</a>
    </div>

    <div class="hidden flex-1 justify-center sm:flex">
      <ul class="flex gap-1">
        <li>
          <a href="/calculator" 
             class="px-4 py-2 rounded-xl transition-all font-bold text-sm"
             class:bg-ctp-surface0={ $page.url.pathname === '/calculator' }
             class:text-ctp-lavender={ $page.url.pathname === '/calculator' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/calculator' }>
            {$m.nav.calculator}
          </a>
        </li>
        <li>
          <a href="/average" 
             class="px-4 py-2 rounded-xl transition-all font-bold text-sm"
             class:bg-ctp-surface0={ $page.url.pathname === '/average' }
             class:text-ctp-lavender={ $page.url.pathname === '/average' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/average' }>
            {$m.nav.average}
          </a>
        </li>
        <li>
          <a href="/needed" 
             class="px-4 py-2 rounded-xl transition-all font-bold text-sm"
             class:bg-ctp-surface0={ $page.url.pathname === '/needed' }
             class:text-ctp-lavender={ $page.url.pathname === '/needed' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/needed' }>
            {$m.nav.needed}
          </a>
        </li>
        <li>
          <a href="/qv" 
             class="px-4 py-2 rounded-xl transition-all font-bold text-sm"
             class:bg-ctp-surface0={ $page.url.pathname === '/qv' }
             class:text-ctp-lavender={ $page.url.pathname === '/qv' }
             class:hover:bg-ctp-surface0={ $page.url.pathname !== '/qv' }>
            {$m.nav.qv}
          </a>
        </li>
      </ul>
    </div>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="btn btn-ghost btn-circle btn-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        aria-label={$theme === 'latte' ? 'Switch to dark mode' : 'Switch to light mode'}
        title={$theme === 'latte' ? 'Switch to dark mode' : 'Switch to light mode'}
        onclick={toggleTheme}
      >
        {#if $theme === 'latte'}<MoonOutline class="h-5 w-5" />{:else}<SunOutline class="h-5 w-5" />{/if}
      </button>

      <div class="dropdown dropdown-end" class:dropdown-open={localeOpen} data-locale-menu>
        <button
          bind:this={localeButton}
          type="button"
          class="btn btn-ghost btn-sm h-10 min-h-10 gap-2 rounded-lg border border-transparent px-2.5 text-ctp-subtext1 hover:border-ctp-surface0 hover:bg-ctp-surface0 sm:px-3"
          aria-haspopup="menu"
          aria-expanded={localeOpen}
          aria-label={`Select language, current language ${selectedLocale.name}`}
          onclick={toggleLocaleMenu}
          onkeydown={handleLocaleToggleKeydown}
        >
          <span class="text-sm font-bold tracking-normal">{selectedLocale.name}</span>
          <ChevronDownOutline
            class={`h-3.5 w-3.5 transition-transform ${localeOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {#if localeOpen}
        <ul
          class="dropdown-content z-50 mt-3 w-60 rounded-lg border border-ctp-surface0 bg-ctp-mantle p-2 shadow-xl"
          role="menu"
          aria-label="Language"
          onkeydown={handleLocaleMenuKeydown}
        >
          {#each locales as loc}
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all focus:outline-none"
                role="menuitemradio"
                aria-checked={$locale === loc.value}
                data-locale-option
                data-active-locale={$locale === loc.value}
                class:bg-ctp-lavender={$locale === loc.value}
                class:text-ctp-base={$locale === loc.value}
                class:hover:bg-ctp-lavender={$locale === loc.value}
                class:focus:bg-ctp-lavender={$locale === loc.value}
                class:text-ctp-subtext1={$locale !== loc.value}
                class:hover:bg-ctp-surface0={$locale !== loc.value}
                class:hover:text-ctp-text={$locale !== loc.value}
                class:focus:bg-ctp-surface0={$locale !== loc.value}
                class:focus:text-ctp-text={$locale !== loc.value}
                onclick={() => selectLocale(loc.value)}
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-black leading-5">{loc.name}</span>
                </span>
                <CheckOutline
                  class={`h-4 w-4 shrink-0 ${$locale === loc.value ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden="true"
                />
              </button>
            </li>
          {/each}
        </ul>
        {/if}
      </div>
    </div>
  </div>
</nav>
