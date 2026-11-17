<script lang="ts">
	const links = {
		'https://github.com/harshmandan': 'GitHub',
		'https://linkedin.com/in/harshmandan': 'LinkedIn',
		'https://x.com/mandan_harsh': 'X',
		'mailto:harshsinghmandan@gmail.com': 'Email'
	};
</script>

<div class="flex flex-col gap-16">
	<div class="text-20 flex flex-col font-serif">
		<p class="font-500 text-18">Harsh Mandan</p>
		<p class="opacity-85">Software Engineer + Designer</p>
	</div>

	<div class="text-16 flex items-center gap-16 pt-16">
		{#each Object.entries(links) as [path, label] (path)}
			<a
				href={path}
				rel="external"
				class="decoration-pink-light underline-offset-2 opacity-70 transition-all hover:underline hover:decoration-wavy hover:opacity-100"
			>
				{label}
			</a>
		{/each}
	</div>

	<div class="pt-16">
		Seven years in. Mostly front-end and design - Svelte, TypeScript, with the occasional Rust or
		native-mobile detour when a problem actually needs it.

		<div class="pt-16"></div>
		I've worked solo on a startup, inside agencies, in-house at global orgs. Now mostly contracting with
		small craft-focused teams - the kind that ship taste-driven products rather than feature checklists.

		<div class="pt-16"></div>
		Currently with a small team building a web video app that's trying very hard to be good.
	</div>
</div>
