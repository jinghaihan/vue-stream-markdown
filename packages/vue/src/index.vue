<script setup lang="ts">
import type {
  BuiltinNodeRenderers,
  Icons,
  MarkdownAstParser,
  NodeRenderers,
  ParsedNode,
  StreamMarkdownProps,
  SyntaxTree,
  UIComponents,
} from './types'
import {
  createProcessedMarkdownModel,
  createRootStyle,
  createStreamMarkdownEngine,
  DEFAULT_ANIMATION,
  DEFAULT_ANIMATION_SPLIT,
  resolveEnableAnimate,
  resolveEnableCaret,
  resolvePreloadNodeRenderers,
} from '@stream-markdown/core'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { COMPONENT_RENDERERS, UI } from './components'
import { ICONS } from './components/icons'
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
import { loadLocaleMessages } from './locales'
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
  animation: DEFAULT_ANIMATION,
  animationSplit: DEFAULT_ANIMATION_SPLIT,
  isDark: undefined,
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const EMPTY_BLOCKS: SyntaxTree[] = []

const {
  controls,
  previewers,
  mode,
  dir,
  content,
  isDark: darkProp,
  locale: localeProp,
  codeOptions,
  tableOptions,
  imageOptions,
  linkOptions,
  katexOptions,
  hardenOptions,
  shikiOptions,
  mermaidOptions,
  uiOptions,
  cdnOptions,
  animation,
  animationSplit,
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

const { markdownParser, parse, updateMode } = createStreamMarkdownEngine({
  ...props,
  mode: props.mode,
})

const enableAnimate = computed(() => resolveEnableAnimate(mode.value, props.enableAnimate))

const enableCaret = computed(() => resolveEnableCaret(mode.value, props.caret))

const processed = computed(() => {
  updateMode(mode.value)
  return createProcessedMarkdownModel(parse(props.content))
})

const blocks = computed(() => processed.value.blocks)
const parsedNodes = computed(() => processed.value.parsedNodes)
const processedContent = computed(() => processed.value.processedContent)
const renderableBlocks = computed(() => {
  const result: Array<{
    block: SyntaxTree
    index: number
    nextNode?: ParsedNode
    nextNodeType?: string
    prevNode?: ParsedNode
    prevNodeType?: string
  }> = []
  let prevNode: ParsedNode | undefined

  blocks.value.forEach((block, index) => {
    if (!block.children.length)
      return

    const previous = result.at(-1)
    const firstNode = block.children[0]!
    if (previous) {
      previous.nextNodeType = firstNode.type
      const previousLastNode = previous.block.children.at(-1)!
      if (props.nodeRenderers[previousLastNode.type as keyof NodeRenderers])
        previous.nextNode = firstNode
    }
    result.push({
      block,
      index,
      prevNode: props.nodeRenderers[firstNode.type as keyof NodeRenderers] ? prevNode : undefined,
      prevNodeType: prevNode?.type,
    })
    prevNode = block.children.at(-1)
  })

  return result
})

const rootStyle = computed(() => createRootStyle(cssVariables.value, props.animationDuration))

const nodeRenderers = computed((): NodeRenderers => ({
  ...COMPONENT_RENDERERS,
  ...props.nodeRenderers,
}))

const preloadNodeRenderers = computed((): BuiltinNodeRenderers[] => resolvePreloadNodeRenderers(props.preload))

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

interface StreamMarkdownExpose {
  getMarkdownParser: () => MarkdownAstParser
  getParsedNodes: () => ParsedNode[]
  getProcessedContent: () => string
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

watch(locale, () => loadLocaleMessages(locale.value))

provideContext({
  controls,
  previewers,
  shikiOptions,
  mermaidOptions,
  katexOptions,
  hardenOptions,
  codeOptions,
  tableOptions,
  imageOptions,
  linkOptions,
  cdnOptions,
  mode,
  dir,
  nodeRenderers,
  icons,
  uiComponents,
  uiOptions,
  isDark,
  enableAnimate,
  animation,
  animationSplit,
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

defineExpose<StreamMarkdownExpose>({
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
    :dir="dir === 'auto' ? undefined : dir"
    :style="rootStyle"
  >
    <NodeList
      v-for="({ block, index, nextNode, nextNodeType, prevNode, prevNodeType }) in renderableBlocks"
      :key="index"
      :blocks="EMPTY_BLOCKS"
      :nodes="block.children"
      :block-index="index"
      :node-key="`stream-markdown-block-${index}`"
      :deep="0"
      :prev-node="prevNode"
      :prev-node-type="prevNodeType"
      :next-node="nextNode"
      :next-node-type="nextNodeType"
    />
  </div>
</template>
