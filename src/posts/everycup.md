---
title: 'EveryCup: track all your coffee brews'
date: '14-07-2026'
updated: '14-07-2026'
categories:
  - 'sveltekit'
excerpt: A coffee logbook that works offline without an account, has a timer you can start and stop by clapping or saying "go" and "stop", and shows how other people brew the same beans on similar gear.
link: https://everycup.in
---

[EveryCup](https://everycup.in) is a coffee logbook. You log every brew you make (dose, grind, yield, time, temperature, milk) and rate it out of 10 with tasting notes. You can log the cups you buy too, like the flat white at a café, with where you drank it and what it cost. Then you can look up a bean and see how other people dial it in on gear like yours.

I built it after buying an espresso machine and a grinder. I didn't really know what kind of coffee I liked yet, so I was trying all sorts of beans, dialing each one in and making notes on which ones I liked and which I didn't. I wanted one place to keep track of all of it. I also wanted to see what other people were doing: people with the same gear as me, and, once I found a bean I liked, people with similar taste who could point me to new ones.

<img class="screenshot" src="/images/blog/everycup/landing.webp" alt="The EveryCup landing page: a coffee cup logo, the line 'Track every cup', and a list of features with a Get started button" loading="lazy" />

It's a web app built with SvelteKit, and you can install it on your phone like a native app. It started on 24 June 2026 under the name "brewdex", and became EveryCup on 11 July.

## What I wanted from it

Plenty of apps can log a brew and work out the ratio. I wanted a few things on top of that:

- **Other people's brews, not just mine.** When I open a new bag, someone has probably already dialed in the same beans on similar gear. I wanted to start from their recipe.
- **A timer I don't have to touch**, since my hands are busy while I'm brewing.
- **The coffee I drink out, too**, so the café cups sit next to the ones I make.
- **No app store and no account.** A web app that works on any phone, and works without signing up.

## Offline and private

EveryCup works fully offline, with no account. Everything you log stays on your phone, so the app works the same with no signal and nothing leaves your device unless you choose. Signing in is optional and only adds syncing between devices and sharing to Discover. If you sign in later, everything you've already logged comes with you.

## Hands-free timer

When you're brewing, your hands are busy, so the timer can be started and stopped without touching the phone. It works offline too.

<img class="screenshot" src="/images/blog/everycup/timer.webp" alt="The EveryCup brew timer at 0:00.0, with a large play button and a 'Hands-free stop' toggle below it" loading="lazy" />

**Clap mode** listens to how loud the room is and stops the timer at a sharp sound: a clap, a shouted "stop", or a cup clinking down on the counter. Every kitchen is different, so a live sound bar shows the current loudness, and you can move the threshold until a clap triggers it and the background noise doesn't.

**Word mode** listens for "go" to start and "stop" to stop. It uses Google's speech-commands model, a small speech recognition model that runs in the browser with TensorFlow.js. It downloads once (about 6 MB) the first time you turn voice on, and then works offline.

In both modes, the audio never leaves the phone.

## Discover

Discover is where the "every cup" part comes in. It shows which beans are popular this week and what people have brewed recently. Search for a bean, and it shows how other people brewed it, filtered to people with a grinder and brewer like yours. If a recipe looks good, "use as starting point" copies it into your own log, so you can start from someone else's dial-in instead of from nothing.

<img class="screenshot" src="/images/blog/everycup/discover.webp" alt="EveryCup's Discover page: a 'Popular this week' row of beans with brew counts and average scores, and a 'Fresh from the community' feed of brews with their grinder, brewer, recipe and tasting notes" loading="lazy" />

Each bean also gets its own page. At the top is a general starting point for each brew method (a ratio, grind size, temperature and time to aim for), and below it, everyone who is dialing that bean in, with their full recipes.

<img class="screenshot" src="/images/blog/everycup/bean-dialing.webp" alt="An EveryCup bean page scrolled to 'Who's dialing it in': recipes from other people for the same bean, each with drink, grinder, brewer, grind, dose, water, time, ratio and temperature" loading="lazy" />

_The Discover screenshots use sample brews from a local test database._

It only works if people share, so sharing to Discover is switched on by default for signed-in users and can be turned off in settings. It also matches beans and gear exactly, so with only a few users it can look empty. The plan is to seed it with starter recipes for common beans.

## Moderating a shared catalog

Discover only works if everyone points at the same list of roasters, coffees and gear, and that list comes from users. Anyone can add anything, and left alone, a community catalog fills up with typos, duplicates and junk fast. Moderating it is hard, and I didn't want adding a new bean to feel like filing a request.

So anything you add is visible straight away, but only to you. It shows up in your own pickers and you can log brews with it. Nobody else sees it until an admin approves it.

That approval happens in an admin panel inside the app, with tabs for roasters, coffees, gear and beta feedback. Each pending entry can be approved, edited or deleted.

<img src="/images/blog/everycup/admin.webp" alt="EveryCup's admin moderation panel on a laptop-sized screen: the app sidebar on the left, tabs for Roasters, Coffees, Gear and Feedback, a search box with a pending-only toggle, and a list of roasters with edit and delete buttons" loading="lazy" />

The trickiest part is duplicates. Two people adding exactly the same roaster are merged automatically. Typos aren't, so the panel compares each pending entry with the approved catalog and suggests a match: "XYZ Rosters" gets a one-tap "Merge into XYZ Roasters" button, and every brew that used the typo is moved over.

The decisions are simple enough (approve, fix, merge or delete) that you could point an LLM at the queue as a first-pass judge, and only check the ones it isn't sure about.

## How it's built

The app is SvelteKit. On the phone, everything is stored with [Dexie](https://dexie.org), a wrapper around the browser's IndexedDB database, and the app only ever reads from that local copy. When you're online, a sync step sends your changes up and pulls everyone else's down: when the connection comes back, when you switch back to the app, and once a minute while it's open. If the same record was changed in two places, the most recent edit wins.

The server is [PocketBase](https://pocketbase.io), a backend in a single file: sign-in, a SQLite database and file storage in one program. It runs on a small VPS behind Caddy, which handles HTTPS, and it's backed up every night. Photos and the voice model are stored on Cloudflare R2, which doesn't charge for downloads. Deploying is a push to the main branch.

## Making it work on iPhone

As always, Safari needed some extra hand-holding. Two things only broke on iPhone.

**Clap mode did nothing.** The app set up its audio processing before the user had tapped anything, and Safari keeps audio switched off until a tap. So on iPhones the timer was listening to silence. It now switches the audio back on when the timer starts listening.

**Safari deletes a web app's data after seven days unused.** For someone who isn't signed in, that's their whole coffee history. So after you log your first brew, the app asks the browser to keep its storage permanently.

You can try EveryCup at [everycup.in](https://everycup.in). It's in beta, and there's a feedback button on every page.
