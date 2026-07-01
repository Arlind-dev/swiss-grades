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

<span class="inline-flex items-center gap-1.5 text-sm font-medium" style="color: {color};">
  <span class="size-2 rounded-full" style="background: {color};" aria-hidden="true"></span>
  {label}
</span>
