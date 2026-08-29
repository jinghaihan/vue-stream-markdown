<script setup lang="ts">
import type { TokensResult } from 'shiki'
import type { CodeNodeRendererProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { useResizeObserver } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { useCodeOptions, useContext, useShiki } from '../../../composables'
import ShikiTokensRenderer from './shiki-token-renderer.vue'
import VanillaRenderer from './vanilla-renderer.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const { cdnOptions, codeOptions, isDark, shikiOptions } = useContext()

const model = computed(() => createCodeRendererModel(props.node))
const code = computed(() => model.value.code)
const lang = computed(() => model.value.lang)

const { showLineNumbers } = useCodeOptions({
  codeOptions,
  language: lang,
})

const { getShiki, codeToTokens } = useShiki({
  cdnOptions,
  lang,
  shikiOptions,
  isDark,
})

const tokens = shallowRef<TokensResult>()

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
      dir="ltr"
      :style="{
        minHeight: minHeight ? `${minHeight}px` : undefined,
      }"
    >
      <ShikiTokensRenderer
        data-stream-markdown="code"
        :data-show-line-numbers="showLineNumbers"
        :show-line-numbers="showLineNumbers"
        :tokens="tokens"
        :get-shiki="getShiki"
      />
    </div>

    <VanillaRenderer v-else ref="vanillaRef" :node="node" />
  </Transition>
</template>
