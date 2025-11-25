<script setup lang="ts">
import type { Monaco } from '@monaco-editor/loader'
import type { Editor } from '../types'
import loader from '@monaco-editor/loader'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { isDark } from '../composable'

const props = withDefaults(defineProps<{
  content?: string
}>(), {
  content: '',
})

const emits = defineEmits<{
  (e: 'change', content: string): void
}>()

const editorRef = ref<HTMLDivElement>()

const monaco = shallowRef<Monaco>()
const editor = shallowRef<Editor>()

const theme = computed(() => isDark.value ? 'vs-dark' : 'vs')

async function initEditor() {
  await nextTick()
  const element = editorRef.value
  if (!element)
    return

  editor.value = monaco.value.editor.create(element, {
    language: 'markdown',
    value: props.content,
    theme: theme.value,
    fontFamily: 'Geist Mono, Jetbrains Mono, Fira Code, monospace',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    smoothScrolling: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
  })

  editor.value.onDidChangeModelContent(() => {
    emits('change', editor.value?.getValue() ?? '')
  })
}

loader.init().then((data: Monaco) => {
  monaco.value = data
  initEditor()
})

watch(isDark, () => {
  editor.value?.updateOptions({
    theme: theme.value,
  })
})

defineExpose({
  getValue: () => {
    if (editor.value)
      return editor.value.getValue()
    return ''
  },
  setValue: (content: string) => {
    if (editor.value)
      editor.value.setValue(content)
  },
})
</script>

<template>
  <div ref="editorRef" class="size-full" />
</template>
