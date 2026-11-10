<script setup lang="ts">
import type { Monaco } from '@monaco-editor/loader'
import type { BuiltinTheme, Highlighter } from 'shiki'
import type { Editor } from '../types'
import loader from '@monaco-editor/loader'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'

const props = withDefaults(defineProps<{
  content?: string
  theme?: [BuiltinTheme, BuiltinTheme]
}>(), {
  content: '',
  theme: () => ['github-light', 'github-dark'],
})

const emits = defineEmits<{
  (e: 'change', content: string): void
}>()

const { isDark } = useDark()

const editorRef = ref<HTMLDivElement>()

const highlighter = shallowRef<Highlighter>()
const monaco = shallowRef<Monaco>()
const editor = shallowRef<Editor>()

const theme = computed(() => isDark.value ? props.theme[1] : props.theme[0])

async function initEditor() {
  await nextTick()
  const element = editorRef.value
  if (!element)
    return

  highlighter.value = await createHighlighter({
    themes: props.theme,
    langs: ['markdown'],
  })

  monaco.value.languages.register({ id: 'markdown' })

  highlighterToMonaco()

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

async function updateTheme() {
  if (!highlighter.value || !editor.value)
    return

  const loadedThemes = highlighter.value.getLoadedThemes()
  for (const theme of props.theme) {
    if (!loadedThemes.includes(theme!))
      await highlighter.value.loadTheme(theme)
  }

  highlighterToMonaco()

  editor.value.updateOptions({
    theme: theme.value,
  })
}

function highlighterToMonaco() {
  // @ts-expect-error type is broken
  shikiToMonaco(highlighter.value, monaco.value)
}

loader.init().then((data: Monaco) => {
  monaco.value = data
  initEditor()
})

watch(() => [isDark.value, theme.value], updateTheme)

onBeforeUnmount(() => {
  highlighter.value?.dispose()
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
