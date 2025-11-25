<script setup lang="ts">
import type { TokensResult } from 'shiki'
import type { CodeNodeRendererProps } from '../../../types'
import { computed, defineAsyncComponent, ref, toRefs, watch } from 'vue'
import { useShiki } from '../../../composables'
import VanillaRenderer from './vanilla.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const { shikiOptions, codeOptions, isDark } = toRefs(props)

const ShikiTokensRenderer = defineAsyncComponent(() => import('./renderer'))

const code = computed(() => props.node.value.trim())
const lang = computed(() => props.node.lang || '')

const showLineNumbers = computed(
  () => typeof codeOptions.value?.lineNumbers === 'boolean'
    ? codeOptions.value.lineNumbers
    : true,
)

const { codeToTokens } = useShiki({
  lang,
  shikiOptions,
  isDark,
})

const tokens = ref<TokensResult>()

watch(
  () => [
    code.value,
    shikiOptions.value,
    isDark.value,
  ],
  async () => {
    tokens.value = await codeToTokens(code.value)
  },
  { immediate: true },
)
</script>

<template>
  <ShikiTokensRenderer
    v-if="tokens"
    data-stream-markdown="code"
    :data-show-line-numbers="showLineNumbers"
    :tokens="tokens"
    :show-line-numbers="showLineNumbers"
  />
  <VanillaRenderer v-else v-bind="props" />
</template>

<style>
.stream-markdown [data-stream-markdown='code'] .line {
  display: block;
  position: relative;
}

.stream-markdown [data-stream-markdown='code'] .line::before {
  display: inline-block;
  width: 1rem;
  margin-right: 1rem;
  font-size: 13px;
  text-align: right;
  color: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
  font-family: var(--font-mono);
  content: counter(line);
  counter-increment: line;
  user-select: none;
}

.stream-markdown [data-stream-markdown='code'][data-show-line-numbers='false'] .line::before {
  display: none;
}
</style>
