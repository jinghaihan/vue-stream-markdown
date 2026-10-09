<script setup lang="ts">
import type { CodeHighlightResult } from '@stream-markdown/core'
import type { CodeRendererProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { computed, shallowRef, watch } from 'vue'
import { useCodeOptions, useContext } from '../../../composables'
import CodeBlock from '../../code-block/index.vue'
import CodeContent from './content.vue'

const props = withDefaults(defineProps<CodeRendererProps>(), {
  showWrapper: false,
})

const { codeOptions, extensions, isDark } = useContext()

const model = computed(() => createCodeRendererModel(props.node))
const code = computed(() => model.value.code)
const lang = computed(() => model.value.lang)
const languageClass = computed(() => model.value.languageClass)
const startLine = computed(() => model.value.startLine)

const { languageCodeOptions, showLineNumbers: showConfiguredLineNumbers } = useCodeOptions({
  codeOptions,
  language: lang,
})
const showLineNumbers = computed(() => showConfiguredLineNumbers.value && !model.value.noLineNumbers)
const virtualScroll = computed(() => languageCodeOptions.value?.virtualScroll ?? codeOptions.value?.virtualScroll ?? false)

const highlighted = shallowRef<CodeHighlightResult>()
let highlightRequest = 0

const tokens = computed(() => highlighted.value)

watch(
  () => [
    code.value,
    lang.value,
    extensions.value?.code,
    isDark.value,
  ] as const,
  async ([currentCode, currentLanguage, extension, currentIsDark]) => {
    const request = ++highlightRequest
    if (!extension) {
      highlighted.value = undefined
      return
    }

    const result = await extension.highlight({
      code: currentCode,
      isDark: currentIsDark,
      language: currentLanguage,
    })
    if (request === highlightRequest)
      highlighted.value = result
  },
  { immediate: true },
)
</script>

<template>
  <CodeBlock
    v-if="showWrapper"
    v-bind="props"
  >
    <CodeContent
      :code="code"
      :lang="lang"
      :language-class="languageClass"
      :tokens="tokens"
      :show-line-numbers="showLineNumbers"
      :start-line="startLine"
      :virtual-scroll="virtualScroll"
    />
  </CodeBlock>

  <CodeContent
    v-else
    :code="code"
    :lang="lang"
    :language-class="languageClass"
    :tokens="tokens"
    :show-line-numbers="showLineNumbers"
    :start-line="startLine"
    :virtual-scroll="virtualScroll"
  />
</template>
