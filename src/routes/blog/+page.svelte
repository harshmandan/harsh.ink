<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '#lib/components/Footer.svelte';
	import Github from '#lib/icons/Github.svelte';
	import Globe from '#lib/icons/Globe.svelte';
	import Npm from '#lib/icons/Npm.svelte';
	import Rss from '#lib/icons/Rss.svelte';

	import { formatPostDate, isoPostDate } from '../../lib/date';

	let { data } = $props();
</script>

<svelte:head>
	<title>Harsh ✸ Craft</title>
</svelte:head>

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
	{#each data.posts as post (post.slug)}
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
				{#if post.link || post.npm_url || post.source_url}
					<div class="flex items-center gap-12 opacity-70">
						{#if post.link}
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Website"
								class="hover:text-pink-light transition-colors hover:opacity-100"
							>
								<Globe class="size-20" />
							</a>
						{/if}
						{#if post.npm_url}
							<a
								href={post.npm_url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="npm package"
								class="hover:text-pink-light transition-colors hover:opacity-100"
							>
								<Npm class="size-20" />
							</a>
						{/if}
						{#if post.source_url}
							<a
								href={post.source_url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Source repository"
								class="hover:text-pink-light transition-colors hover:opacity-100"
							>
								<Github class="size-20" />
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>

<Footer />
