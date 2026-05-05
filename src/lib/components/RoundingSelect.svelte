<script lang="ts">
  import type { RoundingKey } from '$lib/types';
  import { m } from '$lib/i18n';

  let { value = $bindable(), label }: { value: RoundingKey; label?: string } = $props();
  let resolvedLabel = $derived(label ?? $m.rounding.label);
  const id = $props.id();
</script>

<div class="form-control">
  <label class="label pt-0 cursor-pointer" for={id}>
    <span class="label-text text-[10px] font-black uppercase tracking-widest text-ctp-overlay1">{resolvedLabel}</span>
  </label>
  <select
    {id}
    bind:value 
    class="select select-bordered select-sm bg-ctp-base border-ctp-surface1 text-ctp-text focus:border-ctp-lavender focus:outline-none transition-all font-bold rounded-lg min-w-[8rem]"
  >
    <option value="0.25">0.25</option>
    <option value="0.5">0.5</option>
    <option value="1">{$m.rounding.oneDecimal}</option>
    <option value="2">{$m.rounding.twoDecimal}</option>
  </select>
</div>
