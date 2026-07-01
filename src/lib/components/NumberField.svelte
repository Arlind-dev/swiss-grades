<script lang="ts">
  import { numericInput, clampInput } from '$lib/actions';

  let {
    value = $bindable(''),
    label,
    id,
    placeholder,
    min = 0,
    max = 1_000_000,
    ariaLabel,
    suffix,
    class: className = ''
  }: {
    value?: string;
    label?: string;
    id?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    ariaLabel?: string;
    suffix?: string;
    class?: string;
  } = $props();
</script>

<div class="min-w-0 {className}">
  {#if label}<label for={id} class="field-label">{label}</label>{/if}
  <div class="relative">
    <input
      {id}
      class="field-input tnum {suffix ? 'pr-6' : ''}"
      {placeholder}
      aria-label={ariaLabel}
      inputmode="decimal"
      autocomplete="off"
      bind:value
      use:numericInput
      use:clampInput={{ min, max }}
    />
    {#if suffix}
      <span
        class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-faint"
        aria-hidden="true">{suffix}</span
      >
    {/if}
  </div>
</div>
