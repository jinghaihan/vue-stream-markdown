<script setup lang="ts">
import type { CodeHighlightResult } from '@stream-markdown/core'
import type { CodeBlockProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { computed, shallowRef, watch } from 'vue'
import { useCodeOptions, useContext } from '../../../composables'
import CodeContent from './content.vue'

const props = withDefaults(defineProps<CodeBlockProps & {
  showHeader?: boolean
}>(), {
  showHeader: true,
})

const { codeOptions, extensions, isDark, uiComponents: UI } = useContext()

const model = computed(() => createCodeRendererModel(props.node))
const code = computed(() => model.value.code)
const lang = computed(() => model.value.lang)
const languageClass = computed(() => model.value.languageClass)
const startLine = computed(() => model.value.startLine)

const { showLineNumbers: showConfiguredLineNumbers } = useCodeOptions({
  codeOptions,
  language: lang,
})
const showLineNumbers = computed(() => showConfiguredLineNumbers.value && !model.value.noLineNumbers)

const highlighted = shallowRef<CodeHighlightResult>()
let highlightRequest = 0

const tokens = computed(() => highlighted.value)

watch(
  () => [
    code.value,
    extensions.value?.code,
    isDark.value,
  ] as const,
  async ([currentCode, extension, currentIsDark]) => {
    const request = ++highlightRequest
    if (!extension) {
      highlighted.value = undefined
      return
    }

    const result = await extension.highlight({
      code: currentCode,
      isDark: currentIsDark,
      language: lang.value,
    })
    if (request === highlightRequest)
      highlighted.value = result
  },
  { immediate: true },
)
</script>

<template>
  <component
    :is="UI.CodeBlock"
    v-if="showHeader"
    v-bind="props"
  >
    <CodeContent
      :code="code"
      :lang="lang"
      :language-class="languageClass"
      :tokens="tokens"
      :show-line-numbers="showLineNumbers"
      :start-line="startLine"
    />
  </component>

  <CodeContent
    v-else
    :code="code"
    :lang="lang"
    :language-class="languageClass"
    :tokens="tokens"
    :show-line-numbers="showLineNumbers"
    :start-line="startLine"
  />
</template>
