<script lang="ts">
  import type { RoundingKey } from '$lib/types';
  import { m } from '$lib/i18n';

  let { value = $bindable(), label }: { value: RoundingKey; label?: string } = $props();
  let resolvedLabel = $derived(label ?? $m.rounding.label);
</script>

<label>
  {resolvedLabel}:
  <select bind:value>
    <option value="0.25">0.25</option>
    <option value="0.5">0.5</option>
    <option value="1">{$m.rounding.oneDecimal}</option>
    <option value="2">{$m.rounding.twoDecimal}</option>
  </select>
</label>

<style>
  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  select {
    padding: 4px 8px;
    font-size: 0.95rem;
  }
</style>
