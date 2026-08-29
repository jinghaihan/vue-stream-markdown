<script setup lang="ts">
import type { TokensResult } from 'shiki'
import type { CodeBlockProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { computed, shallowRef, watch } from 'vue'
import { useCodeOptions, useContext, useShiki } from '../../../composables'
import CodeContent from './content.vue'

const props = withDefaults(defineProps<CodeBlockProps & {
  showHeader?: boolean
}>(), {
  showHeader: true,
})

const { cdnOptions, codeOptions, isDark, shikiOptions, uiComponents: UI } = useContext()

const model = computed(() => createCodeRendererModel(props.node))
const code = computed(() => model.value.code)
const lang = computed(() => model.value.lang)
const languageClass = computed(() => model.value.languageClass)

const { showLineNumbers } = useCodeOptions({
  codeOptions,
  language: lang,
})

const { installed: hasShiki, getShiki, codeToTokens } = useShiki({
  cdnOptions,
  lang,
  shikiOptions,
  isDark,
})

const highlighted = shallowRef<TokensResult>()
let highlightRequest = 0

const tokens = computed(() => highlighted.value)

watch(
  () => [
    code.value,
    hasShiki.value,
    shikiOptions.value,
    isDark.value,
  ] as const,
  async ([currentCode, installed]) => {
    const request = ++highlightRequest
    if (!installed) {
      highlighted.value = undefined
      return
    }

    const result = await codeToTokens(currentCode)
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
      :get-shiki="getShiki"
      :show-line-numbers="showLineNumbers"
    />
  </component>

  <CodeContent
    v-else
    :code="code"
    :lang="lang"
    :language-class="languageClass"
    :tokens="tokens"
    :get-shiki="getShiki"
    :show-line-numbers="showLineNumbers"
  />
</template>
