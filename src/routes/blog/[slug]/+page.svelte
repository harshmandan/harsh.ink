<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import PostFooter from '$lib/components/PostFooter.svelte';

	let { data } = $props();

	const { title, excerpt, date, categories } = data.meta;
	const { PostContent } = data;
</script>

<svelte:head>
	<title>{title}</title>
	<meta data-key="description" name="description" content={excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta name="twitter:title" content={title} />
	<meta property="og:description" content={excerpt} />
	<meta name="twitter:description" content={excerpt} />
</svelte:head>

<article class="pb-32">
	<header class="post-header">
		<h1 class="post-header__title">{title}</h1>
		{#if excerpt}
			<p class="post-header__excerpt">{excerpt}</p>
		{/if}
		<div class="post-header__meta">
			<time>{date}</time>
			{#if categories?.length}
				<span class="post-header__sep" aria-hidden="true">·</span>
				<ul class="post-header__tags">
					{#each categories as category}
						<li>#{category}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</header>

	<div class="post-content">
		<PostContent />
	</div>

	<PostFooter {date} {categories} />
</article>

<Footer />
