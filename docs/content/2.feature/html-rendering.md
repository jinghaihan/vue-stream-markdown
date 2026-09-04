---
title: HTML Rendering
navigation:
  icon: i-lucide-file-code-2
description: Render native and custom HTML-like tags through Comark.
---

HTML support is built into `vue-stream-markdown`; there is no HTML package or plugin to install. [Comark](https://github.com/comarkdown/comark)'s default HTML parser converts supported native HTML and custom HTML-like tags into its normal document tuples. Vue Stream Markdown renders native tags directly and lets you map custom tags through `components`; no separate HTML representation or renderer is involved.

```vue
<script setup lang="ts">
import GitHubCard from './github-card.vue'

const content = `
<section class="profile">
  <github name="vuejs/core" />
</section>
`

const components = {
  github: GitHubCard,
}
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

## Security

The built-in Comark security plugin validates links and image URLs using `hardenOptions`. Vue event-handler source such as `onclick` is not executed as a template expression: parsed attributes are passed as ordinary VNode attributes.

Only register custom components you trust. If a component interprets an attribute as executable code or injects raw HTML itself, that component owns the corresponding security boundary.

See [Components](/config/components) and [Security](/config/security).
