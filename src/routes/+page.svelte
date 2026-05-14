<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Info from '$lib/components/Info.svelte';

	const links = {
		'https://github.com/harshmandan': 'GitHub',
		'https://linkedin.com/in/harshmandan': 'LinkedIn',
		'https://x.com/mandan_harsh': 'X',
		'mailto:harshsinghmandan@gmail.com': 'Email'
	};
</script>

<svelte:head>
	<title>Harsh Mandan</title>
</svelte:head>

<Info />
<Footer />
