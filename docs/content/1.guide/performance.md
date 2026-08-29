---
title: Performance
navigation:
  icon: i-lucide-gauge
description: Incremental Comark parsing, stable Vue rendering, and token-level code updates.
---

vue-stream-markdown is built with performance in mind, utilizing Vue's reactivity and memoization capabilities to ensure efficient rendering even with large amounts of streaming content. The library intelligently caches computations and prevents unnecessary re-renders, making it ideal for real-time AI streaming applications.

## Incremental Rendering with Stable Keys

In streaming scenarios, content arrives incrementally. The key to performance is **preserving existing nodes** rather than re-rendering them from scratch. As new content streams in, only new nodes are added to the end, while existing nodes with stable keys are recognized by Vue and remain untouched. This means:

- Completed paragraphs don't re-render
- Finished code blocks remain stable
- Interactive elements maintain their state
- Only the streaming node updates incrementally

## Code Block Token-Level Updates

Code blocks receive special optimization through Shiki's `codeToTokens` API, enabling **token-level incremental updates** instead of full DOM recreation:

::stream-markdown{example="guide-performance.codeBlockExample"}
::

> 💡 **Tip**: Click the "Start Typing" button above and open the browser console to observe the incremental rendering behavior in real-time.

This approach ensures that:

- Only new or changed tokens are processed, not the entire code block
- Existing tokens remain in the DOM, reducing DOM operations
- Code blocks update smoothly as content streams in
- Large code blocks avoid expensive full re-renders

## Stateful Comark Parsing

Each `Markdown` instance owns one long-lived Comark parser. The component always supplies the complete source, while Comark tracks the stable prefix internally and parses the changing tail incrementally. Vue Stream Markdown does not split the document or build a second compatibility representation.

Simple Comark tuples are converted directly to VNodes. Only feature-heavy code and math rendering use lazily loaded Vue components.

## Performance Summary

vue-stream-markdown's performance optimizations provide:

- **Incremental Parsing** - Comark reuses the stable source prefix and processes the changing tail
- **Stable Output** - Completed blocks remain stable and don't re-render, with nodes cached by Vue
- **Direct Rendering** - Compact Comark tuples render directly to VNodes without an intermediate conversion model
- **Minimal Overhead** - Heavy feature components and their event listeners are created only when needed

This makes vue-stream-markdown particularly well-suited for AI chat interfaces with streaming responses, real-time collaborative editing, and progressive content loading scenarios.
