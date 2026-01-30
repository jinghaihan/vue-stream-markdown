---
title: HTML Node Rendering
description: Security considerations and implementation guidelines for custom HTML node rendering with proper filtering.
---

# HTML Node Rendering

In streaming markdown rendering scenarios, HTML nodes present unique security challenges. This document explains the security considerations and how to implement custom HTML node rendering with proper filtering.

## Security Considerations

### The Problem

In streaming rendering scenarios, HTML nodes are **unpredictable**. Directly rendering raw HTML content can lead to serious security vulnerabilities, particularly **XSS (Cross-Site Scripting) attacks**, which can compromise system security.

Consider this example:

```markdown
<script>alert('XSS Attack')</script>
<img src="x" onerror="alert('XSS')">
<div onclick="maliciousFunction()">Click me</div>
```

If rendered directly without sanitization, these could execute malicious JavaScript in the user's browser.

### Default Behavior

To protect against these security risks, the built-in `HtmlNodeRenderer` **renders HTML nodes as empty** by default, effectively skipping HTML syntax rendering:

```vue
<script setup lang="ts">
import type { HtmlNodeRendererProps } from '../../types'

withDefaults(defineProps<HtmlNodeRendererProps>(), {})
</script>
```

Since there's no `<template>` section, nothing is rendered, providing a safe default that prevents XSS attacks.

## Custom HTML Rendering

While the default behavior is secure, you may need to render specific HTML content in a controlled manner. vue-stream-markdown provides the `nodeRenderers` API to customize HTML node rendering with proper filtering and sanitization.

### Basic Example

::: warning
Using `v-html` directly is still dangerous! You should always sanitize the HTML content first.
:::

Here's a simple example that renders HTML content:

```vue
<script setup lang="ts">
import type { HtmlNodeRendererProps } from 'vue-stream-markdown'

const props = withDefaults(defineProps<HtmlNodeRendererProps>(), {})

const htmlContent = computed(() => props.node.value)
</script>

<template>
  <div v-html="htmlContent" />
</template>
```

### Recommended Approach: Parse and Filter

The recommended approach is to parse the HTML and filter it before rendering. Here's an example from the playground:

```vue
<script setup lang="ts">
import type { HtmlNodeRendererProps } from 'vue-stream-markdown'
import { parseDocument } from 'htmlparser2'
import { treeFind } from 'treechop'
import { homepage } from '../../../package.json'
import { GitHub } from '../icons'

const props = withDefaults(defineProps<HtmlNodeRendererProps>(), {})

const code = computed(() => props.node.value)
const document = computed(() => parseDocument(code.value))
const github = computed(() => {
  const children = document.value.children
  if (!children || !children.length)
    return null
  return treeFind(
    children,
    item => item.name.toLowerCase() === 'github'
  )
})
const attrs = computed(() => github.value?.attribs ?? {})

function onClick() {
  window.open(homepage, '_blank')
}
</script>

<template>
  <div
    v-if="github"
    class="px-4 py-2 border border-border rounded-md bg-card flex flex-col gap-1 cursor-pointer duration-150 self-start hover:bg-accent"
    @click="onClick"
  >
    <h3 class="flex gap-2 items-center">
      <GitHub />
      {{ attrs.name }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ attrs.description }}
    </p>
  </div>
</template>
```

The core approach here is:

1. **Parse the HTML** using an HTML parser (like `htmlparser2`) to safely extract the structure
2. **Filter for safe nodes** - Extract only the specific tags you want to render (customizable per your needs)
3. **Extract attributes** - The parser will safely extract attributes without executing any code
4. **Render custom components** - Map the parsed and filtered nodes to your custom Vue components

### Using the Custom Renderer

Register your custom HTML renderer:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'
import CustomHtmlRenderer from './CustomHtmlRenderer.vue'

const content = `
## Custom Html Render
<GitHub name="vue-stream-markdown" description="Streaming-optimized Markdown Renderer" />
`
</script>

<template>
  <Markdown
    :content="content"
    :node-renderers="{
      html: CustomHtmlRenderer,
    }"
  />
</template>
```

## Handling Unclosed Tags in Streaming

### The Problem

During streaming output, **unclosed HTML tags are not recognized as HTML nodes** by the markdown parser. This means incomplete tags like `<GitHub` (without the closing `>`) won't be parsed as HTML nodes and may cause parsing errors or unexpected rendering.

### Solution: Filter in `normalize`

You need to filter unclosed tags in the `normalize` method. The basic approach is:

1. Check if the content contains opening tags for your custom HTML elements
2. Verify whether these tags are properly closed (either self-closing with `/>` or have a corresponding closing tag)
3. If a tag is unclosed, remove it from the content before parsing

You can implement this logic in your custom `normalize` function and pass it to the `Markdown` component:

```vue
<script setup lang="ts">
import { Markdown, normalize } from 'vue-stream-markdown'
import CustomHtmlRenderer from './CustomHtmlRenderer.vue'

function normalizeContent(content: string) {
  // First apply default normalization
  const normalized = normalize(content)
  // Then filter unclosed tags
  // ... your filtering logic here
  return normalized
}

const content = ref('')
</script>

<template>
  <Markdown
    :content="content"
    :normalize="normalizeContent"
    :node-renderers="{
      html: CustomHtmlRenderer,
    }"
  />
</template>
```

If you have better approaches for handling unclosed tags in streaming scenarios, I welcome your discussions and contributions!

## Best Practices

### Always Sanitize HTML Content

Never render raw HTML directly. Always parse and filter:

```typescript
import DOMPurify from 'dompurify' // or another sanitization library

const sanitized = DOMPurify.sanitize(htmlContent)
```

### Test with Malicious Content

Test your custom renderer with potentially malicious content:

```markdown
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<iframe src="javascript:alert('XSS')"></iframe>
```

Your renderer should safely ignore or sanitize these.
