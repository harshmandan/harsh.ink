---
title: 'Linear scale in Tailwind CSS'
date: '15-12-2024'
updated: '15-12-2024'
categories:
  - 'css'
excerpt: Figuring out a better tailwind scaling & naming system
---

I love tailwindCSS! The combination of tailwind & svelte is just 🤌. But as I worked with it more I realized the default naming system had a big issue that I loathed. Pretty sure everyone who has worked with tailwind must have gone through this. Let me explain with an example:

You have a figma file that you want to translate into code.

Here, the button has vertical padding of 10px and horizontal padding of 16px. What would that look like in tailwind's _default_ classes: `py-2.5 px-4`. If you have even a little bit of experience with tailwindCSS, then you understand `2.5` comes from `10/4=2.5` & `4` comes from `16/4`. So what, you say! It's a pretty basic division and you're right but bear with me. Let's make the example more in favour of my point: Say, the vertical padding is now `18px`, instead of `16px`: `14/4 = 4.5`. You type in px-4.5 but oh no! By default there's no such class. But no worries, we can use arbitrary numbers with tailwind: `px-[18px]`. If you came to the same answer, well it's partially incorrect. Yes, it will be `18px` but only at base scaling/font-size. When you use any default tailwind classes the spacing is in `rem` units. So the correct answer would be `px-[1.125rem]` - It comes from `0.0625 * 18`. Now, try doing this math again & again. It gets pretty tiring. Not to mention when you're double checking every spacing with the design - that can't be as quick.

This problem continues with other classes as well (at base scale):

- Border radius: `rounded-md` = `border-radius: 8px`
- Font size: `font-xl` = `font-size: 18px; line-height: ??`
- Font weight: `font-medium` = `font-weight: 500` (This bothers me the least as the weights do have standard names associated with them - but I prefer an explicit number)
- Breakpoints & Container queries: `md:, lg:, @md:` = `640:, 768:, @640:`

## The spacing scale conspiracy

Here's the kicker - Tailwind's `p-4` means `padding: 1rem`. And if you're running on the default font size (which most of us are), that's 16 pixels.

### Quick math lesson

Your browser's default font size is usually 16px. So `1rem = 16px`. Which means:

```css
/* Tailwind's spacing scale */
.p-1 {
	padding: 0.25rem;
} /* 4px */
.p-2 {
	padding: 0.5rem;
} /* 8px */
.p-3 {
	padding: 0.75rem;
} /* 12px */
.p-4 {
	padding: 1rem;
} /* 16px */
```

See the pattern? Every increment adds 4px. So to get 10px padding, you need... `p-2.5`?

_cries in Figma_

## The Figma translation nightmare

If you've ever stared at a Figma design that says "padding: 10px" and then spent 30 seconds figuring out that means `p-2.5` in Tailwind-land, you know my pain.

```
Designer: "Just add 20px margin"
Me: *furiously calculating* "So that's... 20 divided by 4... equals m-5"
```

Why are we doing division in our heads while coding?

### The translation table of doom

| Figma says | You calculate | You write |
| ---------- | ------------- | --------- |
| 10px       | 10 ÷ 4 = 2.5  | `p-2.5`   |
| 20px       | 20 ÷ 4 = 5    | `p-5`     |
| 24px       | 24 ÷ 4 = 6    | `p-6`     |
| 30px       | 30 ÷ 4 = 7.5  | `p-7.5`   |

## My stupidly simple solution

I got tired of this, so I made a config that just... makes sense. Now `p-4` means 4 pixels. Revolutionary, I know.

But here's the trick - it's still using rem units under the hood! The magic formula:

```css
:root {
	--spacing-scale: 0.0625em; /* Magic number! */
}
```

### Why 0.0625?

Because math:

```
1px = 1/16 rem = 0.0625rem (when base font is 16px)
```

So `p-10` becomes:

```css
.p-10 {
	padding: calc(10 * var(--spacing-scale));
	/* 10 * 0.0625rem = 0.625rem = 10px */
}
```

No mental math required!

## What I changed

### Spacing (margin, padding, gap, etc.)

```html
<!-- Before: Mental gymnastics -->
<div class="m-6 gap-2 p-4">
	<!-- 16px, 24px, 8px -->

	<!-- After: What you see is what you get -->
	<div class="m-24 gap-8 p-16"><!-- 16px, 24px, 8px --></div>
</div>
```

Now when Figma says 20px, you use `p-20`. Mind. Blown. 🤯

### Typography

```html
<!-- Before: Abstract sizes -->
<h1 class="text-base">Base text</h1>
<!-- 16px -->
<h2 class="text-lg">Large text</h2>
<!-- 18px -->
<h3 class="text-xl">Extra large</h3>
<!-- 20px -->
<h4 class="text-2xl">2x large?</h4>
<!-- 24px -->

<!-- After: Actual pixel values -->
<h1 class="text-16">Base text</h1>
<!-- 16px -->
<h2 class="text-18">Large text</h2>
<!-- 18px -->
<h3 class="text-20">Extra large</h3>
<!-- 20px -->
<h4 class="text-24">2x large?</h4>
<!-- 24px -->
```

No more guessing if `text-2xl` is 24px or 28px or whatever.

### Border radius

```html
<!-- Before: What's medium? -->
<div class="rounded-sm">Small?</div>
<!-- 2px -->
<div class="rounded-md">Medium?</div>
<!-- 6px -->
<div class="rounded-lg">Large?</div>
<!-- 8px -->

<!-- After: Just pixels -->
<div class="rounded-2">Small</div>
<!-- 2px -->
<div class="rounded-6">Medium</div>
<!-- 6px -->
<div class="rounded-8">Large</div>
<!-- 8px -->
```

### Breakpoints

Even the breakpoints got the treatment:

```html
<!-- Before: Abstract breakpoints -->
<div class="sm:hidden md:block lg:flex">
	<!-- After: Pixel values -->
	<div class="640:hidden 768:block 1024:flex"></div>
</div>
```

Because why memorize abstract names when the pixel values are right there?

## The config magic

Here's a peek at what the config looks like:

```js
// tailwind.config.js
module.exports = {
	theme: {
		extend: {
			spacing: {
				1: 'calc(1 * var(--spacing-scale))',
				2: 'calc(2 * var(--spacing-scale))',
				3: 'calc(3 * var(--spacing-scale))',
				4: 'calc(4 * var(--spacing-scale))'
				// ... and so on
			},
			fontSize: {
				12: ['calc(12 * var(--spacing-scale))', { lineHeight: '1.5' }],
				14: ['calc(14 * var(--spacing-scale))', { lineHeight: '1.5' }],
				16: ['calc(16 * var(--spacing-scale))', { lineHeight: '1.5' }]
				// ... more sizes
			}
		}
	}
};
```

## The best part

It's all backwards compatible! The old classes still work if you're into that whole abstract naming thing. I just added sensible alternatives.

```html
<!-- Both work! -->
<div class="p-4">Old way (16px)</div>
<div class="p-16">New way (16px)</div>
```

## Try it yourself

Grab the config from [the repo](https://github.com/harshmandan/tailwind-linear-scale) and stop doing math in your head. Your brain cells will thank you.

### Installation

```bash
npm install tailwind-linear-scale
# or
pnpm add tailwind-linear-scale
```

Then update your config:

```js
// tailwind.config.js
const linearScale = require('tailwind-linear-scale');

module.exports = {
	presets: [linearScale]
	// ... your other config
};
```

## The accessibility note

And yes, I know some purists will say "but rem units are better for accessibility!" - and they're right! That's why everything still compiles to rem. You get the best of both worlds: think in pixels, output in rems.

```css
/* What you write */
.p-20 {
}

/* What gets generated */
.p-20 {
	padding: 1.25rem;
} /* Still rem! */
```

Now if you'll excuse me, I need to go update all my projects to use this because I can't go back to the dark times of `p-2.5`.
