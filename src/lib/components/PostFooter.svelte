<script lang="ts">
	import { formatPostDate } from '../date';
	import Star from '#lib/icons/Star.svelte';

	let {
		date,
		updated,
		categories = []
	}: { date: string; updated?: string; categories?: string[] } = $props();

	const formatted = $derived(formatPostDate(date));

	function backToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<section class="post-end">
	<div class="post-end__rule" aria-hidden="true">
		<Star class="text-pink-light size-16" />
	</div>

	<p class="post-end__thanks">Thanks for reading.</p>

	<p class="post-end__date">
		Published {formatted}{#if updated}<span>&nbsp;· Updated {formatPostDate(updated)}</span>{/if}
	</p>

	{#if categories?.length}
		<ul class="post-end__tags">
			{#each categories as category (category)}
				<li>#{category}</li>
			{/each}
		</ul>
	{/if}

	<button class="post-end__top" type="button" onclick={backToTop}>
		<span aria-hidden="true">↑</span>
		<span>Back to top</span>
	</button>
</section>
