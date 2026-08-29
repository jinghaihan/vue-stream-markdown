---
title: Parser
description: Configure Comark plugins and streaming Markdown completion.
---

# Parser

Vue Stream Markdown uses one long-lived [Comark](https://github.com/comarkdown/comark) parser for each component instance. Pass the complete source to `content`; Comark retains incremental state and reuses the stable prefix between updates.

The same parser layer is available independently from Vue through
`createMarkmendParser()` in `@markmend/parser`. `@markmend/core` remains the
smaller parser-independent package for completion alone.

## completion

`completion` controls how incomplete Markdown is completed in streaming mode. It accepts Markmend options or a custom function:

```vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'

function completeTail(markdown: string) {
  return markdown.endsWith('**') ? markdown : `${markdown}**`
}
</script>

<template>
  <Markdown :content="content" :completion="completeTail" />
</template>
```

The custom function receives Comark's unstable source tail, not a replacement document tree. In `static` mode completion is skipped and the original source is parsed.

## parserOptions

`parserOptions` exposes Comark parser options and plugins. `autoClose` is intentionally omitted because the `completion` prop owns that behavior.

```vue
<script setup lang="ts">
import type { StreamMarkdownParserOptions } from 'vue-stream-markdown'
import myPlugin from './my-comark-plugin'

const parserOptions: StreamMarkdownParserOptions = {
  plugins: [myPlugin()],
}
</script>

<template>
  <Markdown :content="content" :parser-options="parserOptions" />
</template>
```

Vue Stream Markdown also installs its security, footnote, and math plugins. Parser calls run sequentially so rapid source updates are applied in order.

## Public document

The component exposes the latest successfully parsed Comark document:

```ts
const markdown = useTemplateRef('markdown')
const document = markdown.value?.getDocument()
```

If parsing an update fails, `getDocument()` and the rendered UI keep the previous successful document.
