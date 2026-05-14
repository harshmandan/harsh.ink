<script lang="ts">
	import { page } from '$app/state';

	let activePath = $derived(page.url.pathname);

	const links = {
		'/': 'Index',
		'/blog': 'Craft',
		'/gallery': 'Photography'
	};
</script>

<ul class="text-16 font-500 flex flex-col gap-2 text-right font-serif">
	{#each Object.entries(links) as [path, label]}
		<a
			class={[
				'decoration-pink-light transition hover:underline hover:decoration-wavy',
				{
					'underline-offset-3 opacity-50': activePath !== path,
					'underline-offset-2': activePath === path
				}
			]}
			href={path}
		>
			{label}
		</a>
	{/each}
</ul>
