---
title: Components
navigation:
  icon: i-lucide-component
description: Map Markdown and custom HTML-like tags to Vue components.
---

Use `components` to customize content rendering by the tag name emitted by [Comark](https://github.com/comarkdown/comark). The same mapping handles Markdown, HTML, and custom tags. To replace shared controls, use [UI Components](/feature/custom-ui-components).

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

A custom component receives `MarkdownComponentProps`, the element attributes as props, and rendered children through its default slot:

| Prop      | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `node`    | Comark element tuple: `[tag, attributes, ...children]`.                                                          |
| `loading` | `true` on the last renderable branch in streaming mode; `false` on preceding branches and in static mode.        |
| `nodeKey` | Renderer key derived from the node's position and tag, such as `root-0-pre`. It is not a persistent document ID. |

`loading` describes the active streaming branch, not whether its syntax is incomplete. These props take precedence over HTML attributes with the same names.

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

## Built-in Renderers

Reuse these renderers inside custom components:

| Renderer            | Tag     | Behavior                                           |
| ------------------- | ------- | -------------------------------------------------- |
| `CodeBlockRenderer` | `pre`   | Complete code block with its wrapper and controls. |
| `LinkRenderer`      | `a`     | Link with destination feedback and favicon.        |
| `ImageRenderer`     | `img`   | Image with caption and preview.                    |
| `MathRenderer`      | `math`  | Inline or block math.                              |
| `TableRenderer`     | `table` | Table with its wrapper and controls.               |

These accept `MarkdownRendererProps`: `node` (a Comark element), `nodeKey`, and optional `loading`. Inside `Markdown`, they inherit its options, extensions, and UI components. Forward the received props when reusing them.

`LinkRenderer` and `TableRenderer` render their original children by default. Their default slots can replace that content.

### Custom Code Bodies

`CodeRenderer` renders the highlighted code body. It accepts `CodeRendererProps`: `node` as a `CodeBlockNode` (`value`, `lang`, `meta`, `loading`), `nodeKey`, and optional `showWrapper` (default: `false`). Set `:show-wrapper="true"` to include the wrapper and controls.

For a custom body inside the complete code block, map `pre` to a component like this. `CodeBlockRenderer` exposes the normalized `node` through its default slot. Copying, downloading, previews, and fullscreen retain the full source:

```vue
<script setup lang="ts">
import type { MarkdownRendererProps } from 'vue-stream-markdown'
import { CodeBlockRenderer, CodeRenderer } from 'vue-stream-markdown'

const props = defineProps<MarkdownRendererProps>()
</script>

<template>
  <CodeBlockRenderer v-bind="props" v-slot="{ node }">
    <CodeRenderer :node="{ ...node, value: node.value.slice(0, 1000) }" :node-key="props.nodeKey" />
    <p v-if="node.value.length > 1000">Showing the first 1,000 characters.</p>
  </CodeBlockRenderer>
</template>
```

## Rendering Node Lists

Use the default slot for a custom component's original children. Use `MarkdownNodes` when you need to render a selected or modified list of Comark nodes, without parsing Markdown again. For example, this heading appends an emphasized label:

```vue
<script setup lang="ts">
import type { MarkdownComponentProps, MarkdownNode } from 'vue-stream-markdown'
import { computed } from 'vue'
import { MarkdownNodes } from 'vue-stream-markdown'

const props = defineProps<MarkdownComponentProps>()
const nodes = computed<MarkdownNode[]>(() => {
  const [, , ...children] = props.node
  return [...children, ['em', {}, ' (updated)']]
})
</script>

<template>
  <component :is="props.node[0]">
    <MarkdownNodes :nodes="nodes" :node-key="props.nodeKey" :loading="props.loading" />
  </component>
</template>
```

`MarkdownNodes` accepts `MarkdownNodesProps`:

| Prop             | Default   | Description                                                                                                                            |
| ---------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `nodes`          | `[]`      | Comark nodes to render; strings render as text.                                                                                        |
| `nodeKey`        | —         | Parent key for child keys. Forward it to inherit component mappings and completion metadata; omit it for an independent document root. |
| `loading`        | `false`   | Marks the last renderable branch as active.                                                                                            |
| `hideCaret`      | `false`   | Hides the tail caret.                                                                                                                  |
| `components`     | Inherited | Tag-to-component mapping, replacing the inherited mapping when supplied.                                                               |
| `completionInfo` | Inherited | Completion metadata used by streaming links.                                                                                           |

Renderer options, extensions, and UI components are inherited from the surrounding context. Use distinct `nodeKey` prefixes when rendering multiple lists in one component.

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
