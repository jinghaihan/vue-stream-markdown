---
title: Optional Extensions
navigation:
  icon: i-lucide-plug
description: Add Shiki, KaTeX, Mermaid, and Beautiful Mermaid without coupling their dependencies or types to the main package.
---

`vue-stream-markdown` works without any rich-renderer package. Code remains readable source, math stays ordinary Markdown text, and Mermaid fences remain code blocks until the corresponding extension is supplied.

Extension factories receive provider-specific options and return stable runtime instances for the `extensions` prop.

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

Create these runtimes once rather than recreating them during every Vue render.

## Shared Extension Lifecycle

Every extension implements both `preload()` and `dispose()`. Wrap a message list in `MarkdownProvider` to preload provider extensions once and dispose them when the provider unmounts:

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

Provider-owned extensions are never disposed when an individual Markdown instance unmounts. An instance owns only the extensions it adds or replaces.

## Code

Install `@stream-markdown/code` to enable Shiki highlighting:

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

The package exports its Shiki-specific option types. The main package only sees normalized token data, so applications that do not install this extension can still typecheck.

The shared Shiki highlighter is retained by a module-level reference across Markdown component remounts and cannot be garbage-collected until that reference is released. The code extension's lifecycle `dispose()` is intentionally a no-op because other providers or instances may still share that highlighter. Call `disposeShikiHighlighter()` from `@stream-markdown/code` manually only when syntax highlighting is no longer needed, such as during full-app or test cleanup.

## Math

Install `@stream-markdown/math` to add both Comark math parsing and KaTeX rendering:

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

For local package loading, import KaTeX CSS in your application:

```ts
import 'katex/dist/katex.min.css'
```

KaTeX is externalized from the extension bundle. Its parser plugin is also absent from the base parser until `math()` is supplied.

## Mermaid

The standard Mermaid renderer supports every diagram type supported by your Mermaid version:

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

The extension installs the Mermaid runtime as its own dependency while keeping it out of the main package.

## Beautiful Mermaid

Install the lightweight Beautiful Mermaid renderer independently:

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
import diagramError from './diagram-error.vue'

const extensions = {
  mermaid: mermaid({ errorComponent: diagramError }),
  math: math({ errorComponent: diagramError }),
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

## Type isolation

`vue-stream-markdown` declares only minimal structural extension contracts. Shiki, KaTeX, Mermaid, and Beautiful Mermaid types are exported from their corresponding extension packages. Installing only the main package therefore does not introduce unresolved optional-provider types during application typechecking.
