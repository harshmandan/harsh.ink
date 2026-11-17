---
name: natural-writing
description: Use when drafting or editing prose, and always for harsh.ink blog posts. Starts with the site's house rules (openers, story over checklist, plain headings, no repo paths or product links, fact-checking against the real code), then general patterns for formulaic AI-style language. Apply the general patterns contextually, not as absolute rules.
---

# harsh.ink house rules

These come from the user's corrections on real posts. They take priority over the general patterns further down.

## Openers

- Lead with the broken thing, the artifact, or an opinion. Never open with "picture this" or a scene-setting cold open ("it's 3am and…"), even if the scene is real. Save real-world colour for later in the post.

## A story, not a checklist

- Follow what happened, in order. Don't give each part or feature its own section with the same shape (what I picked, one reason, move on). That reads like a spec sheet. A parts list goes in one table at the end, once.
- Tell each anecdote properly: what was said, what broke, what it looked like. Not "it went smoothly" or "one of the nicer parts of the build".
- Use numbers instead of adjectives: prices, temperatures, sizes, timings, versions.
- Never invent experiences, numbers, feelings or reasons. If a detail is missing, list what you need and ask the user. Leave it out until they answer.
- Don't present an idea as a built feature. Check the code; if it isn't there, write it as a possibility ("you could point an LLM at it").

## Project posts: order and framing

- Order: what it is and why I built it, then the features, then how it's built, then the problems hit along the way. Features come before problems.
- Frame motivation around the user's own needs. Don't write sections that imply a survey of competitors ("What the other apps do") unless the user actually did one.
- Open with the general idea before the specific library. For a portal library, first say what a portal is and the common way they're built, with the existing library as one example, then how this one differs. Don't open with "Portals in Svelte, like X, …".
- Each feature section starts with the problem or idea behind it, then the feature. "Moderating a community catalog is hard, so…" before "the admin panel has tabs for…".
- No devlog or commit-history sections ("What broke along the way" listing every fix). Keep only problems a reader can learn from, give them a heading that names the problem ("Making it work on iPhone"), and put them after the features.
- No yapping. If one paragraph covers it (offline, private, no account), write one paragraph.
- No release notes, changelogs or version timelines in the prose ("v2.0.0 came out on 20 July. Breaking changes: …", "1.0.0 went out on 6 June, and 1.1.0 the next day"). At most one line: "If you're upgrading from v1, the changelog lists what changed", linked.

## Headings

- Plain, short and descriptive: "Update: Hisense Tweaks", "Hands-free timer", "Global stores leak between requests", "Testing on the real kit".
- A heading must not claim more than is true ("What the other apps do" implies every app was tried).
- Post titles are short, and product names are written in normal case: "EveryCup: track all your coffee brews", not "EVERYCUP: an app for tracking all your coffee brews".
- A bit of attitude is welcome where it's earned, like Safari needing extra hand-holding "as always". Flat, neutral intros to a section ("Two problems were specific to Safari") read like a report.
- No clever or cute headings ("an Apple TV, and a menu it couldn't close"), no "Let's dive deeper into this madness", and no run of "Why not X?" headings.

## A blog, not a CLAUDE.md

Posts must not read like internal notes about the codebase.

- No repo file paths in prose, and no path comments at the top of code blocks (`debug/open-cardi.py`, `// src/lib/ble/client.ts`).
- No internal class, file or constant names unless they are the point (`MediaRecorderDemo.SPACE`, `BluetoothLeService.java`). Say what the thing does in plain words.
- To point at a file, call it something plain like "the Python script" and link to it on GitHub.
- Keep identifiers the reader will actually use: protocol bytes, commands to run, an API they will call.
- Write open-bug and to-do lists as plain sentences, not implementation notes.
- No prompt text, agent instructions or decision-log notes in posts ("The bar I set in the prompt was an app that could win an Apple Design Award", "Most of the details in this post come from the decisions file"). If AI tooling matters to the story, write one or two paragraphs on what was hard and what helped.
- Don't frame a design as copying another product ("I decided to follow the Siri screenshots directly"). The motivation is that the user wanted it to look and feel good; mention a reference only if it adds something.

## Links

- Don't link tool names to their product or marketing pages (for example Claude Code → claude.com/product/claude-code). Just write the name.
- Link to things the post relies on: a repo, a docs page, an issue, a library.

## Check facts against the source

Posts on this site had wrong option names, wrong timings, missing exports, packages that were never published, and code examples the real code contradicted.

- Before editing a post about one of the user's projects, read the real code: the published npm package (via unpkg), the GitHub repo, or the files in this repo.
- Check every code example against the real API: names, required arguments, and version-specific syntax (Svelte 4 vs 5, Tailwind v3 vs v4).
- Check install instructions actually work (does the npm package exist?).
- Remove placeholder images (placehold.co and similar). If there's a live demo, embed it as an iframe with `class="demo-frame"`, adding `wide` for demos built for desktop. Put the demo at the very top of the post, before any update section, so readers can try it first.
- If an update section contradicts the original post, fix or mark the original. Don't leave both standing.
- Watch the date: a post dated 2024 that mentions a 2025 release needs `updated` bumped or a dated note.

## Punctuation and rhythm

- No spaced hyphens used as dashes (" - "). Use a full stop, comma, colon or parentheses.
- No tidy closers that restate the paragraph ("Same brand, two contexts.", "Best of both worlds.", "Two rules baked in for free.").
- No runs of punchy fragments ("One byte. Sentinel-framed. Modeless.").
- Watch lists of three. Cut to two, or one, when the third item is filler.
- No catchy repeated taglines ("error for error", "function for function", "byte for byte" used as a refrain). Say it once, plainly, or not at all.
- Don't state the obvious. A port is a copy of something real, so "the same error as the real thing" adds nothing; say "the same error as acorn".
- When a sentence says what something doesn't do, give the reason in the same breath: "It doesn't, however, build a syntax tree, because…".
- Say results the simple way: "all 24,364 tests pass", not "checked against 24,364 readings of acorn's own test inputs".
- Use British spelling ("colour") and keep it consistent within a post. Leave code as it is.

## Keep the user's voice

- Keep real asides: the Delhi heat, the dirty laptop screen, "lol", 🤌, admitted mistakes. Rewrite what reads generated, not what reads like the user.
- Remove remarks that generalise about a nationality or group, and say so in your summary so the user can put it back.

# Writing patterns

LLMs (and artificial neural networks in general) use statistical algorithms to guess (infer) what should come next based on a large corpus of training material. It thus tends to regress to the mean; that is, the result tends toward the most statistically likely result that applies to the widest variety of cases. Most LLM-based tools then undergo another round of adjustment, called reinforcement learning from human feedback, to tailor its output toward the most broadly palatable prose. This can simultaneously be a strength and a "tell" for detecting AI-generated content.

For example, LLMs are usually trained on data from the internet in which famous people are generally described with positive, important-sounding language. Consequently, the LLM tends to omit specific, unusual, nuanced facts (which are statistically rare) and replace them with more generic, positive descriptions (which are statistically common). Thus the highly specific "inventor of the first train-coupling device" might become "a revolutionary titan of industry". It is like shouting louder and louder that a portrait shows a uniquely important person, while the portrait itself is fading from a sharp photograph into a blurry, generic sketch. The subject becomes simultaneously less specific and more exaggerated.

This statistical regression to the mean, a smoothing over of specific facts into generic statements, that could equally apply to many topics, makes AI-generated content easier to detect.

### Undue emphasis on significance, legacy, and broader trends

Words to watch: stands/serves as, is a testament/reminder, a crucial/pivotal/vital/significant/key role/moment, underscores/highlights its importance/significance, reflects broader, symbolizing its ongoing/enduring/lasting, contributing to the, setting the stage for, marking/shaping the, represents/marks a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted, distinction [matters/is important] because... ...

LLM writing often puffs up the importance of the subject matter by adding statements about how arbitrary aspects of the topic represent or contribute to a broader topic. There is a distinct and easily identifiable repertoire of ways that it writes these statements.

**Examples**

> Dip's work reflected the growing influence of regional social media personalities within localized digital communities in Bangladesh.

LLMs may include these statements for even the most mundane of subjects like etymology or population data. Sometimes, they add hedging preambles acknowledging that the subject is of relatively low importance, before talking about its importance anyway.

When talking about biology (e.g., when asked to discuss an animal or plant species), LLMs tend to over-emphasize connections to the broader ecosystem or environment, even when those connections are tenuous or generic. LLMs also tend to belabor the species' conservation status and research and preservation efforts, even if the status is unknown and no serious efforts exist.

As of mid-2026, LLMs frequently include these alongside hedging disclaimers, editorializing about how a particular distinction or nuance is important.

> Although the numerical figure should not be treated as an exact census of the Chola army, the episode indicates that the Cholas regarded Vikramabahu and the Ruhuna resistance as a serious threat.

#### Claims that a topic has influenced discussions about related topics

Words to watch: has/have shaped conversations/discussions/debate about

Another common manifestation of this sign is AI chatbots situating an article subject amid broader "debates" or noting a subject's involvement "in public discussions" about other topics.

They sometimes follow the rule of three with phrases like "This has started discussions about X, Y, and the Z regarding something else".

**Examples**

> The phenomenon has generated debate about authenticity, consent, and the psychological effects of digitally extending personhood.

> Collectively, these works have shaped emerging policy discussions about ownership, consent, and dignity in digital resurrection technologies.

### Undue emphasis on notability, attribution, and media coverage

Words to watch: independent coverage, local/regional/national/[country name] media outlets, music/business/tech outlets, trade publications, cited/featured/profiled in

Similarly, LLMs act as if the best way to prove that a subject is notable is to hit readers over the head with claims of notability, often by detailing sources that a subject has been covered in and specifying what kind of sources they are (e.g., trade publications, regional media, etc). They often inaccurately attribute their own superficial analyses to the source. This is more common in text from AI tools released in 2025 or later.

This sign is narrow and distinct from human-written press releases, which have of course also cited news clippings for decades. The distinctions are the idiosyncratic phrasing above and the fact that the focus is placed on characteristics of _the sources themselves_: their contents, their availability/unavailability in public searching, and their classification in relation to the media landscape and the article's subject. When LLMs are asked to write a Wikipedia article, the result often echoes the exact wording of Wikipedia's guidelines like "independent coverage," as if the LLM has collapsed the context between the edit and its justification.

**Examples**

> His pioneering journey and ongoing policy discussions have been extensively documented across major national and regional media networks, including \*The Hindu\*, \*Hindustan Times\*, \*Homegrown\*, \*The New Indian Express\*, \*Mathrubhumi\*, \*Manorama News\*, \*Asianet News\*, and \*News18 Kerala\*.

#### Undue emphasis on identification by primary or tertiary sources

Words to watch: Databases/records/listings/filings/materials identify/list/describe [article subject] as..., was identified by [source] as [fact]..., is listed in, his/her professional profile lists

When an article subject is mentioned in primary or tertiary sources (e.g., official websites, databases, historical records), AI-generated text will still over-stress the existence and contents of those sources. The emphasis will generally be on how these sources _identify_ the article subject and/or a fact about them, usually in a stilted and formulaic manner.

This sign became common starting in 2026.

**Examples**

> His personal website identifies him as a retired Indian Administrative Service (IAS) officer associated with the 1982 batch...

#### Undue emphasis on online presence

In articles about people or organizations that use social media, LLMs will often note that they "maintain an active social media presence" or something similar. This wording is particularly idiosyncratic to AI text and relatively uncommon on Wikipedia before ~2024.

**Examples**

> The mall maintains a strong digital presence, particularly on Instagram, where it actively shares the latest updates and events. Forum Kochi has consistently demonstrated excellence in digital promotions, with high-quality, engaging, and impactful video content playing a key role in its outreach.

### Superficial analyses

Words to watch: highlighting/underscoring/emphasizing ..., ensuring ..., reflecting/symbolizing ..., contributing to ..., cultivating/fostering ..., encompassing ..., enhancing ..., valuable insights, align/resonate with,

AI chatbots tend to insert superficial analysis of information, often in relation to its significance, recognition, or impact. This is often done by attaching a present participle ("-ing") phrase at the end of sentences, sometimes with vague attributions to third parties (see below).

For the purpose of Wikipedia, such comments are usually synthesis or unattributed opinions. Newer chatbots with retrieval-augmented generation (for example, an AI chatbot that can search the web) may attach these statements to named sources—e.g., "Roger Ebert highlighted the lasting influence"—regardless of whether those sources say anything close.

**Examples**

> Columbia's Tunisian record supplement featured Louisa Tounsia on its cover, highlighting the image that the record label wished to promote through its marketing.

### Vague expression of connection or association

Words to watch: in connection with/to ..., connected with/to, in association with ..., associated with

Rather than directly stating a connection or relationship between two subjects (e.g., "In 2017, John Doe was the CEO of ExampleCorp", "Professor Jane Doe taught science at Example University"), LLMs will often allude vaguely to the two subjects being "connected to" or "associated with" each other (e.g., "In 2017, sources identified John Doe as being associated with leadership of ExampleCorp", "Professor Jane Doe was connected with science education at Example University"). This pattern is often combined with promotional buzzspeak and generic "AI vocabulary", e.g. _particularly/widely associated_, sometimes even iteratively like in this August 2026 revision to Draft:Amir Tajik.

**Examples**

> He is associated with the Rajhans Orchestra, a multicultural ensemble combining Western classical and Indian musicians and instruments.

> The Rajhans Orchestra subsequently performed internationally. Contemporary material associated with the ensemble documents performances in India, the United States, Belgium and Pakistan.

### Vague attributions and overgeneralization of opinions

Words to watch: Industry reports, Observers have cited, Experts argue, Some critics argue, several sources/publications (when only few sources are cited), such as (before exhaustive word lists),  ...

AI chatbots tend to attribute opinions or claims to some vague authority—a practice called weasel wording. They also commonly exaggerate the quantity of sources that these opinions are attributed to. They may present views from one or two sources as widely held (often combined with the vague attributions above), mention the existence or opinion of multiple "reviewers" or "scholars" while only citing one person, or imply that lists of examples are non-exhaustive when the sources give no indication that other examples exist.

**Examples**

> Toy industry publications such as _The Toy Insider_ and _Mojo Nation_ have presented Rubik's WOWCube as a STEM-oriented platform that brings the Rubik's Cube "into the future" with motion controls and an open software ecosystem.

### Outline-like conclusions about challenges and future prospects

Words to watch: Despite its... faces several challenges..., Despite these challenges, Challenges and Legacy, Future Outlook ...

Many LLM-generated Wikipedia articles include a "Challenges" section, which typically begins with a sentence like "Despite its [positive/promotional words], [article subject] faces challenges..." and ends with either a vaguely positive assessment of the article subject, or speculation about how ongoing or potential initiatives could benefit the subject. Such paragraphs usually appear at the end of articles with a rigid outline structure, which may also include a separate section for "Future Prospects."

Note: This sign is about the rigid formula, not simply the mention of challenges or challenging.

**Examples**

> Despite their promising applications, pyroelectric materials face several challenges that must be addressed for broader adoption.

### "Awards and recognition" section

Section or subsection headers in the format of "X and Y" are common in (but not exclusive to) AI-generated articles. An "Awards and recognition" section is particularly common (indeed, also simply a "Recognition" section). This is a manifestation of AI-generated text's undue and particular focus on legacy and trends and its tendency to vaguely allude to "coverage" or "recognition" of the subject by various outlets.

While human editors may also include sections about a subject's legacy or impact on the world or their industry, the specific wording of "Awards and recognition" is nearly ubiquitous in AI generated articles, and much more common than in human writing even when comparing against articles tagged as containing promotional content.

AI-generated text displays consistent patterns in syntax, word choice, and sentence construction that human writing does not display to nearly the same degree. Conversely, it often struggles to match some syntactic and linguistic patterns characteristic of human writing. Some LLMs deviate more from human writing than others; for example, GPT-4o, the language model used by ChatGPT from May 2024 to August 2025, produces output with more variation from human writing than other contemporaneous language models. Since these are linguistic patterns, they occur consistently regardless of the subject matter, which often gives AI-generated text an identifiable "voice".

### High density of "AI vocabulary" words

Words to watch: Additionally (especially beginning a sentence), align with, boasts (meaning "has"), bolstered, crucial, deep dive, delve, emphasizing, enduring, enhance, fostering, garner, highlight (as a verb), interplay, intricate/intricacies, landscape (as an abstract noun), meticulous/meticulously, pivotal, robust, showcase, tapestry (as an abstract noun), testament, underscore (as a verb), valuable, vibrant

Many studies have demonstrated that LLMs overuse specific words. These words started appearing far more frequently in text produced after 2022, when LLM chatbots became widely accessible. They often co-occur in LLM output: where there is one, there are likely others. While most of these studies have analyzed scientific abstracts or fiction, "AI vocabulary" words are also ubiquitous in LLM-based encyclopedias, such as Grokipedia, and in AI-generated Wikipedia text. One or two of these words appearing in an edit may be coincidental, but an edit (post-2022) introducing lots of them, lots of times, is one of the strongest tells for AI use.

The words that LLMs overuse have changed over time. For instance, the word _delve_ was famously overused by ChatGPT in 2023 and early 2024, but became less frequent later in 2024, then dropped off sharply in 2025. Below is a breakdown of which words frequently recur together during which LLM "era". While these are not hard cutoffs, they should give you a rough idea of how "earlier" vs "later" LLM output reads.

- **2023 to mid-2024** (GPT-4): _Additionally_, _boasts_, _bolstered_, _crucial_, _delve_, _emphasizing_, _enduring_, _garner_, _intricate/intricacies_, _interplay_, _key_, _landscape_, _meticulously_, _pivotal_, _underscore_, _tapestry_, _testament_, _valuable_, _vibrant_
- **Mid-2024 to mid-2025** (GPT-4o): _align with_, _bolstered_, _crucial_, _emphasizing_, _enhance_, _enduring_, _fostering_, _highlighting_, _pivotal_, _showcasing_, _underscore_, _vibrant_
- **Mid-2025 to mid-2026** (GPT-5): _emphasizing_, _enhance_, _highlighting_, _showcasing_ (plus words associated with "Canned emphasis on notability, attribution, and media coverage")
- **Mid-2026 and on** (GPT-6): _challenge_, _clearer_, _dependable_, _echoed_, _foster_, _leverage_, _matters_, _multifaceted_, _practical_, _prioritize_, _quietly_, _steady_, _universally_ (with much more period and comma usage and shorter sentences around a strict 8–20 word limit)
  The distribution of "AI vocabulary" is also somewhat different depending on the chatbot or LLM used. Grok output is particularly idiosyncratic: it overuses superficially "scientific" words like _causal_, _empirical_, _correlate_, and continues to overuse _underscore_ as of 2026.

This section is to be taken as literally as possible: a word being overused by AI does _not_ imply that its synonyms are also overused. Also, keep context in mind. For example, while the figurative use of "underscore" is ubiquitous in earlier AI text, the word can also refer to a literal underline mark or to incidental music.

**Examples**

> Additionally, Somali merchants played a pivotal role in the global coffee trade, being one of the first to export coffee beans.

### Avoidance of basic copulatives ("is"/"are" phrases)

Words to watch: serves as/stands as/marks/functions as/operates as/represents [a], boasts/features/maintains/offers [a], refers to

LLM-generated text often replaces simple constructions that use copulas such as _is_ or _are_ with constructions such as _serves as a_ or _mark the_. This pattern has been observed in GPT and Gemini models. One study documented an over 10% decrease in the usage of the words _is_ and _are_ in academic writing in 2023, with no major changes in their frequency before that. Similarly, LLMs prefer to use marketing\-related verbs like _features_, _offers_, and the like to their neutral synonym _has_. (Note: Do not confuse this with _has_ used in the present perfect form, as in _has been featured_.) Sometimes—especially in more recent AI output—these constructions are more elaborate and link to vague expressions of connection or association between two topics, e.g., _ventured into politics as a candidate_ versus _was a candidate_, or _began his career as_ versus _was_.

A similar decline in "is"/"are" constructions has been observed on Wikipedia, especially when controlling for lead paragraphs (which usually follow a formulaic structure of "[article subject] is...]" and thus skew the data). It is particularly visible in AI copyedits, which will often "improve" text in this way. The study above also demonstrated that when GPT-3.5 was prompted to "Revise the following sentence" in 10,000 abstracts, the words _is_ and _are_ appeared less often in the revised versions.

In lead sentences, LLMs will sometimes avoid _is_ by writing _refers to_ as though the article were about the word or term instead of the subject directly.

### Negative parallelisms

When LLMs describe a subject, their output may seem as though it is clearing up a common misconception, or as though the audience may be reaching an incomplete or incorrect conclusion about that subject. This kind of contrast can come across as trying to retroactively challenge such thinking by pointing out another characteristic that the subject may possess alongside (or in the place of) one or more previously mentioned characteristics. While it is common among human writers (especially in "common misconceptions" or "myths busted" listicles), it is stereotypically an "AI sign".

#### Not just X, but also Y

It is common for LLMs to use parallel constructions involving "not", "but", or "however" such as "Not only ... but ..." or "It is not just ..., it's ...".

Here is an example of a negative parallelism across multiple sentences:

**Examples**

> He hailed from the esteemed Duse family, renowned for their theatrical legacy. Eugenio's life, however, took a path that intertwined both personal ambition and familial complexities.

#### Not X, but Y

Another common LLM pattern is parallelisms that explicitly state that a particular item does not possess the first characteristic at all. Such constructions are often expressed as "It's not ..., it's ..." or "no ..., no ..., just ...".

**Examples**

> The viewer is presented with a self-image that is not grounded in visual mastery, but in what Amelia Jones terms “the performative enactment of subjectivity”.[...]This dispersal is not dissolution. Rather, it constitutes what Deleuze might describe as “becoming”—an identity in flux, constituted through iterative difference. Through this lens, Kusama’s self-portrait is not a mirror but a portal: not a representation of self, but a mechanism for its constant reinvention.

#### Y rather than X

This pattern may also be reversed, a construction particularly common in recent LLM output.

**Examples**

> Cyber Security News described the software as a bridge between AI coding agents and existing reverse-engineering tools rather than a replacement for conventional disassemblers.

### Rule of three

LLMs overuse the rule of three. This can take different forms, from "adjective, adjective, adjective" to "short phrase, short phrase, and short phrase". LLMs often use this structure to make superficial analyses appear more comprehensive.

This sign is stronger when it appears in contexts where most people would not bother to include such stylistic flourishes, like edit summaries.

**Examples**

> The film preserves core elements such as Nezha's mythological image, magical weapons, and spirit of resistance while reshaping them through contemporary values, modern aesthetics, and digital animation technology.

### Formatting patterns

AI-generated text tends to exhibit some stylistic features that are not expected to be found as often in human-made articles. These include:

- Using title case instead of sentence case in section titles.
- Overuse of boldface in prose, sometimes misusing asterisks in an attempt to do so.
- Frequently presenting information in inline-header vertical lists.
- Using the incorrect heading levels. For example, an LLM might start an article with a level 1 heading containing the article title, or use multiple level 1 headings throughout.
- Affixing emoji at the beginning of section titles or list entries.
- Using curly quotation marks (“”) and apostrophes (’) instead of straight ones.

### Collaborative communication

Words to watch: a Wikipedia-style article, I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., is there anything else, let me know, more detailed breakdown, here is a ..., [check/verify/confirm]... ...before [publishing/publication/submitting]

Editors sometimes paste text from an AI chatbot that was meant as correspondence, prewriting or advice, rather than article content. This may appear in article text or within comments (`<!-- -->`).

### Hedging disclaimers about source availability and recommended usage

Words to watch: While specific details are limited/scarce..., not widely available/documented/disclosed, ...in the provided/available sources / search results..., [claim] should be [treated/presented] as... rather than..., based on available information, ...does not by itself establish... ...

Chatbots will often attempt to fill perceived gaps in article content by drawing attention to the fact that there are gaps, or otherwise include cautionary disclaimers.

#### 2023–2024

Older LLMs (~2023) often added didactic disclaimers about topics being "important to note". This frequently took the form of advice to an imagined reader regarding safety or controversial topics, or disambiguating topics that varied in different locales/jurisdictions. Several such disclaimers appear in OpenAI's GPT-4 system card as examples of "partial refusals".

#### 2024–2025

Chatbots with retrieval-augmented generation (e.g., the ability to search the web) often fail to find sources on a given topic, or to find information within the sources a user provides. When this happens, they often output a statement claiming that the information is not publicly available. They may also pair it with text about what that information "likely" may be and why it is significant. This information is entirely speculative (including the very claim that it's "not documented") and may be based on loosely related topics or completely fabricated. When that unknown information is about an individual's personal life, this disclaimer often states that the person "maintains a low profile", "keeps personal details private", etc. This is also speculative.

#### Mid-2026–present

As of mid-2026, chatbots frequently include disclaimers about how sources should be used or other "corrective framings." There are at least three known patterns:

- Negative parallelism constructions, usually with "rather than", warning that a source or claim should be treated as [something speculative/subjective/symbolic] rather than [something definitive/verified].
- Cautioning that the available information does not establish [some firm conclusion].
- Disambiguating a topic by stating it "should not be confused" with another topic. (Note: This pattern is less reliable than the above two.)

### Phrasal templates and placeholder text

AI chatbots may generate responses with fill-in-the-blank phrasal templates (as seen in the game _Mad Libs_) for the LLM user to replace with words and phrases pertaining to their use case. However, some LLM users forget to fill in those blanks. Note that non-LLM-generated templates exist for drafts and new articles, such as Wikipedia:Artist biography article template/Preload and pages in Category:Article creation templates.

**Examples**

> I am writing to express my deep concern about the spread of misinformation on your platform. Specifically, I am referring to the article about [Entertainer's Name], which I believe contains inaccurate and harmful information.

#### Date placeholders

Large language models may insert placeholder dates like "2026\-xx-xx" into citation fields, particularly the access-date parameter and rarely the date parameter as well, producing errors.

#### URL placeholders

Historically, LLMs have used strings such as `INSERT_SOURCE_URL_##` or `INSERT_WEBSITE_URL_HERE` to fill the URL field in citations.

### Broken external links

If a new article or draft has multiple citations with external links, and **several** of them are broken (e.g., non-existent websites or 404 errors), this is a strong sign of an AI-generated page, particularly if the dead links are not found in website archiving sites like the Internet Archive. Most links become broken over time, but these factors make it unlikely that the link was ever real.

Watch out for: Links that don't work for you, but do work for other people (e.g., journal articles accessed through a university library); links that were mangled by bots and scripts (e.g., to add incorrect identifiers or to remove seemingly unnecessary parts of the URL); links that are missing the start or end (a sign of a human copy/pasting the URL).

### Invalid DOI and ISBNs

A checksum can be used to verify ISBNs. An invalid checksum is a very likely sign that an ISBN is incorrect, and citation templates display a warning if so. Similarly, DOIs are more resistant to link rot than regular hyperlinks. Unresolvable DOIs and invalid ISBNs can be indicators of hallucinated references.

### Book citations without page numbers or URLs

The book reference appears valid – a book on electric circuits would likely have information about Ohm's law – but without the page number, that citation is not useful for verifying the claims in the prose.

### Syntax

LLMs writing or editing Wikipedia articles will attempt, by default, to produce text in what it considers to be "formal, neutral, encyclopedic tone". This manifests as AI-generated text avoiding certain syntactic constructions that are both common in human writing and often perfectly acceptable per the Manual of Style – and in some cases, even preferred by it.

Specifically, the following have been empirically observed, over 25 years of Wikipedia writing, to be more common in Wikipedia articles written by humans than in AI-generated text:

- Simple is/has phrases, such as _there is a_, _it has a_.
- Words with complex, stiff or euphemistic synonyms, such as _wrote_ (versus _authored_), _moved_ (versus _relocated_), _used_ (versus _utilized_), _tried_ (versus _attempted_), _died_ (versus _passed away_).
- Superlative or definitive statements, such as _one of the best_, _is the only_, _was the first_
- Qualifiers and intensifiers, such as _very_, _perhaps_, _tends to_.
- Isolated wordy constructions such as _as a result of_, _in order to_, _all of the_, _a part of_, or _the fact that_.

### Weak indicators

- **Perfect grammar** – While modern LLMs are known for high grammatical proficiency, many editors are also skilled writers or come from professional writing backgrounds. (See also § Sudden shift in English variety use.)
- **Combination of casual and formal registers, or language that sounds both "clinical" and "emotional"** – This may indicate the casual writing of a person in a technical field, such as computer science. It may also indicate youth, a preference for mixed registers, playfulness, or neurodivergence. In the case of a wiki, it may simply be the result of multiple editors adding to a page.
- **"Bland" or "robotic" prose** – LLM output has specific traits, as detailed above, and it skews positive and verbose by default. While these tendencies are formulaic, they may not scan as "robotic" to those unfamiliar with AI writing.
- **"Fancy", "academic", or "formal" prose** – While LLMs disproportionately favor certain words and phrases, many of which are longer and have more difficult readability scores than some of their synonyms, these are _specific words_. The correlation does not extend to all formal, academic, or "fancy"-sounding prose.
- **Transition words (in isolation)** – Older AI text tended to formulaically overuse certain transitions like _Additionally,_ _Consequently,_ and _Notably,_ often to begin sentences. However, only a few transition words and phrases are known to be overused by AI in this way. This pattern also has precedence in essay-like writing by humans and is accepted by many style guides, so this is not a strong tell.

The following indicators were common in text generated by older AI models, but are much less frequent in newer models. They may still be useful for finding older undetected AI-generated edits. Dates are approximate.

### Promotional and advertisement-like language (2023–2025)

Words to watch: boasts a, vibrant, rich, profound, enhancing, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking, renowned, featuring, diverse array,  ...

Older LLMs had serious problems keeping a neutral tone. Even when prompted to use an encyclopedic style, their output often tended toward press release-like writing, or like the prose of a travel guide. While this did not apply to all promotional writing -- in particular, AI-generated articles tended to avoid superlative or obviously positive statements like "the best" -- the stylistic trend was noticeable.

However, this blatant promotional tone became less common in AI output starting around 2024, and is no longer common in newer LLM output unless a user specifically asks for it. While LLM-generated Wikipedia articles are often "promotional" in terms of conflict of interest or the information it includes (e.g., focusing on awards), the prose itself is less likely to be.

**Examples**

> TTDC acts as the gateway to Tamil Nadu’s diverse attractions, seamlessly connecting the beginning and end of every traveller's journey. It offers dependable, value-driven experiences that showcase the state’s rich history, spiritual heritage, and natural beauty.

### Statements about knowledge cutoffs (2022–2023)

Words to watch: Up to my last training update, as of my last knowledge update ...

A knowledge-cutoff disclaimer is a statement used by an AI chatbot to indicate that the information provided may be incomplete, inaccurate, or outdated.

Older LLMs with fixed knowledge cutoffs, such as GPT-3.5 or GPT-4, were unable to provide any information on events or developments past a certain date (usually the model's last training update). Such LLMs would often remind the user about this by outputting a disclaimer that the information in its response is accurate only up to a certain date, sometimes explicitly mentioning the knowledge cutoff.

**Examples**

> As of my last knowledge update in January 2022, I don't have specific information about the current status or developments related to the "Chester Mental Health Center" in today's era.

### Section summaries

Words to watch: In summary, In conclusion, Overall ...

When generating longer outputs (such as when told to "write an article"), older LLMs often added sections titled "Conclusion" or similar, and often ended paragraphs or sections by summarizing and restating its core idea. Many of these older models are still used because of lower or absent token costs, so this sign is still observed after 2024, just much less.

**Examples**

> In summary, the educational and training trajectory for nurse scientists typically involves a progression from a master's degree in nursing to a Doctor of Philosophy in Nursing, followed by postdoctoral training in nursing research. This structured pathway ensures that nurse scientists acquire the necessary knowledge and skills to engage in rigorous research and contribute meaningfully to the advancement of nursing science.

### Prompt refusal

Words to watch: as an AI language model, as a large language model, I cannot offer medical advice, but I can..., I'm sorry ...

In the past, AI chatbots occasionally declined to answer prompts as written, usually with apologies and reminders that they are AI language models. Attempting to be helpful, chatbots often gave suggestions or answers to alternative, similar requests. Outright refusals have become increasingly rare.

**Examples**

> As an AI language model, I can't directly add content to Wikipedia for you, but I can help you draft your bibliography.

### Overuse of em dashes (2022–September 2026)

While human editors and writers often use em dashes (—), LLM output is much more disposed to use them than nonprofessional human-written text of the same genre, and uses them in places where humans are more likely to use commas, parentheses, colons, or (misused) hyphens (-) and en dashes (–). LLMs especially tend to use em dashes in a formulaic, pat way, often mimicking "punched up" sales-like writing by over-emphasizing clauses or parallelisms. AI-generated em dashes are usually surrounded by spaces, contrary to common typographic guidelines (which most human users of em dashes will be familiar with).

This sign is most useful when taken in combination with other indicators, not by itself. It is much more common on discussion pages than in article text. Also, because LLMs' use of em-dashes has become somewhat notorious, some AI companies have attempted to make their newer chatbots suppress their use, most notably OpenAI's GPT-5.1. A July 2026 study found that of contemporary models only Claude used em dashes more than professional writers, and ChatGPT used them less.

While still produced today as many AI users don't use the latest AI models, those same latest AI models of late (September 2026 and onward) have more and more often been found to be hard coded to not use em dashes at all. This, however, has the unintended side effect of making LLMs not once dare to use any sort of alternate puctuation, so the overall variety has dropped significantly in their output; commas and periods are more likely now than even human text, and now that has become its own sign of AI writing.

### Lexical diversity/elegant variation

Older AI models may include a repetition penalty, meant to discourage it from reusing words too often. This pattern has also been observed on Wikipedia on a broad level: both when comparing Wikipedia text from before 2023 to Wikipedia text from after 2023, and comparing the older Wikipedia text to "Wikipedia-style articles" generated by GPT-4o-mini and Gemini-1.5-Flash.

Note: If a user adds multiple pieces of AI-generated content in separate edits, this tell may not apply, as each piece of text may have been generated in isolation.

It must be noticed, however, that editors who are not native English speakers might prefer to avoid repeated words as well. For example, Italian schools often teach to avoid repeating words.
