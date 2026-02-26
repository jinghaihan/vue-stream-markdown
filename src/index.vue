<script setup lang="ts">
import type { BuiltinNodeRenderers, Icons, NodeRenderers, StreamMarkdownProps, UIComponents } from './types'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { NODE_RENDERERS, UI } from './components'
import NodeList from './components/node-list.vue'
import {
  useContext,
  useDarkDetector,
  useKatex,
  useLocaleDetector,
  useMermaid,
  useShiki,
  useTailwindV3Theme,
} from './composables'
import { ICONS, PRELOAD_NODE_RENDERER } from './constants'
import { loadLocaleMessages } from './locales'
import { MarkdownParser } from './markdown-parser'
import { preloadAsyncComponents } from './utils'
import './style.css'

const props = withDefaults(defineProps<StreamMarkdownProps>(), {
  mode: 'streaming',
  content: '',
  nodeRenderers: () => ({}),
  icons: () => ({}),
  controls: true,
  previewers: true,
  enableAnimate: undefined,
  isDark: undefined,
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const {
  controls,
  previewers,
  mode,
  content,
  isDark: darkProp,
  locale: localeProp,
  codeOptions,
  imageOptions,
  linkOptions,
  htmlOptions,
  katexOptions,
  hardenOptions,
  shikiOptions,
  mermaidOptions,
  uiOptions,
  cdnOptions,
  caret,
} = toRefs(props)

const { provideContext } = useContext()

const { cssVariables, stop: stopTailwindV3ThemeObserver } = useTailwindV3Theme({ element: props.themeElement })
const { isDark, stop: stopDarkModeObserver } = useDarkDetector(darkProp, cssVariables)
const { locale } = useLocaleDetector(localeProp)

const { preload: preloadShiki, dispose: disposeShiki } = useShiki({
  shikiOptions,
  cdnOptions: props.cdnOptions,
})
const { preload: preloadMermaid, dispose: disposeMermaid } = useMermaid({
  mermaidOptions,
  cdnOptions: props.cdnOptions,
})
const { preload: preloadKatex, dispose: disposeKatex } = useKatex({
  markdown: content,
  mdastOptions: props.mdastOptions,
  cdnOptions: props.cdnOptions,
})

const containerRef = ref<HTMLDivElement>()

const markdownParser = new MarkdownParser(props)
const defaultEnableAnimate = props.mode === 'streaming'

const enableAnimate = computed(() => {
  if (typeof props.enableAnimate === 'boolean')
    return props.enableAnimate
  return defaultEnableAnimate
})

const enableCaret = computed(() => !!props.caret && mode.value === 'streaming')

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

const uiComponents = computed((): UIComponents => ({
  ...UI,
  ...props.components,
}))

function getContainer(): HTMLElement | undefined {
  return containerRef.value
}

async function bootstrap() {
  const tasks = [
    preloadShiki(),
    preloadMermaid(),
    preloadKatex(),
    preloadAsyncComponents(icons.value),
    preloadAsyncComponents(uiComponents.value),
  ]

  if (props.locale !== 'en-US')
    tasks.push(loadLocaleMessages(locale.value))

  if (preloadNodeRenderers.value.length)
    tasks.push(preloadAsyncComponents(nodeRenderers.value, preloadNodeRenderers.value))

  await Promise.all(tasks)
}

onMounted(bootstrap)

watch(mode, () => markdownParser.updateMode(mode.value))
watch(locale, () => loadLocaleMessages(locale.value))

provideContext({
  controls,
  previewers,
  shikiOptions,
  mermaidOptions,
  katexOptions,
  htmlOptions,
  hardenOptions,
  codeOptions,
  imageOptions,
  linkOptions,
  cdnOptions,
  mode,
  nodeRenderers,
  icons,
  uiComponents,
  uiOptions,
  isDark,
  enableAnimate,
  enableCaret,
  caret,
  blocks,
  parsedNodes,
  markdownParser,
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

  stopTailwindV3ThemeObserver()
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
    :style="cssVariables"
  >
    <template v-for="(block, index) in blocks" :key="index">
      <NodeList
        :nodes="block.children"
        :block-index="index"
        :node-key="`stream-markdown-block-${index}`"
        :deep="0"
      />
    </template>
  </div>
</template>
