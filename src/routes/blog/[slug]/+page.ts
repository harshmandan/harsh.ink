import { error } from '@sveltejs/kit';
import type { Frontmatter } from '../../../lib/posts';
import type { SvelteComponent } from 'svelte';

// Import all markdown files statically
const posts = import.meta.glob('../../../posts/*.md', { eager: true });

export const load = async ({ params }) => {
	try {
		const post = Object.entries(posts).find(([path]) => {
			const slug = path.split('/').pop()?.slice(0, -3);
			return slug === params.slug;
		});

		if (!post) {
			error(404);
		}

		const [, postContent] = post;
		const typedContent = postContent as { default: typeof SvelteComponent; metadata: Frontmatter };

		return {
			PostContent: typedContent.default,
			meta: { ...typedContent.metadata, slug: params.slug }
		};
	} catch (err) {
		console.error(err);
		error(404);
	}
};
