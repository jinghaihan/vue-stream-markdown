---
title: Introduction
navigation:
  icon: i-lucide-book-open
description: Render complete and streaming Markdown in Vue applications.
---

`vue-stream-markdown` is a Vue 3 renderer for Markdown that changes while it is being generated. It keeps incomplete responses readable, preserves stable content between updates, and adds interactive controls for rich output.

## Why streaming needs a dedicated renderer

A normal Markdown renderer expects a finished document. Model output can stop after an opening marker, halfway through a link, or inside a code fence:

```markdown
The result is **still being generated
```

Rendering that source literally exposes distracting syntax. Rebuilding the whole document for every token can also reset component state and make completed content flash.

In streaming mode, the renderer completes supported unfinished syntax before parsing it. In static mode, it renders the original source exactly as supplied.

## What is included

- Markdown, GFM, footnotes, CJK-friendly emphasis, and safe native HTML
- Stable Vue rendering for incrementally growing responses
- Streaming caret and text-entry animations
- Link safety, image previews, table controls, and custom UI components
- Custom HTML-like tags mapped directly to Vue components
- Optional [Shiki](https://shiki.style/), [KaTeX](https://katex.org/), [Mermaid](https://mermaid.js.org/), and [Beautiful Mermaid](https://github.com/lukilabs/beautiful-mermaid) extensions

## Start rendering

Install the main package:

```sh
pnpm add vue-stream-markdown
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

const content = ref('# Hello\n\nThis response is **streaming**.')
</script>

<template>
  <Markdown :content="content" mode="streaming" />
</template>
```

Switch to `mode="static"` when generation finishes if the final source should be rendered without completion.

## Next steps

- Follow [Usage](/guide/usage) to add optional rich renderers.
- Read [Rendering Pipeline](/guide/rendering-pipeline) to understand streaming updates.
- Explore [Features](/feature) for interactive output.
- Use the [Playground](https://play-vue-stream-markdown.netlify.app/) to test real content.
