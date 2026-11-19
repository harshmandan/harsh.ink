---
title: 'The best way to manage state in Svelte'
date: '20-07-2023'
updated: '20-07-2023'
categories:
  - 'svelte'
excerpt: Sharing state in Svelte and SvelteKit with stores inside context, wrapped in typed getter and setter functions.
---

Put the signed-in user in a module-level store and SvelteKit can show one user's data to another. The server keeps a single copy of that store for every request. Context fixes that, but a plain value in context isn't reactive, and a typo in a string key gives you `undefined` instead of an error.

Here's the pattern I use for shared state in Svelte 4 and SvelteKit.

## The pattern

One file per context. It owns a private key, a setter that builds the context, and a getter that reads it.

```ts
// src/lib/contexts/teamContext.ts
import { getContext, setContext } from 'svelte';
import { derived, writable } from 'svelte/store';
import type { Team } from '$lib/types';

const KEY = Symbol('team');

export function setTeamContext(initial: Team) {
	const team = writable(initial);
	const memberCount = derived(team, ($team) => $team.members.length);

	const context = {
		team,
		memberCount,
		rename(name: string) {
			team.update((t) => ({ ...t, name }));
		}
	};

	return setContext(KEY, context);
}

export type TeamContext = ReturnType<typeof setTeamContext>;

export function getTeamContext() {
	const context = getContext<TeamContext | undefined>(KEY);
	if (!context) {
		throw new Error('getTeamContext() needs setTeamContext() in a parent component');
	}
	return context;
}
```

A layout sets it once, from data it already has:

```svelte
<!-- src/routes/[teamId]/+layout.svelte -->
<script lang="ts">
	import { setTeamContext } from '$lib/contexts/teamContext';

	export let data;

	const { team } = setTeamContext(data.team);
	$: team.set(data.team);
</script>

<slot />
```

Any component below it reads it:

```svelte
<!-- src/lib/components/TeamHeader.svelte -->
<script lang="ts">
	import { getTeamContext } from '$lib/contexts/teamContext';

	const { team, memberCount, rename } = getTeamContext();
</script>

<h1>{$team.name}</h1>
<p>{$memberCount} members</p>
<button on:click={() => rename('New name')}>Rename</button>
```

The setter's return value is the context, so the layout can use the same stores it just handed down. The `$:` line keeps the store in sync when `data.team` changes on navigation, since SvelteKit reuses the layout instead of mounting it again.

That's the whole pattern. The rest of this post is why each part is there.

## Global stores leak between requests

The first thing most people reach for is a store in a module:

```ts
// src/lib/stores/user.ts
export const user = writable<User | null>(null);

// src/routes/+layout.ts
export async function load({ fetch }) {
	const res = await fetch('/api/me');
	user.set(await res.json());
}
```

In the browser this works, because each tab gets its own copy of the module. On the server it doesn't. The module is loaded once per server process, so every request the server handles shares one `user` store.

Requests interleave at every `await`. Alice's `load` sets the store, then Bob's `load` sets it again before Alice's page renders. Alice's page now shows Bob. Any page that reads the store without setting it first shows whoever was there last.

The [SvelteKit docs](https://svelte.dev/docs/kit/state-management) say this directly: servers are shared and long-lived, so don't keep per-user data in shared variables, and keep `load` free of side effects like writing to a store. Their fix is the same one this post uses: context, which is created per component tree, and so per request.

A module-level store is fine for state that really is global and only exists in the browser, like a theme preference read from `localStorage`. It isn't fine for anything tied to one user or one page.

## Context alone isn't reactive

Context solves the per-request problem, but a plain value in context isn't reactive:

```svelte
<!-- Counter.svelte -->
<script>
	import { setContext } from 'svelte';
	import Display from './Display.svelte';

	let count = 0;
	setContext('count', count);
</script>

<button on:click={() => count++}>+1</button>
<Display />

<!-- Display.svelte -->
<script>
	import { getContext } from 'svelte';
	const count = getContext('count');
</script>

<p>{count}</p>
```

`Display` shows `0` forever. `setContext` runs once, during initialisation, and stores the value `count` had at that moment. Later assignments to `count` in the parent never reach it.

The fix is to put a store in context instead of a value: `const count = writable(0)` in `Counter`, and `{$count}` in `Display`. Then context answers "which instance?", and the store handles updates.

Context also only flows down. A child can call `setContext`, but only its own descendants see it, never its parent or siblings. So the component that owns the state should be the one that sets it.

## String keys fail late

Once stores are in context, the next shortcut is to call `setContext` and `getContext` directly wherever they're needed:

```svelte
<!-- src/routes/[teamId]/+layout.svelte -->
<script lang="ts">
	setContext('locale', writable(data.locale));
</script>

<!-- four folders away -->
<script lang="ts">
	const locale = getContext<Writable<string>>('locale');
</script>
```

This works, but only by convention.

The key is a magic string. A typo like `'Locale'` doesn't fail; `getContext` returns `undefined`, and you find out when something renders blank. Two unrelated parts of the app can also both pick `'locale'`. Whichever is set closer to the component wins, and nothing warns you.

`getContext<Writable<string>>` is also just a cast. If the layout changes the context to a plain string, every consumer still compiles and breaks at runtime, and the only way to find them is to search for the key.

The worst case is a missing provider. Render the component without the layout above it, in a test or a Storybook story, and `getContext` returns `undefined`. The error shows up later as `Cannot read properties of undefined`, far from the real cause.

That's what the getter/setter file is for. The key is a private `Symbol`, which is unique even when two symbols share a name, so it can't collide with anything. The type comes from `ReturnType<typeof setTeamContext>`, so it can't drift from what the setter builds. And the check in `getTeamContext()` turns that late `undefined` into an error that names the function you forgot to call.

## When a bare key is fine

There's one place where calling `setContext` and `getContext` directly with a shared key is reasonable: a group of components that only work together, like a menu and its items.

```ts
// src/lib/components/menu/menuContext.ts
export const MENU_KEY = Symbol('menu');
export type MenuContext = { checklist: boolean; close: () => void };
```

```svelte
<!-- Menu.svelte -->
<script lang="ts">
	import { setContext, createEventDispatcher } from 'svelte';
	import { MENU_KEY, type MenuContext } from './menuContext';

	export let checklist = false;
	const dispatch = createEventDispatcher();
	setContext<MenuContext>(MENU_KEY, { checklist, close: () => dispatch('close') });
</script>

<ul role="menu"><slot /></ul>

<!-- MenuItem.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { MENU_KEY, type MenuContext } from './menuContext';

	const menu = getContext<MenuContext>(MENU_KEY);
</script>

<li role="menuitem">
	{#if menu.checklist}<input type="checkbox" />{/if}
	<slot />
</li>
```

`MenuItem` is never used outside a `Menu`, and the key never leaves the `menu/` folder. Once an unrelated part of the app needs to read it, it has outgrown this and needs a getter/setter file.

## Call the getter at the top of the script

Context belongs to the component that is being created, so `getContext` and `setContext` only work while Svelte is initialising a component. Call one later and Svelte throws `Function called outside component initialization`:

```svelte
<script>
	import { onMount } from 'svelte';
	import { getTeamContext } from '$lib/contexts/teamContext';

	export let open = false;

	// Works: runs during init
	const { team } = getTeamContext();

	// Breaks: runs again after init, whenever `open` changes
	$: if (open) {
		const { team } = getTeamContext();
	}

	// Breaks: runs after init
	onMount(async () => {
		await somethingSlow();
		const { team } = getTeamContext();
	});
</script>
```

So call the getter once, at the top, and use `$team` wherever you need it later. Destructuring there has another benefit: `$team` only works on a top-level variable. You can't write `$context.team`, so pulling the stores out by name is what lets you use the `$` prefix at all.

## Testing with the setter

The setter is also the test helper. A component that calls `getTeamContext()` needs a parent that called `setTeamContext()`, so the test renders a small wrapper:

```svelte
<!-- TeamHeader.test.svelte -->
<script lang="ts">
	import { setTeamContext } from '$lib/contexts/teamContext';
	import TeamHeader from './TeamHeader.svelte';
	import type { Team } from '$lib/types';

	export let team: Team;

	setTeamContext(team);
</script>

<TeamHeader />
```

The test builds the context the same way the app does, through the same function. There's no key to import and no context shape to fake. Each test also gets a fresh context, where a module-level store would carry whatever the previous test left in it.

## Organising context files

Where a context file lives depends on who uses it. In a larger app it ends up looking like this:

```
src/
├── lib/
│   ├── contexts/                       # used across the app
│   │   ├── userContext.ts
│   │   ├── teamContext.ts
│   │   └── projectContext.ts
│   └── components/
│       ├── menu/
│       │   ├── Menu.svelte             # sets menuContext
│       │   ├── MenuItem.svelte
│       │   └── menuContext.ts          # only used inside menu/
│       └── player/
│           ├── Player.svelte           # sets playerContext
│           └── playerContext.ts
└── routes/
    └── (app)/
        ├── +layout.svelte              # setUserContext()
        └── [teamId]/
            ├── +layout.svelte          # setTeamContext()
            └── [projectId]/
                └── +layout.svelte      # setProjectContext()
```

App-wide contexts go in `src/lib/contexts/`, and each one is set by the layout for the part of the URL it belongs to. The user context is set at the top, the team context in `[teamId]/+layout.svelte`, and the project context one level below that. The nesting follows the URL, so a project page always has a team and a user above it.

That also means a setter can read its parent's context:

```ts
// src/lib/contexts/projectContext.ts
export function setProjectContext(initial: Project) {
	const { team } = getTeamContext();
	// ...build project stores that depend on the team
}
```

Contexts for a component live next to the component. `Menu` and its items share `menuContext.ts` in their own folder. `Player` sets its own context, so two players on one page each get their own state, which a module-level store can't do.

## Where state should live

Context plus stores is for state that a part of the component tree shares. Plenty of state belongs somewhere else:

| State                                                      | Where it goes                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Filters, sort order, the open tab                          | The URL, so it survives a reload and the server can render it    |
| Data from the server                                       | `load`, returned as `data`, never written into a store in `load` |
| Shared by a layout and the components below it             | A getter/setter context file holding stores                      |
| Shared by a small group of components that belong together | A shared symbol key in the components' folder                    |
| Used by one component                                      | A `let` in that component                                        |
| Browser-only and truly global, like a theme                | A module-level store                                             |

## Update: `createContext` in Svelte 5

October 2025: Svelte 5.40 added [`createContext`](https://svelte.dev/docs/svelte/context), which returns this getter/setter pair for you, with a getter that throws when nothing has been set. It's the same pattern, now built in.
