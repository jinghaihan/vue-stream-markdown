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

The repository benchmarks the equivalent Vue Stream Markdown and Streamdown pipelines under the same inputs. These numbers are a local snapshot from an Apple M1 running Node.js 22.22.2; absolute throughput varies by machine, so the relative result is more useful than the exact operations per second.

### Completion and parsing

`pnpm bench:parser` measures streaming completion plus Markdown parsing. Vue Stream Markdown uses Markmend with its long-lived Comark parser. The Streamdown path uses [Remend](https://github.com/vercel/streamdown/tree/main/packages/remend), Streamdown block splitting, and [Remark](https://remark.js.org/) with GFM.

| Scenario                              | Vue Stream Markdown |  Streamdown | Faster |
| ------------------------------------- | ------------------: | ----------: | -----: |
| Cold parse, short document            |         2,271 ops/s | 1,195 ops/s |  1.90× |
| Cold parse, medium document           |         1,075 ops/s |   113 ops/s |  9.49× |
| Cold parse, large document            |           357 ops/s |  28.6 ops/s | 12.49× |
| Growing paragraph, 19 updates         |           432 ops/s |   115 ops/s |  3.76× |
| Large stable prefix, 16 updates       |           108 ops/s |  17.3 ops/s |  6.27× |
| Appending complete blocks, 16 updates |           955 ops/s |   190 ops/s |  5.04× |

The largest parsing gain appears when a document has substantial stable content. Comark can reuse that prefix while the response continues growing at the end.

### DOM rendering

`pnpm bench:render` measures an initial render and a session containing 20 streaming appends. Controls and animations are disabled for both renderers, and both receive their Shiki code extension when the input contains a code block.

| Scenario                                | Vue Stream Markdown | Streamdown | Faster |
| --------------------------------------- | ------------------: | ---------: | -----: |
| Prose, initial render                   |           488 ops/s |  271 ops/s |  1.80× |
| Prose, 20 streaming appends             |          34.6 ops/s | 25.1 ops/s |  1.38× |
| Stable code block, initial render       |           247 ops/s |  237 ops/s |  1.04× |
| Stable code block, 20 streaming appends |          32.1 ops/s | 20.6 ops/s |  1.56× |

The code-block cold render is effectively the same order of magnitude. The more meaningful advantage appears during repeated streaming updates, where completed blocks and highlighted tokens remain stable.

These are cross-framework end-to-end measurements—Vue for vue-stream-markdown and React for Streamdown—not a claim about the underlying framework runtimes in isolation. Run the benchmark commands in your target environment before using the figures for capacity planning.

## Performance Summary

vue-stream-markdown's performance optimizations provide:

- **Incremental Parsing** - Comark reuses the stable source prefix and processes the changing tail
- **Stable Output** - Completed blocks remain stable and don't re-render, with nodes cached by Vue
- **Direct Rendering** - Compact Comark tuples render directly to VNodes without an intermediate conversion model
- **Minimal Overhead** - Heavy feature components and their event listeners are created only when needed

This makes vue-stream-markdown particularly well-suited for AI chat interfaces with streaming responses, real-time collaborative editing, and progressive content loading scenarios.
