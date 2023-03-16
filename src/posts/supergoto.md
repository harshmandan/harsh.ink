---
title: 'supergoto: a better way to manage URL state in SvelteKit'
date: '16-03-2023'
updated: '16-03-2023'
categories:
  - 'sveltekit'
  - 'open-source'
excerpt: A small wrapper around SvelteKit's goto that carries search params, hash state and redirects across navigation, so you don't have to build URLs by hand.
npm_url: https://www.npmjs.com/package/supergoto
source_url: https://github.com/harshmandan/supergoto
---

Reading the URL in SvelteKit is easy. `$page.url.searchParams` gives you the query string, and `$page.url.hash` gives you the hash. Keeping them when you navigate is harder. `goto` takes a URL string, and anything you want on that URL, you have to build yourself.

That means the same few lines show up all over an app: copy the current query string so filters survive a page change, add a param, put a `redirectTo` on the login link, squeeze some state into the hash. supergoto is a wrapper around `goto` that turns each of those into an option. It was my first npm package.

## The idea

supergoto takes the same arguments as `goto`, so every existing call keeps working when you swap the import. On top of `goto`'s own options, it adds a few for the URL:

```ts
interface SupergotoOptions {
	// everything goto already accepts
	replaceState?: boolean;
	noScroll?: boolean;
	keepFocus?: boolean;
	invalidateAll?: boolean;
	state?: any;

	// added by supergoto
	preserveSearchParams?: boolean; // keep the current ?query on the new URL
	preserveHashParams?: boolean; // keep the current #hash on the new URL
	searchParams?: Record<string, any>; // add search params
	hashParams?: object; // put an object in the hash
	preserveUrlForRedirection?: boolean; // add ?redirectTo=<current page>
}
```

Each call says what should happen to the URL, and the URL building lives in one place instead of in every component.

## Before and after

### Keeping filters when you navigate

A search page with filters in the query string, like `/shoes?size=9&sort=price`, links to a product. The back link on the product page should return to the same filtered list.

Without supergoto, you copy the query string over yourself:

```ts
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

goto(`/shoes${get(page).url.search}`);
```

With it:

```ts
import { supergoto } from 'supergoto';

supergoto('/shoes', { preserveSearchParams: true });
```

### Adding search params

Going to the second page of results:

```ts
// before
goto(`/results?${new URLSearchParams({ page: '2', sort: 'newest' })}`);

// after
supergoto('/results', { searchParams: { page: 2, sort: 'newest' } });
```

### Sending people back after they log in

A page that needs a logged-in user sends visitors to `/login`, and the login page should send them back afterwards. The usual way is a `redirectTo` param with the current page in it:

```ts
// before
const redirectTo = `${location.origin}${location.pathname}`;
goto(`/login?${new URLSearchParams({ redirectTo })}`);

// after
supergoto('/login', { preserveUrlForRedirection: true });
```

### Passing state in the hash

The hash is a handy place for state that shouldn't go to the server, like a draft being passed to an editor page. The catch with `JSON.stringify` is that anything that isn't a string, number or plain object comes back different. A `Date` comes back as a string, and a `Map` comes back as an empty object.

```ts
// before
const draft = { title: 'Untitled', savedAt: new Date() };
goto(`/editor#${encodeURIComponent(JSON.stringify(draft))}`);

// on the editor page
const draft = JSON.parse(decodeURIComponent(location.hash.slice(1)));
draft.savedAt; // a string now, not a Date
```

supergoto serializes the hash with [devalue](https://github.com/Rich-Harris/devalue), the library SvelteKit itself uses to send data from the server to the browser. It keeps the types:

```ts
// after
supergoto('/editor', { hashParams: { title: 'Untitled', savedAt: new Date() } });

// on the editor page
import { getParsedHashParams } from 'supergoto';

const draft = getParsedHashParams() as Draft;
draft.savedAt; // still a Date
```

## Reading params back

Two small helpers cover the other side. `getURLSearchParams()` returns the query string as a plain object, and `getParsedHashParams()` returns whatever was put in the hash, with its types.

To change the URL without calling `supergoto`, there's `updateURLHashParams()` and `updateURLSearchParams()`. Both merge new values into what's already there, or replace it with `{ replace: true }`. The hash one updates in place. The search one sets `location.search`, so the browser reloads the page.

## Checking the URL first

Navigation URLs often come from somewhere you don't control, like a `redirectTo` param that anyone can edit. supergoto checks the protocol before navigating and refuses `javascript:` and `script:` URLs, so a crafted link can't run code through a redirect.

## What's next

The first version only covers `goto`. The next thing I want is an `href` helper for `<a>` tags, so links and `goto` calls build URLs the same way. The URL handling doesn't depend on Svelte either, only the final `goto` call does, so a version that works outside SvelteKit wouldn't take much.

## Try it

```sh
npm i supergoto
```

```ts
import { supergoto } from 'supergoto';
```

The source is on [GitHub](https://github.com/harshmandan/supergoto), under the MIT license.
