<script lang="ts">
	import Star from '$lib/icons/Star.svelte';
	import Sveltekit from '$lib/icons/Sveltekit.svelte';
</script>

<footer class="mt-auto flex items-center justify-between px-16 pt-64 pb-24 font-serif xl:pt-128">
	<div class="text-14 font-500 flex items-center gap-16">
		<a href="https://en.wikipedia.org/wiki/Jaipur" target="_blank" class="flex items-center gap-8">
			<span>Jaipur, IN</span>
			<Star class="size-8 text-white" />
			<span>
				{new Date().toLocaleTimeString([], {
					timeZone: 'Asia/Kolkata',
					hourCycle: 'h24',
					hour: '2-digit',
					minute: '2-digit'
				})}
			</span>
		</a>
	</div>
	<div class="flex translate-y-1 items-center gap-16">
		<a href="https://www.indiantypefoundry.com/news/begum-multiscript" target="_blank">
			<span class="text-20 font-600 pt-2 font-serif">A</span>
		</a>
		<a href="https://encycolorpedia.com/c5796d" target="_blank">
			<Star class="text-pink-light size-20" />
		</a>

		<a href="https://svelte.dev/" target="_blank">
			<Sveltekit class="text-pink-light size-20" />
		</a>
	</div>
</footer>
