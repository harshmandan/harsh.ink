---
title: 'svelte-emplace: portals without moving the DOM'
date: '12-08-2026'
updated: '12-08-2026'
categories:
  - 'svelte'
  - 'open-source'
excerpt: A portal component for Svelte 5 that mounts content at its destination instead of rendering it in place and moving the DOM node.
link: https://svelte-emplace.harsh.ink
npm_url: https://www.npmjs.com/package/svelte-emplace
source_url: https://github.com/harshmandan/svelte-emplace
---

<iframe class="demo-frame wide" src="https://svelte-emplace.harsh.ink" title="svelte-emplace demo" loading="lazy"></iframe>

A portal shows a piece of UI somewhere other than where you wrote it. You write a modal inside the button that opens it, and it ends up at the end of `<body>`, out of reach of the parent's `overflow: hidden` and stacking order. Tooltips, toasts and dropdown menus usually work the same way.

A common way to build one, and the way libraries like [svelte-portal](https://www.npmjs.com/package/svelte-portal) do it, is to render the content where you wrote it and then move the DOM node to its target. Most of the time that's fine. But the move causes a few problems:

- **Positioning runs too early.** Code that measures the element's parent, like a positioning helper, runs when the element mounts, which is before the move. It measures the wrong parent and doesn't run again.
- **Things inside reset.** The browser treats a re-inserted node as new, so an iframe reloads and a focused input loses focus.
- **There's a wrapper.** Moving a node needs a handle on it, so the content gets wrapped in a `<div>`, which breaks flex and grid layouts that expect a direct child.
- **Order is whatever mounted first.** Two portals into the same target land in whichever order they happened to mount.

[svelte-emplace](https://svelte-emplace.harsh.ink) creates the content at its destination instead. Nothing is moved, so all four go away. The demo above runs svelte-portal and svelte-emplace side by side for each one.

```svelte
<script>
	import Emplace from 'svelte-emplace';
</script>

<Emplace>
	<div class="modal" transition:fade>…</div>
</Emplace>
```

Without a `to`, content goes into a shared container at the end of `<body>`. `to` can also be a name, a CSS selector or an element:

```svelte
<h1 data-emplace="title"></h1>

<Emplace to="@title">{data.title}</Emplace>
<Emplace to="#tooltips">…</Emplace>
<Emplace to={element}>…</Emplace>
```

Names take an `@` because CSS reserves `@` for at-rules, so no selector can start with one. Every other string goes straight to `querySelector`.

## Mounting at the destination

The component calls Svelte's `mount()` with the target element and passes the content along as a snippet. It's a small library with no dependencies, but a few parts only work one way, and I found each of them by testing rather than by reading the docs:

- **Mount inside an `$effect`, and unmount in that effect's cleanup.** Doing the same work at init and in `onDestroy` removes the content straight away, so the closing animation never plays.
- **Props given to `mount()` aren't live.** So the snippet travels in a `$state` object, and swapping the content updates it in place. That object is never set to empty: while the source is being torn down, the effect runs once more with no children, and passing that through would blank the destination before the outro.
- **Keep `children` out of the mounting effect.** Reading it there makes a content swap tear down and rebuild the destination, which loses DOM state and replays the intro.

Ordering uses comment nodes. Each `<Emplace>` claims a comment in the target, and its content sits between that comment and the next one. A `priority` prop decides where the comment goes, so the order holds no matter which component mounts first:

```svelte
<Emplace to="@toolbar" priority={10}><button>Save</button></Emplace>
<Emplace to="@toolbar"><button>Cancel</button></Emplace>
```

Errors are caught at the destination and thrown again from the `<Emplace>`, so they reach the `<svelte:boundary>` around the code that wrote the content, not whatever happens to wrap the target.

## Server rendering

My first version rendered portals on the server too, and it took separate In and Out components, a SvelteKit hook, a request-scoped store and a handover during hydration. Then I noticed that portaled content is almost always conditional: a modal that's closed, a toast that hasn't fired. It doesn't exist when the server renders anyway. So I dropped all of it, and the API became one component.

Server rendering is still there as an optional hook, for `@name` targets only. Selectors, elements and the body container need a real DOM, so they stay client-only:

```js
// hooks.server.js
export { emplaceHandle as handle } from 'svelte-emplace/server';
```

On the server, `<Emplace>` registers its content, and the hook renders it after the page and splices the HTML into the matching empty element. The library's own site turned up two bugs in that:

- The server copy was wrapped in a `<div>`. A `<div>` isn't allowed inside a `<p>`, so the browser moved it out of the destination, the client couldn't find it to remove, and the text showed up twice. The copy is now marked with comments, which are valid anywhere.
- The splice looked for `data-emplace="name"` with a plain string search, so it also matched the docs on the page that mention the attribute, and injected content into the middle of the prose. It now only matches inside an opening tag.

## The attachment that does move things

For a single element you already have, there's an `emplace` attachment:

```svelte
<div class="tip" {@attach emplace('@tips')}>…</div>
```

An attachment only ever gets an element that already exists, so this one has to move it. It's the one exception to creating content at its destination, and the docs say to use the component for anything with an iframe, a video or a focused input.

Moving brought back a bug the component never had. Svelte removes a block by walking the range of sibling nodes it recorded at mount. A moved node isn't in that range any more, so it survived at its destination: a dialog that wouldn't close, menus piling up. The fix leaves a comment where the node was and puts the node back on cleanup, which runs after the outro and before Svelte's walk. That fix had a bug of its own: when Svelte had already removed the node, putting it back brought dismissed content back on screen. Now it only puts back a node that's still in the document.

## Testing transitions

The tests run on `bun test` with jsdom. I tried happy-dom first, but it doesn't implement enough of the transition path, so outros produced no keyframes, and every transition test passed or failed for the wrong reason. jsdom has no Web Animations API at all, so the tests stub exactly the parts Svelte uses and record every call, to check the real keyframes.

One more trap: Svelte creates a zero-length animation for the delay before the real one. Counting animations isn't enough, because that one counts too, so the tests only count animations that have keyframes.
