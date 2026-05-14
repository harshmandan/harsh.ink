<script lang="ts">
	import Star from '$lib/icons/Star.svelte';

	let { date, categories = [] }: { date: string; categories?: string[] } = $props();

	// frontmatter date is `DD-MM-YYYY` — parse and format as "12 May 2026"
	const formatted = (() => {
		const [d, m, y] = date.split('-').map(Number);
		if (!d || !m || !y) return date;
		const iso = new Date(Date.UTC(y, m - 1, d));
		return iso.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	})();

	function backToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<section class="post-end">
	<div class="post-end__rule" aria-hidden="true">
		<Star class="text-pink-light size-16" />
	</div>

	<p class="post-end__thanks">Thanks for reading.</p>

	<p class="post-end__date">Published {formatted}</p>

	{#if categories?.length}
		<ul class="post-end__tags">
			{#each categories as category}
				<li>#{category}</li>
			{/each}
		</ul>
	{/if}

	<button class="post-end__top" type="button" onclick={backToTop}>
		<span aria-hidden="true">↑</span>
		<span>Back to top</span>
	</button>
</section>
