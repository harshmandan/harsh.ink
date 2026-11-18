import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { highlight } from './src/lib/markdown/highlight';
import { wrapText } from './src/lib/markdown/wrap-text';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: ['.md'],
					highlight: { highlighter: highlight },
					rehypePlugins: [wrapText]
				})
			],
			adapter: adapter(),
			prerender: {
				entries: ['*', '/rss.xml']
			}
		})
	]
});
