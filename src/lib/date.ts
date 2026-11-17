// Post frontmatter dates are `DD-MM-YYYY`.
function parsePostDate(date: string): Date | null {
	const [day, month, year] = date.split('-').map(Number);
	if (!day || !month || !year) return null;
	return new Date(Date.UTC(year, month - 1, day));
}

/** `16-10-2025` → `October 16, 2025` */
export function formatPostDate(date: string): string {
	const parsed = parsePostDate(date);
	if (!parsed) return date;
	return parsed.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

/** `16-10-2025` → `2025-10-16`, for `<time datetime>` */
export function isoPostDate(date: string): string | undefined {
	return parsePostDate(date)?.toISOString().slice(0, 10);
}

/** The `updated` date worth showing: present and different from `date`. */
export function shownUpdate(date: string, updated?: string): string | undefined {
	return updated && updated !== date ? updated : undefined;
}
