<script lang="ts">
  import { toneColor, type Tone } from '$lib/utils/grading';

  let {
    tone = 'neutral',
    label
  }: {
    tone?: Tone;
    label: string;
  } = $props();

  const color = $derived(toneColor(tone));
</script>

<span class="text-sm font-medium" style="color: {color};">{label}</span>
