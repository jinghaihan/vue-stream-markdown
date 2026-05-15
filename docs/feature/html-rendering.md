---
title: HTML Rendering
description: Opt in to sanitized HTML rendering and map custom tags to Vue components.
---

# HTML Rendering

Raw HTML nodes render empty by default. This keeps the main package small and avoids rendering untrusted markup by accident.

Use the optional `@stream-markdown/html` package when you need HTML support:

```sh
pnpm add @stream-markdown/html
```

This renderer works best when the llm can emit complete HTML fragments at once. For heavily streamed HTML, you may want to replace the `html` preprocess step so incomplete tags are handled in a way that matches your UI.

```vue
<script setup lang="ts">
function fixHtml(content: string) {
  // Your streaming HTML policy
  return content
}

const preprocessSteps = {
  html: fixHtml,
}
</script>

<template>
  <Markdown :preprocess-steps="preprocessSteps" />
</template>
```

## Basic Usage

```vue
<script setup lang="ts">
import { createHtmlPlugin } from '@stream-markdown/html'
import { Markdown } from 'vue-stream-markdown'
import { createHtmlNodeRenderer } from 'vue-stream-markdown/html'
import GitHubCard from './GitHubCard.vue'

const html = createHtmlPlugin({
  componentTags: ['github'],
  allowedAttributes: {
    github: ['name', 'description'],
  },
})

const HtmlNodeRenderer = createHtmlNodeRenderer({
  transform: html.transform,
  components: {
    GitHub: GitHubCard,
  },
})

const content = `
<div>
  <GitHub name="vue-stream-markdown" description="Streaming markdown renderer" />
</div>
`
</script>

<template>
  <Markdown
    :content="content"
    :node-renderers="{ html: HtmlNodeRenderer }"
  />
</template>
```

Safe native tags such as `<div>` are rendered normally. Registered custom tags such as `<GitHub>` are sanitized, parsed, and then mapped to the matching Vue component.

## Options

`createHtmlPlugin()` accepts:

- `componentTags`: Extra custom tags to keep, such as `github`
- `allowedTags`: Replace the default native tag allowlist
- `allowedAttributes`: Allowed attributes, globally or per tag
- `sanitizeOptions`: Extra `sanitize-html` options

Custom tag names are normalized to lower case during parsing, so `GitHub` and `github` resolve to the same component entry.

## Advanced Use

`@stream-markdown/html` also exports lower-level helpers:

```ts
import { parseHtml, sanitizeHtml, transformHtml } from '@stream-markdown/html'
```

Use them when you need to compose the pipeline yourself. The Vue wrapper only needs a `transform(raw) => HtmlAstNode[]` function.

## Security

Always keep sanitization in the path. The optional package removes unsafe tags, unsafe attributes, and dangerous URLs before rendering.

```html
<script>
  alert('xss')
</script>
<img src="x" onerror="alert('xss')" />
<div onclick="alert('xss')">Click me</div>
```

The built-in empty renderer is still the safest choice when your product does not need HTML output.
