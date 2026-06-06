---
title: 'svaul: a drawer for Svelte'
date: '06-06-2026'
updated: '20-07-2026'
categories:
  - 'svelte'
  - 'open-source'
excerpt: A zero-dependency drawer for Svelte 5, first ported from vaul and vaul-svelte, then rebuilt for v2 on the declarative motion model of the Base UI drawer.
link: https://harshmandan.github.io/svaul/
npm_url: https://www.npmjs.com/package/@harshmandan/svaul
source_url: https://github.com/harshmandan/svaul
---

<iframe class="demo-frame" src="https://harshmandan.github.io/svaul/" title="svaul demo" loading="lazy"></iframe>

## Update: svaul 2.0

_July 2026_

v1 (below) animated the drawer with CSS keyframes and moved it during a drag by writing inline transforms from JavaScript. By July, the same kind of bug kept coming up: the animation and the JavaScript disagreed about where the drawer was.

- Reopening a drawer while it was closing restarted the enter keyframe from fully closed, so it jumped.
- A drag-close left its inline transform behind. Reopening played the enter animation, then snapped back to the frame where the drag had stopped.
- Every fix added more state to keep in sync: pinned offsets, forced reflows, double `requestAnimationFrame` waits.

I'd been looking at the [Base UI](https://github.com/mui/base-ui) drawer, and its approach was much better. JavaScript never animates anything. It sets a few data attributes and CSS variables, and CSS transitions do the rest. So for v2 I rebuilt the motion and gesture core on that model.

### Transitions instead of keyframes

The drawer's position comes from `data-state`. For a bottom drawer, simplified:

```css
[data-svaul-drawer] {
	transition: transform var(--svaul-drawer-duration, 0.5s) cubic-bezier(0.32, 0.72, 0, 1);
}

[data-svaul-drawer][data-state='closed'],
[data-svaul-drawer][data-svaul-drawer-starting] {
	transform: translate3d(0, 100%, 0);
}

[data-svaul-drawer][data-svaul-drawer-swiping] {
	transition-duration: 0s;
	transform: translate3d(0, var(--svaul-drawer-swipe), 0);
}
```

- **Opening:** the drawer mounts with `data-svaul-drawer-starting`, so the first painted frame is fully closed. A frame later the attribute is removed, and the transition slides it in.
- **Closing:** `data-state` flips to `closed`. Reopening mid-close flips it back, and since a transition always starts from the current value, the drawer just turns around. Interrupting a close needs no code at all.
- **Dragging:** JavaScript writes the finger's offset into `--svaul-drawer-swipe` and sets `data-svaul-drawer-swiping`, which freezes the transition so the drawer follows the finger exactly. On release the attribute goes away, and the transition takes the drawer from wherever it is to open or closed.

Because the enter is a transition too, you can grab a drawer while it's still opening, and the drag starts from where you caught it.

### Flick to close

A fast flick should close faster than a slow drag. svaul uses the same numbers as Base UI:

- The release speed is measured over the last 80ms of movement, not the whole drag.
- It's clamped to 0.2–4 px/ms, and the remaining distance divided by it gives a time, clamped to 80–360ms.
- That's mapped onto a 0.1–1 scale and multiplied by 400ms, so a close takes between 40 and 400ms.

The result goes into `--svaul-drawer-duration` for that one close. A flick in the opposite direction at the end of a drag ("changed my mind") snaps the drawer back instead of closing it.

### Moving the rest into CSS

The background scale (the page shrinking behind the drawer, like an iOS sheet) got the same treatment. v1 wrote inline transforms on the page wrapper and overwrote `document.body.style.background`, and sometimes failed to put it back. v2 only publishes state, like `data-svaul-drawer-scaled` and `--svaul-scale-open`, and the stylesheet draws the effect. You can restyle it by overriding those.

### Bugs only a phone shows

Some bugs never showed up in the desktop tests:

- On Chrome for Android, moving the element under your finger during a touch drag made the browser drop the click on your next tap. After swiping a drawer closed, the button that opened it needed two taps. The fix claims the gesture with a non-passive `touchmove` that calls `preventDefault`, only once a drag has actually started, so it never blocks scrolling inside the drawer.
- The enter transition leaves a tiny leftover transform for a moment after opening. The code that decides "scroll or drag?" read that as a drag in progress, so scrolling inside a freshly opened drawer bounced the drawer instead. It now waits for the finger to move a few pixels before deciding.

If you're upgrading from v1, the [changelog](https://github.com/harshmandan/svaul/blob/main/CHANGELOG.md) lists what changed.

<div class="post-divider" role="separator">Original post · June 2026</div>

svaul is a drawer for Svelte 5: a panel that slides in from the edge of the screen, which you can drag to dismiss. It's built on [vaul](https://github.com/emilkowalski/vaul), Emil Kowalski's drawer for React, and [vaul-svelte](https://github.com/huntabyte/vaul-svelte), its Svelte port.

vaul's README says it's unmaintained. vaul-svelte's stable release targets Svelte 4 and depends on bits-ui, and its Svelte 5 version has been stuck in prerelease since March 2025.

svaul is a port of both to Svelte 5 runes, with no runtime dependencies. The portal, focus trap, scroll lock, Escape and outside-click handling, the inert background and the ARIA are all written in the library.

```bash
npm i @harshmandan/svaul
```

```svelte
<script lang="ts">
	import Drawer from '@harshmandan/svaul';
	let open = $state(false);
</script>

<Drawer bind:open class="rounded-t-xl bg-white p-4">
	{#snippet trigger(props)}
		<button {...props}>Open</button>
	{/snippet}

	<h2>A bottom sheet</h2>
	<p>Drag it down to dismiss, or tap outside.</p>

	{#snippet footer({ close })}
		<button onclick={close}>Close</button>
	{/snippet}
</Drawer>
```

Instead of vaul's `Drawer.Root`, `Drawer.Content` and friends, it's one component with named snippets (`trigger`, `overlay`, `handle`, `title`, `header`, `footer` and more). You only write the parts you want to change, and each one gets a sensible default otherwise. There's also a headless `Drawer` class if you want to build the markup yourself.

## What it does

- Drawers from all four edges.
- Snap points as fractions, pixels or `calc()` (for example `"calc(50% + 24px)"`).
- Nested drawers, where the one behind shrinks back like a stack of cards.
- Scaling the page behind the drawer, like an iOS sheet.
- A `keepMounted` prop that keeps closed content in the DOM.
- Unstyled. The library's CSS sits in a cascade layer called `svaul`, so your own styles always win without `!important`.

It also fixes some bugs in vaul and vaul-svelte: the page's background colour not being restored after a scaled drawer closed, outside clicks closing every nested drawer instead of the top one, the drawer shooting off-screen when the on-screen keyboard opened, and blurry text from snap points landing on half pixels.
