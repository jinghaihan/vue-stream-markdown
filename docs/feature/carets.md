<script setup>
const blockCaret = `
Streaming content with **block caret**

This is a paragraph that continues streaming.
`

const circleCaret = `
Streaming content with **circle caret**

This is a paragraph that continues streaming.
`

const streamingComplete = `
Streaming content is now **complete**.

The caret has disappeared.
`
</script>

# Carets

vue-stream-markdown includes built-in caret (cursor) indicators that display at the end of streaming content. Carets provide a visual cue to users that content is actively being generated, similar to a blinking cursor in a text editor.

## Overview

The `caret` prop adds a visual indicator at the end of your streaming markdown content. This feature enhances the user experience by making it clear when content is actively being generated versus when generation is complete.

Key features:

- **Two built-in styles** - Choose between block (`▋`) and circle (`●`) carets
- **Automatic positioning** - Carets automatically appear at the last text node that is still loading
- **Streaming-aware** - Only displays when `mode="streaming"` (default) and `caret` prop is set
- **Efficient rendering** - Uses inline span elements for optimal performance

## Usage

To enable carets, pass the `caret` prop with either `"block"` or `"circle"`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const content = ref('')
</script>

<template>
  <Markdown caret="block">
    {{ content }}
  </Markdown>
</template>
```

## Caret Styles

vue-stream-markdown provides two built-in caret styles:

### Block Caret

The block caret displays a vertical bar (`▋`) similar to a terminal cursor:

```vue
<template>
  <Markdown caret="block">
    Streaming content...
  </Markdown>
</template>
```

<StreamMarkdown :content="blockCaret" caret="block" />

### Circle Caret

The circle caret displays a filled circle (`●`) for a subtler indicator:

```vue
<template>
  <Markdown caret="circle">
    Streaming content...
  </Markdown>
</template>
```

<StreamMarkdown :content="circleCaret" caret="circle" />

## Behavior

The caret visibility is controlled by two conditions:

1. **`caret` prop is set** - You must specify either `"block"` or `"circle"`
2. **`mode="streaming"`** (default) - Carets only work in streaming mode

The caret automatically appears on the last text node that is still in a loading state. When the content finishes streaming and all nodes are fully parsed, the caret disappears:

<StreamMarkdown :content="streamingComplete" :caret="'block'" />

## Conditional Display

vue-stream-markdown doesn't know about roles or message ordering, so you should conditionally show carets for specific messages, such as only displaying them for the last message in a chat and only displaying them from assistant messages:

```vue
<template>
  <Markdown
    v-for="(message, index) in messages"
    :key="message.id"
    :caret="isAssistant(message) && isLatest(index)
      ? 'block'
      : undefined"
    :mode="isAssistant(message) && isLatest(index) && isStreaming
      ? 'streaming'
      : 'static'"
  >
    {{ message.content }}
  </Markdown>
</template>
```

## Technical Details

Carets are implemented using inline span elements:

- The caret is rendered as a `<span>` element with `data-stream-markdown="caret"` attribute
- The span is appended to the last text node that has `loading: true`
- The caret character is displayed inline within the span
- When text node loading completes or `caret` prop is `undefined`, the span is removed from the DOM

This approach ensures the caret always appears at the correct position within the text content.
