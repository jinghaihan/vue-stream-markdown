---
title: Extensions
navigation:
  icon: i-lucide-plug
description: Add syntax highlighting, mathematics, and diagrams only when your application needs them.
---

`vue-stream-markdown` works without any rich-renderer package. Code remains readable source, math stays ordinary Markdown text, and [Mermaid](https://mermaid.js.org/) fences remain code blocks until the corresponding extension is supplied.

Extension factories receive their renderer options and return instances for the `extensions` prop.

## Complete example

```vue
<script setup lang="ts">
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { code } from '@stream-markdown/code'
import { math } from '@stream-markdown/math'
import { mermaid } from '@stream-markdown/mermaid'
import { Markdown, MarkdownProvider } from 'vue-stream-markdown'
import 'katex/dist/katex.min.css'

const extensions = {
  code: code({
    theme: ['github-light', 'github-dark'],
    langs: ['typescript', 'vue'],
  }),
  math: math({
    config: { throwOnError: false },
  }),
  beautifulMermaid: beautifulMermaid({
    theme: ['github-light', 'github-dark'],
  }),
  mermaid: mermaid({
    theme: ['neutral', 'dark'],
  }),
}
</script>

<template>
  <MarkdownProvider :extensions="extensions">
    <Markdown :content="content" />
  </MarkdownProvider>
</template>
```

Create extension instances once. For a chat or message list, pass them through `MarkdownProvider` so every message can share the same configuration:

```vue
<script setup lang="ts">
import { code } from '@stream-markdown/code'
import { Markdown, MarkdownProvider } from 'vue-stream-markdown'

const extensions = { code: code() }
</script>

<template>
  <MarkdownProvider :extensions="extensions">
    <Markdown v-for="message in messages" :key="message.id" :content="message.content" />
  </MarkdownProvider>
</template>
```

An instance can replace one provider extension or disable it with `false`:

```vue
<Markdown :extensions="{ code: false }" />
```

## Code

Install `@stream-markdown/code` to enable [Shiki](https://shiki.style/) highlighting:

```sh
pnpm add @stream-markdown/code
```

```ts
import type { CodeExtensionOptions } from '@stream-markdown/code'
import { code } from '@stream-markdown/code'

const options: CodeExtensionOptions = {
  theme: ['vitesse-light', 'vitesse-dark'],
  langs: ['typescript', 'vue'],
  langAlias: { 'custom-lang': 'typescript' },
  codeToTokenOptions: {
    includeExplanation: false,
  },
}

const codeExtension = code(options)
```

## Math

Install `@stream-markdown/math` to add both [Comark](https://github.com/comarkdown/comark) math parsing and [KaTeX](https://katex.org/) rendering:

```sh
pnpm add @stream-markdown/math
```

```ts
import type { MathExtensionOptions } from '@stream-markdown/math'
import { math } from '@stream-markdown/math'

const options: MathExtensionOptions = {
  config: {
    throwOnError: false,
    macros: {
      '\\RR': '\\mathbb{R}',
    },
  },
}

const mathExtension = math(options)
```

For local package loading, import [KaTeX](https://katex.org/) CSS in your application:

```ts
import 'katex/dist/katex.min.css'
```

The extension adds both math parsing and [KaTeX](https://katex.org/) rendering. Without it, math-like source remains ordinary text.

## Mermaid

The standard [Mermaid](https://mermaid.js.org/) renderer supports every diagram type supported by your Mermaid version:

```sh
pnpm add @stream-markdown/mermaid
```

```ts
import type { MermaidExtensionOptions } from '@stream-markdown/mermaid'
import { mermaid } from '@stream-markdown/mermaid'

const options: MermaidExtensionOptions = {
  theme: ['neutral', 'dark'],
  config: {
    securityLevel: 'strict',
    flowchart: { curve: 'basis' },
  },
}

const mermaidExtension = mermaid(options)
```

## Beautiful Mermaid

Install the lightweight [Beautiful Mermaid](https://github.com/lukilabs/beautiful-mermaid) renderer independently:

```sh
pnpm add @stream-markdown/beautiful-mermaid
```

```ts
import type { BeautifulMermaidExtensionOptions } from '@stream-markdown/beautiful-mermaid'
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'

const options: BeautifulMermaidExtensionOptions = {
  theme: ['github-light', 'github-dark'],
  config: { padding: 12 },
}

const beautifulMermaidExtension = beautifulMermaid(options)
```

You can configure both diagram extensions at once:

```ts
const extensions = {
  beautifulMermaid: beautifulMermaid(),
  mermaid: mermaid(),
}
```

The renderer tries Beautiful Mermaid only for diagram types it supports, then falls back to Mermaid. If Mermaid is omitted, unsupported diagrams stay as code blocks.

## Custom error components

Provider error components belong to their extension factory:

```ts
import DiagramError from './diagram-error.vue'

const extensions = {
  mermaid: mermaid({ errorComponent: DiagramError }),
  math: math({ errorComponent: DiagramError }),
}
```

## CDN loading

CDN configuration also belongs to each extension rather than `<Markdown>`:

```ts
const cdnOptions = {
  getUrl(module: string, version: string) {
    if (module === 'katex-css')
      return `https://esm.sh/katex@${version}/dist/katex.min.css`
    return `https://esm.sh/${module}@${version}`
  },
}

const extensions = {
  code: code({ cdnOptions }),
  math: math({ cdnOptions }),
  beautifulMermaid: beautifulMermaid({ cdnOptions }),
  mermaid: mermaid({ cdnOptions }),
}
```

You can also set `baseUrl` and provider switches such as `shiki`, `katex`, `mermaid`, or `beautifulMermaid`. Local dependencies remain the default when no CDN URL is configured.
