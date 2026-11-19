<script lang="ts">
	import Footer from '#lib/components/Footer.svelte';
	import Seo from '#lib/components/Seo.svelte';

	const photos = [
		{ file: 'DSC02166.avif', w: 5184, h: 3888 },
		{ file: 'PXL_20210921_163354792.avif', w: 3280, h: 2464 },
		{ file: 'P2170017.avif', w: 4608, h: 3456 },
		{ file: 'P2170023.avif', w: 4608, h: 3456 },
		{ file: 'P2180029.avif', w: 4608, h: 3456 },
		{ file: 'P2180061.avif', w: 3456, h: 4608 },
		{ file: 'P3020878.avif', w: 4608, h: 3456 },
		{ file: 'P3041043.avif', w: 4608, h: 3456 },
		{ file: 'P3051301.avif', w: 3456, h: 4608 },
		{ file: 'P3051330.avif', w: 4608, h: 3456 },
		{ file: 'P3041080.avif', w: 4608, h: 3456 },
		{ file: 'P3191655.avif', w: 4608, h: 3456 },
		{ file: 'P3191677.avif', w: 4608, h: 3456 },
		{ file: 'P3191699.avif', w: 3456, h: 4608 },
		{ file: 'P3191848.avif', w: 3456, h: 4608 },
		{ file: 'P4041970.avif', w: 4608, h: 3456 },
		{ file: 'P3041076.avif', w: 4608, h: 3456 },
		{ file: 'P4051981.avif', w: 4608, h: 3456 },
		{ file: 'P4052126.avif', w: 3456, h: 4608 },
		{ file: 'P4052141.avif', w: 4608, h: 3456 },
		{ file: 'P4052325.avif', w: 4160, h: 3120 },
		{ file: 'P4062419.avif', w: 4608, h: 3456 },
		{ file: 'P4062427.avif', w: 4608, h: 3456 },
		{ file: 'P4062431.avif', w: 4608, h: 3456 },
		{ file: 'P4062437.avif', w: 3456, h: 4608 },
		{ file: 'P4062553.avif', w: 4608, h: 3456 },
		{ file: 'P3051537.avif', w: 3456, h: 4608 },
		{ file: 'P5132607.avif', w: 3456, h: 4608 },
		{ file: 'P5132609.avif', w: 4608, h: 3456 },
		{ file: 'P5142622.avif', w: 3456, h: 4608 },
		{ file: 'P5142641.avif', w: 4518, h: 3388 },
		{ file: 'P5150897.avif', w: 4608, h: 3456 },
		{ file: 'P5150930.avif', w: 4608, h: 3456 },
		{ file: 'P5161009.avif', w: 4142, h: 3107 },
		{ file: 'P3051266.avif', w: 2621, h: 3495 },
		{ file: 'P5181212.avif', w: 3456, h: 4608 },
		{ file: 'P5201312.avif', w: 4608, h: 3456 },
		{ file: 'P5201315.avif', w: 4608, h: 3456 },
		{ file: 'P5231318.avif', w: 4608, h: 3456 },
		{ file: 'P6021357.avif', w: 4476, h: 3356 },
		{ file: 'P6261425.avif', w: 4608, h: 3456 },
		{ file: 'P7181856.avif', w: 4608, h: 3456 },
		{ file: 'P7181876.avif', w: 4608, h: 3456 },
		{ file: 'P7181907.avif', w: 4608, h: 3456 },
		{ file: 'P7181916.avif', w: 4320, h: 3240 },
		{ file: 'P7181938.avif', w: 3456, h: 4608 },
		{ file: 'P6261432.avif', w: 4608, h: 3456 },
		{ file: 'P8161960.avif', w: 3456, h: 4608 },
		{ file: 'P8161961.avif', w: 4608, h: 3456 },
		{ file: 'P8161969.avif', w: 4608, h: 3456 },
		{ file: 'P8162010.avif', w: 2752, h: 2063 },
		{ file: 'P8252065.avif', w: 4608, h: 3456 },
		{ file: 'PB262148.avif', w: 4608, h: 3456 },
		{ file: 'PB262174.avif', w: 4608, h: 3456 },
		{ file: 'PB262196.avif', w: 2952, h: 3936 },
		{ file: 'PXL_20231222_021424334.MP.avif', w: 3072, h: 4080 },
		{ file: 'P2102269.avif', w: 3626, h: 2719 },
		{ file: 'P2102276.avif', w: 4473, h: 3354 },
		{ file: 'P2102283.avif', w: 3728, h: 2795 },
		{ file: 'P3051483.avif', w: 3243, h: 4325 },
		{ file: 'P3232441.avif', w: 4608, h: 3456 },
		{ file: 'P3232467.avif', w: 3456, h: 4608 },
		{ file: 'P3242683.avif', w: 4608, h: 3456 },
		{ file: 'PXL_20240909_104116548.ACTION_PAN-01.COVER.avif', w: 3072, h: 4080 },
		{ file: 'PC143292.avif', w: 3847, h: 2885 },
		{ file: 'PC143318.avif', w: 4608, h: 3456 },
		{ file: 'PC143351.avif', w: 4608, h: 3456 },
		{ file: 'PC143392.avif', w: 3456, h: 4608 }
	];
</script>

<Seo title="Harsh ✸ Photography" description="Photos by Harsh Mandan." />

<div class="text-16 font-500 flex flex-col gap-16">
	<div class="text-24 font-600 pb-16">Photography</div>
	<div class="flex flex-col gap-16">
		<div>
			Most of the photos I upload are taken using my Olympus mirrorless. I love the M43 ecosystem as
			the whole system is really light and portable
		</div>
		<div><span class="font-400 opacity-70">Body:</span> Olympus EM5-Mk2</div>
		<div><span class="font-400 opacity-70">Lens:</span> Olympus 12-40mm f/2.8</div>
		<div><span class="font-400 opacity-70">Lens:</span> Olympus 14-42mm Pancake</div>
		<div><span class="font-400 opacity-70">Lens:</span> Olympus 45mm f/1.8</div>
		<div><span class="font-400 opacity-70">Lens:</span> Olympus 75-300mm f/4.8-6.7</div>
		<div><span class="font-400 opacity-70">Phone:</span> Pixel 7 Pro</div>
	</div>
	<div class="text-24 font-600 pt-84 pb-16">Gallery</div>
	<div
		class="relative right-1/2 left-1/2 -mx-[50vw] flex h-full w-screen flex-col gap-32 px-16 xl:gap-72"
	>
		{#each photos as photo (photo.file)}
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
