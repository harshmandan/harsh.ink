<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Github from '$lib/icons/Github.svelte';
	import Globe from '$lib/icons/Globe.svelte';
	import Npm from '$lib/icons/Npm.svelte';

	let { data } = $props();

	function shortDate(raw: string): string {
		const [d, m, y] = raw.split('-').map(Number);
		if (!d || !m || !y) return raw;
		return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}
</script>

<svelte:head>
	<title>Harsh ✸ Craft</title>
</svelte:head>

<div class="text-24 font-600 pb-24">Craft</div>

<ul class="flex flex-col">
	{#each data.posts as post}
		<li class="border-white/10 not-last:border-b py-20">
			<div class="mb-6 flex items-center justify-between gap-16">
				<span class="text-13 whitespace-nowrap opacity-60">{shortDate(post.date)}</span>
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

			<a href="/blog/{post.slug}" class="craft-title">
				{post.title}
			</a>
		</li>
	{/each}
</ul>

<Footer />

<style>
	.craft-title {
		display: block;
		font-size: calc(var(--spacing-scale) * 16);
		font-weight: 500;
		line-height: 1.45;
		text-decoration-color: var(--color-pink-light);
		text-underline-offset: 2px;
		transition: all 150ms ease;
	}

	.craft-title:hover {
		text-decoration: underline wavy var(--color-pink-light);
	}

	.craft-title::first-letter {
		float: left;
		font-family: var(--font-serif);
		font-size: calc(var(--spacing-scale) * 44);
		line-height: 0.85;
		padding-right: calc(var(--spacing-scale) * 2);
		padding-top: calc(var(--spacing-scale) * 2);
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-pink-light);
	}
</style>
