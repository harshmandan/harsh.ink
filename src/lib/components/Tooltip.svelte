<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		tip: string;
		top?: boolean;
		right?: boolean;
		bottom?: boolean;
		left?: boolean;
		active?: boolean;
		children: Snippet;
	};

	let { tip, top, right, bottom, left, active, children }: Props = $props();

	let arrowTopGap = 0;

	const tooltip = (element: HTMLElement) => {
		const tooltip = element.querySelector('.tooltip') as HTMLElement;
		const tip = element.querySelector('.tip') as HTMLElement;
		tooltip.style.setProperty('--tooltip-color', 'var(--color-neutral-900)');

		const showTooltip = () => {
			updateTooltipPosition();
			tooltip.style.opacity = '1';
			tooltip.style.zIndex = '10';
		};

		const hideTooltip = () => {
			tooltip.style.opacity = '0';
			tooltip.style.zIndex = '-1';
		};

		const updateTooltipPosition = () => {
			const { height: elHeight, width: elWidth } = element.getBoundingClientRect();
			const { height: tipHeight, width: tipWidth } = tooltip.getBoundingClientRect();
			let topGap;
			let rightGap;
			let bottomGap;
			let leftGap;
			if (top) {
				leftGap = -(tipWidth / 2 - elWidth / 2);
				bottomGap = elHeight + 12;
			} else if (right) {
				leftGap = elWidth + 12;
				bottomGap = elHeight / 2 - tipHeight / 2;
				arrowTopGap = tipHeight / 2;
			} else if (bottom) {
				leftGap = -(tipWidth / 2 - elWidth / 2);
				topGap = elHeight + 12;
			} else if (left) {
				leftGap = -(tipWidth + 12);
				bottomGap = elHeight / 2 - tipHeight / 2;
				arrowTopGap = tipHeight / 2;
			} else {
				leftGap = -Math.floor(tipWidth / 2 - elWidth / 2);
				topGap = Math.floor(elHeight + 8);
				tooltip.style.bottom = 'unset';
				tooltip.style.right = 'unset';
			}
			tooltip.style.top = `${topGap}px`;
			tooltip.style.bottom = `${bottomGap}px`;
			tooltip.style.right = `${rightGap}px`;
			tooltip.style.left = `${leftGap}px`;
			tip.style.setProperty('--top-gap', `${arrowTopGap - 4}px`);
		};

		const resizeObserver = new ResizeObserver(updateTooltipPosition);
		resizeObserver.observe(element);

		element.addEventListener('mouseover', showTooltip);
		element.addEventListener('mouseout', hideTooltip);

		return {
			destroy() {
				element.removeEventListener('mouseover', showTooltip);
				element.removeEventListener('mouseout', hideTooltip);
				resizeObserver.unobserve(element);
			}
		};
	};
</script>

<span class="relative inline-block" use:tooltip>
	{@render children()}
	<span
		style="background-color: var(--tooltip-color);"
		class={[
			'tooltip rounded-8 absolute z-[-1] block px-10 py-5 whitespace-nowrap text-white opacity-0 transition-all',
			{
				'visible z-10 opacity-100': active
			}
		]}
	>
		<div class="tip" class:top class:right class:bottom class:left>
			<span class="text-12 xl:text-16 bg-pink p-4 text-neutral-50">
				{tip}
			</span>
		</div>
	</span>
</span>
