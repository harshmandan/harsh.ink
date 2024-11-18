---
title: 'How to port a SvelteKit website to Leptos'
date: '18-11-2024'
updated: '17-11-2026'
categories:
  - 'rust'
  - 'sveltekit'
excerpt: How each part of a SvelteKit app maps to Leptos, and why I wouldn't do the port again.
---

I spent most of a year on a website the team was porting from SvelteKit to [Leptos](https://leptos.dev), a Rust framework that renders pages on the server and then hydrates them in the browser with WebAssembly. I joined after the port had started, and most of my work was UI: popups, overlays, empty states, and a mute button that needed its own fix for Safari.

Below is what each part of a SvelteKit app turns into in Leptos. The examples use Leptos 0.6, the version I started on. Later versions changed some of the APIs, signals and resources in particular, but the overall shape is the same.

## Project setup

A SvelteKit app is one Vite build with an adapter. A Leptos app is built by `cargo-leptos`, which compiles the same crate twice: once as a server binary and once as a WASM bundle for the browser. Two Cargo features, `ssr` and `hydrate`, decide which build you're in:

```toml
[features]
hydrate = ["leptos/hydrate", "leptos_meta/hydrate", "leptos_router/hydrate"]
ssr = ["dep:axum", "dep:tokio", "dep:leptos_axum", "leptos/ssr", "leptos_meta/ssr", "leptos_router/ssr"]
```

This is the first big difference in how you think about the code. SvelteKit decides what's server-only for you: anything in `+page.server.ts` or `$lib/server` never reaches the browser. In Leptos you mark it yourself with `#[cfg(feature = "ssr")]`, on database clients, secrets and anything that uses `tokio`. Miss one and the WASM build fails while trying to compile a database driver for the browser. After a while you start reading every `use` statement and asking which side of the wire it belongs on.

## Routing

SvelteKit builds routes from folders. Leptos has a router built in, `leptos_router`, and you declare routes in code:

```rust
#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/app.css"/>
        <Router>
            <Routes>
                <Route path="" view=Layout>
                    <Route path="/" view=Home/>
                    <Route path="/profile/:id" view=Profile/>
                </Route>
            </Routes>
        </Router>
    }
}
```

A parent `<Route>` whose component renders `<Outlet/>` works like `+layout.svelte` with a `<slot />`, and `leptos_meta` gives you `<Title>` and `<Stylesheet>` in place of `<svelte:head>`. Params come from `use_params_map()` instead of `$page.params`.

Having every route in one list makes it easy to see the whole site at once. The trade-off is that a route's data, page and layout no longer sit together in one folder; they end up wherever you put them.

## Hooks

SvelteKit has `hooks.server.ts`, where `handle` runs on every request, usually to set headers or put the current user into `event.locals`. On the client, `hooks.client.ts` is often just a `handleError` that reports to an error tracker.

Leptos has no hooks file. The server is an [Axum](https://github.com/tokio-rs/axum) app that you write yourself, so the work of `handle` moves into Axum middleware, like `tower_http`'s header layers. `event.locals` becomes Leptos context, provided in the handlers that render pages and run server functions:

```rust
async fn leptos_routes_handler(State(state): State<AppState>, req: Request<Body>) -> Response {
    let handler = leptos_axum::render_route_with_context(
        state.leptos_options.clone(),
        state.routes.clone(),
        move || provide_context(state.db.clone()),
        App,
    );
    handler(req).await.into_response()
}

async fn server_fn_handler(State(state): State<AppState>, req: Request<Body>) -> impl IntoResponse {
    handle_server_fns_with_context(move || provide_context(state.db.clone()), req).await
}
```

Both handlers have to provide the same context. Page rendering and server function calls arrive through different routes, so a value you only add to one of them doesn't exist in the other, and `expect_context` panics. In a real app, this becomes two long, identical lists of `provide_context` calls that you have to keep in sync by hand.

On the client, the closest thing to `hooks.client.ts` is the `hydrate()` function that starts the app in the browser. Anything that should run once on the client, like setting up a panic hook, goes there.

## Loading data

A SvelteKit page loads its data in `+page.server.ts` and gets it as the `data` prop. In Leptos, the server side is a server function, and the page reads it through a resource:

```rust
#[server]
async fn get_profile(id: String) -> Result<Profile, ServerFnError> {
    let db = expect_context::<Db>();
    db.profile(&id).await.map_err(ServerFnError::new)
}

#[component]
fn Profile() -> impl IntoView {
    let params = use_params_map();
    let id = move || params.with(|p| p.get("id").cloned().unwrap_or_default());
    let profile = create_resource(id, get_profile);

    view! {
        <Suspense fallback=|| view! { <p>"Loading..."</p> }>
            {move || profile.get().map(|p| match p {
                Ok(p) => view! { <h1>{p.name}</h1> }.into_view(),
                Err(_) => view! { <p>"Not found"</p> }.into_view(),
            })}
        </Suspense>
    }
}
```

`#[server]` turns the function into an endpoint and gives the browser a function that calls it, so the same `get_profile` runs directly during server rendering and over HTTP after hydration. The `Profile` struct is shared by both sides, so the server and the client can't disagree about its shape. This is the nicest part of having Rust on both sides. In SvelteKit you get close with shared TypeScript types, but here the compiler checks it end to end.

## Tailwind

In SvelteKit, Tailwind runs as a PostCSS plugin inside Vite. With Leptos, `cargo-leptos` runs the Tailwind CLI itself, from a `tailwind-input-file` set in `Cargo.toml`. The only real change is that Tailwind's `content` setting has to point at your `.rs` files, since that's where the class names live now.

The usual Tailwind rule still applies: it only finds class names written out in full, so a class built with `format!("bg-{color}-500")` never makes it into the CSS. The difference I felt every day was speed. In SvelteKit, changing a class shows up almost instantly. In Leptos, the class lives in a Rust file, so changing it means waiting for a Rust rebuild.

## Components

A Svelte component is a file with props and slots. A Leptos component is a function with the `#[component]` attribute, and its props are the function's arguments:

```rust
#[component]
pub fn Button(
    #[prop(default = "primary")] variant: &'static str,
    #[prop(optional)] on_click: Option<Callback<ev::MouseEvent>>,
    children: Children,
) -> impl IntoView {
    let class = match variant {
        "ghost" => "px-4 py-2 rounded text-white/80 hover:bg-white/10",
        _ => "px-4 py-2 rounded bg-pink-600 text-white",
    };

    view! {
        <button class=class on:click=move |ev| {
            if let Some(on_click) = on_click { on_click.call(ev) }
        }>
            {children()}
        </button>
    }
}
```

`children: Children` is the default slot. Things that are one word in Svelte take more setup here. Forwarding a click is a bare `on:click` in Svelte, and here it's an optional `Callback` prop. Named slots exist (`#[slot]`), but each one is its own struct. Since most of my work was components, this is where I felt the extra ceremony the most. None of it is hard, but a small popup in Leptos takes noticeably more code than the same popup in Svelte.

## Shared libraries

A SvelteKit monorepo shares components and types through workspace packages. In Leptos it's a Cargo workspace, with shared components and constants in their own crates.

The catch is that every crate that uses Leptos has to forward the `ssr` and `hydrate` features, so it's compiled the same way as the app using it:

```toml
# ui/Cargo.toml
[features]
ssr = ["leptos/ssr"]
hydrate = ["leptos/hydrate"]

# app/Cargo.toml
[features]
ssr = ["leptos/ssr", "ui/ssr"]
hydrate = ["leptos/hydrate", "ui/hydrate"]
```

Miss one and the error rarely points at the missing feature. It's easy to set up once, and easy to forget on the next crate.

## State management

Svelte has stores and context. Leptos has signals and context, and they work almost the same way: put the signals in a struct, provide it near the top of the app, and read it further down.

```rust
#[derive(Clone, Copy)]
pub struct ThemeState {
    pub dark: RwSignal<bool>,
}

impl ThemeState {
    pub fn provide() {
        provide_context(Self { dark: create_rw_signal(false) });
    }

    pub fn get() -> Self {
        expect_context()
    }
}
```

That's the same [getter/setter pattern I use in Svelte](/blog/svelte-state-management). `App` runs once per request on the server, so context provided there belongs to that request. A Rust `static`, on the other hand, is shared by every request, the same way a module-level store is in SvelteKit, so per-user data doesn't belong in one.

In 0.6, signals are `Copy`, which makes passing them into closures painless. The thing that takes getting used to is `move ||`. You write it in front of nearly every dynamic value in a view, because a closure is how Leptos knows which part of the page to update.

## The workarounds

Leptos 0.6 needed a fair number of workarounds. These are some of the common ones from that time, with what the Leptos issue tracker and docs suggested for each.

### Pin your nightly toolchain

Leptos has a `nightly` feature that lets you call signals like functions (`count()` instead of `count.get()`), and it needs nightly Rust. Nightly Rust sometimes breaks things. In February 2024, a nightly release made [server functions crash in the browser](https://github.com/leptos-rs/leptos/issues/2377) when a response contained characters like `€` or an en dash. That's a real problem on a site full of user-written text. The fix was to pin the previous nightly in `rust-toolchain.toml`. Our project pinned a dated nightly as well.

### Keep server and browser output identical

If the server renders different HTML from what the browser expects, hydration fails. Using `cfg!` to render something only in the browser, or touching browser APIs like `localStorage` during render, both cause it. The Leptos book has [a whole chapter on hydration bugs](https://book.leptos.dev/ssr/24_hydration_bugs.html), and its fix for browser-only code is to move it into an effect, since effects only run in the browser. Even invalid HTML can break it: the browser adds a `<tbody>` to a table that doesn't have one, and the DOM no longer matches.

### Don't dispatch an action while rendering

Calling a server action during the first render [panicked on the server](https://github.com/leptos-rs/leptos/issues/2225). The suggested pattern is to load the data with a resource and let the action refetch it:

```rust
// `id` comes from the route params, as in `Profile` above
let save = create_server_action::<SaveProfile>();
let profile = create_resource(
    move || (id(), save.version().get()),
    |(id, _)| get_profile(id),
);
```

### Turn off file hashing in development

With `hash-files` enabled, `cargo-leptos` [stopped picking up new Tailwind classes](https://github.com/leptos-rs/cargo-leptos/issues/271) until you restarted it. The workaround from the issue is to leave `hash-files = false` in `Cargo.toml` and set `LEPTOS_HASH_FILES=true` only for release builds. Our config had `hash-files = false` too.

### Live without real hot reload

`cargo-leptos` can patch the markup inside `view!` macros without a rebuild, but any change to logic means a full rebuild and a page reload, and whatever state the page was in is gone. There's a long-running [issue about proper HMR](https://github.com/leptos-rs/leptos/issues/2379) with some experiments in it, but nothing you could rely on.

## Was it worth it?

In hindsight, no.

Using Rust on the front end is nice if Rust is already everywhere else. Sharing types between the server and the browser is a real benefit, and the compiler catches mistakes that would be runtime errors in TypeScript. But Leptos wasn't built for the kind of site we were porting, and on 0.6 it was buggy. The list above is only some of the workarounds.

The developer experience was the bigger problem. SvelteKit's is far better. Slow Rust builds and hot reloading that kept breaking made day-to-day work straight-up painful. A tweak that takes seconds to check in SvelteKit meant waiting on a rebuild in Leptos.

It also has to load a large WASM file before the page becomes interactive. That's the same problem as a big React bundle, and there's only so much you can trim from it. If the reason to put Rust in the browser is heavy computation, a web worker can move that work off the main thread without changing the whole framework.

So unless you're set on using Rust everywhere, there's no need to use Leptos for a website. SvelteKit does the job better.
