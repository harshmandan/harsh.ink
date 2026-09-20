---
title: "Things You Should Never Do, unless you're using AI"
date: '20-09-2026'
updated: '20-09-2026'
categories:
  - 'ai'
excerpt: Rewriting a teaching platform from scratch with Claude Code, moving 2.2 GB of MongoDB data into Postgres, and comparing OCR engines, models and prompts to turn 116,000 scanned exam questions into text.
---

In 2000, Joel Spolsky wrote [Things You Should Never Do, Part I](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/). Netscape had decided to rewrite its browser from scratch, and almost three years passed between version 4.0 and the 6.0 beta, with no 5.0 in between. He called it "the single worst strategic mistake that any software company can make".

His reasons still sound right. Old code carries years of bug fixes from real use, and a rewrite throws them away. It takes years, and competitors don't wait. And the new team usually repeats the old mistakes.

That held for 25 years. With AI writing the code, it doesn't have to. In July 2026, Jarred Sumner wrote about [porting Bun from Zig to Rust](https://bun.com/blog/bun-in-rust) with Claude Code: 535,496 lines of Zig, in 11 days. His estimate for doing it by hand was about a year for three engineers who already knew the codebase.

TutorGrow is far smaller than Bun, but the same thing applies, so I rewrote it from scratch.

## What TutorGrow is

TutorGrow is a teaching platform for coaching institutes. Each institute gets its own branded Android app, and its students get classes, notes, live classes and tests through it. The old version was a Java Android app started in 2019 and an Express and MongoDB API started in 2020, with very little work on either since 2022.

The new one is SvelteKit with Svelte 5, Postgres with Drizzle, Valkey, and Bun, wrapped in Capacitor for Android. It took six weeks from starting properly to the first release on the Play Store.

<img src="/images/blog/tutorgrow/classes.webp" alt="The TutorGrow staff dashboard for a coaching institute: 159 classes as cards, the first with 12,433 students, each showing its tests, content count and price" loading="lazy" />

Most of the app is what you'd expect: create a class, edit it, enrol students, take payments. That part isn't interesting to write about. These are the parts that were.

## The Android app

The app is Capacitor around the same SvelteKit code that serves the web, so a screen is written once and runs in both.

A WebView is fine for most screens, but not for everything. Where it falls short, there's a native plugin in Kotlin that the Svelte code calls:

- **Video** plays in a native player from [capacitor-pipe](/blog/capacitor-pipe), built on Media3. It sits on top of the app rather than inside the page, so it keeps playing smoothly while the page underneath redraws. The page only tells it where to sit.
- **Downloads** carry on when the app is in the background, resume from where they stopped if they're interrupted, and are encrypted with a key that never leaves the phone's secure storage.
- **PDFs and photos** open in native viewers, and the decrypted file only ever exists in memory, never as a readable file on the phone.
- **The small stuff:** in-app updates from Play, since these students never visit the Play listing, reading the sign-in code from an SMS, and keeping students signed in when they update from the old app.

<img class="screenshot" src="/images/blog/tutorgrow/student-home.webp" alt="The student home screen in the app: a test ready to take, the student's class, and sections for saved items, live sessions and tests" loading="lazy" />

One codebase builds all 246 white-label apps. Each one picks up its institute's name and branding when it starts, and releases go to the Play Store five at a time per publisher account.

## Moving the data from Mongo to Postgres

The old database was 2.2 GB of MongoDB. The importer reads 18 of its 51 Mongoose models into about 50 Postgres tables. It runs one institute at a time inside a single transaction, so a dry run is simply a full import followed by a rollback. Every imported row keeps its original Mongo ID, so any row can be traced back to where it came from.

### Making it fast enough

The first version took 17 minutes for the largest institute, and at one point was projected to take 18 hours. Profiling showed 96% of Postgres's CPU going to foreign key checks, two per row, across 21.2 million answer rows.

| Insert method             | Rows per second |
| :------------------------ | --------------: |
| Foreign keys on, Drizzle  |             357 |
| Foreign keys off, Drizzle |          29,557 |
| Foreign keys off, `COPY`  |         117,000 |

The foreign keys are now dropped for the load and added back as `NOT VALID`, which took re-checking from 635 seconds to 41 milliseconds. Building the answer indexes after the load instead of during it took the largest institute from 423 seconds to 186.

The biggest win was a change of shape. Answers were a table with one row per question per attempt: 23.6 million rows and 3.3 GB. They became a JSON column on the attempt itself, 244,000 rows and 530 MB in total, with all 23,642,023 answers kept exactly. The largest institute now imports in 126 seconds.

### Checking it

After each import, a report compares counts for every table: how many rows Mongo has, how many the importer considered, and how many arrived. Every row that doesn't arrive has to be explained. All twelve institutes ended at zero unexplained rows.

That check still missed a bug. 40,222 students, 46% of them, had been imported enrolled in nothing, and every count agreed, because the check was filtering Mongo the same wrong way the importer was. A reconciliation that shares the importer's assumptions can only prove the importer agrees with itself.

### Rules that changed after launch

Before launch, the database was disposable. Changing the schema meant resetting it and re-importing everything from Mongo, which only took minutes, so there were no migrations to write.

Going live ended that. The live database now held data that couldn't be regenerated, so every schema change became a hand-written migration, even locally. Each one is first run against a restored copy of production, run twice to prove running it again changes nothing, and preceded by a backup that is read back to check it.

Institutes kept using the old app between their import and the day it was switched off. A separate importer covers that gap. It only adds rows, and decides what's new by whether the Mongo ID is already there, not by date. Across the ten migrated institutes it found 98 students, 39 enrolments and 4 materials.

## Turning scanned papers into text

The imported question bank had a bigger problem. 116,192 of its 119,657 questions were just an image of a scanned exam paper, with the options inside the picture too. About 85% of them contain Hindi in Devanagari script, usually mixed with English and maths. You can't search an image, and it reads badly on a phone.

<img class="screenshot" src="/images/blog/tutorgrow/question.webp" alt="A real test question on a phone before OCR: the whole bilingual question, an SI unit of pressure question in English and Hindi, is a scanned image, and the four options below it are just the letters A to D with no text" loading="lazy" />

I tried the local options first, on the same real questions. Everything ran on an M1 Pro with 16 GB, except Qwen, which needed a GPU:

| Engine           | What happened                                                                                                                  |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| Apple Vision     | Supports 30 languages, none of them Indian. Blank on 19 of 150 images.                                                         |
| Tesseract 5.5    | Fast, and fine for Hindi and English prose. LaTeX on 0 of 12 maths questions: `\sqrt{K_w/(K_a K_b)}` came back as `VK ©) Ex,`. |
| Surya 2          | The only one promising proper LaTeX, but 498 seconds on the first image.                                                       |
| PaddleOCR-VL 1.6 | The best local output, 2.6 seconds an image with proper fractions. It also put a Chinese character into an English question.   |
| Qwen3-VL-8B      | The best open model on printed Hindi, but it needs 11 GB of video memory. On my 8 GB RTX 3070, it took 33 seconds an image.    |
| In the browser   | Not possible. The WebAssembly threads it needs don't work in Android's WebView.                                                |

Two more things settled it. 22 of the 25 PDFs I sampled were scans with no text, so reading a PDF's own text wouldn't help most of the time. And at about $0.04 for a 30-page paper on a hosted model, there was no case for running my own model server.

Every run also produced a comparison page: the scan, then each engine's reading of it, side by side.

<img src="/images/blog/tutorgrow/ocr-compare-hindi.webp" alt="A comparison card: a scanned Hindi biology question, then readings by Gemini 3.6 Flash and Flash-Lite that match it exactly, and Tesseract's reading, which turns words into nonsense like Yer and Geet" loading="lazy" />

<img src="/images/blog/tutorgrow/ocr-compare-maths.webp" alt="A comparison card: a scanned maths question about the domain of a function with a square root over a fraction, Gemini's readings with the formula typeset correctly, and Tesseract's reading, which is garbled" loading="lazy" />

### Comparing runs

I didn't use LangChain or Langfuse. Every run goes into its own Postgres database, separate from the app's, with the model, the prompt version, each question's reading, its confidence and what it cost. A new run never overwrites an old one, which matters more than it sounds: the same prompt has returned different boxes on two calls in a row.

The bank has 134,259 questions, and checking all of them by hand at five seconds each would take 166 hours. So each reading gets flagged for things that are easy to spot without another model call, like Hindi stuck inside a maths block, or a correct answer that isn't one of the options, and a person only looks at the flagged ones.

To compare models, I picked 70 hard questions by hand as a test set:

|                                             | Gemini 3.6 Flash | Gemini 3.5 Flash-Lite |      GPT-5.6 Luna |
| :------------------------------------------ | ---------------: | --------------------: | ----------------: |
| List price, $ per million tokens (in / out) |      0.75 / 3.75 |           0.30 / 2.50 |       0.20 / 1.20 |
| Median time per question                    |           10.6 s |                 2.1 s |   2.4× Flash-Lite |
| Hidden thinking tokens                      |  ~1,000 per call |                  none | 76% of its output |
| LaTeX on 12 maths questions                 |               11 |                    11 |                 – |
| Cost of a full pass                         |  ~10× Flash-Lite |                $80.02 |            $85.75 |

_Flash and Flash-Lite were compared on all 70 questions. Luna only had a 13-question head-to-head._

The list price turned out to be the wrong number to compare. Luna is cheaper per token and turns an image into about half as many tokens, but it spends most of its output on reasoning the task doesn't need, and that's billed at the output rate. It came out 7% dearer than Flash-Lite, slower, and with worse transcriptions. Gemini 3.6 Flash lost the same way.

So the model is `gemini-3.5-flash-lite`, pinned to a version rather than "latest", at temperature 0. A few things I learned about calling it:

- **It still wraps JSON in prose sometimes**, even when asked for JSON only, so the reply goes through a forgiving parser.
- **Ask for boxes in Gemini's own format**, `[ymin, xmin, ymax, xmax]` on a 0–1000 grid. Asking for a friendlier shape made the boxes measurably worse.
- **An image costs about 1,101 input tokens** for a 432×122 crop, whether the file is 6 KB or 53 KB. The resolution decides it, not the file size, and it's far more than the 258 the docs suggest for small images.
- **The free tier couldn't do this:** 29 of 35 calls came back rate-limited. The bank went through the paid Batch API, at half price, which also keeps the data out of training.

### Prompt versions

Prompts are versioned too, and every reading records which version produced it:

| Version | What changed                   | Why                                                                                                                                                                                                   |
| :------ | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1      | One block of HTML per question | The starting point.                                                                                                                                                                                   |
| v2      | Three explicit rules           | Took three problems to zero on the test set: loose LaTeX layout commands, Hindi inside `\text{}` (which KaTeX draws as empty boxes), and two-column options read down the columns as (a) (c) (b) (d). |
| v3      | JSON fields instead of HTML    | Parsing the options back out of HTML was guesswork.                                                                                                                                                   |
| v4      | Markers for figures            | So a diagram lands in the right place in the text.                                                                                                                                                    |

v1's failures looked like a weak model and turned out to be an unclear instruction.

The first real batch of 2,383 questions read 99.5% of them, with a mean confidence of 0.967 and 3.7% flagged for review, in 8 minutes 31 seconds. By the time the whole bank went through it had grown to 134,259 questions, and 129,304 were transcribed.

It reads handwriting too. One institute's bank had questions written out by hand on ruled paper, calculus and combinatorics included, and they came back as text with the maths in LaTeX:

<img src="/images/blog/tutorgrow/ocr-handwritten.webp" alt="Three handwritten questions on ruled paper, each next to its transcription: finding the local maximum and minimum of 2 sin x minus x, the minimum of sin to the fourth plus cos to the fourth, and a true or false counting question, with fractions, square roots and powers typeset" loading="lazy" />

### Importing new papers

Teachers can import new papers from a PDF the same way. The browser renders the pages, so the server never opens the PDF. The model marks each question as a box on the page, the teacher checks and fixes the boxes, each box is transcribed to text and LaTeX, and a person sets the correct answers before anything is saved.

Teachers can also draw the boxes themselves. Each question then stays a picture until they choose to have it read, which for these six would cost $0.003:

<img src="/images/blog/tutorgrow/import-review.webp" alt="The import review screen with a real scanned biology test: six questions, each printed in Hindi on the left and English on the right, boxed by hand and numbered 1 to 6, with a side panel offering to read them into text for $0.003" loading="lazy" />

_A real scanned paper, with the institute's name and phone number blanked out. Each box holds one question in both languages._

Maths is rendered with KaTeX. MathML was ruled out because Chrome on Android can't stretch square root signs over tall expressions.

## Testing it

There were 912 unit tests at launch, on Bun's built-in test runner. They cover the places where a bug costs money or data: grading answers, coupons and checkout, the AI credit ledger, and who can see what.

The app itself is tested by signing in as each role and screenshotting every page at desktop size and at 360 pixels wide, the width of a budget Android phone, where tables overflow and bottom bars collide.

The most useful test was the simplest. A script creates two throwaway institutes with a student in each, then has each student call the other institute's routes and checks that every request is refused. It found that a student in one institute could read another institute's entire test list.

Downloads are tested on a real Android device, with a test server that cuts a download off halfway on purpose, because that's the only way to check that it resumes. And the build became a required check before deploying after it was broken for three deploys in a row, while type checking, linting and every test passed.

## How the AI was steered

It was built with Claude Code, and what kept it on track was writing things down. Every mistake that cost time once went into a notes file the agent reads, so it didn't cost time again. By launch that file was about 1,800 lines long.

Running several agents at once needed rules too. One audit round ran six agents fixing things in parallel, and three of them were cut off halfway through an edit. After that, each agent owned its own files, only three ran at a time, and only the main session touched git.

## Final thoughts

Joel wasn't entirely wrong. A new app brings new bugs: 40,222 students imported into no classes, a build broken for three deploys in a row while every check passed, and plenty of smaller ones. AI-written code isn't perfect, and it needs the same checking as anyone else's. Most of this post is about that checking.

What has changed is the cost. Rewriting used to mean years, and that's what made it a bad bet. Here it meant weeks, and the time went into checking rather than typing.

It's also something I'd wanted to do for a really long time. The original Android apps weren't written by me, so rebuilding them on the latest Android APIs was one of the nicest parts.
