---
title: 'A favicon that knows your system theme'
date: '10-04-2025'
updated: '10-04-2025'
categories:
  - 'css'
excerpt: A small SVG favicon that swaps colours with your system's light or dark mode, and the two other ways to do it that I didn't pick.
source_url: https://github.com/harshmandan/harsh.ink
---

The favicon in this tab is the same star as the logo. Until this post it was one fixed colour, a muted pink that looked fine on a white tab bar and washed out on a dark one. **Switch your system between light and dark mode and watch it change.** On macOS that's System Settings → Appearance. On Windows it's Settings → Personalization → Colors.

The star should flip between a darker terracotta and a lighter pink. If it stays one colour, your browser is using the PNG fallback. More on that at the end.

## Why a favicon needs to know about your theme

A light tab bar is close to white, and a dark one is close to black. A fixed-colour favicon can be easy to see on one and nearly invisible on the other. A near-white logo on a dark Chrome tab bar is fine. On a light one, it disappears.

Browsers expose the system theme to CSS through the [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) media query, and every current browser supports it. There are three ways to get that into a favicon, and I only liked one of them.

## Option 1: JavaScript

Listen for the media query change in JS and swap the `href` on the `<link>` tag:

```js
const favicon = document.querySelector('link[rel="icon"]');
const mq = window.matchMedia('(prefers-color-scheme: dark)');

mq.addEventListener('change', (e) => {
	favicon.href = e.matches ? '/favicon-dark.png' : '/favicon-light.png';
});

// also set it once on load
favicon.href = mq.matches ? '/favicon-dark.png' : '/favicon-light.png';
```

This works. It also needs two image files, a script and a listener, and the wrong icon can show until the script runs. For one icon swap that's a lot of moving parts. _Next._

## Option 2: Two `<link>` tags with `media` attributes

The `<link>` element accepts a `media` attribute that takes any media query, including `prefers-color-scheme`. The browser picks the one that matches, with no script:

```html
<link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
<link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
```

Better. No JavaScript, and no flash. But it's still two image files, at every size you ship. The minute you tweak the shape in Figma, you're re-exporting both and hoping they don't drift apart.

## Option 3: One SVG, theme-switched inside

This is the one I shipped. Browsers that support SVG favicons, like Chrome, Firefox and Edge, read the SVG like any other document, _including the `<style>` tag inside it_. So you can put a `prefers-color-scheme` media query straight into the SVG and let one file draw both versions:

```html
<!-- src/app.html -->
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
```

The PNG and ICO are fallbacks for browsers that don't support SVG favicons, which included Safari when I wrote this. They get a fixed-colour icon.

The SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 227 227">
	<style>
		path { fill: #c5796d; }            /* terracotta - for light tab bars */
		@media (prefers-color-scheme: dark) {
			path { fill: #ffb7a4; }          /* pink-light - for dark tab bars */
		}
	</style>
	<path d="M33.1371 33.1371H193.137V193.137H33.1371V33.1371Z" />
	<path d="M0 113.137L113.137 0L226.274 113.137L113.137 226.274L0 113.137Z" />
</svg>
```

That's the whole favicon, `static/favicon.svg` in this repo. It's two paths, a square and the same square rotated, which overlap into the four-point star in the tab. The paths have no `fill` attribute, so the `<style>` block sets the colour without needing `!important`.

The two colours come from the site's theme. `#c5796d` is `--color-pink`, the terracotta background in light mode, and `#ffb7a4` is `--color-pink-light`, the accent colour. The darker one shows up on a white tab bar, and the lighter one on a dark tab bar.

## One thing that catches people

SVGs exported from design tools usually have `fill="#..."` on every path. A `fill` attribute loses to any CSS rule that matches the element, so `<style>path { fill: red }</style>` beats `<path fill="blue" />`. The catch is the word "matches". If your selector is a class the paths don't have, the attribute wins and nothing changes, and you'll burn 20 minutes wondering why.

The simplest fix is to delete the `fill` attributes, so the `<style>` block is the only place the colour is set. That's what the SVG above does.

If your favicon came out of Figma or another vector editor, run it through [SVGOMG](https://jakearchibald.github.io/svgomg/) first. It strips the export boilerplate, like `xmlns:xlink` and empty `<title>` tags. The original export of this star was about 2 KB. After SVGOMG and the media query, it's 340 bytes.

## If it doesn't change

You're probably in a browser that doesn't support SVG favicons, so it's showing the PNG. That one is the light-mode colour, which is still visible on a dark tab bar, just not as nicely.

The source for the whole site, favicon included, is on [GitHub](https://github.com/harshmandan/harsh.ink).
