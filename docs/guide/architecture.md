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

### Syntax Completion: remend

[remend](https://github.com/vercel/streamdown/tree/main/packages/remend) is a library from the [streamdown](https://streamdown.ai/) project that intelligently parses and completes incomplete Markdown syntax blocks. It automatically detects and completes unterminated syntax, providing the foundation for streaming-friendly Markdown parsing.

### Complex Rendering Libraries

#### Shiki - Code Syntax Highlighting

[Shiki](https://shiki.style/) provides beautiful syntax highlighting for code blocks using TextMate grammars. Shiki's `codeToTokens` API enables token-level incremental rendering, reducing DOM recreation overhead and providing better rendering update control for streaming scenarios.

#### Mermaid - Diagram Rendering

[Mermaid](https://mermaid.js.org/) enables the rendering of various types of diagrams (flowcharts, sequence diagrams, state diagrams, etc.) from text-based definitions. It provides progressive diagram rendering with throttling support, making it suitable for streaming-friendly updates.

#### KaTeX - Mathematical Expression Rendering

[KaTeX](https://katex.org/) is a fast, self-contained library for rendering LaTeX mathematical expressions in the browser. It supports progressive rendering through throttling, making it well-suited for streaming scenarios.

### Fallback Rendering: markdown-it-async

[markdown-it-async](https://github.com/jinghaihan/markdown-it-async) serves as a fallback rendering mechanism for AST nodes that don't have dedicated renderers. It provides HTML rendering as a safety net, ensuring that all Markdown content can be rendered.

## Architecture Flow

The rendering pipeline follows this general flow:

1. **Preprocessing** - Custom syntax completion functions + `remend` handle incomplete syntax
2. **Parsing** - `mdast-util-from-markdown` converts Markdown to AST
3. **Postprocessing** - AST is processed and optimized for streaming
4. **Rendering** - Vue components render each AST node type:
   - Specialized renderers for code (Shiki), diagrams (Mermaid), math (KaTeX)
   - Fallback to `markdown-it-async` for unsupported node types

## Acknowledgments

Special thanks to:

- The [**mdast**](https://github.com/syntax-tree/mdast) ecosystem maintainers for providing a robust AST foundation
- The [**streamdown**](https://streamdown.ai/) team and [**remend**](https://github.com/vercel/streamdown/tree/main/packages/remend) contributors for solving the hard problem of streaming Markdown parsing
- The [**Shiki**](https://shiki.style/) team for excellent syntax highlighting with streaming-friendly APIs
- The [**Mermaid**](https://mermaid.js.org/) team for comprehensive diagram rendering capabilities
- The [**KaTeX**](https://katex.org/) team for fast and reliable math rendering
- All the maintainers and contributors of the dependencies that make this project possible
