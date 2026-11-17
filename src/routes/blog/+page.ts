import { error } from '@sveltejs/kit';
import type { Frontmatter } from '../../lib/posts';
import { shownUpdate } from '../../lib/date';

// Import all markdown files statically
const posts = import.meta.glob('../../posts/*.md', { eager: true });

// Dates are DD-MM-YYYY.
function toTime(date: string): number {
	const [day, month, year] = date.split('-').map(Number);
	return Date.UTC(year, month - 1, day);
}

export const load = async () => {
	try {
		const postList = Object.entries(posts)
			.map(([path, post]) => {
				const { metadata } = post as { metadata: Frontmatter };
				const slug = path.slice(path.lastIndexOf('/') + 1, -3);
				return { ...metadata, slug, shownUpdated: shownUpdate(metadata.date, metadata.updated) };
			})
			.filter((p) => import.meta.env.DEV || !p.draft)
			.sort((a, b) => toTime(b.date) - toTime(a.date));

		return {
			posts: postList
		};
	} catch (err) {
		console.error(err);
		error(404);
	}
};
