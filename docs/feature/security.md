---
title: Security
description: Security features for protecting against malicious content including URL sanitization and validation.
---

# Security

vue-stream-markdown is built with security as a top priority. When rendering user-generated or AI-generated Markdown content, it's crucial to protect against malicious content, especially when dealing with content that might have been subject to prompt injection attacks.

## Why Security Matters

Markdown can contain:

- **Links to malicious sites** - Phishing or malware distribution
- **External images** - Privacy tracking or CSRF attacks
- **HTML content** - XSS vulnerabilities
- **JavaScript execution** - Code injection
- **Prompt injection** - AI models manipulated to include harmful content

vue-stream-markdown implements URL sanitization and validation based on the source code from [rehype-harden](https://github.com/vercel-labs/markdown-sanitizers) to protect against malicious content before rendering.

## Default Security

By default, vue-stream-markdown is configured with **permissive security** to allow maximum functionality:

```sh
// Default configuration
{
  allowedImagePrefixes: ["*"],  // All images allowed
  allowedLinkPrefixes: ["*"],   // All links allowed
  allowedProtocols: ["*"],      // All protocols allowed
  defaultOrigin: undefined,     // No origin restriction
  allowDataImages: true,        // Base64 images allowed
}
```

This works well for trusted content but should be tightened for untrusted sources.

## Restricting Protocols

By default, all protocols are allowed. You can restrict which URL protocols are permitted:

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

This is useful for security-sensitive applications where you want to prevent custom protocol schemes like `javascript:`, `data:`, or desktop app protocols.

### Custom Protocol Schemes

To enable custom protocol schemes like `postman://`, `vscode://`, or `slack://`, include them in the `allowedProtocols` array:

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

## Restricting Links

Limit which domains users can link to:

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

Any links not matching the allowed prefixes will be rewritten to point to the `defaultOrigin`.

### Example

With the above configuration:

```markdown
[Safe link](https://github.com/vercel/vue-stream-markdown)
[Unsafe link](https://malicious-site.com)
```

Results in:

- Safe link: Works normally
- Unsafe link: Renders as [blocked]

## Restricting Images

Similarly, restrict which domains can serve images:

```vue
<script setup lang="ts">
import type { HardenOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const hardenOptions: HardenOptions = {
  allowedImagePrefixes: [
    'https://your-cdn.com',
    'https://trusted-images.com',
  ],
  allowDataImages: false, // Disable base64 images
}
</script>

<template>
  <Markdown :harden-options="hardenOptions" :content="markdown" />
</template>
```

### Data Images

Base64-encoded images (`data:image/...`) can be disabled:

```typescript
allowDataImages: false
```

This prevents embedding arbitrary image data in Markdown, which could be used for:

- Tracking pixels
- Large embedded files
- Malicious payloads

## Protecting Against Prompt Injection

When using AI-generated content, models can be manipulated to include malicious links or content. Here's a production-ready configuration:

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
    // More permissive for user content
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

## Relative URLs

Control how relative URLs are handled:

```typescript
{
  defaultOrigin: 'https://your-app.com'
}
```

Relative URLs will be resolved against this origin:

```markdown
[Relative link](/docs/guide)
```

Becomes: `https://your-app.com/docs/guide`
