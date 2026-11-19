<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '#lib/components/Footer.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import Github from '#lib/icons/Github.svelte';
	import Globe from '#lib/icons/Globe.svelte';
	import Npm from '#lib/icons/Npm.svelte';
	import Docs from '#lib/icons/Docs.svelte';
	import Crate from '#lib/icons/Crate.svelte';
	import Rss from '#lib/icons/Rss.svelte';
	import type { Frontmatter } from '../../lib/posts';

	import { formatPostDate, isoPostDate } from '../../lib/date';

	let { data } = $props();

	function postLinks(post: Frontmatter) {
		return [
			post.link && { href: post.link, label: 'Website', icon: Globe },
			post.docs_url && { href: post.docs_url, label: 'Documentation', icon: Docs },
			post.npm_url && { href: post.npm_url, label: 'npm package', icon: Npm },
			post.crates_url && { href: post.crates_url, label: 'crates.io crate', icon: Crate },
			post.source_url && { href: post.source_url, label: 'Source repository', icon: Github }
		].filter((l) => !!l);
	}

	const posts = $derived(data.posts.map((post) => ({ post, links: postLinks(post) })));
</script>

<Seo
	title="Harsh ✸ Craft"
	description="Open-source apps, mobile apps and libraries I've built, and posts about how they work."
/>

<div class="flex items-center justify-between pb-24">
	<div class="text-24 font-600">Craft</div>
	<a
		href={resolve('/rss.xml')}
		class="text-14 hover:text-pink-light flex items-center gap-6 opacity-70 transition-colors hover:opacity-100"
		aria-label="RSS feed"
	>
		<Rss class="size-16" />
		<span>RSS</span>
	</a>
</div>

<ul class="flex flex-col">
	{#each posts as { post, links } (post.slug)}
		<li class="border-white/10 py-20 not-last:border-b">
			<a
				href={resolve('/blog/[slug]', { slug: post.slug })}
				class="text-16 font-500 decoration-pink-light underline-offset-2 transition-all hover:underline hover:decoration-wavy"
			>
				{post.title}
			</a>

			<div class="mt-6 flex items-center justify-between gap-16">
				<span class="text-13 opacity-60">
					<time datetime={isoPostDate(post.date)}>{formatPostDate(post.date)}</time
					>{#if post.shownUpdated}<span class="whitespace-nowrap"
							>&nbsp;· Updated
							<time datetime={isoPostDate(post.shownUpdated)}
								>{formatPostDate(post.shownUpdated)}</time
							></span
						>{/if}{#if post.draft}<span class="text-pink-light">&nbsp;· Draft</span>{/if}
				</span>
				{#if links.length}
					<div class="flex items-center gap-12 opacity-70">
						{#each links as l (l.href)}
							<a
								href={l.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={l.label}
								class="hover:text-pink-light transition-colors hover:opacity-100"
							>
								<l.icon class="size-20" />
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<Footer />
