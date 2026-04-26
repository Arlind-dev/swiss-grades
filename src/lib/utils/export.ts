import type { GradeEntry } from '$lib/types';

function formatEntry(entry: GradeEntry, depth = 0): string {
	const indent = '  '.repeat(depth);
	const name = entry.name || '—';
	const grade = entry.grade || '?';
	const weight = entry.weight ? ` (${entry.weight}%)` : '';
	const line = `${indent}${name}: ${grade}${weight}`;
	if (entry.subgrades.length === 0) return line;
	const children = entry.subgrades.map((s) => formatEntry(s, depth + 1)).join('\n');
	return `${line}\n${children}`;
}

export function formatGradesAsText(entries: GradeEntry[], averageLine?: string): string {
	const lines = entries
		.filter((e) => e.grade || e.name || e.subgrades.length > 0)
		.map((e) => formatEntry(e));
	if (averageLine) lines.push('', averageLine);
	return lines.join('\n');
}
