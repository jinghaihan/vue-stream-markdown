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
} from 'vue-stream-markdown'

// Combine built-in functions
const normalize = flow([
  preprocessContent, // Replace CRLF with LF, trim trailing spaces
  preprocessLaTeX, // Preprocess LaTeX syntax
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
  Markdown
} from 'vue-stream-markdown'

// Custom preprocess with selective functions
const preprocess = flow([
  fixCode, // Fix incomplete code blocks
  fixStrong, // Fix incomplete strong (**bold**)
  fixEmphasis, // Fix incomplete emphasis (*italic*)
  // Skip other functions or add your own
])
</script>

<template>
  <Markdown :content="content" :preprocess="preprocess" />
</template>
```

### Built-in Preprocess Functions

The following functions are available for use in `preprocess`:

- `fixCode`: Completes incomplete code block syntax (```code```)
- `fixFootnote`: Removes incomplete footnote references (`[^label]`) that don't have corresponding definitions (`[^label]:`)
- `fixStrong`: Completes incomplete strong syntax (`**bold**`). Also removes standalone list markers (`- `) left after removing incomplete `**` to prevent parsing issues
- `fixEmphasis`: Completes incomplete emphasis syntax (`*italic*`). Also removes standalone list markers (`- `) left after removing incomplete `*` to prevent parsing issues
- `fixDelete`: Completes incomplete strikethrough syntax (`~~deleted~~`)
- `fixTaskList`: Removes incomplete task list syntax (`- [`) and standalone dashes (`-`) that could cause parsing issues. **Must run before `fixLink`** to prevent `- [` from being treated as an incomplete link
- `fixLink`: Completes incomplete link syntax (`[text](url)`) and removes trailing standalone brackets (`[`) without content
- `fixTable`: Completes incomplete table syntax
- `fixInlineMath`: Completes incomplete inline math syntax (`$$math$$`)
- `fixMath`: Completes incomplete block math syntax (`$$\n...\n$$`)

::: danger ⚠️ Important: Execution Order
The order of preprocess functions is **critical** to prevent parsing conflicts. The default order is:
:::

```typescript
flow([
  fixCode,
  fixFootnote,
  fixStrong,
  fixEmphasis,
  fixDelete,
  fixTaskList, // Must run before fixLink
  fixLink,
  fixTable,
  fixInlineMath,
  fixMath,
])
```

**Key ordering rules:**

- **`fixCode` runs first**: Code blocks should be handled early to prevent code syntax from interfering with other syntax completion.

- **`fixTaskList` must run before `fixLink`**: This prevents incomplete task list syntax like `- [` from being misinterpreted as an incomplete link marker. If `fixLink` runs first, it will remove the `[`, leaving `- ` which could be parsed as a setext heading underline.

- **`fixStrong` and `fixEmphasis` should run early**: These functions clean up not only `**` and `*`, but also any standalone list markers (`- `) left behind, preventing them from causing parsing issues in later stages.

If you customize the preprocess pipeline, ensure you maintain these ordering rules to avoid parsing conflicts.

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

### builtin

- **Type:** `{ micromark?: BuiltinPluginControl, from?: BuiltinPluginControl, to?: BuiltinPluginControl }`

Control built-in plugins. Set a plugin key to `false` to disable it, or provide a function to override it.

Available built-in plugins:
- **micromark**: `gfm`, `math`, `frontmatter`, `cjkFriendlyExtension`, `gfmStrikethroughCjkFriendly`
- **from**: `gfmFromMarkdown`, `mathFromMarkdown`, `frontmatterFromMarkdown`
- **to**: `gfmToMarkdown`, `mathToMarkdown`, `frontmatterToMarkdown`

### singleDollarTextMath

- **Type:** `boolean`
- **Default:** `false`

Enable single dollar sign (`$`) for inline math expressions. When enabled, you can use `$math$` in addition to `$$math$$`.

### Example

```vue
<script setup lang="ts">
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { Markdown } from 'vue-stream-markdown'

const mdastOptions = {
  singleDollarTextMath: true, // Enable single $ for math
  builtin: {
    micromark: {
      gfm: false, // Disable built-in GFM
    },
  },
  micromark: [
    gfm(), // Add custom GFM support
  ],
  from: [
    gfmFromMarkdown(),
  ],
}
</script>

<template>
  <Markdown :content="content" :mdast-options="mdastOptions" />
</template>
```
