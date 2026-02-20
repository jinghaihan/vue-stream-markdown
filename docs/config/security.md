---
title: Security Configuration
description: Configure URL sanitization and validation for links and images to protect against malicious content.
---

# Security

The security configuration allows you to control URL sanitization and validation for links and images in Markdown content. This helps protect against malicious content, especially when rendering user-generated or AI-generated Markdown.

## hardenOptions

- **Type:** `HardenOptions | undefined`
- **Default:** `undefined` (uses default permissive settings)

The `hardenOptions` prop accepts a `HardenOptions` object to configure URL sanitization:

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  // ... configuration options
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

## HardenOptions Interface

```typescript
interface HardenOptions {
  defaultOrigin?: string
  allowedLinkPrefixes?: string[]
  allowedImagePrefixes?: string[]
  allowedProtocols?: string[]
  allowDataImages?: boolean
  errorComponent?: Component
}
```

## defaultOrigin

- **Type:** `string | undefined`
- **Default:** `undefined`

The origin used to resolve relative URLs. When set, relative URLs will be resolved against this origin.

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  defaultOrigin: 'https://your-app.com',
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### Example

With `defaultOrigin: 'https://your-app.com'`, a relative link:

```markdown
[Relative link](/docs/guide)
```

Will be resolved to: `https://your-app.com/docs/guide`

## allowedLinkPrefixes

- **Type:** `string[] | undefined`
- **Default:** `['*']` (all links allowed)

An array of URL prefixes that are allowed for links. Links not matching any allowed prefix will be blocked or rewritten.

Use `['*']` to allow all links, or specify specific domains:

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  defaultOrigin: 'https://vue-stream-markdown.com',
  allowedLinkPrefixes: [
    'https://vue-stream-markdown.com',
    'https://github.com',
    'https://vercel.com',
  ],
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### Behavior

- Links matching any prefix in the array are allowed
- Links not matching any prefix are blocked (rendered as `[blocked]`)
- Use `['*']` to allow all links (default behavior)

## allowedImagePrefixes

- **Type:** `string[] | undefined`
- **Default:** `['*']` (all images allowed)

An array of URL prefixes that are allowed for images. Images not matching any allowed prefix will be blocked.

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  allowedImagePrefixes: [
    'https://your-cdn.com',
    'https://trusted-images.com',
  ],
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### Behavior

- Images matching any prefix in the array are allowed
- Images not matching any prefix are blocked
- Use `['*']` to allow all images (default behavior)

## allowedProtocols

- **Type:** `string[] | undefined`
- **Default:** `['*']` (all protocols allowed)

An array of URL protocols that are permitted. URLs with protocols not in this list will be blocked.

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  allowedProtocols: [
    'http',
    'https',
    'mailto',
  ],
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### Common Protocols

- `'http'` - HTTP protocol
- `'https'` - HTTPS protocol
- `'mailto'` - Email links
- `'data'` - Data URIs (when `allowDataImages` is enabled)

### Custom Protocol Schemes

You can allow custom protocol schemes like `postman://`, `vscode://`, or `slack://`:

```sh
{
  allowedProtocols: [
    'http',
    'https',
    'postman',
    'vscode',
    'slack',
  ],
}
```

### Behavior

- URLs with protocols in the array are allowed
- URLs with protocols not in the array are blocked
- Use `['*']` to allow all protocols (default behavior)

## allowDataImages

- **Type:** `boolean | undefined`
- **Default:** `true`

Whether to allow base64-encoded images using the `data:image/...` protocol.

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  allowDataImages: false, // Disable base64 images
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### When to Disable

Set `allowDataImages: false` to prevent:

- Tracking pixels embedded in Markdown
- Large embedded image files
- Potential malicious payloads

## errorComponent

- **Type:** `Component | undefined`
- **Default:** `undefined`

A custom Vue component to render when a URL is blocked. If not provided, blocked URLs are rendered as `[blocked]`.

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const CustomErrorComponent = defineComponent({
  template: '<span class="text-red-500">Blocked URL</span>',
})

const hardenOptions: HardenOptions = {
  errorComponent: CustomErrorComponent,
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

## Default Configuration

By default, vue-stream-markdown uses permissive security settings:

```sh
{
  allowedImagePrefixes: ['*'],  // All images allowed
  allowedLinkPrefixes: ['*'],   // All links allowed
  allowedProtocols: ['*'],      // All protocols allowed
  defaultOrigin: undefined,     // No origin restriction
  allowDataImages: true,        // Base64 images allowed
}
```

## Complete Example

Here's a complete example with strict security settings for untrusted content:

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { computed } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const props = defineProps<{
  content: string
  isAIGenerated: boolean
}>()

const hardenOptions = computed<HardenOptions>(() => {
  if (props.isAIGenerated) {
    return {
      defaultOrigin: 'https://your-app.com',
      allowedLinkPrefixes: [
        'https://your-app.com',
        'https://docs.your-app.com',
        'https://github.com',
      ],
      allowedImagePrefixes: [
        'https://your-cdn.com',
      ],
      allowedProtocols: [
        'http',
        'https',
        'mailto',
      ],
      allowDataImages: false,
    }
  }
  else {
    // More permissive for trusted user content
    return {
      allowedLinkPrefixes: ['*'],
      allowedImagePrefixes: ['*'],
      allowedProtocols: ['*'],
    }
  }
})
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="content" />
</template>
```
