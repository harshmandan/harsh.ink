<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';

	const photos = [
		'https://live.staticflickr.com/65535/54562196474_66b38d4e29_k.jpg',
		'https://live.staticflickr.com/65535/54561135182_20ce80f799_k.jpg',
		'https://live.staticflickr.com/65535/54562342260_3798e50e56_k.jpg',
		'https://live.staticflickr.com/65535/54562253098_ffda72d85c_k.jpg',
		'https://live.staticflickr.com/65535/54562253138_15c12db54e_k.jpg',
		'https://live.staticflickr.com/65535/54562196354_3f9341b5c3_k.jpg',
		'https://live.staticflickr.com/65535/54561136027_d177a848b8_k.jpg',
		'https://live.staticflickr.com/65535/54561136012_3bd88add21_k.jpg',
		'https://live.staticflickr.com/65535/54561135317_42573740fb_k.jpg',
		'https://live.staticflickr.com/65535/54562012156_cf74ef643f_k.jpg',
		'https://live.staticflickr.com/65535/54562011346_32c3f87e83_k.jpg',
		'https://live.staticflickr.com/65535/54562011991_4762a5d765_k.jpg',
		'https://live.staticflickr.com/65535/54562196154_cc42b51f36_k.jpg',
		'https://live.staticflickr.com/65535/54562252863_eb934feef7_k.jpg',
		'https://live.staticflickr.com/65535/54562252848_88e675012e_k.jpg',
		'https://live.staticflickr.com/65535/54562253028_ab79d29174_k.jpg',
		'https://live.staticflickr.com/65535/54561135767_c470eb4e07_k.jpg',
		'https://live.staticflickr.com/65535/54562011841_f0b78a17d6_k.jpg',
		'https://live.staticflickr.com/65535/54562011861_573a371773_k.jpg',
		'https://live.staticflickr.com/65535/54562341910_b17d3753db_k.jpg',
		'https://live.staticflickr.com/65535/54562341960_a4dc4fe719_k.jpg',
		'https://live.staticflickr.com/65535/54562011766_d5c3275c89_k.jpg',
		'https://live.staticflickr.com/65535/54562195929_1d95427053_k.jpg',
		'https://live.staticflickr.com/65535/54562341875_21b73c38a2_k.jpg',
		'https://live.staticflickr.com/65535/54562196194_a03472c306_k.jpg',
		'https://live.staticflickr.com/65535/54562011711_515aa78812_k.jpg',
		'https://live.staticflickr.com/65535/54562252628_8bdec53bc0_k.jpg',
		'https://live.staticflickr.com/65535/54562341850_3f0f21b5d8_k.jpg',
		'https://live.staticflickr.com/65535/54562011271_0b1e9058c8_k.jpg',
		'https://live.staticflickr.com/65535/54562195854_678aa984d8_k.jpg',
		'https://live.staticflickr.com/65535/54562341800_6995a4efc1_k.jpg',
		'https://live.staticflickr.com/65535/54561135572_f6844253ae_k.jpg',
		'https://live.staticflickr.com/65535/54562196259_d374079c16_k.jpg',
		'https://live.staticflickr.com/65535/54562252173_0e31143e90_k.jpg',
		'https://live.staticflickr.com/65535/54562195804_fdd0b0220f_k.jpg',
		'https://live.staticflickr.com/65535/54562011621_4fc48968c9_k.jpg',
		'https://live.staticflickr.com/65535/54561135547_b9f25ea2c1_k.jpg',
		'https://live.staticflickr.com/65535/54562341715_cd567470e5_k.jpg',
		'https://live.staticflickr.com/65535/54561135557_20d94bafd9_k.jpg',
		'https://live.staticflickr.com/65535/54561135522_43e93b43a4_k.jpg',
		'https://live.staticflickr.com/65535/54562195469_dc0e9a8297_k.jpg',
		'https://live.staticflickr.com/65535/54561135492_c0a2d7e45f_k.jpg',
		'https://live.staticflickr.com/65535/54562341670_ab75f982cb_k.jpg',
		'https://live.staticflickr.com/65535/54562341650_0e55afd742_k.jpg',
		'https://live.staticflickr.com/65535/54562195744_96732e8d8f_k.jpg',
		'https://live.staticflickr.com/65535/54562195674_f7b91c688d_k.jpg',
		'https://live.staticflickr.com/65535/54562341660_e1206a5cc2_k.jpg',
		'https://live.staticflickr.com/65535/54562252178_0df8358c77_k.jpg',
		'https://live.staticflickr.com/65535/54562195604_b87fc5d042_k.jpg',
		'https://live.staticflickr.com/65535/54562252383_94e65c9ede_k.jpg',
		'https://live.staticflickr.com/65535/54562252358_93e3d23cb8_k.jpg',
		'https://live.staticflickr.com/65535/54562011456_6619820c3f_k.jpg',
		'https://live.staticflickr.com/65535/54562195544_871152886b_k.jpg',
		'https://live.staticflickr.com/65535/54562011191_f5f9219409_k.jpg',
		'https://live.staticflickr.com/65535/54562012256_af5ad565a9_k.jpg',
		'https://live.staticflickr.com/65535/54562253168_adbfd87779_k.jpg',
		'https://live.staticflickr.com/65535/54562012231_2729951916_k.jpg',
		'https://live.staticflickr.com/65535/54562252233_8f3a82f3d5_k.jpg',
		'https://live.staticflickr.com/65535/54562011966_1326c1adcb_k.jpg',
		'https://live.staticflickr.com/65535/54562011946_50fee489d9_k.jpg',
		'https://live.staticflickr.com/65535/54562342025_9cec39b62e_k.jpg',
		'https://live.staticflickr.com/65535/54562195399_2b4414871b_k.jpg',
		'https://live.staticflickr.com/65535/54562341565_621bb9a658_k.jpg',
		'https://live.staticflickr.com/65535/54562011376_e465d05a95_k.jpg',
		'https://live.staticflickr.com/65535/54561135377_42a2d3c161_k.jpg',
		'https://live.staticflickr.com/65535/54561135217_5c4f5de104_k.jpg'
	];
</script>

<svelte:head>
	<title>Harsh ✸ Photography</title>
</svelte:head>

<div class="text-16 font-500 flex flex-col gap-16">
	<div class="text-24 font-600 pb-16">Photography</div>
	<div class="flex flex-col gap-16">
		<div class="font-400">
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
		{#each photos as photo}
			<a href={photo} target="_blank" class="flex w-full snap-start items-center justify-center">
				<img alt="Gallery" src={photo} class="max-h-[calc(100vh-100px)] w-full object-contain" />
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
