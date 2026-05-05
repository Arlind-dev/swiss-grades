import type { GradeEntry } from '$lib/types';

export type CsvDelimiter = ';' | ',';

export interface CsvExportLabels {
	type: string;
	level: string;
	path: string;
	parentPath: string;
	name: string;
	grade: string;
	weightPercent: string;
	gradeRow: string;
	averageRow: string;
	averageName: string;
}

export interface CsvExportOptions {
	labels: CsvExportLabels;
	averageGrade?: string | null;
	delimiter?: CsvDelimiter;
	includeBom?: boolean;
}

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

function hasOwnExportableData(entry: GradeEntry): boolean {
	return Boolean(entry.name.trim() || entry.grade.trim() || entry.weight.trim());
}

function hasExportableEntry(entry: GradeEntry): boolean {
	return hasOwnExportableData(entry) || entry.subgrades.some(hasExportableEntry);
}

export function hasExportableGradeEntries(entries: GradeEntry[]): boolean {
	return entries.some(hasExportableEntry);
}

function effectiveWeightPercent(entry: GradeEntry): string {
	const weightVal = parseFloat(entry.weight);
	const weight = isNaN(weightVal) || weightVal <= 0 ? 100 : weightVal;
	return String(weight);
}

function escapeCsvField(value: string, delimiter: CsvDelimiter): string {
	const escaped = value.replace(/"/g, '""');
	const needsQuotes =
		escaped.includes(delimiter) ||
		escaped.includes('"') ||
		escaped.includes('\r') ||
		escaped.includes('\n') ||
		escaped !== escaped.trim();
	return needsQuotes ? `"${escaped}"` : escaped;
}

function csvLine(fields: string[], delimiter: CsvDelimiter): string {
	return fields.map((field) => escapeCsvField(field, delimiter)).join(delimiter);
}

function appendEntryRows(
	rows: string[][],
	entry: GradeEntry,
	options: Required<Pick<CsvExportOptions, 'labels' | 'delimiter'>>,
	path: string,
	parentPath: string
): void {
	const { labels, delimiter } = options;
	const exportableChildren = entry.subgrades.filter(hasExportableEntry);
	rows.push([
		labels.gradeRow,
		String(path.split('.').length),
		path,
		parentPath,
		entry.name.trim(),
		entry.grade.trim(),
		effectiveWeightPercent(entry)
	]);

	exportableChildren.forEach((child, index) => {
		appendEntryRows(rows, child, { labels, delimiter }, `${path}.${index + 1}`, path);
	});
}

export function formatGradesAsCsv(entries: GradeEntry[], options: CsvExportOptions): string {
	const delimiter = options.delimiter ?? ';';
	const includeBom = options.includeBom ?? true;
	const labels = options.labels;
	const rows: string[][] = [
		[
			labels.type,
			labels.level,
			labels.path,
			labels.parentPath,
			labels.name,
			labels.grade,
			labels.weightPercent
		]
	];

	entries.filter(hasExportableEntry).forEach((entry, index) => {
		appendEntryRows(rows, entry, { labels, delimiter }, String(index + 1), '');
	});

	if (options.averageGrade !== null && options.averageGrade !== undefined) {
		rows.push([labels.averageRow, '', '', '', labels.averageName, options.averageGrade, '']);
	}

	const csv = rows.map((row) => csvLine(row, delimiter)).join('\r\n');
	return includeBom ? `\uFEFF${csv}` : csv;
}

export function buildCsvFilename(prefix = 'swiss-grades-average', date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${prefix}-${year}-${month}-${day}.csv`;
}

export function downloadCsv(filename: string, contents: string): void {
	const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
