---
title: Usage
description: Install and use vue-stream-markdown in streaming and static modes.
---

## Installation

```sh
pnpm add vue-stream-markdown
```

Install the optional peer dependencies for the features you use:

```sh
pnpm add shiki mermaid katex
```

When CDN loading is enabled, those libraries do not need to be installed locally.

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'katex/dist/katex.min.css'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

const content = ref('# Hello World\n\nThis is **streaming** Markdown.')
</script>

<template>
  <Markdown :content="content" mode="streaming" />
</template>
```

Use `mode="static"` after streaming finishes if you want settled-source semantics. Static mode skips Markmend completion.

## Custom tags

Comark parses native HTML and custom HTML-like tags into the same compact document model. Map custom tags directly to Vue components:

```vue
<script setup lang="ts">
import GitHubCard from './GitHubCard.vue'

const components = { github: GitHubCard }
const content = '<github name="vuejs/core" />'
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

See [Components](/config/components) and [HTML Rendering](/feature/html-rendering).

## Nuxt and SSR

Add the styles to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  css: [
    'katex/dist/katex.min.css',
    'vue-stream-markdown/index.css',
    'vue-stream-markdown/theme.css',
  ],
})
```

## Next steps

- [Parser](/config/parser)
- [Configuration](/config/)
- [Display Options](/config/display-options)
- [Controls](/config/controls)
- [Security](/config/security)
- [External Options](/config/external-options)
