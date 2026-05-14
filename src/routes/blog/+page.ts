import { error } from '@sveltejs/kit';
import type { Frontmatter } from '../../lib/posts';

// Import all markdown files statically
const posts = import.meta.glob('../../posts/*.md', { eager: true });

export const load = async () => {
	try {
		const postList = Object.entries(posts)
			.map(([path, post]) => {
				const { metadata } = post as { metadata: Frontmatter };
				const slug = path.split('/').pop()?.slice(0, -3);
				return { ...metadata, slug };
			})
			.filter((p) => !p.draft)
			.sort((a, b) => {
				const [aDay, aMonth, aYear] = a.date.split('-');
				const [bDay, bMonth, bYear] = b.date.split('-');
				const aDate = new Date();
				aDate.setDate(Number(aDay));
				aDate.setMonth(Number(aMonth));
				aDate.setFullYear(Number(aYear));

				const bDate = new Date();
				bDate.setDate(Number(bDay));
				bDate.setMonth(Number(bMonth));
				bDate.setFullYear(Number(bYear));

				return bDate.getTime() - aDate.getTime();
			});

		return {
			posts: postList
		};
	} catch (err) {
		console.error(err);
		error(404);
	}
};
