---
title: Carets
navigation:
  icon: i-lucide-text-cursor-input
description: Show a caret at the active text tail during streaming.
---

Set `caret` to `"block"` (`▋`) or `"circle"` (`●`) to mark the active text tail in streaming mode.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const content = ref('')
const isStreaming = ref(true)
</script>

<template>
  <Markdown :content="content" caret="block" :mode="isStreaming ? 'streaming' : 'static'" />
</template>
```

Set `isStreaming` to `false` when generation ends. Complete Markdown syntax alone does not hide the caret while `mode` remains `"streaming"`. You can also disable it by setting `caret` to `undefined`.

## Caret Styles

### Block Caret

```vue
<Markdown content="Streaming content..." caret="block" />
```

::stream-markdown{example="feature-carets.blockCaret" caret="block" mode="streaming"}
::

### Circle Caret

```vue
<Markdown content="Streaming content..." caret="circle" />
```

::stream-markdown{example="feature-carets.circleCaret" caret="circle" mode="streaming"}
::

## Custom Caret

Replace the indicator through `uiComponents.Caret`:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'
import CustomCaret from './custom-caret.vue'
</script>

<template>
  <Markdown :content="content" caret="block" :ui-components="{ Caret: CustomCaret }" />
</template>
```

The custom component needs no props. Use `useContext().caret` to read the current caret character. The `caret` prop and streaming mode still control when it is shown.

## Streaming Completion

The caret appears in the active text tail when `caret` is set and `mode="streaming"` (the default). It is hidden in static mode. This example switches to static mode when playback finishes:

::stream-markdown{example="feature-carets.streamingComplete" caret="block"}
::

## Message Lists

For a chat, select the active message in your application:

```vue
<template>
  <Markdown
    v-for="(message, index) in messages"
    :key="message.id"
    :content="message.content"
    :caret="isAssistant(message) && isLatest(index)
      ? 'block'
      : undefined"
    :mode="isAssistant(message) && isLatest(index) && isStreaming
      ? 'streaming'
      : 'static'"
  />
</template>
```
