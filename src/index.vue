<script setup lang="ts">
import type { BuiltinNodeRenderers, Icons, NodeRenderers, StreamMarkdownProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import NodeList from './components/node-list.vue'
import { NODE_RENDERERS } from './components/renderers'
import { useContext, useDarkDetector, useKatex, useMermaid, useShiki } from './composables'
import { ICONS, PRELOAD_NODE_RENDERER } from './constants'
import { loadLocaleMessages } from './locales'
import { MarkdownParser } from './markdown-parser'
import { preloadAsyncComponents } from './utils'

const props = withDefaults(defineProps<StreamMarkdownProps>(), {
  mode: 'streaming',
  content: '',
  nodeRenderers: () => ({}),
  icons: () => ({}),
  controls: true,
  previewers: true,
  isDark: undefined,
  enableAnimate: undefined,
  locale: 'en-US',
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const {
  mode,
  isDark: darkMode,
  locale,
  shikiOptions,
  mermaidOptions,
  uiOptions,
  enableAnimate,
} = toRefs(props)

const { provideContext } = useContext()

const { isDark, stop: stopDarkModeObserver } = useDarkDetector(darkMode)

const { preload: preloadShiki, dispose: disposeShiki } = useShiki({
  shikiOptions,
})
const { preload: preloadMermaid, dispose: disposeMermaid } = useMermaid({
  mermaidOptions,
})
const { preload: preloadKatex, dispose: disposeKatex } = useKatex()

const containerRef = ref<HTMLDivElement>()

const markdownParser = new MarkdownParser(props)

const processed = computed(() => markdownParser.parseMarkdown(props.content))

const blocks = computed(() => processed.value?.asts ?? [])
const parsedNodes = computed(() => blocks.value.flatMap(block => block.children))
const processedContent = computed(() => (processed.value?.contents ?? []).join(''))

const nodeRenderers = computed((): NodeRenderers => ({
  ...NODE_RENDERERS,
  ...props.nodeRenderers,
}))

const preloadNodeRenderers = computed((): BuiltinNodeRenderers[] => {
  if (!props.preload || !props.preload.nodeRenderers)
    return PRELOAD_NODE_RENDERER
  return props.preload.nodeRenderers
})

const icons = computed((): Icons => ({
  ...ICONS,
  ...props.icons,
}))

function getContainer(): HTMLElement | undefined {
  return containerRef.value
}

async function bootstrap() {
  const tasks = [
    preloadShiki(), // init shiki highlighter
    preloadMermaid(), // init mermaid instance
    preloadKatex(), // dynamic load katex css
    preloadAsyncComponents(icons.value),
  ]

  if (props.locale !== 'en-US')
    tasks.push(loadLocaleMessages(props.locale))

  if (preloadNodeRenderers.value.length)
    tasks.push(preloadAsyncComponents(nodeRenderers.value, preloadNodeRenderers.value))

  await Promise.all(tasks)
}

onMounted(bootstrap)

watch(locale, () => loadLocaleMessages(locale.value))

provideContext({
  mode,
  icons,
  uiOptions,
  isDark,
  enableAnimate,
  parsedNodes,
  getContainer,
  beforeDownload: props.beforeDownload,
  onCopied: (content: string) => {
    emits('copied', content)
  },
})

onBeforeUnmount(() => {
  disposeShiki()
  disposeMermaid()
  disposeKatex()
  stopDarkModeObserver()
})

defineExpose({
  getMarkdownParser: () => markdownParser,
  getParsedNodes: () => parsedNodes.value,
  getProcessedContent: () => processedContent.value,
})
</script>

<template>
  <div
    ref="containerRef"
    class="stream-markdown"
    :class="[isDark ? 'dark' : 'light']"
  >
    <template v-for="(block, index) in blocks" :key="index">
      <NodeList
        v-bind="props"
        :markdown-parser="markdownParser"
        :node-renderers="nodeRenderers"
        :nodes="block.children"
        :get-container="getContainer"
        :node-key="`stream-markdown-block-${index}`"
        :is-dark="isDark"
      />
    </template>
  </div>
</template>
