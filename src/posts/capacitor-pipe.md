---
title: 'A Capacitor plugin for YouTube streams, built on NewPipe'
date: '03-07-2025'
updated: '17-11-2026'
categories:
  - 'capacitor'
  - 'open-source'
excerpt: capacitor-npe brings NewPipeExtractor, the Java library behind the NewPipe app, into a Capacitor app. It has since been rewritten in Kotlin as capacitor-pipe, with SABR support and a native player.
npm_url: https://www.npmjs.com/package/capacitor-npe
source_url: https://github.com/harshmandan/capacitor-pipe
---

_Update, November 2026: the plugin has since been rewritten as capacitor-pipe, with SABR support and a native video player. [Jump to the update](#update-capacitor-pipe)._

If you're writing a Capacitor app and you need YouTube stream URLs without using YouTube's official API, the web stack doesn't have a good answer. Android does. [NewPipeExtractor](https://github.com/TeamNewPipe/NewPipeExtractor) is the Java library behind [NewPipe](https://newpipe.net/), the open-source YouTube client for Android. It gets the stream URLs for a YouTube video without an API key or an account.

[capacitor-npe](https://www.npmjs.com/package/capacitor-npe) is the Capacitor plugin I wrote to call it from TypeScript. It has one method, `extractStreamInfo`, which returns the video's title, duration, uploader, thumbnail and view count, plus three lists of streams: video with audio, video only, and audio only. Each stream has its direct URL, its format, and its resolution or bitrate.

## Why a plugin and not a JS library

NewPipeExtractor runs on the JVM. There are JavaScript ports, but they keep breaking, because they reimplement YouTube's player decryption and YouTube keeps changing it. The Java library has the NewPipe team behind it, and they usually ship a fix within days.

A Capacitor app is a web app in a native shell, with a bridge for calling native code. So the plugin is an npm package that wraps the Java library, and `npx cap sync` pulls its Android module into your app like any other Capacitor plugin.

That's all `capacitor-npe` is: about 200 lines of Java to wire the plugin to NewPipeExtractor, a TypeScript layer for the types, and a peer dependency on `@capacitor/core` 7 or later.

## The API

```ts
import { NPE } from 'capacitor-npe';

const result = await NPE.extractStreamInfo({
	videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
});

if (result.success && result.streamInfo) {
	const { title, duration, uploader, thumbnailUrl, viewCount } = result.streamInfo;
	const { videoStreams, audioStreams, videoOnlyStreams } = result.streamInfo;
	// videoStreams[i].url is a direct stream URL you can drop into a <video src=...>
}
```

The return shape, from `src/definitions.ts`:

```ts
interface StreamInfoResult {
	success: boolean;
	error?: string;
	streamInfo?: {
		title: string;
		duration: number;
		uploader: string;
		viewCount: number;
		thumbnailUrl: string;
		videoStreams: VideoStream[]; // muxed video+audio
		audioStreams: AudioStream[]; // audio only
		videoOnlyStreams: VideoStream[]; // higher-res, need separate audio
	};
}
```

`videoStreams` are the easy ones: one URL that plays in a `<video>` tag. The catch is quality. YouTube only offers video with audio at low resolutions, usually 360p. `videoOnlyStreams` go up to 4K, but you have to combine them with an `audioStreams` URL yourself, with Media Source Extensions in the browser or ExoPlayer on Android. For a lot of apps, 360p is enough.

## Under the hood

The plugin lives at `ink.harsh.plugins.npe`. Two Java files: `NPE.java` does the extraction, `NPEPlugin.java` is the Capacitor entry point.

The interesting bit is the downloader. NewPipeExtractor doesn't come with an HTTP client. The app using it has to provide one, by implementing `org.schabi.newpipe.extractor.downloader.Downloader`. Mine uses OkHttp and copies the User-Agent and cookie the NewPipe app sends:

```java
// android/.../NPE.java - abbreviated
httpClient = new OkHttpClient.Builder()
		.readTimeout(30, TimeUnit.SECONDS)
		.connectTimeout(30, TimeUnit.SECONDS)
		.build();

Downloader downloader = new Downloader() {
	private final Map<String, String> mCookies = new HashMap<>();
	{
		mCookies.put("youtube.com", "PREF=f2=8000000"); // restricted-mode cookie, like NewPipe
	}

	@Override
	public Response execute(Request request) throws IOException {
		// NewPipe's exact User-Agent (Firefox 128.0 desktop)
		requestBuilder.addHeader("User-Agent",
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0");
		// ... forward headers, set cookies, return Response
	}
};

NewPipe.init(downloader);
```

Copying NewPipe's headers is on purpose. YouTube's bot detection looks for unusual combinations of User-Agent and headers, and looking like an ordinary desktop Firefox is the easiest way not to stand out. If the NewPipe app works, this plugin works.

The extraction itself is one call:

```java
StreamInfo info = StreamInfo.getInfo(ServiceList.YouTube, videoUrl);
```

Everything else is copying fields out of `StreamInfo` into a Capacitor `JSObject` so it can cross the bridge back to TypeScript. The plugin method runs all of it on a new thread, so the network requests don't hold up anything else.

## Version pinning is part of the package

`capacitor-npe` is published as `0.24.6` because it embeds NewPipeExtractor `0.24.6`, and every release of the plugin will match an NPE version. YouTube changes its player often enough that NPE ships patch releases just to keep extraction working. Letting apps pick a different NPE version would defeat the point. Either you ship the version that works against YouTube today, or it doesn't work.

```gradle
// android/build.gradle
implementation "com.github.teamnewpipe:NewPipeExtractor:0.24.6"
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
```

When NPE ships `0.24.7`, I'll cut a `0.24.7` of the plugin.

## What's not in scope

- **iOS.** NewPipeExtractor only runs on the JVM. A Capacitor plugin can have a Swift version of the same interface, but there's no iOS extractor maintained as carefully as NPE, and writing one is a project, not a weekend. On iOS the call fails, and on the web it returns `success: false`.
- **Other services.** NewPipeExtractor also handles SoundCloud, Bandcamp, PeerTube and a few more. The plugin only exposes YouTube because that's what I needed. Adding another is mostly `ServiceList.SoundCloud` and some new TypeScript types. PRs welcome.
- **Muxing.** If you use a `videoOnlyStreams` URL, combining it with audio is up to you. The plugin gives you the URLs, and what plays them is your call.

## Try it

```sh
pnpm add capacitor-npe
npx cap sync
```

```ts
import { NPE } from 'capacitor-npe';

const { streamInfo } = await NPE.extractStreamInfo({
	videoUrl: 'https://youtu.be/dQw4w9WgXcQ'
});

console.log(streamInfo?.title);
console.log(streamInfo?.videoStreams[0].url);
```

The source and issue tracker are on [GitHub](https://github.com/harshmandan/capacitor-pipe). capacitor-npe is MIT licensed.

<div class="post-divider" role="separator">Update · November 2026</div>

<h2 id="update-capacitor-pipe">Update: capacitor-pipe</h2>

Since this post, the plugin has been rewritten and renamed to [capacitor-pipe](https://github.com/harshmandan/capacitor-pipe), and the Android side is Kotlin now instead of Java. Two things drove the rewrite: YouTube changed how it delivers video, and I wanted a proper video player to go with the extractor.

### YouTube moved to SABR

The original plugin had a simple idea: ask NewPipeExtractor about a video, get back direct stream URLs, and put one in a `<video>` tag. That only works while YouTube hands out URLs.

More and more, it doesn't. In February 2025, the yt-dlp maintainers noticed that YouTube's web client was only being offered [SABR formats](https://github.com/yt-dlp/yt-dlp/issues/12482), and it has spread to more clients and videos since. SABR (server-side adaptive bitrate) replaces "here's a URL, download ranges of it" with a session. The player keeps a conversation going with YouTube's video servers in a binary protocol, and the server decides what to send next. For a video that's only available over SABR, there is no URL to give a `<video>` tag at all. The requests also need a proof-of-origin token from Google's own check, which the plugin gets by running that check in a hidden WebView.

capacitor-pipe handles this in two ways.

First, it uses two extractors behind one API. [PipePipeExtractor](https://github.com/InfinityLoop1308/PipePipeExtractor), the extractor behind the PipePipe app, is tried first, and NewPipeExtractor is the fallback. The result says which one answered. They don't always get the same thing from YouTube either: at one point, NewPipe still got a plain 360p file for videos that PipePipe could only get over SABR.

Second, for videos that need SABR, `openSabrSession()` starts a small server on the phone itself, at `127.0.0.1`. It speaks SABR to YouTube and hands the video to your app as an ordinary DASH manifest, so any DASH player (dash.js, Shaka Player or Android's Media3) can play it without knowing SABR exists:

```ts
const { streamInfo } = await Pipe.extractStreamInfo({ videoUrl });

if (streamInfo.requiresSabr) {
	const session = await Pipe.openSabrSession({ videoUrl, maxHeight: 720 });
	await shakaPlayer.load(session.manifestUrl); // a DASH manifest on 127.0.0.1
}
```

A session serves one quality. To switch, the plugin opens a second session at the current position, starts playing it, and only then closes the first.

### A native video player

The other half of the rewrite is a video player that behaves like YouTube's: drag the video from its spot in the page to fullscreen, shrink it to a corner while you keep browsing, and keep it playing in picture-in-picture when you leave the app.

A WebView can't do the first part well. Dragging a video smoothly between an inline box and fullscreen, while the page underneath stays still, needs native code. So the player is a native overlay that sits on top of the whole app, built with Jetpack Compose and Media3, outside the WebView.

That changes how a page uses it. The page doesn't own the player; it lends it a rectangle. A page calls `dock()` with the position of its video area when it opens, and `undock()` when it closes. The video keeps playing in between, the way YouTube keeps playing while you browse to another page:

```js
const r = stage.getBoundingClientRect();
await PipePlayer.dock({ x: r.x, y: r.y, w: r.width, h: r.height, dpr: devicePixelRatio });

// when the page goes away, the video moves to the corner and keeps playing
await PipePlayer.undock();
```

It also plays live streams, plays SABR sessions directly through Media3 without the local server, and plays downloaded files from the device, optionally encrypted. It's opinionated on purpose: the accent colour is the only thing you can style.

### Installing it now

capacitor-pipe isn't on npm yet, so the [README](https://github.com/harshmandan/capacitor-pipe#install) explains how to build it from GitHub and install the packed file. The licence also changed to GPL-3.0, since both extractors it uses are GPL-3.0.
