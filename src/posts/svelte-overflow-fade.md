---
title: 'svelte-overflow-fade: a smooth scroll fade with CSS masks'
date: '15-08-2025'
updated: '17-11-2026'
categories:
  - 'svelte'
  - 'css'
  - 'open-source'
excerpt: A Svelte action and attachment that fades the edges of a scrolling container, using a CSS @property trick to animate a mask-image gradient the browser otherwise can't animate.
link: https://harshmandan.github.io/svelte-overflow-fade/
npm_url: https://www.npmjs.com/package/svelte-overflow-fade
source_url: https://github.com/harshmandan/svelte-overflow-fade
---

A scrollable list with more content than fits ends in a hard cut at the bottom edge, with nothing to say there's more. The usual fix is a soft fade at the edge: when there's content below, the bottom fades out, and when you've scrolled down, the top fades too.

It's easy to describe and fiddly to build, because the obvious CSS for it, `mask-image: linear-gradient(…)`, doesn't animate. The browser can't interpolate between two gradients, so when you swap one for another on scroll, the fade snaps instead of sliding. Every version I'd seen either lived with the snap or put an extra element over the edge and animated that.

[svelte-overflow-fade](https://www.npmjs.com/package/svelte-overflow-fade) is my Svelte action and attachment for it. It uses `mask-image`, animates smoothly, and adds no extra elements. Scroll inside the frame to see it, or [open the demo](https://harshmandan.github.io/svelte-overflow-fade/):

<iframe class="demo-frame wide" src="https://harshmandan.github.io/svelte-overflow-fade/" title="svelte-overflow-fade demo" loading="lazy"></iframe>

## The trick: `@property` makes the mask animatable

The `@property` rule registers a CSS custom property with a type. A normal custom property is just text, so the browser can't animate it. Once it's registered as a `<number>`, the browser can, and anything built from it with `var()` animates along with it, including a gradient.

The library registers one number per edge the first time you use a mask:

```css
@property --fade-top {
	syntax: '<number>';
	initial-value: 0;
	inherits: false;
}
@property --fade-bottom {
	syntax: '<number>';
	initial-value: 100;
	inherits: false;
}
/* --fade-left and --fade-right work the same way */
```

The mask is a gradient that's transparent at both ends and opaque between the two stops, with the stops set by those numbers:

```css
.scrolly {
	mask-image: linear-gradient(
		to bottom,
		transparent 0%,
		black calc(var(--fade-top) * 1%),
		black calc(var(--fade-bottom) * 1%),
		transparent 100%
	);
	transition:
		--fade-top 300ms ease,
		--fade-bottom 300ms ease;
}
```

At `0` and `100`, both fades have zero width, so nothing is hidden. When you scroll away from the top, the library sets `--fade-top` to `10`. The browser animates that number from 0 to 10 over 300ms and redraws the gradient on every frame, so the fade slides in. There's no JavaScript animation loop and no extra element.

Without `@property`, the same CSS jumps straight from no fade to a 10% fade.

## Two fade modes

Masks still have rough edges in some older browsers and WebViews, so the library also has an element mode. It puts a gradient `<div>` over the edge instead. Both use the same options:

```svelte
<!-- Mask mode -->
<div
	class="max-h-64 overflow-auto"
	use:overflowFadeAction={{
		axis: 'y',
		fade: { type: 'mask', fadePercent: 10 }
	}}
>
	<!-- scrollable content -->
</div>

<!-- Element mode, for a solid background -->
<div
	class="max-h-64 overflow-auto"
	use:overflowFadeAction={{
		axis: 'y',
		fade: { type: 'element', size: '60px', backgroundColor: 'white', zIndex: 10 }
	}}
>
	<!-- scrollable content -->
</div>
```

Use mask mode unless you have a reason not to. It works over any background, including gradients and images. Element mode paints a solid colour over the content, so it only looks right on a plain background. If you need to switch, it's a change to one option.

## Action and attachment

Svelte 5.29 added [attachments](https://svelte.dev/docs/svelte/@attach), a newer alternative to actions. Not every project is on 5.29, so the library exports both:

```svelte
<!-- Action: Svelte 4 and 5 -->
<div use:overflowFadeAction={{ axis: 'y', fade: { type: 'mask', fadePercent: 10 } }}>
	<!-- ... -->
</div>

<!-- Attachment: Svelte 5.29+ -->
<div {@attach overflowFade({ axis: 'y', fade: { type: 'mask', fadePercent: 10 } })}>
	<!-- ... -->
</div>
```

Both run the same code underneath. The action returns `update` and `destroy`, and the attachment returns a cleanup function.

## Knowing when to fade

Whether to fade each edge comes from the container's scroll position. `scrollTop > 0` means there's content above, so fade the top. `clientHeight + scrollTop < scrollHeight` means there's content below, so fade the bottom. Left and right work the same way with the horizontal values.

The library checks again when:

1. The container scrolls. This is throttled to once every 100ms, so a fast scroll runs about 10 checks instead of one per frame.
2. Its content changes. A `MutationObserver` watches for elements being added or removed, since that can change the overflow without any scrolling.
3. It mounts, after Svelte's `tick()`, in case the content already overflows.

It doesn't watch for the container itself changing size, so a resize won't update the fade until the next scroll.

Every check also fires an `overflow` event with the result, so a component can react to reaching the bottom without doing the maths itself:

```svelte
<script>
	let hasMore = $state(false);
</script>

<div use:overflowFadeAction={{ axis: 'y' }} onoverflow={(e) => (hasMore = e.detail.overflowBottom)}>
	<!-- ... -->
</div>
```

If you want that check without any fade, v1.0.3 split it out as `isOverflowingAction` and `isOverflowing`. Later versions added `axis: 'both'` to fade all four edges, and a `sides` option to fade only the start or end.

## Try it

```sh
pnpm add svelte-overflow-fade
```

The options and the issue tracker are on [GitHub](https://github.com/harshmandan/svelte-overflow-fade). It's MIT licensed.

The `@property` trick isn't only for fades. Any time you want to animate a value inside a gradient, whether it's a mask, a background or a border image, register that value as a typed custom property and the browser will animate it.
