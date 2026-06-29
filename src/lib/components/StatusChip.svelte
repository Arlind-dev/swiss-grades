<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'success' | 'error' | 'warning' | 'neutral';

  let { variant = 'neutral', children }: { variant?: Variant; children: Snippet } = $props();

  const styles: Record<Variant, string> = {
    success: 'bg-ctp-green/15 text-ctp-green',
    error: 'bg-ctp-red/15 text-ctp-red',
    warning: 'bg-ctp-yellow/15 text-ctp-yellow',
    neutral: 'bg-ctp-surface0 text-ctp-subtext1'
  };
</script>

<span
  class="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide leading-tight text-center whitespace-normal {styles[variant]}"
>
  {@render children()}
</span>
