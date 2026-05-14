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
		{#each Object.entries(links) as [path, label]}
			<a
				href={path}
				class="decoration-pink-light underline-offset-2 opacity-70 transition-all hover:underline hover:decoration-wavy hover:opacity-100"
			>
				{label}
			</a>
		{/each}
	</div>

	<div class="font-400 pt-16">
		A computer science engineer with over 7 years of experience. I'm passionate about building
		delightful and functional apps with focus on user experience, performance and interactivity. My
		expertise is in front-end development and design.

		<div class="pt-16"></div>
		In the past I've worked solo, on my own startup, within agencies and in-house at global organizations.
		I'm now focused on contracting with small craft-focused teams and agencies.

		<div class="pt-16"></div>
		I'm currently working with a small team of developers on building a world-class web application that
		enhances user video experiences.
	</div>
</div>
