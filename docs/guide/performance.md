<script setup>
const scriptTag = '<' + 'script setup lang="ts">'
const scriptCloseTag = '<' + '/script>'
const codeBlockExample = `
\`\`\`vue
${scriptTag}
import { computed, ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'
import 'vue-stream-markdown/theme.css'

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

## Block-Based Parsing Optimization

The parser uses `parseMarkdownIntoBlocks` (ported from [streamdown](https://github.com/vercel/streamdown)) to perform coarse-grained segmentation, splitting markdown content into smaller blocks before AST parsing. This reduces the content length for each AST parsing operation, improving performance especially for large documents. In streaming mode, only the last block needs to be re-parsed as new content arrives, while completed blocks remain cached.

## Renderer Preloading

Lightweight node renderers are preloaded by default to reduce initial rendering latency. The preload happens after merging custom renderers, ensuring that preloaded components match your final configuration. You can customize which renderers to preload using the `preload` prop.

## Performance Summary

vue-stream-markdown's performance optimizations provide:

- **Incremental Rendering** - Only new or changed blocks are processed, maintaining a stable AST structure
- **Stable Output** - Completed blocks remain stable and don't re-render, with nodes cached by Vue
- **Block-Based Parsing** - Content is split into blocks (via `parseMarkdownIntoBlocks` from streamdown) to reduce AST parsing overhead
- **Minimal Overhead** - Parsing and rendering work is minimized through lazy parsing, selective updates, and efficient Vue reactivity diffing
- **Renderer Preloading** - Lightweight renderers are preloaded to reduce initial rendering latency

This makes vue-stream-markdown particularly well-suited for AI chat interfaces with streaming responses, real-time collaborative editing, and progressive content loading scenarios.
