<script lang="ts">
	import Footer from '#lib/components/Footer.svelte';
	import Seo from '#lib/components/Seo.svelte';

	type Camera = 'em5' | 'pixel' | 'pen' | 'funtouch';
	type Photo = { file: string; cam: Camera; w: number; h: number };

	type GearItem = { text: string; link?: { label: string; href: string } };

	const gear: { label: string; items: GearItem[] }[] = [
		{ label: 'Mirrorless', items: [{ text: 'Olympus EM5-Mk2' }] },
		{
			label: 'Lenses',
			items: [
				{ text: 'Olympus 12-40mm f/2.8' },
				{ text: 'Olympus 14-42mm Pancake' },
				{ text: 'Olympus 45mm f/1.8' },
				{ text: 'Olympus 75-300mm f/4.8-6.7' }
			]
		},
		{ label: 'Phone', items: [{ text: 'Pixel 9 Pro' }] },
		{
			label: 'Analogue',
			items: [{ text: 'Olympus Pen EES-2 (Half Frame)' }, { text: 'Nikon Funtouch 4' }]
		},
		{
			label: 'Film',
			items: [
				{ text: 'Kodak Gold 200' },
				{
					text: 'Zhenwei Labs - ',
					link: {
						label: 'Kepler 400',
						href: 'https://www.lomography.com/films/871975041-kepler-400-by-zhenwei-labs-mumbai/photos'
					}
				}
			]
		}
	];

	const tabs: { id: Camera | 'all'; label: string; empty?: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'em5', label: 'EM5ii' },
		{ id: 'pixel', label: 'Pixel' },
		{
			id: 'pen',
			label: 'Pen EES-2',
			empty: 'Half-frame means 72 shots a roll. Still shooting, check back later.'
		},
		{
			id: 'funtouch',
			label: 'Funtouch 4',
			empty: 'In the darkroom, development in process.'
		}
	];

	const photos: Photo[] = [
		{ file: 'DSC02166.avif', cam: 'em5', w: 5184, h: 3888 },
		{ file: 'PXL_20210921_163354792.avif', cam: 'pixel', w: 3280, h: 2464 },
		{ file: 'P2170017.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P2170023.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P2180029.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P2180061.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P3020878.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3041043.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3051301.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P3051330.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3041080.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3191655.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3191677.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3191699.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P3191848.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P4041970.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3041076.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4051981.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4052126.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P4052141.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4052325.avif', cam: 'em5', w: 4160, h: 3120 },
		{ file: 'P4062419.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4062427.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4062431.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P4062437.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P4062553.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3051537.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P5132607.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P5132609.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P5142622.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P5142641.avif', cam: 'em5', w: 4518, h: 3388 },
		{ file: 'P5150897.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P5150930.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P5161009.avif', cam: 'em5', w: 4142, h: 3107 },
		{ file: 'P3051266.avif', cam: 'em5', w: 2621, h: 3495 },
		{ file: 'P5181212.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P5201312.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P5201315.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P5231318.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P6021357.avif', cam: 'em5', w: 4476, h: 3356 },
		{ file: 'P6261425.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P7181856.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P7181876.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P7181907.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P7181916.avif', cam: 'em5', w: 4320, h: 3240 },
		{ file: 'P7181938.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P6261432.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P8161960.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P8161961.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P8161969.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P8162010.avif', cam: 'em5', w: 2752, h: 2063 },
		{ file: 'P8252065.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PB262148.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PB262174.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PB262196.avif', cam: 'em5', w: 2952, h: 3936 },
		{ file: 'PXL_20231222_021424334.MP.avif', cam: 'pixel', w: 3072, h: 4080 },
		{ file: 'P2102269.avif', cam: 'em5', w: 3626, h: 2719 },
		{ file: 'P2102276.avif', cam: 'em5', w: 4473, h: 3354 },
		{ file: 'P2102283.avif', cam: 'em5', w: 3728, h: 2795 },
		{ file: 'P3051483.avif', cam: 'em5', w: 3243, h: 4325 },
		{ file: 'P3232441.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'P3232467.avif', cam: 'em5', w: 3456, h: 4608 },
		{ file: 'P3242683.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PXL_20240909_104116548.ACTION_PAN-01.COVER.avif', cam: 'pixel', w: 3072, h: 4080 },
		{ file: 'PC143292.avif', cam: 'em5', w: 3847, h: 2885 },
		{ file: 'PC143318.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PC143351.avif', cam: 'em5', w: 4608, h: 3456 },
		{ file: 'PC143392.avif', cam: 'em5', w: 3456, h: 4608 }
	];

	let active = $state<Camera | 'all'>('all');
	let shown = $derived(active === 'all' ? photos : photos.filter((p) => p.cam === active));
</script>

<Seo title="Harsh ✸ Photography" description="Photos by Harsh Mandan." />

<div class="text-16 font-500 flex flex-col gap-16">
	<div class="text-24 font-600 pb-16">Photography</div>
	<div class="flex flex-col gap-16">
		<div>
			Most of the photos I upload are taken using my Olympus mirrorless. I love the M43 ecosystem as
			the whole system is really light and portable
		</div>
		<dl class="grid grid-cols-[auto_1fr] gap-x-32 gap-y-16 pt-16">
			{#each gear as group (group.label)}
				<dt class="font-400 opacity-70">{group.label}</dt>
				<dd class="flex flex-col gap-4">
					{#each group.items as item (item.text)}
						<span>
							{item.text}{#if item.link}<a
									href={item.link.href}
									target="_blank"
									rel="external noopener"
									class="decoration-pink-light underline underline-offset-2 hover:decoration-wavy"
									>{item.link.label}</a
								>{/if}
						</span>
					{/each}
				</dd>
			{/each}
		</dl>
	</div>
	<div class="text-24 font-600 pt-84 pb-16">Gallery</div>
	<div class="flex flex-wrap gap-x-16 gap-y-8 pb-16 font-serif">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				aria-pressed={active === tab.id}
				class={[
					'decoration-pink-light transition hover:underline hover:decoration-wavy',
					active === tab.id
						? 'underline decoration-wavy underline-offset-2'
						: 'underline-offset-3 opacity-50'
				]}
				onclick={() => (active = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div
		class="relative right-1/2 left-1/2 -mx-[50vw] flex h-full w-screen flex-col gap-32 px-16 xl:gap-72"
	>
		{#each shown as photo (photo.file)}
			{@const src = `https://bucket.harsh.ink/${photo.file}`}
			<a href={src} target="_blank" class="flex w-full snap-start items-center justify-center">
				<!-- width/height reserve space, so lazy loading only fetches photos near the screen -->
				<img
					alt="Gallery"
					{src}
					width={photo.w}
					height={photo.h}
					loading="lazy"
					decoding="async"
					class="h-auto max-h-[calc(100vh-100px)] w-full object-contain"
				/>
			</a>
		{:else}
			{#key active}
				<div class="empty flex flex-col items-center gap-16 py-64 text-center">
					<span class="empty__camera text-24" aria-hidden="true">📷</span>
					<span class="opacity-70">
						{tabs.find((t) => t.id === active)?.empty ?? 'Out taking photos. Check back later.'}
					</span>
				</div>
			{/key}
		{/each}
	</div>
	<div class="flex flex-col items-center justify-center gap-8 py-64">
		<div class="opacity-70">Thanks for scrolling! :)</div>
		<button
			class="decoration-wavy underline-offset-2 hover:underline"
			onclick={() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}}
		>
			Go to top
		</button>
	</div>
</div>

<Footer />

<style>
	.empty {
		animation: empty-in 0.5s ease-out both;
	}

	.empty__camera {
		display: inline-block;
		transform-origin: 50% 80%;
		animation: empty-snap 2.4s ease-in-out infinite;
	}

	@keyframes empty-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}

	/* Rock side to side, then a quick press and a flash, like taking a shot. */
	@keyframes empty-snap {
		0%,
		100% {
			transform: rotate(-8deg);
			filter: brightness(1);
		}
		40% {
			transform: rotate(8deg);
			filter: brightness(1);
		}
		55% {
			transform: rotate(0deg) scale(0.88);
			filter: brightness(1);
		}
		62% {
			transform: rotate(0deg) scale(1.12);
			filter: brightness(1.8);
		}
		75% {
			transform: rotate(0deg) scale(1);
			filter: brightness(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.empty,
		.empty__camera {
			animation: none;
		}
	}
</style>
