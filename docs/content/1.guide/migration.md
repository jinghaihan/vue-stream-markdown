---
title: 2.0 Migration Guide
navigation:
  icon: i-lucide-route
description: Move a 1.x integration to the Comark parser and optional extension packages.
---

Version 2.0 replaces the mdast pipeline with [Comark](https://github.com/comarkdown/comark), renders its compact document directly, and moves large rendering runtimes behind optional extensions. The `Markdown` component and its core display options remain familiar, but parser customization and rich-renderer configuration have changed.

## Parser return value

When using `@markmend/parser` directly, `parse()` returns the document and
streaming completion information as one result. Replace direct document access
on the parse result:

```ts
// Before
const document = await parser.parse(markdown)

// 2.0
const { document, completion } = await parser.parse(markdown)
```

`getDocument()` continues to return the latest successfully parsed document.
Custom completion functions may continue returning a string, or return
`{ markdown, completion }` to describe the syntax they completed.

## Package changes

The main package remains:

```sh
pnpm add vue-stream-markdown
```

Install rich renderers separately:

```sh
pnpm add @stream-markdown/code
pnpm add @stream-markdown/math
pnpm add @stream-markdown/mermaid
pnpm add @stream-markdown/beautiful-mermaid
```

Package changes:

- `@markmend/ast` is replaced by `@markmend/parser`.
- `@stream-markdown/html` is removed; native HTML and custom tags are supported by the main package.
- Beautiful Mermaid is no longer bundled with `@stream-markdown/mermaid`.
- Shiki, KaTeX, Mermaid, and Beautiful Mermaid types come from their corresponding extension packages.

## Configure rich renderers

In 1.x, provider configuration was passed directly to `Markdown`:

```vue
<Markdown
  :shiki-options="shikiOptions"
  :katex-options="katexOptions"
  :mermaid-options="mermaidOptions"
  :cdn-options="cdnOptions"
/>
```

In 2.0, create extension instances and pass them through `extensions`:

```vue
<script setup lang="ts">
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { code } from '@stream-markdown/code'
import { math } from '@stream-markdown/math'
import { mermaid } from '@stream-markdown/mermaid'

const extensions = {
  code: code({ theme: ['github-light', 'github-dark'] }),
  math: math(),
  beautifulMermaid: beautifulMermaid(),
  mermaid: mermaid(),
}
</script>

<template>
  <Markdown :content="content" :extensions="extensions" />
</template>
```

When both diagram extensions are configured, supported diagrams use Beautiful Mermaid and other diagram types fall back to Mermaid.

## Replace parser APIs

| 1.x                                      | 2.0                                   |
| ---------------------------------------- | ------------------------------------- |
| `mdastOptions`                           | `parserOptions`                       |
| Markmend preprocessing hooks             | `completion` / `completionSteps`      |
| `nodeRenderers` keyed by mdast node type | `components` keyed by HTML/Comark tag |
| `components` for built-in UI             | `uiComponents`                        |
| `getMarkdownParser()`                    | Removed                               |
| `getParsedNodes()`                       | `getDocument()`                       |
| `getProcessedContent()`                  | Removed                               |

The removed lifecycle hooks include `normalize`, `preprocess`, `parseMarkdownIntoBlocks`, `postnormalize`, and `postprocess`. Use `completion` for a complete custom function or `completionSteps` to replace selected built-in steps. The built-in completion functions are now exported with a `complete*` prefix (for example, `completeLink` and `completeMath`) and are also available through `defaultCompletionSteps`.

### Custom completion

```vue
<script setup lang="ts">
function completion(markdown: string) {
  return markdown.endsWith('**') ? markdown : markdown + '**'
}
</script>

<template>
  <Markdown :content="content" :completion="completion" />
</template>
```

Completion runs only in streaming mode. Static mode parses the original source.

To keep the default pipeline and replace one rule, pass a partial step map:

```ts
import { completeLink } from 'vue-stream-markdown'

const completion = {
  completionSteps: {
    link: (markdown, context) => completeLink(markdown, context),
  },
}
```

### Comark plugins

```vue
<script setup lang="ts">
import myPlugin from './my-comark-plugin'

const parserOptions = {
  plugins: [myPlugin()],
}
</script>

<template>
  <Markdown :content="content" :parser-options="parserOptions" />
</template>
```

## Replace custom renderers

In 1.x, `nodeRenderers` received mdast-oriented nodes. In 2.0, map the emitted tag name directly:

```vue
<script setup lang="ts">
import CustomHeading from './custom-heading.vue'
import GitHubCard from './github-card.vue'

const components = {
  h2: CustomHeading,
  github: GitHubCard,
}
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

The same mapping handles native Markdown elements and custom HTML-like tags.

If you previously passed built-in UI replacements through `components`, rename that prop:

```vue
<Markdown :ui-components="{ Button: CustomButton }" />
```

## Share configuration across messages

`MarkdownProvider` can supply extensions and theme defaults to a message list:

```vue
<MarkdownProvider :extensions="extensions">
  <Markdown
    v-for="message in messages"
    :key="message.id"
    :content="message.content"
  />
</MarkdownProvider>
```

An individual `Markdown` can override a provider value when one message needs different behavior.

## Migration checklist

- Install only the rich-renderer packages your application uses.
- Move Shiki, KaTeX, Mermaid, and CDN options into extension factories.
- Replace `mdastOptions` with `parserOptions` or `completion`.
- Replace `nodeRenderers` with tag-based `components`.
- Rename UI replacement `components` to `uiComponents`.
- Replace parsed-node access with `getDocument()`.
- Remove `@stream-markdown/html` and any mdast compatibility code.
- Import `katex/dist/katex.min.css` when loading KaTeX locally.
- Test custom tags, security rules, streaming-to-static transitions, and extension fallbacks.
