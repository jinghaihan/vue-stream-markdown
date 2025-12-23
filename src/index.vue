<script setup lang="ts">
import type { BuiltinNodeRenderers, Icons, NodeRenderers, StreamMarkdownProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import NodeList from './components/node-list.vue'
import { NODE_RENDERERS } from './components/renderers'
import { useContext, useKatex, useMermaid, useShiki } from './composables'
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
  isDark: false,
  enableAnimate: undefined,
  locale: 'en-US',
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const {
  mode,
  shikiOptions,
  mermaidOptions,
  uiOptions,
  isDark,
  enableAnimate,
} = toRefs(props)

const containerRef = ref<HTMLDivElement>()

const { provideContext } = useContext()

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

function getOverlayContainer(): Element | null {
  return document.querySelector('#stream-markdown-overlay')
}

const { preload: preloadShiki, dispose: disposeShiki } = useShiki({
  shikiOptions,
})
const { preload: preloadMermaid, dispose: disposeMermaid } = useMermaid({
  mermaidOptions,
})
const { preload: preloadKatex, dispose: disposeKatex } = useKatex()

function ensureOverlayContainer() {
  const overlayContainer = getOverlayContainer()
  if (!overlayContainer) {
    const div = document.createElement('div')
    div.id = 'stream-markdown-overlay'
    div.classList.add('stream-markdown-overlay')
    div.classList.add(isDark.value ? 'dark' : 'light')
    document.body.appendChild(div)
  }
}

function updateOverlayContainerTheme() {
  const overlayContainer = getOverlayContainer()
  if (!overlayContainer)
    return

  overlayContainer.classList.toggle('dark', isDark.value)
  overlayContainer.classList.toggle('light', !isDark.value)
}

async function bootstrap() {
  ensureOverlayContainer()

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

watch(() => props.locale, () => loadLocaleMessages(props.locale))
watch(() => props.isDark, () => updateOverlayContainerTheme())

provideContext({
  mode,
  icons,
  uiOptions,
  isDark,
  enableAnimate,
  parsedNodes,
  getContainer,
  getOverlayContainer,
  beforeDownload: props.beforeDownload,
  onCopied: (content: string) => {
    emits('copied', content)
  },
})

onBeforeUnmount(() => {
  disposeShiki()
  disposeMermaid()
  disposeKatex()
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
      />
    </template>
  </div>
</template>
