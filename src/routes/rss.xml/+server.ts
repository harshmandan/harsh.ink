import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { Frontmatter } from '../../lib/posts';

export const prerender = true;

const SITE = 'https://harsh.ink';
const TITLE = 'Harsh Mandan';
const DESCRIPTION = 'Posts from harsh.ink';

const posts = import.meta.glob('../../posts/*.md', { eager: true });

// Frontmatter dates are DD-MM-YYYY.
function toDate(date: string): Date {
	const [day, month, year] = date.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * RFC 822 date at midnight in India, where the posts are written. Midnight GMT
 * would be the previous evening for anyone west of London.
 */
function rfc822(date: Date): string {
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${DAYS[date.getUTCDay()]}, ${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} 00:00:00 +0530`;
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Post HTML as a feed reader should see it: absolute URLs, no page-only controls. */
function feedHtml(html: string): string {
	return (
		html
			// Copy buttons in code blocks do nothing outside the site.
			.replace(/<button[^>]*>[\s\S]*?<\/button>/g, '')
			// Root-relative images and links only resolve on harsh.ink.
			.replace(/(src|href|poster)="\/(?!\/)/g, `$1="${SITE}/`)
			// Svelte's hydration markers.
			.replace(/<!--[\s\S]*?-->/g, '')
			// A literal "]]>" would end the CDATA section early.
			.replaceAll(']]>', ']]]]><![CDATA[>')
	);
}

export const GET = () => {
	const items = Object.entries(posts)
		.map(([path, mod]) => {
			const { metadata, default: content } = mod as {
				metadata: Frontmatter;
				default: Component;
			};
			const slug = path.slice(path.lastIndexOf('/') + 1, -3);
			return { ...metadata, slug, content };
		})
		.filter((p) => !p.draft)
		.sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime());

	const lastBuild = items
		.map((p) => toDate(p.updated ?? p.date))
		.reduce((a, b) => (a > b ? a : b), new Date(0));

	const xmlItems = items
		.map((post) => {
			const url = `${SITE}/blog/${post.slug}`;
			const categories = (post.categories ?? [])
				.map((c) => `<category>${escapeXml(c)}</category>`)
				.join('');
			return `<item>
<title>${escapeXml(post.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${rfc822(toDate(post.date))}</pubDate>
${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
<content:encoded><![CDATA[${feedHtml(render(post.content).body)}]]></content:encoded>
${categories}
</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>${TITLE}</title>
<link>${SITE}/blog</link>
<description>${DESCRIPTION}</description>
<language>en-gb</language>
<lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
</channel>
</rss>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
	});
};
