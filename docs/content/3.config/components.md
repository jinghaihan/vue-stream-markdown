---
title: Components
navigation:
  icon: i-lucide-component
description: Map Markdown and custom HTML-like tags to Vue components.
---

Use the `components` prop to replace a native tag or render a custom HTML-like tag. Keys use the lower-case tag name emitted by Comark.

```vue
<script setup lang="ts">
import customHeading from './custom-heading.vue'
import githubCard from './github-card.vue'

const components = {
  github: githubCard,
  h2: customHeading,
}
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

A component receives the Comark element tuple as `node`, the element attributes as props, and rendered child nodes through its default slot:

```vue
<script setup lang="ts">
import type { MarkdownComponentProps } from 'vue-stream-markdown'

defineProps<MarkdownComponentProps & { name?: string }>()
</script>

<template>
  <article class="github-card">
    {{ name }}
    <slot />
  </article>
</template>
```

This same path handles native HTML and LLM-defined custom tags, so there is no separate HTML representation or renderer API.
