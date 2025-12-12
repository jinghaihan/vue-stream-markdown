# Parser Configuration

The parser configuration allows you to customize the markdown parsing process through four main functions: `normalize`, `preprocess`, `postNormalize`, and `postprocess`. These functions work together to handle content normalization, syntax completion, and AST post-processing.

## normalize

- **Type:** `(content: string) => string`
- **Default:** Built-in normalize function

The `normalize` function is used for routine normalization of markdown content. It does **not** include syntax completion. The parser compares the result after `normalize` with the result after `preprocess` to determine whether there are currently loading nodes.

### How It Works

In streaming mode, the parser:
1. First applies `normalize` to the raw content
2. Then applies `preprocess` to the normalized content (for syntax completion)
3. Compares the two results: if they differ, it indicates that syntax completion occurred, and the parser marks the last leaf node as `loading`

### Customization

You can completely customize the `normalize` function, or use built-in functions from the library and combine them freely:

```vue
<script setup lang="ts">
import {
  flow,
  Markdown,
  preprocessContent,
  preprocessLaTeX,
  preprocessThinkTag
} from 'vue-stream-markdown'

// Combine built-in functions
const normalize = flow([
  preprocessContent, // Replace CRLF with LF, trim trailing spaces
  preprocessLaTeX, // Preprocess LaTeX syntax
  preprocessThinkTag, // Preprocess think tags
  // Add your own functions
])
</script>

<template>
  <Markdown :content="content" :normalize="normalize" />
</template>
```

### Built-in Normalize Functions

The following functions are available for use in `normalize`:

- `preprocessContent`: Replaces CRLF with LF and trims trailing spaces
- `preprocessLaTeX`: Preprocesses LaTeX syntax (source code from [Dify](https://github.com/langgenius/dify))
- `preprocessThinkTag`: Preprocesses think tags (source code from [Dify](https://github.com/langgenius/dify)). This function helps simplify the integration cost when using Dify, as it handles Dify's special think tag syntax (e.g., `<think>...</think>`) by converting them to HTML `<details>` elements

## preprocess

- **Type:** `(content: string) => string`
- **Default:** Built-in preprocess function

The `preprocess` function is responsible for **syntax completion**. It takes the normalized content and completes incomplete markdown syntax to ensure proper parsing during streaming.

### Customization

If you want full customization, you can combine `preprocess` functions yourself. All built-in `preprocess` functions are available and can be combined in any order you want:

```vue
<script setup lang="ts">
import {
  fixCode,
  fixEmphasis,
  fixStrong,
  flow,
  Markdown,
  remend
} from 'vue-stream-markdown'

// Custom preprocess with selective functions
const preprocess = flow([
  fixStrong, // Fix incomplete strong (**bold**)
  fixEmphasis, // Fix incomplete emphasis (*italic*)
  fixCode, // Fix incomplete code blocks
  // Skip other functions or add your own
])
</script>

<template>
  <Markdown :content="content" :preprocess="preprocess" />
</template>
```

### Built-in Preprocess Functions

The following functions are available for use in `preprocess`:

- `fixFootnote`: Removes incomplete footnote references (`[^label]`) that don't have corresponding definitions (`[^label]:`)
- `fixStrong`: Completes incomplete strong syntax (`**bold**`)
- `fixEmphasis`: Completes incomplete emphasis syntax (`*italic*`)
- `fixDelete`: Completes incomplete strikethrough syntax (`~~deleted~~`)
- `fixLink`: Completes incomplete link syntax (`[text](url)`) and removes trailing standalone brackets (`[` or `![`) without content
- `fixCode`: Completes incomplete code block syntax (```code```)
- `fixTable`: Completes incomplete table syntax
- `fixInlineMath`: Completes incomplete inline math syntax (`$math$`)
- `remend`: Intelligently parses and completes incomplete Markdown syntax blocks (from [remend](https://github.com/vercel/streamdown/tree/main/packages/remend), a library from the [streamdown](https://streamdown.ai/) project). It automatically detects and completes unterminated syntax, providing the foundation for streaming-friendly Markdown parsing

## postNormalize

- **Type:** `(data: SyntaxTree) => SyntaxTree`
- **Default:** Built-in postNormalize function

The `postNormalize` function is executed after the AST (Abstract Syntax Tree) is generated, but before `postprocess`. It is used for basic AST normalization tasks, such as reorganizing footnote definitions.

### How It Works

The parser processes the AST in the following order:
1. Markdown is parsed into an AST
2. `postNormalize` is applied (for basic normalization)
3. `postprocess` is applied (for streaming-specific processing)

### Customization

You can customize the `postNormalize` function to modify the AST:

```vue
<script setup lang="ts">
import type { SyntaxTree } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

// Custom postNormalize
function postNormalize(ast: SyntaxTree): SyntaxTree {
  // Your custom AST normalization logic
  // For example, reorganize nodes, normalize structure, etc.
  return ast
}
</script>

<template>
  <Markdown :content="content" :post-normalize="postNormalize" />
</template>
```

### Built-in PostNormalize Functions

The following functions are available for use in `postNormalize`:

- `postFixFootnote`: Reorganizes footnote definitions by moving them to the end of the document

## postprocess

- **Type:** `(content: SyntaxTree) => SyntaxTree`
- **Default:** Built-in postprocess function

The `postprocess` function is executed after `postNormalize`. It is used to perform streaming-specific processing on the AST syntax tree before rendering. In streaming mode, `postprocess` is always applied; in static mode, it is skipped.

### Customization

You can customize the `postprocess` function to modify the AST:

```vue
<script setup lang="ts">
import type { SyntaxTree } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

// Custom postprocess
function postprocess(ast: SyntaxTree): SyntaxTree {
  // Your custom AST processing logic
  // For example, modify nodes, add metadata, etc.
  return ast
}
</script>

<template>
  <Markdown :content="content" :postprocess="postprocess" />
</template>
```

### Built-in Postprocess Functions

The following functions are available for use in `postprocess`:

- `postFixText`: Fixes text nodes, such as trimming trailing `$` and `$$` to fix preprocess math breaking

## Complete Example

Here's a complete example showing how to use all four functions together:

```vue
<script setup lang="ts">
import type { SyntaxTree } from 'vue-stream-markdown'
import {
  flow,
  Markdown,
  normalize,
  postNormalize,
  postprocess,
  preprocess
} from 'vue-stream-markdown'

const customNormalize = flow([normalize])
const customPreprocess = flow([preprocess])
function customPostNormalize(ast: SyntaxTree): SyntaxTree {
  return postNormalize(ast)
}
function customPostprocess(ast: SyntaxTree): SyntaxTree {
  return postprocess(ast)
}
</script>

<template>
  <Markdown
    :content="content"
    :normalize="customNormalize"
    :preprocess="customPreprocess"
    :post-normalize="customPostNormalize"
    :postprocess="customPostprocess"
  />
</template>
```

## mdastOptions

- **Type:** `MdastOptions`

Options for configuring the MDAST (Markdown Abstract Syntax Tree) parser.

**Note:** The configuration here **extends** the default plugins rather than replacing them. The default plugins include:

- `mdast-util-from-markdown`
- `mdast-util-frontmatter`
- `mdast-util-gfm`
- `mdast-util-math`
- `mdast-util-to-markdown`
- `micromark-extension-cjk-friendly`
- `micromark-extension-cjk-friendly-gfm-strikethrough`
- `micromark-extension-frontmatter`
- `micromark-extension-gfm`
- `micromark-extension-math`
- `micromark-util-types`

### from

- **Type:** `FromMarkdownExtension[]`

Extensions for parsing markdown to MDAST. These are added **in addition to** the default extensions.

### to

- **Type:** `ToMarkdownExtension[]`

Extensions for converting MDAST to markdown.

### micromark

- **Type:** `MicromarkExtension[]`

Micromark extensions for parsing. These are added **in addition to** the default extensions.

### Example

```vue
<script setup lang="ts">
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { Markdown } from 'vue-stream-markdown'

const mdastOptions = {
  micromark: [
    gfm(), // Add GFM support
    // Add your custom micromark extensions
  ],
  from: [
    gfmFromMarkdown(), // Add GFM from-markdown support
    // Add your custom from-markdown extensions
  ],
  to: [
    // Add your custom to-markdown extensions
  ],
}
</script>

<template>
  <Markdown :content="content" :mdast-options="mdastOptions" />
</template>
```

## extendMarkdownIt

- **Type:** `(md: MarkdownItAsync) => void`

Function to extend the markdown-it instance with custom plugins or configurations.

**Note:** The `MarkdownItAsync` type comes from [`markdown-it-async`](https://github.com/antfu/markdown-it-async), which enhances `markdown-it` to support async highlight functions. `markdown-it` is only used as a **fallback** rendering mechanism for AST nodes that don't have dedicated node renderers. In most cases, you **don't need to configure this** as the library provides renderers for common node types. Only configure this if you need to add custom markdown-it plugins for handling unsupported node types.

### Example

```vue
<script setup lang="ts">
import type { MarkdownItAsync } from 'markdown-it-async'
import markdownItFootnote from 'markdown-it-footnote'
import { Markdown } from 'vue-stream-markdown'

function extendMarkdownIt(md: MarkdownItAsync) {
  // Add plugins
  md.use(markdownItFootnote)

  // Configure options
  md.set({
    html: true,
    linkify: true,
    typographer: true,
  })
}
</script>

<template>
  <Markdown :content="content" :extend-markdown-it="extendMarkdownIt" />
</template>
```
