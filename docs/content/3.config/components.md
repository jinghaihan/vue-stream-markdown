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

- `loading`: whether this node is in the active streaming tail. Completed preceding nodes and all nodes in static mode receive `false`.
- `nodeKey`: the renderer's key for this node. It stays the same while the node remains at the same position and its content grows; it is not a persistent document ID.

These renderer props take precedence over HTML attributes with the same names.

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

## Built-in Renderers

Reuse the built-in renderers inside a custom component to keep the default behavior while adding your own layout:

| Export              | Component mapping                    | Input                                                |
| ------------------- | ------------------------------------ | ---------------------------------------------------- |
| `CodeBlockRenderer` | `pre`                                | Comark element                                       |
| `LinkRenderer`      | `a`                                  | Comark element                                       |
| `ImageRenderer`     | `img`                                | Comark element                                       |
| `MathRenderer`      | `math`                               | Comark element (inline or block)                     |
| `TableRenderer`     | `table`                              | Comark element                                       |
| `CodeRenderer`      | Code content inside your own wrapper | `CodeBlockNode` (`value`, `lang`, `meta`, `loading`) |

For example, map `pre` to this component:

```vue
<script setup lang="ts">
import type { MarkdownRendererProps } from 'vue-stream-markdown'
import { CodeBlockRenderer } from 'vue-stream-markdown'

const props = defineProps<MarkdownRendererProps>()
</script>

<template>
  <section class="custom-code-block">
    <CodeBlockRenderer v-bind="props" />
  </section>
</template>
```

The Comark renderers accept `node`, `nodeKey`, and optional `loading` through `MarkdownRendererProps`. When used inside `Markdown`, they inherit its options, extensions, and UI components. `LinkRenderer` and `TableRenderer` render their original children by default, including custom component mappings; you can supply a default slot to replace that content.

`CodeRenderer` accepts `CodeRendererProps`: a normalized `CodeBlockNode`, `nodeKey`, and optional `showWrapper` (default: `false`). It renders only the highlighted code body by default; set `:show-wrapper="true"` to include the built-in header and wrapper. `CodeBlockRenderer` enables this automatically.

## Rendering Node Lists

Use `NodeList` to render existing Comark nodes after selecting or modifying them. For example, this custom heading appends a generated node to the original children:

```vue
<script setup lang="ts">
import type { MarkdownComponentProps, MarkdownNode } from 'vue-stream-markdown'
import { computed } from 'vue'
import { NodeList } from 'vue-stream-markdown'

const props = defineProps<MarkdownComponentProps>()
const nodes = computed<MarkdownNode[]>(() => {
  const [, , ...children] = props.node
  return [...children, ['em', {}, ' (updated)']]
})
</script>

<template>
  <component :is="node[0]">
    <NodeList :nodes="nodes" :node-key="nodeKey" :loading="loading" />
  </component>
</template>
```

`NodeList` accepts `NodeListProps`:

- `nodes`: Comark nodes to render; defaults to an empty list. String nodes render as text; `NodeList` does not parse or complete Markdown.
- `nodeKey`: the parent key used to build child keys; defaults to `root`. Forward the custom component's `nodeKey`, and use separate key prefixes when rendering multiple lists.
- `loading`: whether the list has an active streaming tail; defaults to `false`. Only the last renderable node receives the active state.
- `hideCaret`: suppress the tail caret; defaults to `false`.
- `components`: optional tag-to-component mapping, replacing the inherited mapping.
- `completionInfo`: optional parser completion metadata, replacing inherited metadata for streaming links.

Inside a custom `Markdown` component, lists inherit renderer options, extensions, UI components, component mappings, and completion metadata. For an unchanged set of children, use the default slot.

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
