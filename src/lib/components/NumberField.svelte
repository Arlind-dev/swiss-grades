<script lang="ts">
  import { numericInput, clampInput } from '$lib/actions';

  let {
    value = $bindable(''),
    label,
    id,
    placeholder,
    min = 0,
    max = 1_000_000,
    decimals,
    ariaLabel,
    suffix,
    commitOnBlur = false,
    class: className = ''
  }: {
    value?: string;
    label?: string;
    id?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    decimals?: number;
    ariaLabel?: string;
    suffix?: string;
    /** Only write the value out on blur (not on every keystroke). */
    commitOnBlur?: boolean;
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
      {value}
      oninput={commitOnBlur ? undefined : (e) => (value = e.currentTarget.value)}
      use:numericInput
      use:clampInput={{ min, max, decimals, oncommit: (v) => (value = v) }}
    />
    {#if suffix}
      <span
        class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-faint"
        aria-hidden="true">{suffix}</span
      >
    {/if}
  </div>
</div>
