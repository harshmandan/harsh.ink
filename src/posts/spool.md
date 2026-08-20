---
title: 'Spool: faster reviews for AI-written code'
date: '20-08-2026'
updated: '20-08-2026'
categories:
  - 'open-source'
excerpt: A macOS menu bar app that collects notes, screenshots, code references and page elements during a review, and hands them to a coding agent as one file.
link: https://spool.harsh.ink
source_url: https://github.com/harshmandan/spool
---

Reviewing a page an AI agent built usually leaves me with ten things to change. I can write one huge prompt, or go back and forth with the agent ten times. Dictation gets component names wrong, and every screenshot means switching windows to paste it in.

<img class="app-icon" src="/images/blog/spool/icon.webp" alt="The Spool app icon: a clear glass spool wound with cream thread, on a soft iridescent background" width="160" height="160" />

Spool is a macOS menu bar app that collects all of that while I review, and turns it into one file for the agent.

## How it works

A small glass panel floats over whatever I'm working in. While a session is running, it picks up:

- **Notes**, typed into the panel or dictated with my own speech-to-text tool. The panel takes keyboard focus without becoming the active app, so the editor underneath stays in front.
- **Screenshots** from the normal macOS shortcut (⌘⌃⇧4). Spool watches the clipboard and never records the screen itself, so it never asks for Screen Recording permission.
- **Figma links and editor permalinks**, also from the clipboard.
- **Code** from a VS Code or Zed extension, which sends the selection and the file and line it came from.
- **Page elements** from a browser extension: hold a key, hover, click, and it captures the element's selector, its markup and a cropped screenshot.

<video class="screenshot" src="/images/blog/spool/capture.mp4" poster="/images/blog/spool/capture-poster.webp" autoplay loop muted playsinline preload="metadata" aria-label="The Spool panel at rest in the corner of the screen, waking briefly as an image, a CSS snippet, a link, a Figma link and a note with colours are copied in, then showing the whole list on hover"></video>

When I'm done, one shortcut copies the session as markdown, ready to paste into Claude Code, Cursor or anything else. Past sessions live in a window modelled on Apple Notes, where entries can be edited, added to and deleted. From there a session can be copied as a numbered list, as bullets or without breaks, or saved as `session.md`.

<img src="/images/blog/spool/browser.webp" alt="Spool's session browser: a sidebar with one session, the session's entries as a document on the right with a screenshot and two notes, and the copy menu open with Copy with Numbers, Copy with Bullets and Copy without Breaks" loading="lazy" />

On disk it's a plain folder: `session.md` plus the screenshot files, with relative paths. When copied to the clipboard, the screenshot paths become absolute so an agent can open them. Spool never talks to an LLM itself.

## Making it look good

Spool sits on top of whatever I'm working in all day, so I wanted it to look and feel like it belonged on macOS 26, not like a utility bolted on. That meant using Apple's Liquid Glass properly. `NSGlassEffectView` draws the refraction, the tint that picks up the colour of whatever is behind the panel, and the edge highlights. None of that can be faked with a blur and a border, and a fake looks wrong as soon as it moves.

- **The shape follows the content.** An empty session is a single capsule with just the input. Each capture grows the panel, and the corners relax from a capsule into a rounded rectangle.
- **Dark only**, so it reads the same over any app.
- **A plain black gradient for legibility**, not another blur. A blur adds its own grey wash; a gradient only darkens. It runs from the bottom up, because the input is at the bottom.

## Making it feel right

Most of the time went into how it moves.

- **Every window move is a spring.** AppKit can only animate a window frame with a fixed ease-in-out. So Spool steps SwiftUI's own `Spring` once per display refresh and moves the window itself. The windows and the SwiftUI views inside them follow the same physics, and when several captures land quickly, the spring keeps its speed instead of restarting.
- **The panel grows upward.** The input is at the bottom and stays still under your cursor while new captures stack above it, so you can keep typing while one lands.
- **It fades when you're not using it.** At rest, the panel dissolves towards the top and lets clicks through to the app below. Only the input row stays readable. The fade's edge is a blurred half-cosine curve rather than a straight gradient, which read as a hard line across the panel.
- **Hiding it during a session tucks it away.** It slides to the screen edge and leaves a strip of glass with the session light. New captures make the strip flash and lean out.
- **Ending a session says goodbye.** The light turns red, waves, and the panel folds and glides off in one spring.
- **Press and hold a screenshot to preview it**, and let go to put it away. Hover-to-enlarge was unstable, because growing the image changes what's under the cursor.
- **The session light breathes.** An earlier version wound a thread around a spool, which looked like a loading spinner. A spinner that never stops says "stuck", not "ready".

<img class="recording" src="/images/blog/spool/states.webp" alt="The same Spool panel twice: on the left at rest, faded to just the input row, and on the right awake, showing eight captures including screenshots, a CSS snippet, a link and notes with colour swatches" loading="lazy" />

Polish also meant fixing what the profiler found. With a session running and the panel hidden, Spool used 9.3% CPU. The breathing animation kept running for a window that wasn't even on screen. After a round of fixes, idle CPU was 0.2%. Dragging the panel ran at about 15 frames a second, because a blur mask taking 34.8ms was rebuilt on every frame of the resize, for a view that was invisible at the time.

## Building it with Claude Code

I built Spool with Claude Code, and the hard part was that Liquid Glass is newer than most of what the model was trained on. Left alone, it reached for old API names and guessed at the rest. So it reads Apple's current docs and design guidelines before touching any UI, and the repo keeps reference screenshots it opens as images, because refraction and tint are much easier to see than to describe. With Screen Recording allowed for the terminal, it could also build the app, launch it and screenshot the panel to check its own work, instead of asking me to look.

A separate review pass at the end caught a nasty one: deleting a screenshot could make the next capture overwrite another screenshot's file, because file names were based on how many files were in the folder.
