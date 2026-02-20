---
title: Architecture
description: Overview of key dependencies and libraries including mdast, Shiki, Mermaid, and KaTeX that power vue-stream-markdown.
---

# Architecture

This document serves to acknowledge and document the key dependencies and libraries that have been instrumental in building **vue-stream-markdown**. Special thanks to the teams and maintainers behind these projects for their excellent work and contributions to the open-source community.

## Core Dependencies

### AST Transformation: mdast & mdast-util

The [mdast](https://github.com/syntax-tree/mdast) (Markdown Abstract Syntax Tree) ecosystem provides the foundation for parsing and transforming Markdown content into a structured tree format. This AST-based approach enables fine-grained rendering control and optimizations for streaming scenarios where content arrives incrementally.

**Key packages:**

- `mdast-util-from-markdown` - Converts Markdown text into mdast syntax trees
- `mdast-util-to-markdown` - Converts mdast syntax trees back to Markdown text
- `mdast-util-gfm` - Adds GitHub Flavored Markdown support
- `mdast-util-math` - Handles mathematical expressions in the AST
- `mdast-util-frontmatter` - Processes YAML frontmatter

### Syntax Completion: Internal Implementation

This project implements syntax completion functionality internally, inspired by [remend](https://github.com/vercel/streamdown/tree/main/packages/remend) from the [streamdown](https://streamdown.ai/) project. It intelligently parses and completes incomplete Markdown syntax blocks, automatically detecting and completing unterminated syntax to provide the foundation for streaming-friendly Markdown parsing.

### Complex Rendering Libraries

#### Shiki - Code Syntax Highlighting

[Shiki](https://shiki.style/) provides beautiful syntax highlighting for code blocks using TextMate grammars. Shiki's `codeToTokens` API enables token-level incremental rendering, reducing DOM recreation overhead and providing better rendering update control for streaming scenarios.

#### Mermaid - Diagram Rendering

[Mermaid](https://mermaid.js.org/) enables the rendering of various types of diagrams (flowcharts, sequence diagrams, state diagrams, etc.) from text-based definitions. It provides progressive diagram rendering with throttling support, making it suitable for streaming-friendly updates.

#### KaTeX - Mathematical Expression Rendering

[KaTeX](https://katex.org/) is a fast, self-contained library for rendering LaTeX mathematical expressions in the browser. It supports progressive rendering through throttling, making it well-suited for streaming scenarios.

## Architecture Flow

The rendering pipeline follows this general flow:

1. **Preprocessing** - Custom syntax completion functions handle incomplete syntax
2. **Parsing** - `mdast-util-from-markdown` converts Markdown to AST
3. **Postprocessing** - AST is processed and optimized for streaming
4. **Rendering** - Vue components render each AST node type:
   - Specialized renderers for code (Shiki), diagrams (Mermaid), math (KaTeX)

## Acknowledgments

Special thanks to:

- The [**mdast**](https://github.com/syntax-tree/mdast) ecosystem maintainers for providing a robust AST foundation
- The [**streamdown**](https://streamdown.ai/) team and [**remend**](https://github.com/vercel/streamdown/tree/main/packages/remend) contributors for the foundational ideas that inspired this project's syntax completion implementation
- The [**Shiki**](https://shiki.style/) team for excellent syntax highlighting with streaming-friendly APIs
- The [**Mermaid**](https://mermaid.js.org/) team for comprehensive diagram rendering capabilities
- The [**KaTeX**](https://katex.org/) team for fast and reliable math rendering
- All the maintainers and contributors of the dependencies that make this project possible
