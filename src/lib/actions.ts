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
}

/**
 * Svelte action: clamps an input value to [min, max] on blur.
 * Dispatches a synthetic 'input' event after clamping so stores stay in sync.
 */
export function clampInput(node: HTMLInputElement, params: ClampParams) {
  function handleBlur() {
    const val = parseFloat(node.value);
    if (isNaN(val)) {
      node.value = '';
      node.dispatchEvent(new Event('input'));
      return;
    }
    const clamped = Math.min(params.max, Math.max(params.min, val));
    node.value = params.decimals != null ? clamped.toFixed(params.decimals) : String(clamped);
    node.dispatchEvent(new Event('input'));
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
