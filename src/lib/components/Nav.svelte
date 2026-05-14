<script lang="ts">
	import { page } from '$app/state';

	let activePath = $derived(page.url.pathname);

	const links = {
		'/': 'Index',
		'/blog': 'Craft',
		'/gallery': 'Photography'
	};

	function isActive(path: string, current: string): boolean {
		if (path === '/') return current === '/';
		return current === path || current.startsWith(path + '/');
	}
</script>

<ul class="text-16 font-500 flex flex-col gap-2 text-right font-serif">
	{#each Object.entries(links) as [path, label]}
		{@const active = isActive(path, activePath)}
		<a
			class={[
				'decoration-pink-light transition hover:underline hover:decoration-wavy',
				{
					'underline-offset-3 opacity-50': !active,
					'underline-offset-2': active
				}
			]}
			href={path}
		>
			{label}
		</a>
	{/each}
</ul>
