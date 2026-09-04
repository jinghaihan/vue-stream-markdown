---
title: Parser
navigation:
  icon: i-lucide-scan-text
description: Configure Comark plugins and streaming Markdown completion.
---

Vue Stream Markdown uses one long-lived [Comark](https://github.com/comarkdown/comark) parser for each component instance. Pass the complete source to `content`; Comark retains incremental state and reuses the stable prefix between updates.

The same parser layer is available independently from Vue through
`createMarkmendParser()` in `@markmend/parser`. `@markmend/core` remains the
smaller parser-independent package for completion alone.

`parse()` returns the parsed document together with information about the
syntax completed during that streaming update:

```ts
const parser = createMarkmendParser()
const result = await parser.parse('[Documentation](', 'streaming')

result.document
result.completion
// { type: 'link', phase: 'destination' }
```

`completion` is omitted when the input did not require completion. `phase` is
only present when a completion type has a meaningful sub-stage.

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

The custom function receives Comark's unstable source tail, not a replacement parser result. It can return a string or `{ markdown, completion }` when it also knows the active completion type. In `static` mode completion is skipped and the original source is parsed.

```ts
function completeLinkDestination(markdown: string) {
  return {
    markdown: `${markdown})`,
    completion: {
      type: 'link',
      phase: 'destination',
    },
  }
}
```

### Completion steps

For more control, override individual built-in steps with `completionSteps`.
The built-in functions and their order are available from the main package, so
an application can wrap or replace only the rule it needs:

```ts
import {
  completeLink,
  defaultCompletionSteps,
} from 'vue-stream-markdown'

const completion = {
  completionSteps: {
    ...defaultCompletionSteps,
    link: (markdown, context) => completeLink(markdown, context),
  },
}
```

Each step receives the current Markdown and an optional completion context and
returns the Markdown for the next step. Unspecified entries keep the default
behavior. The exported `complete*` functions can also be composed directly in
custom streaming integrations.

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
