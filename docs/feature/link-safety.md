# Link Safety

vue-stream-markdown includes a configurable confirmation modal for external links to protect users from malicious URLs. When rendering AI-generated or user-generated content, links can pose security risks. The link safety feature adds a confirmation modal before opening external links, similar to ChatGPT's implementation.

## Default Behavior

Link safety is **enabled by default**. When a user clicks any link, a confirmation modal appears with:

- The full URL being opened
- A "Copy link" button
- An "Open link" button
- Close via backdrop click or Escape key

## Disabling Link Safety

To disable the confirmation modal and allow links to open directly:

```vue
<script setup lang="ts">
import type { LinkOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const linkOptions: LinkOptions = {
  safetyCheck: false,
}
</script>

<template>
  <Markdown :link-options="linkOptions" :content="markdown" />
</template>
```

## Safelist with isTrusted

Use the `isTrusted` callback to allow trusted domains without showing the modal:

```vue
<script setup lang="ts">
import type { LinkOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const linkOptions: LinkOptions = {
  safetyCheck: true,
  isTrusted: (url) => {
    // Return true to allow without modal (safelist)
    // Return false to show confirmation modal
    return url.startsWith('https://your-app.com')
      || url.startsWith('https://github.com')
  },
}
</script>

<template>
  <Markdown :link-options="linkOptions" :content="markdown" />
</template>
```

The callback receives the URL and can return:
- `true` - Open the link directly without modal
- `false` - Show the confirmation modal
- `Promise<boolean>` - Async checks are supported

### Async Safelist Check

For server-side safelist validation:

```vue
<script setup lang="ts">
import type { LinkOptions } from 'vue-stream-markdown'
import { Markdown } from 'vue-stream-markdown'

const linkOptions: LinkOptions = {
  safetyCheck: true,
  isTrusted: async (url) => {
    const response = await fetch('/api/check-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
    const { isSafe } = await response.json()
    return isSafe
  },
}
</script>

<template>
  <Markdown :link-options="linkOptions" :content="markdown" />
</template>
```
