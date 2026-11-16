---
title: 'acorn-rs: porting acorn to Rust'
date: '16-11-2026'
updated: '16-11-2026'
categories:
  - 'rust'
  - 'open-source'
excerpt: A Rust port of the acorn JavaScript parser and acorn-typescript that gives the same syntax errors, with the same message at the same position. Built for svelte-check-native, and all 24,364 tests pass.
link: https://docs.rs/acorn-rs/latest/acorn_rs/
source_url: https://github.com/harshmandan/acorn-rs
---

[acorn-rs](https://crates.io/crates/acorn-rs) is a Rust port of [acorn](https://github.com/acornjs/acorn) 8.19.0 and [@sveltejs/acorn-typescript](https://github.com/sveltejs/acorn-typescript) 1.0.13. It tells you whether some JavaScript or TypeScript parses, and if it doesn't, it gives the exact error acorn gives: the same message at the same position. It doesn't, however, build a syntax tree, because svelte-check-native, the project it was built for, already gets its tree from oxc. All it needed from acorn was the verdict.

That's a strange thing to want from a parser, so here's where it came from.

## Translating oxc's errors

[svelte-check-native](/blog/svelte-check-native) is my Rust port of svelte-check, and its output has to match upstream byte for byte. The Svelte compiler reads every script and template expression with acorn, so when a component has a syntax error, svelte-check shows acorn's message at acorn's position.

svelte-check-native parsed scripts with oxc and translated oxc's errors into acorn's message and position. The two parsers are built differently, so every disagreement needed its own rule, and the rules never ran out. On the inputs of acorn's own test suite, 126 JavaScript cases still differed, and in 15 of them one parser accepted the script and the other refused it. Across the inputs of both test suites, 6,068 cases, it differed from the compiler on 288.

Writing more rules wasn't going to close that, so I ported acorn.

## Following acorn's code

The port follows acorn's functions and their call order, because that order decides which error wins when a script has more than one problem. It's fixed to the settings the Svelte compiler uses: ECMAScript 2025, module code (always strict), and parentheses kept in expressions. It counts UTF-16 code units like acorn does, and hands back byte offsets into the Rust string.

acorn-typescript is a plugin. It overrides about a hundred of acorn's methods and adds a type parser on top. In the port that's a switch on the same parser: a method the plugin overrides goes to its TypeScript version, which calls back into the plain one wherever the plugin calls `super`.

The plugin also tries a reading and takes it back when it doesn't work out, for example when an expression starts with `<` and could be a type argument or a cast. The plugin records its changes and undoes them. The port restores a copy of the parser instead. Scope lists are shared between copies until one side changes them, so a copy is cheap.

## Keeping the bugs

The rule for the port is that upstream is the spec. Where the port disagrees with acorn, the port is wrong, even if acorn looks buggy. Some of those quirks decide what the user sees:

- acorn-typescript raises a few errors at a column number and treats it as an offset. `class { static public x }` on the first line fails at `public`, but on any later line the error points earlier in the file than the problem.
- For a modifier that isn't allowed, acorn-typescript passes the function that builds the message instead of the message. So the text the compiler shows is that function's source code.
- On deeply nested input, acorn runs out of stack and throws "Not enough stack space". The port bounds every recursion and returns the same error instead of crashing.

## Testing against acorn

A Node script runs the pinned acorn on every input from acorn's and acorn-typescript's test suites and records what it returns. Each input is read the four ways the compiler reads text: as a component's script, a module, an expression and a single statement. A Rust test runs the same inputs through the port and compares the message and offset, or where the expression ends.

| Suite                         | Inputs |     Checks |      Agree |
| :---------------------------- | -----: | ---------: | ---------: |
| acorn's test suite            |  2,896 |     11,584 |     11,584 |
| acorn-typescript's test suite |  3,188 |     12,752 |     12,752 |
| Other tests                   |        |         28 |         28 |
| **Total**                     |        | **24,364** | **24,364** |

The one thing not compared exactly is the offset of "Not enough stack space". acorn itself reports a different one from run to run, so the test only checks that both sides run out.

In svelte-check-native, the 288 differences from the compiler dropped to 2, both that stack offset. Ten files in the benchmark repos that were already refused now reported the position the compiler reports, and four that the compiler accepts stopped being refused.

## Using it

The port started inside svelte-check-native and now has its own repository, so anyone can use it as a crate.

```toml
[dependencies]
acorn-rs = "0.2"
```

```rust
use acorn_rs::{Language, Position, Reading, parse, parse_expression_at};

let error = parse("let let = 1;", Reading::Module, Language::JavaScript).unwrap_err();
assert_eq!(error.message, "The keyword 'let' is reserved");
assert_eq!(error.position, Position::Offset(4)); // byte offset

assert!(parse("let x: number = 1;", Reading::Module, Language::TypeScript).is_ok());

// Where the expression starting at offset 1 ends.
assert_eq!(parse_expression_at("{a + b}", 1, Language::JavaScript), Ok(6));
```

`parse_expression_at` is what a template parser needs: given `{a + b}`, it tells you where the expression ends, so you know where the closing brace should be.

It's a partial port. There's no syntax tree, no other ECMAScript versions or options, no JSX and no `using` declarations. The [README](https://github.com/harshmandan/acorn-rs#whats-ported) has the full list, and contributions are welcome.
