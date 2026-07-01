<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'secondary',
    type = 'button',
    href,
    title,
    disabled = false,
    onclick,
    children,
    ...rest
  }: {
    variant?: 'secondary' | 'ghost' | 'danger';
    type?: 'button' | 'submit';
    href?: string;
    title?: string;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
    [key: string]: unknown;
  } = $props();

  const cls = $derived(`btn btn-${variant}`);
</script>

{#if href}
  <a {href} {title} class={cls} {...rest}>{@render children()}</a>
{:else}
  <button {type} {title} {disabled} {onclick} class={cls} {...rest}>{@render children()}</button>
{/if}
