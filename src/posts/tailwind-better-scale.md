---
title: 'Linear scale in Tailwind CSS'
date: '15-12-2024'
updated: '15-12-2024'
categories:
  - 'css'
excerpt: A Tailwind config where the number in a class is the pixel value, so p-18 means 18px and the output is still rem.
source_url: https://github.com/harshmandan/tailwind-linear-scale
---

I love Tailwind CSS. Tailwind and Svelte together are just 🤌. But the more I used it, the more one thing bugged me: the numbers in the class names don't mean anything you can see in a design.

## The problem

Say a button in Figma has 10px of vertical padding and 16px of horizontal padding. In Tailwind that's `py-2.5 px-4`, because the spacing scale counts in steps of 4px: `10 / 4 = 2.5` and `16 / 4 = 4`. Easy enough.

Now make the horizontal padding 18px. `18 / 4 = 4.5`, so you type `px-4.5`, and nothing happens. Tailwind's default scale doesn't have it. The obvious fix is an arbitrary value, `px-[18px]`, and that's only half right. It's 18px, but it's fixed in pixels. Every built-in spacing class is in `rem`, so it grows when someone turns up their browser's font size, and `px-[18px]` doesn't. To match the rest of the scale you need `px-[1.125rem]`, which is `18 / 16`.

Doing that once is fine. Doing it for every spacing value in a design, and again when you check the build against the design, gets old fast.

| Design says | You work out | You type       |
| ----------- | ------------ | -------------- |
| 10px        | 10 / 4 = 2.5 | `p-2.5`        |
| 14px        | 14 / 4 = 3.5 | `p-3.5`        |
| 18px        | 18 / 4 = 4.5 | `p-[1.125rem]` |
| 22px        | 22 / 4 = 5.5 | `p-[1.375rem]` |

The other scales have the same problem in a different way. They use names instead of numbers, so you have to remember what each name means:

- Border radius: `rounded-md` is 6px. Medium compared to what?
- Font size: `text-xl` is 20px. That's not very extra large.
- Font weight: `font-medium` is 500. This one bothers me least, since weights have standard names, but I'd still rather see the number.
- Breakpoints and container queries: `md:` is 768px, `lg:` is 1024px, and `@md:` is 448px.

## Numbers that mean pixels

So I made a config where the number in the class is the pixel value. `p-10` is 10px, `p-18` is 18px, `text-20` is 20px, and `rounded-6` is 6px. Breakpoints are named by their width.

```html
<!-- Default Tailwind -->
<div class="m-5 gap-2 rounded-md p-4 text-xl md:flex">...</div>

<!-- Linear scale -->
<div class="rounded-6 text-20 768:flex m-20 gap-8 p-16">...</div>
```

The sizes are still `rem`, not `px`. Each number is divided by 16, so at the default browser font size 1 unit is 1px, and if someone sets a bigger font size, everything scales with it the same way default Tailwind does. You think in the pixels from the design, and the CSS stays in `rem`.

## The config

For Tailwind v3 it's a `tailwind.config.ts` that replaces the theme's scales with generated ones:

```ts
const BASE_FONT = 16;
const rem = (px: number) => `${px / BASE_FONT}rem`;
const linearScale = (values: number[]) =>
	Object.fromEntries(values.map((value) => [value, rem(value)]));

export default {
	theme: {
		spacing: linearScale([...Array(101).keys(), 128, 192, 256 /* ... up to 1216 */]),
		borderRadius: { ...linearScale([0, 2, 4, 6, 8, 12, 16, 24]), full: '9999px' },
		screens: { 640: '640px', 768: '768px', 1024: '1024px', 1280: '1280px', 1536: '1536px' },
		fontSize: {
			12: [rem(12), rem(16)],
			14: [rem(14), rem(20)],
			16: [rem(16), rem(24)]
			// ... up to 128
		},
		fontWeight: { 400: '400', 500: '500', 700: '700' /* ... 100 to 900 */ }
	}
};
```

Spacing goes from 0 to 100 in single pixels, then a few larger steps. Font sizes keep Tailwind's default line heights, so `text-20` looks exactly like `text-xl`. `BASE_FONT` is there in case your design isn't built on 16px. Change it and the whole scale follows.

One thing to know before you switch: this replaces the default scale, it doesn't add to it. `p-4` is now 4px, not 16px. On an existing project, every spacing class has to be converted, so it's easiest to start with on a new one.

<div class="post-divider" role="separator">Update · June 2025</div>

## Update: Tailwind v4

Tailwind v4 came out in January 2025 and moved configuration into CSS, so the [main branch](https://github.com/harshmandan/tailwind-linear-scale) is now a set of CSS files with `@theme` blocks. The idea is the same, with one variable doing the conversion:

```css
@theme {
	--spacing-*: initial;
	--scale-unit: calc(1rem / 16);

	--spacing-1: calc(var(--scale-unit) * 1);
	--spacing-2: calc(var(--scale-unit) * 2);
	/* ... */
}
```

Breakpoints and container sizes are the exception. Tailwind writes them straight into `@media` and `@container` queries, where `var()` doesn't work, so those are plain `rem` values like `--breakpoint-768: 48rem`.

v4 also lets you use any multiple of the default spacing, so `p-4.5` works now. You still have to divide by 4 to get there, though.

## Try it

It isn't on npm. Copy the files from the [repo](https://github.com/harshmandan/tailwind-linear-scale): the CSS files on `main` for Tailwind v4, or `tailwind.config.ts` on the `v3` branch. The README has the full tables for every scale.

I can finally build from a design without a calculator open. If doing division while you code bugs you too, give it a try.
