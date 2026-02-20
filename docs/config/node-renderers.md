---
title: Custom Node Renderers
description: Customize how different types of markdown nodes are rendered by overriding default renderers or adding custom ones.
---

# Custom Node Renderers

Node renderers allow you to customize how different types of markdown nodes are rendered. You can override the default renderers or add custom renderers for specific node types.

## Usage

Pass a `nodeRenderers` object to the `StreamMarkdown` component. The custom renderers will be merged with the default renderers, with your custom renderers taking precedence.

```vue
<script setup lang="ts">
import type { NodeRenderers } from 'vue-stream-markdown'
import { StreamMarkdown } from 'vue-stream-markdown'
import CustomHeading from './CustomHeading.vue'

const nodeRenderers: NodeRenderers = {
  heading: CustomHeading,
}
</script>

<template>
  <StreamMarkdown :content="content" :node-renderers="nodeRenderers" />
</template>
```

## Available Node Types

The following node types can be customized:

| Node Type            | Description                       | Props Type                            |
| -------------------- | --------------------------------- | ------------------------------------- |
| `blockquote`         | Blockquote (`> quote`)            | `BlockquoteNodeRendererProps`         |
| `break`              | Line break                        | `BreakNodeRendererProps`              |
| `code`               | Code block (`code`)               | `CodeNodeRendererProps`               |
| `definition`         | Link/image definition             | `DefinitionNodeRendererProps`         |
| `delete`             | Strikethrough (`~~text~~`)        | `DeleteNodeRendererProps`             |
| `emphasis`           | Emphasis (`*text*` or `_text_`)   | `EmphasisNodeRendererProps`           |
| `footnoteDefinition` | Footnote definition               | `FootnoteDefinitionNodeRendererProps` |
| `footnoteReference`  | Footnote reference                | `FootnoteReferenceNodeRendererProps`  |
| `heading`            | Heading (`# heading`)             | `HeadingNodeRendererProps`            |
| `html`               | HTML node                         | `HtmlNodeRendererProps`               |
| `image`              | Image (`![alt](url)`)             | `ImageNodeRendererProps`              |
| `imageReference`     | Image reference                   | `ImageReferenceNodeRendererProps`     |
| `inlineCode`         | Inline code (`` `code` ``)        | `InlineCodeNodeRendererProps`         |
| `inlineMath`         | Inline math (`$formula$`)         | `InlineMathNodeRendererProps`         |
| `link`               | Link (`[text](url)`)              | `LinkNodeRendererProps`               |
| `linkReference`      | Link reference                    | `LinkReferenceNodeRendererProps`      |
| `list`               | List (`- item` or `1. item`)      | `ListNodeRendererProps`               |
| `listItem`           | List item                         | `ListItemNodeRendererProps`           |
| `math`               | Math block (`$$formula$$`)        | `MathNodeRendererProps`               |
| `paragraph`          | Paragraph                         | `ParagraphNodeRendererProps`          |
| `strong`             | Strong (`**text**` or `__text__`) | `StrongNodeRendererProps`             |
| `table`              | Table                             | `TableNodeRendererProps`              |
| `tableRow`           | Table row                         | `TableRowNodeRendererProps`           |
| `tableCell`          | Table cell                        | `TableCellNodeRendererProps`          |
| `text`               | Text node                         | `TextNodeRendererProps`               |
| `thematicBreak`      | Thematic break (`---`)            | `ThematicBreakNodeRendererProps`      |
| `yaml`               | YAML front matter                 | `YamlNodeRendererProps`               |

## TypeScript Support

When creating custom renderers, use the corresponding Props type to get full type safety and IntelliSense support:

```vue
<script setup lang="ts">
import type { BlockquoteNodeRendererProps } from 'vue-stream-markdown'
import { NodeList } from 'vue-stream-markdown'

const props = withDefaults(defineProps<BlockquoteNodeRendererProps>(), {})
</script>

<template>
  <blockquote class="custom-blockquote">
    <NodeList v-bind="props" :nodes="node.children" />
  </blockquote>
</template>
```

## Props Available to Renderers

All custom renderers receive the following props through their specific Props type:

- `node` - The parsed markdown node (typed according to the node type)
- `markdownParser` - The `MarkdownParser` instance
- `nodeRenderers` - The merged node renderers object
- `nodeKey` - A unique key for the node
- `isDark` - Dark mode state

## Example: Custom Heading Renderer

```vue
<script setup lang="ts">
import type { HeadingNodeRendererProps } from 'vue-stream-markdown'
import { computed } from 'vue'
import { NodeList } from 'vue-stream-markdown'

const props = withDefaults(defineProps<HeadingNodeRendererProps>(), {})

const depth = computed(() => props.node.depth)
const tag = computed(() => `h${depth.value}`)
</script>

<template>
  <component :is="tag" class="custom-heading">
    <NodeList v-bind="props" :nodes="node.children" />
  </component>
</template>

<style scoped>
.custom-heading {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}
</style>
```

## Rendering Child Nodes

When your custom renderer needs to render child nodes, use the `NodeList` component and pass the props along:

```vue
<template>
  <div class="custom-container">
    <NodeList v-bind="props" :nodes="node.children" />
  </div>
</template>
```

The `NodeList` component will automatically handle rendering the child nodes using the appropriate renderers.

## Partial Override

You can override only specific node types. The default renderers will be used for all other node types:

```vue
<script setup lang="ts">
import type { NodeRenderers } from 'vue-stream-markdown'
import { StreamMarkdown } from 'vue-stream-markdown'
import CustomHeading from './CustomHeading.vue'
import CustomParagraph from './CustomParagraph.vue'

const nodeRenderers: NodeRenderers = {
  heading: CustomHeading,
  paragraph: CustomParagraph,
  // All other node types will use default renderers
}
</script>

<template>
  <StreamMarkdown :content="content" :node-renderers="nodeRenderers" />
</template>
```

## Preloading Renderers

By default, lightweight node renderers are preloaded to improve initial rendering performance. The preload happens **after** merging your custom renderers, ensuring that the preloaded components match your final renderer configuration.

### Default Preloaded Renderers

All node renderers are preloaded by default except `code` and `math`, which are heavier components that are loaded on-demand.

### Custom Preload Configuration

You can customize which renderers to preload using the `preload` prop:

```vue
<script setup lang="ts">
import { StreamMarkdown } from 'vue-stream-markdown'

const preload = {
  nodeRenderers: ['heading', 'paragraph', 'text'] as const,
}
</script>

<template>
  <StreamMarkdown :content="content" :preload="preload" />
</template>
```

If `preload.nodeRenderers` is not specified, the default list above is used. Set it to an empty array to disable preloading.

## Notes

- Custom renderers are merged with default renderers, so you only need to specify the ones you want to override
- Use the provided Props types for full TypeScript support
- The `NodeList` component is available for rendering child nodes
- Renderers receive all context props including `node`, `isDark`...

## Special Considerations: HTML Nodes

The `html` node type has special security considerations in streaming rendering scenarios. By default, the built-in HTML renderer renders HTML nodes as empty to prevent XSS attacks, since HTML content in streaming scenarios is unpredictable.

If you need to render HTML content, you should implement a custom HTML renderer with proper sanitization and filtering. See the [HTML Node Rendering](/feature/html-rendering) guide for detailed information on:

- Security considerations and XSS prevention
- How to implement custom HTML renderers with filtering
- Handling unclosed tags in streaming scenarios
- Best practices for safe HTML rendering
