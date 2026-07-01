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

<span class="text-sm font-medium" style="color: {color};">{label}</span>
