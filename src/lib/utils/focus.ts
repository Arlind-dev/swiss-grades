/**
 * Focus the first input inside the nth matching row element.
 * @param containerSelector - CSS selector for the list container
 * @param rowSelector - CSS selector for individual row elements (relative to container)
 * @param index - 0-based index of the row to focus
 */
export function focusRowInput(containerSelector: string, rowSelector: string, index: number): void {
	const container = document.querySelector(containerSelector);
	if (!container) return;
	const rows = container.querySelectorAll<HTMLElement>(rowSelector);
	const target = rows[Math.max(0, Math.min(index, rows.length - 1))];
	target?.querySelector<HTMLElement>('input')?.focus();
}
