---
title: 'Claude skills to convert Svelte 4 code to Svelte 5'
date: '20-10-2025'
updated: '20-10-2025'
categories:
  - 'svelte'
  - 'ai'
excerpt: What Claude's new Skills are, how to set one up in Claude Code, and the skill I use to migrate Svelte 4 components to Svelte 5, rule by rule.
---

Anthropic released [Skills](https://claude.com/blog/skills) for Claude four days ago. I've been moving a codebase from Svelte 4 to Svelte 5 one component at a time, and a skill turned out to be the right place for all the rules about how a migrated component should look. First, a quick look at what skills are and how to set one up. Then the skill itself.

## What a skill is

A skill is a folder with a `SKILL.md` file in it. The file starts with a short header that gives the skill a name and a description, followed by instructions in plain Markdown. The folder can also hold anything else the instructions refer to, like example files, reference docs or scripts.

What makes skills useful is how Claude loads them. Claude starts out seeing only the name and description of each skill. When a task matches a description, it reads that skill's `SKILL.md`, and it only opens the other files when the instructions point it at them. So you can keep a lot of skills around without any of them taking up room until they're needed.

That's the difference from a `CLAUDE.md` file, which Claude reads in every session whether it's relevant or not. Project facts everyone needs, like how to run the tests, belong in `CLAUDE.md`. Knowledge that only matters for one kind of task, like how to migrate a Svelte component, fits better in a skill.

Skills work in the Claude apps, in Claude Code and through the API. This post sticks to Claude Code.

## Setting one up in Claude Code

Claude Code looks for skills in two places:

- `~/.claude/skills/<name>/SKILL.md` for personal skills, available in all your projects.
- `.claude/skills/<name>/SKILL.md` inside a project. Commit it, and everyone working on the repo gets the skill too.

Skills can also come from plugins, including the ones in Anthropic's [skills repository](https://github.com/anthropics/skills).

A minimal skill is a folder with one file:

```md
---
name: release-notes
description: Writes release notes from merged pull requests. Use when the user asks for release notes or a changelog.
---

# Release notes

List the merged pull requests since the last tag, group them into Features, Fixes and Chores, and write one line per change in plain language.
```

The description does most of the work, because it's the only part Claude sees before deciding to use the skill. A good one says what the skill does and when to use it, using the words someone would actually type: "migrate", "convert", "changelog". A vague description means the skill never gets picked.

Keep `SKILL.md` itself short and to the point. Long examples and reference material go in separate files that `SKILL.md` links to, so they're only read when they're needed. To test a skill, start a new session, ask for something that matches its description, and check that Claude reaches for it.

## The Svelte 5 skill

This is the skill I use for writing new Svelte 5 components and migrating old ones. It lives in the project, so the rules are the same for everyone working on the codebase:

```
.claude/skills/svelte-components/
├── SKILL.md
└── examples/
    ├── Example.before.svelte
    └── Example.after.svelte
```

The two example files are the same component, once in Svelte 4 and once in Svelte 5. One real before/after pair shows Claude the conventions better than a page of rules, and `SKILL.md` points at them instead of repeating them.

The header looks like this:

```md
---
name: svelte-components
description: Best practices for writing Svelte 5 components and migrating Svelte 4 components to Svelte 5. Use when creating new Svelte components, modernizing existing components, migrating from Svelte 4 to 5, updating component APIs, or converting legacy Svelte syntax.
---
```

The description lists the different ways someone might ask for the same thing, so the skill gets picked whether you say "migrate", "modernize" or "convert".

The rest of the skill is a set of rules for Svelte 5 components, followed by a table that maps each Svelte 4 pattern to its Svelte 5 version. Here's each rule, and why it's there.

### Props

`export let` becomes one `$props()` call. The skill asks for an `interface Props` for the types, and for pulling out the props that need special handling (bindable ones, ones with defaults) by name, with the rest collected in `...props`:

```svelte
<!-- Svelte 4 -->
<script lang="ts">
	export let label = '';
	export let show = false;
</script>

<!-- Svelte 5 -->
<script lang="ts">
	interface Props {
		label?: string;
		show?: boolean;
	}

	let { show = $bindable(false), ...props }: Props = $props();
</script>
```

Props that a parent uses with `bind:` need `$bindable()`, or Svelte refuses the binding. You can't tell which ones those are from inside the component, so the first step of a migration is to search for `bind:propName` wherever the component is used.

The `class` prop gets its own rule. Svelte 4 needed `export { _class as class }` because `class` is a reserved word. In Svelte 5 you rename it while destructuring, `class: classValue`, and type it as `ClassValue` from `svelte/elements`.

### Events

`createEventDispatcher` goes away. A component that used to dispatch an event takes a callback prop instead, named `on` plus a verb, and calls it directly:

```ts
// Svelte 4
const dispatch = createEventDispatcher<{ toggle: boolean }>();
dispatch('toggle', show);

// Svelte 5
let { onToggle }: Props = $props();
onToggle?.(show);
```

DOM events lose the colon: `on:click={toggle}` becomes `onclick={toggle}`. With callback props also starting with `on`, `onclick` and `onToggle` sit side by side at the call site and read the same way.

### Reactivity

Svelte 4's `$:` did several different jobs, and Svelte 5 splits them up. Most of a migration is deciding which job each `$:` was doing:

- A value computed from other values, like `$: isExpanded = show && !disabled`, becomes `const isExpanded = $derived(show && !disabled)`.
- A block that runs again when its inputs change becomes an `$effect`.
- A `$:` that doesn't depend on anything reactive never needed to be reactive, and becomes a plain statement.

The skill asks for effects to be named functions:

```ts
$effect(function resetScrollOnExpand() {
	if (isExpanded && containerEl) containerEl.scrollTop = 0;
});
```

The name says why the effect exists, which a bare arrow function doesn't, and it shows up in stack traces when the effect throws.

### When effects run: `$effect` and `$effect.pre`

Turning a `$:` block into `$effect` changes when the code runs, and in a few places during the migration that mattered.

In Svelte 4, a `$:` block runs as part of an update, before Svelte changes the DOM. It also runs once while the component is first created, before anything is on screen, and it runs during server-side rendering too.

In Svelte 5, `$effect` runs after the DOM has been updated. Its first run happens after the component is on the page, at the same point as `onMount`, and it never runs on the server.

Most of the time that difference doesn't matter, and running after the DOM update is what you want: an effect that talks to the outside world, like a timer, a video element or a third-party library, should see the finished DOM. It matters when the block was fixing up state that the template is about to render.

Take a video player that shows an error message when a video fails to load. When the source changes, the old error should go away. In Svelte 4 that was a `$:` block, and it cleared the error before the new source was rendered. As a plain `$effect`, the order flips: Svelte first renders the new source with the old error still showing, then the effect clears the error and Svelte renders again. For one frame, the error from the previous video sits on top of the new one.

`$effect.pre` brings back the old timing. It runs before the DOM updates, so the error is already cleared when the new source is rendered:

```svelte
<script lang="ts">
	import { untrack } from 'svelte';

	let { src }: Props = $props();
	let error = $state<string | null>(null);

	let previousSrc = untrack(() => src);
	$effect.pre(function resetErrorForNewSource() {
		if (src === previousSrc) return;
		previousSrc = src;
		error = null;
	});
</script>

{#if error}
	<p>{error}</p>
{/if}
<video {src} onerror={() => (error = "This video couldn't be loaded")}></video>
```

The other classic case is reading the DOM before it changes. A chat window that keeps itself scrolled to the bottom needs to check whether you were at the bottom before the new message is added, because afterwards the answer is always no. That check goes in `$effect.pre`.

The same split replaces Svelte 4's lifecycle functions. `beforeUpdate` and `afterUpdate` don't work in components that use runes:

| Svelte 4       | Svelte 5                                                      |
| -------------- | ------------------------------------------------------------- |
| `beforeUpdate` | `$effect.pre`                                                 |
| `afterUpdate`  | `$effect`                                                     |
| `onMount`      | `onMount`, or an `$effect` that runs once                     |
| `onDestroy`    | `onDestroy`, or the function an `$effect` returns for cleanup |

The order to reach for them in: `$derived` for anything computed from other values, `$effect` for anything that touches the outside world, and `$effect.pre` only when state has to be fixed before the template renders, or the DOM has to be read before it changes.

One more thing to check during a migration: a `$:` block that produced something the server-rendered page needs can't become an effect at all, because effects don't run on the server. That one has to become `$derived`.

### Classes

Svelte 5 accepts arrays and objects in `class` directly, in the same format as the `clsx` library. The skill says to drop `clsx` and use the built-in version:

```svelte
<!-- Svelte 4 -->
<div class={clsx('flex', { 'opacity-50': disabled })}>

<!-- Svelte 5 -->
<div class={['flex', disabled && 'opacity-50']}>
```

### Slots

Slots become snippets. The default slot is a `children` prop, rendered with `{@render}`. Named slots become more snippet props, and the skill asks for their names to start with `children` (`childrenFooter`, `childrenHeader`) so they're easy to spot in a component's props:

```svelte
<!-- Svelte 4 -->
<slot {toggle} {show} />
<slot name="footer" />

<!-- Svelte 5 -->
{@render props.children?.(toggle, show)}
{@render props.childrenFooter?.()}
```

Data a slot used to pass back to its parent (`<slot {toggle} />`) becomes arguments to the snippet, typed as `Snippet<[toggle: () => void, show: boolean]>`.

### House rules

Not every rule is about Svelte itself. The skill also has a few of the project's own conventions, like how bound elements are named (`containerEl`, `inputEl`). Rules like these are the part Claude has no way of guessing, so they're the most useful thing a skill can contain.

## The mapping table

The end of the skill is a table Claude can follow line by line while migrating. A shortened version:

| Svelte 4                                    | Svelte 5                                               |
| ------------------------------------------- | ------------------------------------------------------ |
| `export let foo`                            | `let { foo, ...props } = $props()`                     |
| `createEventDispatcher()` + `dispatch('x')` | Callback prop `onX?.()`                                |
| `on:click={handler}`                        | `onclick={handler}`                                    |
| `$: x = expr`                               | `const x = $derived(expr)`                             |
| `$: { sideEffect() }`                       | `$effect(function descriptiveName() { sideEffect() })` |
| `$: if (cond)` with no reactive inputs      | A plain `if (cond)`                                    |
| `$:` fixing state before the next render    | `$effect.pre(function descriptiveName() { ... })`      |
| `clsx('base', { x: bool })`                 | `class={['base', { x: bool }]}`                        |
| `<slot />`                                  | `{@render props.children?.()}`                         |
| `<slot name="footer" />`                    | `{@render props.childrenFooter?.()}`                   |

After the table comes a checklist, in the order the work should happen:

1. Search for `bind:` on the component to find props that need `$bindable()`.
2. Move the props to `$props()` with an `interface Props`.
3. Replace event dispatchers with `on` + verb callback props.
4. Turn each `$:` into `$derived`, a named `$effect` or a plain statement.
5. Replace `clsx` with class arrays.
6. Turn slots into `children` snippets.
7. Run the type checker.

The order matters. Finding the bound props first means step 2 gets them right the first time, and the type checker at the end catches the props and snippets whose types no longer line up.

## Why a skill and not a prompt

All of this could be pasted into a chat each time. With the skill in the repository, nobody has to. Claude picks it up as soon as someone asks to migrate a component, and every component comes out following the same rules, whoever ran the migration.
