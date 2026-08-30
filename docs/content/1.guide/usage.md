---
title: Usage
navigation:
  icon: i-lucide-rocket
description: Install vue-stream-markdown and opt into only the rich renderers your application needs.
---

## Installation

The main package includes Markdown parsing, streaming completion, Vue rendering, HTML/custom tags, GFM, CJK support, and plain code blocks:

```sh
pnpm add vue-stream-markdown
```

Rich renderers are optional. Install only the packages you use:

```sh
# Shiki syntax highlighting
pnpm add @stream-markdown/code

# KaTeX parsing and rendering
pnpm add @stream-markdown/math

# Standard Mermaid
pnpm add @stream-markdown/mermaid

# Beautiful Mermaid
pnpm add @stream-markdown/beautiful-mermaid
```

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

const content = ref('# Hello World\n\nThis is **streaming** Markdown.')
</script>

<template>
  <Markdown :content="content" mode="streaming" />
</template>
```

Use `mode="static"` after streaming finishes when the source should be rendered exactly as supplied. Static mode skips Markmend completion.

## Enable rich renderers

Each extension factory owns its provider-specific configuration. Create extension instances once and pass them through the `extensions` prop:

```vue
<script setup lang="ts">
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { code } from '@stream-markdown/code'
import { math } from '@stream-markdown/math'
import { mermaid } from '@stream-markdown/mermaid'
import { Markdown, MarkdownProvider } from 'vue-stream-markdown'
import 'katex/dist/katex.min.css'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

const extensions = {
  code: code({ theme: ['github-light', 'github-dark'] }),
  math: math(),
  beautifulMermaid: beautifulMermaid(),
  mermaid: mermaid(),
}
</script>

<template>
  <MarkdownProvider :extensions="extensions">
    <Markdown :content="content" />
  </MarkdownProvider>
</template>
```

When both diagram extensions are present, supported diagrams use Beautiful Mermaid and unsupported diagram types fall back to Mermaid. Without a matching diagram extension, the original code block remains visible.

Use `MarkdownProvider` around a message list to share extension lifecycles and theme observation. A standalone `Markdown` remains supported, and instance props override provider defaults.

## Custom tags

Comark parses native HTML and custom HTML-like tags into the same compact document model. Map custom tags directly to Vue components:

```vue
<script setup lang="ts">
import githubCard from './github-card.vue'

const components = { github: githubCard }
const content = '<github name="vuejs/core" />'
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

See [Components](/config/components) and [HTML Rendering](/feature/html-rendering).

## Nuxt and SSR

Add the styles you use to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  css: [
    'vue-stream-markdown/index.css',
    'vue-stream-markdown/theme.css',
    'katex/dist/katex.min.css', // only when using @stream-markdown/math
  ],
})
```

## Next steps

- [Extensions](/config/extensions)
- [Parser](/config/parser)
- [Display Options](/config/display-options)
- [Controls](/config/controls)
- [Security](/config/security)
