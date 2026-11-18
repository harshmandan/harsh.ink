---
title: 'Scroll-driven animations in CSS'
date: '18-11-2026'
updated: '18-11-2026'
categories:
  - 'css'
  - 'sveltekit'
excerpt: Shrinking each tile of a TikTok-style feed as it scrolls, with no JavaScript, using CSS view timelines, registered custom properties and a named scroll timeline.
link: https://harshmandan.github.io/doomscroller/
source_url: https://github.com/harshmandan/doomscroller
---

<iframe class="demo-frame" src="https://harshmandan.github.io/doomscroller/" title="doomscroller demo" loading="lazy" allow="autoplay; fullscreen"></iframe>

In [doomscroller](/blog/infinite-scrolling-video-feed), each video tile now shrinks and rounds its corners while you scroll, and grows back to full size when it snaps into place. There's no JavaScript involved. It's all [CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations): normal `@keyframes`, but driven by scroll position instead of time.

## A view timeline per tile

`animation-timeline: view()` ties an animation's progress to where the element is in its scroll container. `animation-range` picks which part of that journey the animation covers. `entry` is the element coming into view, and `exit` is it leaving.

Each tile runs two animations on its own view timeline: one that grows it back to full size over the last part of its entry, and one that shrinks it over the first part of its exit.

```css
.tile-zoom {
	overflow: clip;
	scale: calc(var(--tile-in) * var(--tile-out));
	border-radius: max(var(--tile-in-radius), var(--tile-out-radius));
	animation:
		tile-in linear both,
		tile-out linear both;
	/* must come after `animation`, which resets them */
	animation-timeline: view(block), view(block);
	animation-range:
		entry calc(100% - var(--tile-zoom-distance, 30%)) entry 100%,
		exit 0% exit var(--tile-zoom-distance, 30%);
}
```

## Two animations, one `scale`

Two animations can't both drive `scale`: the later one wins outright. So each animation drives its own custom property, and the tile multiplies them. A tile that's half out and half in still gets one combined scale.

The properties are registered with `@property`. An unregistered custom property is just a string, so it would jump from one value to the next instead of animating smoothly:

```css
@property --tile-in {
	syntax: '<number>';
	inherits: false;
	initial-value: 1;
}

@keyframes tile-in {
	from {
		--tile-in: var(--tile-in-scale, 0.9);
		--tile-in-radius: var(--tile-radius, 28px);
	}
	to {
		--tile-in: 1;
		--tile-in-radius: 0px;
	}
}
```

`--tile-out` and the two radius properties work the same way. The values in `var()` are what the settings panel changes: the scales, the corner radius and how far into the scroll the zoom happens. They're set as custom properties on the feed element, so the animation picks up a new value straight away.

## Place tiles with `top`, not `transform`

The feed reuses three video elements and moves them down the page as you scroll. They used to be placed with `transform: translateY()`. A view timeline works out where an element is from layout and ignores transforms, so it wouldn't follow a tile that was only moved by a transform. The tiles are now placed with `top`.

## A named scroll timeline for the logo

The logo is a pixel skull that bites once for every tile you scroll past. It isn't inside a tile, so it uses the feed's own scroll position instead. The feed element names its timeline:

```css
main {
	scroll-timeline: --feed block;
}
```

The jaw then animates on that timeline, with one iteration per tile. Stepped timing makes it move in whole pixels, like a sprite:

```css
.jaw {
	animation: bite linear both;
	animation-timeline: --feed;
	animation-iteration-count: var(--bites); /* the number of tiles */
	animation-timing-function: steps(2, jump-none);
}
```

## Browser support

Scroll-driven animations work in Chrome and Edge 115 and later, Safari 26 and later on macOS and iOS, and Firefox 159 and later.

All of it is wrapped in `@supports` (`animation-timeline: view()` for the tiles, `scroll()` for the logo) and `@media (prefers-reduced-motion: no-preference)`. A browser without support, or a visitor who has asked for less motion, gets the feed exactly as it was, at full size and with square corners. The settings panel checks `CSS.supports('animation-timeline: view()')` and disables the animation controls, with a note, where they wouldn't do anything.
