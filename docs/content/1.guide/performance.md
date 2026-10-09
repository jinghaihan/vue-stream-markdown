---
title: Performance
navigation:
  icon: i-lucide-gauge
description: Incremental Comark parsing, stable Vue rendering, and token-level code updates.
---

vue-stream-markdown minimizes repeated parsing and DOM work as a response grows. It keeps parser state for each document, preserves completed Vue nodes, and updates highlighted code at token level.

## Incremental Rendering with Stable Keys

In streaming scenarios, content arrives incrementally. The key to performance is **preserving existing nodes** rather than re-rendering them from scratch. As new content streams in, only new nodes are added to the end, while existing nodes with stable keys are recognized by Vue and remain untouched. This means:

- Completed paragraphs don't re-render
- Finished code blocks remain stable
- Interactive elements maintain their state
- Only the streaming node updates incrementally

## Code Block Token-Level Updates

When `@stream-markdown/code` is configured, code blocks use [Shiki](https://shiki.style/)'s `codeToTokens` API for **token-level incremental updates** instead of full DOM recreation:

::stream-markdown{example="guide-performance.codeBlockExample"}
::

> 💡 **Tip**: Click the "Start Typing" button above and open the browser console to observe the incremental rendering behavior in real-time.

This approach ensures that:

- Only new or changed tokens are processed, not the entire code block
- Existing tokens remain in the DOM, reducing DOM operations
- Code blocks update smoothly as content streams in
- Large code blocks avoid expensive full re-renders

## Stateful Comark Parsing

Each `Markdown` instance owns one long-lived [Comark](https://github.com/comarkdown/comark) parser. The component always supplies the complete source, while Comark tracks the stable prefix internally and parses the changing tail incrementally. Vue Stream Markdown does not split the document or build a second compatibility representation.

Simple Comark tuples are converted directly to VNodes. Only feature-heavy code and math rendering use lazily loaded Vue components.

## Comparison with Streamdown

[Streamdown](https://streamdown.ai/) was an important inspiration for this project. This comparison documents implementation trade-offs under reproducible workloads rather than presenting a universal ranking.

This snapshot compares **vue-stream-markdown 2.1.0** with **Streamdown 2.7.0**.

| Dependency          | Vue Stream Markdown                      | Streamdown                         |
| ------------------- | ---------------------------------------- | ---------------------------------- |
| Renderer            | `vue-stream-markdown@2.1.0`              | `streamdown@2.7.0`                 |
| Code extension      | `@stream-markdown/code@2.1.0`            | `@streamdown/code@2.0.0`           |
| Parser / completion | `@markmend/parser@2.1.0`, `comark@0.7.0` | `remend@1.4.0`, Remark with GFM    |
| Framework           | `vue@3.5.43`                             | `react@19.3.0`, `react-dom@19.3.0` |

Run `pnpm bench:compare` to build the workspace packages and repeat all comparison scenarios. The results below are the **median throughput of five independent runs**, using built artifacts on both sides and interleaved sampling within each scenario. The machine was an Apple M1 (arm64), running Node.js 22.22.2 and Vitest 5.0.3.

Higher operations per second means faster processing. **Vue / Streamdown** is the ratio of the two median throughputs: above 1 favors Vue Stream Markdown; below 1 favors Streamdown. Absolute rates vary with machine load, and some scenarios showed substantial variation between runs. These results are not a controlled before/after comparison with older documentation snapshots.

### Completion and parsing

`pnpm bench:parser` measures streaming completion plus Markdown parsing. Vue Stream Markdown uses Markmend with its long-lived Comark parser. The Streamdown path uses [Remend](https://github.com/vercel/streamdown/tree/main/packages/remend), Streamdown block splitting, and [Remark](https://remark.js.org/) with GFM.

| Scenario                              | Vue Stream Markdown 2.1.0 | Streamdown 2.7.0 | Vue / Streamdown |
| ------------------------------------- | ------------------------: | ---------------: | ---------------: |
| Cold parse, short document            |            1,826.92 ops/s |     864.71 ops/s |            2.11× |
| Cold parse, medium document           |              722.20 ops/s |      79.28 ops/s |            9.11× |
| Cold parse, large document            |              225.52 ops/s |      19.96 ops/s |           11.30× |
| Growing paragraph, 19 updates         |              283.55 ops/s |      78.34 ops/s |            3.62× |
| Large stable prefix, 16 updates       |               60.94 ops/s |      20.76 ops/s |            2.94× |
| Appending complete blocks, 16 updates |              617.15 ops/s |     149.50 ops/s |            4.13× |

Comark reuses the stable source prefix while the response continues growing at the end.

### DOM rendering

`pnpm bench:render` measures an initial render and a session containing 20 streaming appends. Controls and animations are disabled for both renderers, and both receive their Shiki code extension when the input contains a code block.

| Scenario                                                  | Vue Stream Markdown 2.1.0 | Streamdown 2.7.0 | Vue / Streamdown |
| --------------------------------------------------------- | ------------------------: | ---------------: | ---------------: |
| Prose, initial render                                     |              265.06 ops/s |     193.29 ops/s |            1.37× |
| Prose, 20 streaming appends                               |               36.76 ops/s |      24.99 ops/s |            1.47× |
| Stable code block, initial render                         |              135.25 ops/s |     145.07 ops/s |            0.93× |
| Stable code block followed by prose, 20 streaming appends |               30.59 ops/s |      23.15 ops/s |            1.32× |

First rendering of a document containing a code block was close between the two implementations, with substantial variation between runs. Repeated streaming appends after the completed code block favored Vue Stream Markdown in this workload.

### Growing code blocks

`pnpm bench:code` measures 20 line appends inside an unfinished TypeScript code fence, starting with either 2 or 200 code lines. Each session uses fresh source text to avoid complete-result cache hits, and each update waits for highlighted DOM output.

| Scenario                               | Vue Stream Markdown 2.1.0 | Streamdown 2.7.0 | Vue / Streamdown |
| -------------------------------------- | ------------------------: | ---------------: | ---------------: |
| Short code block, 20 appended lines    |               30.91 ops/s |      16.37 ops/s |            1.89× |
| 200-line code block, 20 appended lines |                6.47 ops/s |       1.59 ops/s |            4.08× |

DOM measurements use jsdom 30.1.2, with controls and animations disabled and highlighters warmed up. Waiting for DOM output includes polling timers. These cross-framework measurements include parsing, highlighting, and DOM updates; they do not measure browser layout, paint, or frame rate, or isolate the framework runtimes. Run the benchmarks in your target environment before using the figures for capacity planning.

## Performance Summary

vue-stream-markdown's performance optimizations provide:

- **Incremental Parsing** - Comark reuses the stable source prefix and processes the changing tail
- **Stable Output** - Completed blocks remain stable and don't re-render, with nodes cached by Vue
- **Direct Rendering** - Compact Comark tuples render directly to VNodes without an intermediate conversion model
- **Minimal Overhead** - Heavy feature components and their event listeners are created only when needed

This makes vue-stream-markdown particularly well-suited for AI chat interfaces with streaming responses, real-time collaborative editing, and progressive content loading scenarios.
