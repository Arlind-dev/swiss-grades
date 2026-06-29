<script lang="ts">
  let {
    tone = 'neutral',
    label
  }: {
    tone?: 'pass' | 'fail' | 'warn' | 'neutral';
    label: string;
  } = $props();

  const color = $derived(
    tone === 'pass'
      ? 'var(--ctp-green)'
      : tone === 'fail'
        ? 'var(--ctp-red)'
        : tone === 'warn'
          ? 'var(--ctp-yellow)'
          : 'var(--muted)'
  );
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
  style="color: {color}; background: color-mix(in srgb, {color} 12%, transparent);"
>
  <span class="size-1.5 rounded-full" style="background: {color};" aria-hidden="true"></span>
  {label}
</span>
