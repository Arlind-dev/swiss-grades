/**
 * Svelte action: restricts an input to decimal numbers only.
 * Blocks non-numeric keypresses while allowing control keys and a single dot.
 */
export function numericInput(node: HTMLInputElement) {
  function handleKeydown(e: KeyboardEvent) {
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (controlKeys.includes(e.key)) return;
    if (e.key === '.' && !node.value.includes('.')) return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  }

  node.addEventListener('keydown', handleKeydown);
  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    }
  };
}

interface ClampParams {
  min: number;
  max: number;
  /** Number of decimal places to format on blur. Omit for no formatting. */
  decimals?: number;
  /** Called with the clamped value after blur. Use instead of oninput for deferred emit. */
  oncommit?: (value: string) => void;
}

/**
 * Svelte action: clamps an input value to [min, max] on blur.
 * Calls oncommit(value) if provided, otherwise dispatches a synthetic 'input' event.
 */
export function clampInput(node: HTMLInputElement, params: ClampParams) {
  function handleBlur() {
    const val = parseFloat(node.value);
    let result: string;
    if (isNaN(val)) {
      result = '';
    } else {
      const clamped = Math.min(params.max, Math.max(params.min, val));
      result = params.decimals != null ? clamped.toFixed(params.decimals) : String(clamped);
    }
    node.value = result;
    if (params.oncommit) {
      params.oncommit(result);
    } else {
      node.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  node.addEventListener('blur', handleBlur);
  return {
    update(newParams: ClampParams) {
      params = newParams;
    },
    destroy() {
      node.removeEventListener('blur', handleBlur);
    }
  };
}
