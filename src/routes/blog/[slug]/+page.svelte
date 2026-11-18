<script lang="ts">
	import Footer from '#lib/components/Footer.svelte';
	import PostFooter from '#lib/components/PostFooter.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatPostDate, isoPostDate, shownUpdate } from '../../../lib/date';
	import Github from '#lib/icons/Github.svelte';
	import Globe from '#lib/icons/Globe.svelte';
	import Npm from '#lib/icons/Npm.svelte';
	import { tick } from 'svelte';

	let { data } = $props();

	const {
		title,
		excerpt,
		coverImage,
		coverWidth,
		coverHeight,
		date,
		updated,
		categories,
		link,
		npm_url,
		source_url
	} = $derived(data.meta);
	const shownUpdated = $derived(shownUpdate(date, updated));
	const links = $derived(
		[
			link && { href: link, label: 'Website', icon: Globe },
			npm_url && { href: npm_url, label: 'npm', icon: Npm },
			source_url && { href: source_url, label: 'GitHub', icon: Github }
		].filter((l) => !!l)
	);
	const { PostContent } = $derived(data);

	// Code blocks come from the markdown highlighter as static HTML, so one
	// delegated listener handles every copy button.
	function copyButtons(node: HTMLElement) {
		const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

		async function onclick(event: MouseEvent) {
			const button = (event.target as Element).closest<HTMLElement>('.code-block__copy');
			const code = button?.closest('.code-block')?.querySelector('pre code');
			if (!button || !code) return;

			try {
				await navigator.clipboard.writeText(code.textContent ?? '');
			} catch {
				return;
			}
			button.dataset.copied = '';
			button.setAttribute('aria-label', 'Copied');
			clearTimeout(timers.get(button));
			timers.set(
				button,
				setTimeout(() => {
					delete button.dataset.copied;
					button.setAttribute('aria-label', 'Copy code');
				}, 1500)
			);
		}

		node.addEventListener('click', onclick);
		return () => node.removeEventListener('click', onclick);
	}

	// A triple-click selects the whole paragraph, even inside inline code, and
	// no CSS stops that in Chrome. On the third click inside a snippet, skip the
	// browser's selection and select just the snippet.
	function selectCodeOnTripleClick(node: HTMLElement) {
		function onmousedown(event: MouseEvent) {
			if (event.detail < 3) return;
			const code = (event.target as Element).closest('code');
			if (!code || code.closest('pre')) return;

			event.preventDefault();
			const range = document.createRange();
			range.selectNodeContents(code);
			const selection = getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
		}

		node.addEventListener('mousedown', onmousedown);
		return () => node.removeEventListener('mousedown', onmousedown);
	}

	// ```mermaid blocks arrive as <pre class="mermaid"> and are drawn here, so
	// the mermaid bundle only loads on posts that have a diagram.
	let mermaidLoader: Promise<typeof import('mermaid').default> | undefined;

	function loadMermaid() {
		mermaidLoader ??= import('mermaid').then(({ default: mermaid }) => {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				fontFamily: 'Begum, Georgia, serif',
				themeVariables: {
					fontSize: '15px',
					primaryColor: '#ffb7a4',
					primaryTextColor: '#3b1f1a',
					primaryBorderColor: '#a8321f',
					lineColor: '#3b1f1a',
					secondaryColor: '#fde1d6',
					tertiaryColor: '#fff3ec',
					clusterBkg: '#fde1d6',
					clusterBorder: '#a8321f',
					edgeLabelBackground: '#fff3ec'
				}
			});
			return mermaid;
		});
		return mermaidLoader;
	}

	async function renderDiagrams(node: HTMLElement) {
		await tick();
		const diagrams = node.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])');
		if (diagrams.length === 0) return;
		const mermaid = await loadMermaid();
		await mermaid.run({ nodes: [...diagrams] });
	}
</script>

<Seo
	{title}
	description={excerpt}
	image={coverImage ?? data.card}
	imageWidth={coverImage ? coverWidth : undefined}
	imageHeight={coverImage ? coverHeight : undefined}
	type="article"
/>

<article class="pb-32">
	<header class="post-header">
		<h1 class="post-header__title">{title}</h1>
		{#if excerpt}
			<p class="post-header__excerpt">{excerpt}</p>
		{/if}
		<div class="post-header__meta">
			<time datetime={isoPostDate(date)}>{formatPostDate(date)}</time>
			{#if shownUpdated}
				<span class="post-header__sep" aria-hidden="true"></span>
				<span class="post-header__updated">
					Updated <time datetime={isoPostDate(shownUpdated)}>{formatPostDate(shownUpdated)}</time>
				</span>
			{/if}
			{#if categories?.length}
				<span class="post-header__sep post-header__sep--tags" aria-hidden="true"></span>
				<ul class="post-header__tags">
					{#each categories as category (category)}
						<li>#{category}</li>
					{/each}
				</ul>
			{/if}
		</div>
		{#if links.length}
			<ul class="post-header__links">
				{#each links as l (l.href)}
					<li>
						<a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label}>
							<l.icon class="size-18" />
							<span class="post-header__link-label">{l.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</header>

	<div
		class="post-content"
		{@attach copyButtons}
		{@attach selectCodeOnTripleClick}
		{@attach (node) => {
			// Reading PostContent re-runs this when navigating to another post.
			if (PostContent) renderDiagrams(node);
		}}
	>
		<PostContent />
	</div>

	<PostFooter {date} updated={shownUpdated} {categories} />
</article>

<Footer />
