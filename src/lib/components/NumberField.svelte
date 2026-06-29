<script lang="ts">
  import { numericInput, clampInput } from '$lib/actions';

  let {
    value = $bindable(''),
    label,
    id,
    placeholder,
    min = 0,
    max = 1_000_000,
    ariaLabel
  }: {
    value?: string;
    label?: string;
    id?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    ariaLabel?: string;
  } = $props();
</script>

<div class="min-w-0">
  {#if label}<label for={id} class="field-label">{label}</label>{/if}
  <input
    {id}
    class="field-input tnum"
    {placeholder}
    aria-label={ariaLabel}
    inputmode="decimal"
    autocomplete="off"
    bind:value
    use:numericInput
    use:clampInput={{ min, max }}
  />
</div>
