---
title: Components
navigation:
  icon: i-lucide-component
description: Map Markdown and custom HTML-like tags to Vue components.
---

Use the `components` prop to replace a native tag or render a custom HTML-like tag. Keys use the lower-case tag name emitted by [Comark](https://github.com/comarkdown/comark).

```vue
<script setup lang="ts">
import CustomHeading from './custom-heading.vue'
import GitHubCard from './github-card.vue'

const components = {
  github: GitHubCard,
  h2: CustomHeading,
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

## Literal Tag Content

Use `literalTagContent` when a custom tag contains a data label rather than Markdown prose. Markdown markers inside configured tags are preserved as text:

```vue
<script setup lang="ts">
import Mention from './mention.vue'

const content = '<mention user_id="123">@_some_username_</mention>'
const components = { mention: Mention }
</script>

<template>
  <Markdown
    :components="components"
    :content="content"
    :literal-tag-content="['mention']"
  />
</template>
```

Here the mention component receives `@_some_username_` as plain text instead of an emphasized child node. Only explicitly configured, closed tags are protected.
