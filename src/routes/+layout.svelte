<script lang="ts">
	import { page } from '$app/state';
	import Nav from '$lib/components/Nav.svelte';
	import Star from '$lib/icons/Star.svelte';
	import { slide } from 'svelte/transition';
	import '../css/app.css';

	let { children } = $props();
</script>

<div class="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col px-16 font-serif">
	<header class="flex w-full items-center justify-between gap-64 py-50 xl:py-100">
		{@render Logo()}
		<Nav />
	</header>
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
</div>

{#snippet Logo()}
	<div class="flex items-center">
		<div class="flex items-center gap-8">
			<a href="/">
				<Star
					class="active:text-pink-light size-42 text-white transition-all ease-in hover:rotate-45 active:rotate-[60deg] active:opacity-75"
				/>
			</a>
		</div>
		{#if page.url.pathname !== '/'}
			<div transition:slide class="text-16 flex flex-col pt-3 pl-16 font-serif">
				<p class="font-500 text-18 whitespace-nowrap">Harsh Mandan</p>
				<p class="line-clamp-2 opacity-85">Software Engineer + Designer</p>
			</div>
		{/if}
	</div>
{/snippet}
