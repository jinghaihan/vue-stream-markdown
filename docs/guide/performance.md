---
title: Performance
description: Incremental Comark parsing, stable Vue rendering, and token-level code updates.
---

<script setup>
const scriptTag = '<' + 'script setup lang="ts">'
const scriptCloseTag = '<' + '/script>'
const codeBlockExample = `
\`\`\`vue
${scriptTag}
import { computed, ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const content = ref('# Hello World\\n\\nThis is **streaming** content.')
const typedEnable = ref(false)
const typingIndex = ref(0)

// Simulate streaming by incrementing typingIndex
function startTyping() {
  typedEnable.value = true
  typingIndex.value = 0
  const interval = setInterval(() => {
    typingIndex.value++
    if (typingIndex.value >= content.value.length) {
      clearInterval(interval)
      typedEnable.value = false
    }
  }, 30)
}

const markdownContent = computed(() =>
  typedEnable.value
    ? content.value.slice(0, typingIndex.value)
    : content.value
)

const mode = computed(() => typedEnable.value ? 'streaming' : 'static')
${scriptCloseTag}

<template>
  <div>
    <button @click="startTyping">Start Typing</button>
    <Markdown
      :content="markdownContent"
      :mode="mode"
      :is-dark="false"
    />
  </div>
</template>
\`\`\`
`
</script>

# Performance

vue-stream-markdown is built with performance in mind, utilizing Vue's reactivity and memoization capabilities to ensure efficient rendering even with large amounts of streaming content. The library intelligently caches computations and prevents unnecessary re-renders, making it ideal for real-time AI streaming applications.

## Incremental Rendering with Stable Keys

In streaming scenarios, content arrives incrementally. The key to performance is **preserving existing nodes** rather than re-rendering them from scratch. As new content streams in, only new nodes are added to the end, while existing nodes with stable keys are recognized by Vue and remain untouched. This means:

- Completed paragraphs don't re-render
- Finished code blocks remain stable
- Interactive elements maintain their state
- Only the streaming node updates incrementally

## Code Block Token-Level Updates

Code blocks receive special optimization through Shiki's `codeToTokens` API, enabling **token-level incremental updates** instead of full DOM recreation:

<StreamMarkdown :content="codeBlockExample" />

> 💡 **Tip**: Click the "Start Typing" button above and open the browser console to observe the incremental rendering behavior in real-time.

This approach ensures that:

- Only new or changed tokens are processed, not the entire code block
- Existing tokens remain in the DOM, reducing DOM operations
- Code blocks update smoothly as content streams in
- Large code blocks avoid expensive full re-renders

## Stateful Comark Parsing

Each `Markdown` instance owns one long-lived Comark parser. The component always supplies the complete source, while Comark tracks the stable prefix internally and parses the changing tail incrementally. Vue Stream Markdown does not split the document or rebuild an intermediate AST.

Simple Comark tuples are converted directly to VNodes. Only feature-heavy code and math rendering use lazily loaded Vue components.

## Performance Summary

vue-stream-markdown's performance optimizations provide:

- **Incremental Parsing** - Comark reuses the stable source prefix and processes the changing tail
- **Stable Output** - Completed blocks remain stable and don't re-render, with nodes cached by Vue
- **Direct Rendering** - Compact Comark tuples render directly to VNodes without a conversion tree
- **Minimal Overhead** - Heavy feature components and their event listeners are created only when needed

This makes vue-stream-markdown particularly well-suited for AI chat interfaces with streaming responses, real-time collaborative editing, and progressive content loading scenarios.
