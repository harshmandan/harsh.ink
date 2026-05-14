<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Harsh ✸ Craft</title>
</svelte:head>

<div class="text-16 font-500 flex flex-col gap-16">
	<div class="text-24 font-600 pb-16">Craft</div>
	{#each data.posts as post}
		<div class="flex items-start justify-between gap-32">
			<a
				href="/blog/{post.slug}"
				class="decoration-pink-light underline-offset-2 transition-all hover:underline hover:decoration-wavy"
			>
				{post.title}
			</a>
			<div class="whitespace-nowrap opacity-70">{post.date}</div>
		</div>
	{/each}
</div>

<Footer />
