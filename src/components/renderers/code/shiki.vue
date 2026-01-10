<script setup lang="ts">
import type { TokensResult } from 'shiki'
import type { CodeNodeRendererProps } from '../../../types'
import { useResizeObserver } from '@vueuse/core'
import { computed, defineAsyncComponent, ref, toRefs, watch } from 'vue'
import { useCodeOptions, useShiki } from '../../../composables'
import VanillaRenderer from './vanilla'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const { shikiOptions, codeOptions, isDark } = toRefs(props)

const ShikiTokensRenderer = defineAsyncComponent(() => import('./shiki-token-renderer'))

const code = computed(() => props.node.value.trim())
const lang = computed(() => props.node.lang || '')

const { showLineNumbers } = useCodeOptions({
  codeOptions,
  language: lang,
})

const { getShiki, codeToTokens } = useShiki({
  lang,
  shikiOptions,
  isDark,
})

const tokens = ref<TokensResult>()

const vanillaRef = ref()
const minHeight = ref<number>()
const element = computed(() => vanillaRef.value?.$el)

const observer = useResizeObserver(element, () => {
  minHeight.value = element.value?.clientHeight
})

watch(
  () => [
    code.value,
    shikiOptions.value,
    isDark.value,
  ],
  async () => {
    tokens.value = await codeToTokens(code.value)
    observer.stop()
  },
  { immediate: true },
)
</script>

<template>
  <Transition name="stream-markdown-code-switch" mode="out-in">
    <div
      v-if="tokens"
      data-stream-markdown="shiki"
      :style="{
        minHeight: minHeight ? `${minHeight}px` : undefined,
      }"
    >
      <ShikiTokensRenderer
        data-stream-markdown="code"
        :data-show-line-numbers="showLineNumbers"
        :tokens="tokens"
        :get-shiki="getShiki"
      />
    </div>

    <VanillaRenderer v-else ref="vanillaRef" v-bind="props" />
  </Transition>
</template>
