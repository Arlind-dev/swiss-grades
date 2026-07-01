<script lang="ts">
  import { m } from '$lib/i18n';
  import type { RoundingKey } from '$lib/types';

  let {
    value,
    onChange
  }: {
    value: RoundingKey;
    onChange: (value: RoundingKey) => void;
  } = $props();
</script>

<label class="flex items-center gap-2 text-sm text-muted">
  <span>{$m.rounding.label}</span>
  <select
    {value}
    onchange={(e) => onChange(e.currentTarget.value as RoundingKey)}
    class="h-9 rounded-md border border-input-line bg-input px-2 text-sm text-text transition-colors hover:border-accent"
  >
    <option value="2">{$m.rounding.twoDecimal}</option>
    <option value="1">{$m.rounding.oneDecimal}</option>
    <option value="0.5">0.5</option>
    <option value="0.25">0.25</option>
  </select>
</label>
