<script lang="ts">
  import { onMount } from 'svelte';
  import { m } from '$lib/i18n';

  const version = __APP_VERSION__;
  const commit = __APP_COMMIT__;
  const buildDate = __APP_BUILD_DATE__;

  const repo = 'https://github.com/Arlind-dev/swiss-grades';

  const tools = [
    { href: '/calculator', key: 'calculator' },
    { href: '/average', key: 'average' },
    { href: '/needed', key: 'needed' },
    { href: '/qv', key: 'qv' }
  ] as const;

  const heading = 'text-[11px] font-semibold uppercase tracking-wider text-faint';
  const link = 'text-sm text-muted transition-colors hover:text-text';

  // Prerendered in the default locale; render after hydration to avoid a flash.
  let mounted = $state(false);
  onMount(() => (mounted = true));
</script>

<footer class="mt-12 border-t border-line bg-page/80 backdrop-blur">
  {#if mounted}
    <div
      class="mx-auto grid max-w-3xl grid-cols-1 gap-8 px-4 py-10 text-center sm:grid-cols-[1fr_auto_auto] sm:gap-16 sm:text-left"
    >
      <!-- Brand + build metadata -->
      <div class="flex flex-col items-center gap-2 sm:items-start">
        <a href="/average" class="font-semibold tracking-tight text-accent">Swiss Grades</a>
        <div class="text-xs text-muted">{$m.footer.tagline}</div>
        <div
          class="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-faint sm:justify-start"
        >
          <a
            href="{repo}/releases/tag/{version}"
            target="_blank"
            rel="noreferrer"
            title={version}
            class="inline-flex items-center rounded-md border border-line px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {version}
          </a>
          <span class="tnum opacity-70">({commit})</span>
          <span class="size-1 rounded-full bg-line" aria-hidden="true"></span>
          <span class="tnum opacity-70">{buildDate}</span>
        </div>
      </div>

      <!-- Tools -->
      <nav class="flex flex-col items-center gap-2.5 sm:items-start">
        <div class={heading}>{$m.footer.tools}</div>
        {#each tools as tool (tool.href)}
          <a href={tool.href} class={link}>{$m.nav[tool.key]}</a>
        {/each}
      </nav>

      <!-- Project -->
      <nav class="flex flex-col items-center gap-2.5 sm:items-start">
        <div class={heading}>{$m.footer.project}</div>
        <a href={repo} target="_blank" rel="noreferrer" class={link}>{$m.footer.source}</a>
        <a href="{repo}/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer" class={link}>
          {$m.footer.changelog}
        </a>
        <a href="{repo}/blob/main/LICENSE" target="_blank" rel="noreferrer" class={link}>
          {$m.footer.license}
        </a>
      </nav>
    </div>
  {/if}
</footer>
