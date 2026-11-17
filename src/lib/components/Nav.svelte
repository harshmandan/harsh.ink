<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let activePath = $derived(page.url.pathname);

	const links = [
		{ path: '/', label: 'Index' },
		{ path: '/blog', label: 'Craft' },
		{ path: '/gallery', label: 'Photography' }
	] as const;

	function isActive(path: string, current: string): boolean {
		if (path === '/') return current === '/';
		return current === path || current.startsWith(path + '/');
	}
</script>

<ul class="text-16 font-500 flex flex-col gap-2 text-right font-serif">
	{#each links as { path, label } (path)}
		{@const active = isActive(path, activePath)}
		<a
			class={[
				'decoration-pink-light transition hover:underline hover:decoration-wavy',
				{
					'underline-offset-3 opacity-50': !active,
					'underline-offset-2': active
				}
			]}
			href={resolve(path)}
		>
			{label}
		</a>
	{/each}
</ul>
