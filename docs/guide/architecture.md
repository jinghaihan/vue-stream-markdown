---
title: Architecture
description: How Comark, Markmend, and Vue cooperate during streaming Markdown rendering.
---

# Architecture

Vue Stream Markdown separates syntax completion, incremental parsing, and Vue rendering so each layer can stay focused.

## Rendering pipeline

1. The component receives the complete Markdown source on every update.
2. A long-lived [Comark](https://github.com/comarkdown/comark) parser reuses the stable source prefix and isolates the changed tail.
3. While `mode="streaming"`, Comark calls the Markmend completion function for that unstable tail.
4. Comark plugins apply security, footnote, math, and user-defined transformations.
5. The compact Comark `MarkdownDocument` is rendered directly to Vue VNodes. There is no compatibility-tree conversion.

Parser calls are serialized in source order. If parsing one update fails, the renderer keeps the last successfully parsed document instead of replacing the UI with an error state.

## Custom tags

Comark represents native HTML and custom syntax with the same compact element tuples. The public `components` prop maps these tag names directly to Vue components, so custom HTML does not require a separate HTML parser or sanitizer package.

## Complex renderers

Simple semantic elements are rendered synchronously as VNodes. Code blocks and math remain specialized components because they coordinate optional runtimes and stateful UI:

- [Shiki](https://shiki.style/) provides syntax highlighting.
- [Mermaid](https://mermaid.js.org/) and [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) render diagrams.
- [KaTeX](https://katex.org/) renders mathematical expressions.

These optional runtimes are loaded only when their features are used.

## Acknowledgments

Special thanks to:

- [Comark](https://github.com/comarkdown/comark) for its compact document model and stateful incremental parser.
- [Streamdown](https://streamdown.ai/) and [Remend](https://github.com/vercel/streamdown/tree/main/packages/remend) for foundational streaming Markdown ideas.
- The Shiki, Mermaid, beautiful-mermaid, and KaTeX maintainers for the complex rendering runtimes used by this project.
