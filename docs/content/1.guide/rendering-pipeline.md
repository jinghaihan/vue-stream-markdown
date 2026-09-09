---
title: Rendering Pipeline
navigation:
  icon: i-lucide-workflow
description: How completion, incremental parsing, and stable Vue rendering cooperate.
---

The rendering pipeline is designed around one rule: callers always provide the complete Markdown source they currently have.

```mermaid
flowchart TD
    Source[Complete source] --> Mode{Rendering mode}
    Mode -->|streaming| Smoothing[Adaptive display buffer]
    Smoothing --> Completion[Markmend completion]
    Mode -->|static| Parser[Incremental Comark parsing]
    Completion --> Parser
    Parser --> Vue[Stable Vue nodes]
    Vue --> Rich[Rich renderers when configured]
```

## 1. Smooth streaming updates

Append-only updates are buffered briefly and exposed as steadily growing prefixes. Each prefix waits for the previous parse to finish, preventing a fast input stream from creating a long parsing queue. Set `smoothing` to `false` to expose every update directly, or choose a smoothing preset for a different pacing profile.

Content rendered in static mode is exposed immediately. When a live stream switches to static mode with buffered content still pending, the buffer drains first and then performs the final exact parse, avoiding a visible whole-document refresh.

## 2. Complete unfinished syntax

When `mode="streaming"`, Markmend repairs supported unfinished syntax in the changing tail. This keeps partial emphasis, links, tables, code fences, and other common structures readable while new text arrives.

When `mode="static"`, completion is skipped and the original source is parsed unchanged.

## 3. Parse incrementally

Each `Markdown` instance keeps a long-lived [Comark](https://github.com/comarkdown/comark) parser. Comark reuses the stable source prefix and parses the changed tail instead of starting from an empty document on every update.

Updates are processed in source order. If one parse fails, the last successfully rendered document remains visible and later updates can still recover.

## 4. Preserve stable Vue output

The compact Comark document is rendered directly to Vue nodes. Completed top-level blocks keep stable identities, so growing content at the end does not replace earlier paragraphs, controls, or interactive components.

Simple semantic elements render synchronously. Stateful features such as code highlighting, math, diagrams, images, tables, and overlays use dedicated Vue components only when the document needs them.

## 5. Add rich output when needed

The main package renders readable code fences without installing large third-party runtimes. Add only the extensions your application uses:

- `@stream-markdown/code` for [Shiki](https://shiki.style/)
- `@stream-markdown/math` for [KaTeX](https://katex.org/)
- `@stream-markdown/mermaid` for the official [Mermaid](https://mermaid.js.org/) renderer
- `@stream-markdown/beautiful-mermaid` for [Beautiful Mermaid](https://github.com/lukilabs/beautiful-mermaid) diagrams

See [Extensions](/config/extensions) for installation and configuration.

## Custom tags

Native HTML and custom HTML-like tags use the same document representation as Markdown elements. The `components` prop maps a tag directly to a Vue component, without a second HTML parsing layer:

```vue
<script setup lang="ts">
import UserCard from './user-card.vue'

const components = {
  'user-card': UserCard,
}
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```
