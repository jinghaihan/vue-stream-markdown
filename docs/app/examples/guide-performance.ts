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

export { codeBlockExample, scriptCloseTag, scriptTag }
