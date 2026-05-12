---
title: 'Making svelte-check up to 100× faster'
date: '12-05-2026'
updated: '15-11-2026'
categories:
  - 'rust'
  - 'svelte'
  - 'ai'
  - 'open-source'
excerpt: Measuring where svelte-check spends its time, writing a plan for a Rust replacement, handing it to Claude Code, and everything that changed once the measurements came in. Now with a port of acorn and an optional Rust TypeScript checker.
npm_url: https://www.npmjs.com/package/svelte-check-native
source_url: https://github.com/harshmandan/svelte-check-native
---

## Update: acorn and tsrs

_November 2026_

Two changes since this post went up, both about what's still not native.

### Porting acorn

I kept running into edge cases in my translation layer. svelte-check-native parsed JavaScript with oxc and translated oxc's syntax errors into the messages and positions acorn would give, because acorn is what the Svelte compiler uses and what svelte-check reports. The two parsers are built differently, so every disagreement needed its own rule, and issues about them kept getting opened on the repo. Measured against acorn's own test inputs, 126 cases still differed, and in 15 of them one parser accepted the code and the other rejected it.

So I decided to do what svelte-check does and use the same parser. acorn is written in JavaScript, so I ported it to Rust as well. Not all of it: only what svelte-check-native needs, which is acorn and the acorn-typescript plugin deciding whether code parses, and where an expression ends. oxc still builds the syntax tree, walks it, generates the overlay and runs the lint.

The port passes every one of acorn's tests, and now lives in its own crate, [acorn-rs](/blog/acorn-rs).

### Making svelte-check-native even faster

[tsrs](https://github.com/oxc-project/tsrs) is a Rust port of TypeScript 7's Go compiler, from the oxc team. Setting `SVN_ENGINE=tsrs` uses it in place of tsgo. On my team's app, the type-check step alone:

| Engine                       | Type-check time | Peak memory |
| :--------------------------- | --------------: | ----------: |
| tsgo (the nightly tsrs pins) |     2.22–2.29 s |     ~2.4 GB |
| tsrs 0.18.0                  |     0.57–0.58 s |     ~0.8 GB |

That's 4× faster with 3× less memory, and the errors it prints are identical. A full run goes from 2.8 s to 1.5 s cold.

It's opt-in for two reasons. tsrs checks against the TypeScript version it's pinned to, not the `typescript` your project installed, so turning it on by default would silently change which compiler checks your code. And it has no Intel macOS or Windows builds yet.

The bigger win would be running the checker inside the same process, with no overlay files on disk. That has to wait until tsrs offers an API meant for that.

<div class="post-divider" role="separator">Original post · May 2026</div>

svelte-check was slow on my team's app: around 40 seconds on a SvelteKit monorepo with about 1,400 files. That used to be a CI annoyance. With agentic coding it became a real cost, because an agent runs the type checker over and over in a single session, and every run is 40 seconds of waiting.

I looked for something faster. The one alternative I found, svelte-check-rs, didn't work on our app: it reported errors that weren't there and missed ones that were. With nothing else to try, I decided to build my own.

The result is [svelte-check-native](https://www.npmjs.com/package/svelte-check-native), a single Rust binary with the same flags, the same exit codes and byte-identical output. On my team's app a warm run takes 0.3 seconds.

## Where svelte-check spends its time

svelte-check does four things for each run. It rewrites every `.svelte` file into TypeScript with a library called svelte2tsx, hands the result to the TypeScript compiler, runs the Svelte compiler on every component for its warnings, and maps every diagnostic back from the generated TypeScript to the original `.svelte` file.

With its default engine (TypeScript 6, in JavaScript), a full run on my team's app takes about 27 seconds, and TypeScript itself is 57% of the CPU time: about 7.5 seconds building the program and 12.6 type-checking it.

That part has an obvious fix. TypeScript 7 is a port of the compiler to Go, called tsgo, and svelte-check already has a `--tsgo` flag. That brings the run down to about 13 seconds. Here's where those 13 seconds go on svelte-check's own thread:

| Stage                                              | Share |
| :------------------------------------------------- | ----: |
| Waiting for tsgo to finish                         |   24% |
| Svelte compiler warnings                           |   20% |
| svelte2tsx, turning `.svelte` into TypeScript      |   19% |
| Mapping tsgo's diagnostics back to `.svelte` files |   12% |
| Loading JavaScript modules                         |   11% |
| Incremental bookkeeping                            |    6% |
| Garbage collection                                 |    3% |

So even with tsgo doing the type-checking, three quarters of the time is JavaScript that isn't type-checking at all. svelte2tsx, the compiler's warnings, the source mapping and Node starting up are all things a native binary can do in a fraction of the time. That was the target: keep tsgo, and replace everything around it.

## The plan

I wrote the plan before any code existed: study svelte-check until every step was understood, then build it, match the command line exactly, use the test suites from Svelte's own language tools to check it, and only then work on speed. A few rules were set from the start:

- **oxc parses all the JavaScript and TypeScript.** No hand-written, character-by-character scanners, because that's where subtle bugs live.
- **tsgo does the type-checking** as a separate process, against generated TypeScript files. There's no fallback to the old JavaScript compiler.
- **Byte-identical output.** Same errors, same positions, same wording, same exit codes. If the two disagree, ours is wrong.

That last rule is what made the rest possible to check. svelte-check's own tests run unchanged against the new binary. Every bug became a test before it was fixed. The generated TypeScript is compared against what svelte2tsx produces for the same file. And 24 real projects are checked by both tools, with every diagnostic compared by file, line, column, code and message.

## Handing it to Claude Code

With the plan and the tests in place, Claude Code wrote the code. The plan set the order of work, and the tests decided whether each step was done. The most useful rule I gave it was how to debug: diff our output against svelte-check's real output first, instead of guessing.

Some lessons were about the tooling, not the code. Several agents running `cargo test` at once fought over Cargo's build lock and turned a 29-second test run into 574 seconds, so every cargo command now waits its turn on one shared lock. Later, an audit gave each of 158 source files to its own agent, and turned up 43 correctness fixes and 15 performance fixes.

The first release came out two days after the first commit. A warm run on my team's app took 2.9 seconds, against svelte-check's 38.

## What changed once I measured it

The plan was a set of guesses about where the time would go. Several were wrong.

### The compiler warnings were the bottleneck

The plan assumed tsgo would dominate and the warnings would be cheap. The first breakdown of our own pipeline, on a 1,000-file app, said otherwise:

| Stage                          | Share of a warm run |
| :----------------------------- | ------------------: |
| Parse, analyze and emit (Rust) |                 10% |
| tsgo                           |                 38% |
| Svelte compiler warnings (JS)  |               50.6% |

The warnings ran in the project's own `svelte/compiler`, in a pool of Bun workers, one per two cores. That had already cut warm runs by 44%, but the warnings were still half the time.

So the compiler's warning pass got ported to Rust too. Before writing it, I counted which warnings actually fire: three codes made up about 93% of them across our projects. The first version covered 66 of about 80 codes and passed 118 of the 129 warning tests from the Svelte repository. Today all 125 that apply pass.

With the native warnings on by default, a warm run on my team's app went from 2.9 to 1.0 seconds, and checking no longer needed Bun or Node at all. The JavaScript path is still there behind `--svelte-warnings bridge`, for anyone who wants the compiler's exact output.

### tsgo was the rest

Once the warnings were native, a profile showed tsgo taking 95% of a cold run, 84% of a warm one and 83% of a run after an edit. All our Rust code together took 150–200 ms. Most of the planned speed work on our side would have saved milliseconds.

What did help was making tsgo do less:

- **The generated tsconfig excluded every `.svelte` file by name**, about 1,210 entries, to match svelte-check. They changed nothing about the result, but tsgo checked every path against every one. Removing them took tsgo's config phase from 0.9 seconds to 0.05.
- **Go's garbage collector was busy** through a burst of about 830 MB while parsing. Turning it off for tsgo, with a 4 GB memory cap instead, took its parse phase from 0.43 to 0.33 seconds.
- **Skipping tsgo when nothing changed.** If none of the files tsgo reads have changed, the last run's errors are reused. A warm run on my team's app went from 1.81 to 0.24 seconds. A check on file contents, not just timestamps, later made it survive `svelte-kit sync` rewriting files with the same contents, which took that case from about 6 seconds to under 1.

The Rust side got its own small wins too. Each script is parsed once and shared by the lint and the code generator, which cut the text parsed per run from 15.4 MB to 9.3 MB. Components are processed in parallel. And calling the platform's tsgo binary directly, instead of the Node wrapper script in front of it, saves 50–100 ms on every run.

### Things that didn't hold

| Planned                                      | What happened                                                                                                                                                   |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Svelte 5 only                                | Svelte 4 was supported a day later. A 1,000-file app halfway through migrating needed it.                                                                       |
| No character-level scanners                  | An audit found 27 of them had crept in anyway, two causing bugs users could see. All were replaced with the parser.                                             |
| Map errors back line by line                 | Rebuilt twice. Now each piece of generated code records where it came from as it's written, which deleted about 530 lines.                                      |
| TypeScript's incremental cache on by default | Made opt-in, as svelte-check does. It could miss an edit to a type declaration file.                                                                            |
| A setting that made runs 3–6× faster         | The speedup was fake. tsgo was exiting with an error, and the empty output read as zero errors. Removed.                                                        |
| Never report anything svelte-check doesn't   | Relaxed with optional extra checks for things `--tsgo` misses, like imports of `.svelte` files that don't exist. On one app that took 308 false errors to zero. |

Some ideas didn't make it at all. tsgo has an API that could keep a warm checker running between runs, but its protocol is explicitly unstable. Its watch mode ignores the folder the generated files live in. A language-server experiment used a third of the memory and answered hovers in about a millisecond, but it stayed an experiment.

## The numbers now

On my team's app, 1,357 files, against svelte-check:

|                               |   Cold | Warm, nothing changed | After an edit |
| :---------------------------- | -----: | --------------------: | ------------: |
| svelte-check                  | 27.4 s |                27.2 s |        27.3 s |
| svelte-check `--tsgo`         | 13.3 s |                13.6 s |        13.7 s |
| svelte-check-native           |  2.8 s |                 0.3 s |         2.5 s |
| svelte-check-native with tsrs |  1.5 s |                 0.3 s |         1.4 s |

svelte-check has got faster since I started, from about 40 seconds to 27. A warm run is still about 90 times faster, and at its best, 0.24 seconds, over 100 times. The run after an edit is slower than it once was, because incremental checking is now off by default: TypeScript really re-checks the project, as svelte-check does.

On open-source projects, against svelte-check:

| Project            |   Ours | svelte-check | Speedup |
| :----------------- | -----: | -----------: | ------: |
| shadcn-svelte docs | 1.40 s |      10.03 s |    7.2× |
| threlte extras     | 0.64 s |       1.81 s |    2.8× |
| bits-ui            | 1.64 s |       3.78 s |    2.3× |

The gap depends on the size of the project and how heavily it uses runes.

## Try it

```sh
npm install -D svelte-check-native typescript@^7.0.0
npx svelte-check-native --workspace .
```

It takes the same flags as svelte-check, so it can replace it in a `check` script. It needs TypeScript 7 installed, which is what provides tsgo.
