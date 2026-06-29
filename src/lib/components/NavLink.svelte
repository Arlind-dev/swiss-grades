<script lang="ts">
  import { page } from '$app/stores';
  import type { Component } from 'svelte';

  let {
    href,
    label,
    Icon,
    onclick,
    class: klass = '',
    labelClass = ''
  }: {
    href: string;
    label: string;
    Icon: Component;
    onclick?: () => void;
    class?: string;
    labelClass?: string;
  } = $props();

  let active = $derived($page.url.pathname === href);
</script>

<a
  {href}
  {onclick}
  aria-current={active ? 'page' : undefined}
  class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-lavender {klass}"
  class:text-ctp-lavender={active}
  class:bg-ctp-surface0={active}
  class:text-ctp-subtext1={!active}
  class:hover:bg-ctp-surface0={!active}
  class:hover:text-ctp-text={!active}
>
  <Icon class="h-4 w-4 shrink-0" />
  <span class={labelClass}>{label}</span>
</a>
