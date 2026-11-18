<script lang="ts">
	import { resolve } from '$app/paths';

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
		Seven years in. Rust and SvelteKit are my favourites. The open-source apps, mobile apps and
		libraries I've built are in
		<a
			href={resolve('/blog')}
			class="decoration-pink-light underline underline-offset-2 hover:decoration-wavy">Craft</a
		>.

		<div class="pt-16"></div>
		I've built a startup on my own, worked at agencies, and been in-house at big companies.

		<div class="pt-16"></div>
		Right now I'm working with a small team building world-class video technology for the web.

		<div class="pt-16"></div>
		Outside work, I 3D print things, take
		<a
			href={resolve('/gallery')}
			class="decoration-pink-light underline underline-offset-2 hover:decoration-wavy">photos</a
		>, and love hanging out with my toddler ❤️.
	</div>
</div>
