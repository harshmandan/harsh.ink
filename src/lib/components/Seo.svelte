<script lang="ts">
	import { page } from '$app/state';

	const SITE = 'https://harsh.ink';
	const SITE_NAME = 'Harsh Mandan';
	const DEFAULT_DESCRIPTION =
		"Software engineer and designer. Posts on Rust, SvelteKit, and the apps and libraries I've built.";

	let {
		title,
		description = DEFAULT_DESCRIPTION,
		image = '/og.png',
		imageWidth = 1200,
		imageHeight = 630,
		type = 'website'
	}: {
		title: string;
		description?: string;
		image?: string;
		imageWidth?: number;
		imageHeight?: number;
		type?: 'website' | 'article';
	} = $props();

	// Cut at a word boundary so previews don't end mid-word.
	function clamp(text: string, max: number) {
		if (text.length <= max) return text;
		const cut = text.slice(0, max - 1);
		return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
	}

	// Crawlers need absolute URLs.
	const url = $derived(SITE + page.url.pathname);
	const imageUrl = $derived(new URL(image, SITE).href);
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="canonical" href={url} />
	<meta name="description" content={clamp(description, 155)} />

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={clamp(description, 125)} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content={String(imageWidth)} />
	<meta property="og:image:height" content={String(imageHeight)} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={clamp(description, 155)} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
