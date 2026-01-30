---
title: Static Mode
description: Static mode for rendering pre-generated markdown content like blog posts and documentation.
---

# Static Mode

Static mode is designed for rendering pre-generated markdown content, such as blog posts, documentation, or other static pages where content is already complete.

## When to Use Static Mode

Use static mode when:

- Rendering static markdown content (e.g., blog posts, docs)
- Content is pre-generated and not streaming
- You need improved fallback rendering for code blocks
- Streaming optimizations are unnecessary

## Basic Usage

Enable static mode by setting the `mode` prop to `"static"`:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

const content = `# My Blog Post

This is a static blog post with complete markdown content.`
</script>

<template>
  <Markdown mode="'static'" :content="content" />
</template>
```

## How It Works

Static mode skips streaming-related optimizations:

- **No block parsing**: Content is rendered as a single unit instead of being split into blocks
- **No incomplete markdown handling**: Assumes markdown is complete and well-formed
- **Simpler rendering**: Direct rendering without streaming overhead
