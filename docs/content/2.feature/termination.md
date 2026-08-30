---
title: Streaming Completion
navigation:
  icon: i-lucide-braces
description: Keep unfinished Markdown readable while a response is still arriving.
---

Markdown syntax often arrives in pieces. A response may temporarily end inside emphasis, a link, a table row, or a code fence. In `mode="streaming"`, vue-stream-markdown completes supported unfinished syntax before parsing so users see a stable preview instead of raw delimiters.

Completion affects only the rendered preview. The `content` value is never modified.

## Streaming and static modes

Use streaming mode while content is arriving:

```vue
<Markdown :content="content" mode="streaming" />
```

Switch to static mode when generation finishes:

```vue
<Markdown :content="content" mode="static" />
```

Static mode skips completion and renders the original Markdown exactly as supplied.

## Emphasis and inline syntax

An unfinished delimiter is kept from leaking into the preview while the text grows:

```markdown
This answer is **still being generated
```

The same behavior covers common emphasis, inline code, strikethrough, and CJK-adjacent formatting cases.

## Links

Incomplete link text can appear as a loading link without becoming clickable:

```markdown
[Read the complete guide
```

::stream-markdown{example="feature-termination.incompleteLink" mode="streaming"}
::

Once the destination arrives, the normal link style and interaction are enabled:

```markdown
[Read the complete guide](https://example.com)
```

::stream-markdown{example="feature-termination.completeLink"}
::

## Images

An image destination may also arrive over several updates. Streaming mode keeps the incomplete syntax from flashing as plain text and exposes a loading state until the image is ready.

::stream-markdown{example="feature-termination.incompleteImage" mode="streaming"}
::

::stream-markdown{example="feature-termination.completeImage"}
::

## Tables

Partial rows remain a table while columns are still arriving:

::stream-markdown{example="feature-termination.incompleteTable" mode="streaming"}
::

When the response completes, static mode renders the final source without inferred cells or delimiters.

## Mathematics

With `@stream-markdown/math` configured, an unfinished equation remains renderable during streaming and is replaced by the exact final expression in static mode.

::stream-markdown{example="feature-termination.incompleteInlineMath" mode="streaming"}
::

See [Mathematics](/feature/mathematics) for extension setup and KaTeX styles.

## Footnotes

A footnote reference is hidden until its matching definition is present, avoiding a reference that cannot navigate anywhere yet.

::stream-markdown{example="feature-termination.incompleteFootnote" mode="streaming"}
::

::stream-markdown{example="feature-termination.completeFootnote"}
::

## Custom completion

Use the `completion` prop when an application needs rules beyond the defaults:

```vue
<script setup lang="ts">
function completion(markdown: string) {
  const opening = markdown.lastIndexOf('<thinking>')
  const closing = markdown.lastIndexOf('</thinking>')
  return opening > closing ? `${markdown}</thinking>` : markdown
}
</script>

<template>
  <Markdown :content="content" :completion="completion" mode="streaming" />
</template>
```

See [Parser](/config/parser) for completion options and Comark plugins.
