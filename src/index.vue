<script setup lang="ts">
import type { Icons, NodeRenderers, StreamMarkdownProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import NodeList from './components/node-list.vue'
import { NODE_RENDERERS } from './components/renderers'
import { useContext, useKatex, useMermaid, useShiki } from './composables'
import { ICONS } from './constants'
import { loadLocaleMessages } from './locales'
import { MarkdownParser } from './markdown-parser'

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

const { mode, shikiOptions, mermaidOptions, isDark, enableAnimate } = toRefs(props)

const containerRef = ref<HTMLDivElement>()

const { provideContext } = useContext()

const markdownParser = new MarkdownParser({
  mode: props.mode,
  mdastOptions: props.mdastOptions,
  postprocess: props.postprocess,
  preprocess: props.preprocess,
})

const processed = computed(() => markdownParser.parseMarkdown(props.content))

const parsedNodes = computed(() => processed.value.nodes)
const processedContent = computed(() => processed.value.content)

const nodeRenderers = computed((): NodeRenderers => ({
  ...NODE_RENDERERS,
  ...props.nodeRenderers,
}))

const icons = computed((): Icons => ({
  ...ICONS,
  ...props.icons,
}))

function getContainer(): HTMLElement | undefined {
  return containerRef.value
}

const { preload: preloadShiki, dispose: disposeShiki } = useShiki({
  shikiOptions,
})
const { preload: preloadMermaid, dispose: disposeMermaid } = useMermaid({
  mermaidOptions,
})
const { preload: preloadKatex, dispose: disposeKatex } = useKatex()

async function bootstrap() {
  const tasks = [preloadShiki(), preloadMermaid(), preloadKatex()]
  if (props.locale !== 'en-US')
    tasks.push(loadLocaleMessages(props.locale))
  await Promise.all(tasks)
}

onMounted(bootstrap)

watch(() => props.mode, () => markdownParser.updateMode(props.mode))
watch(() => props.locale, () => loadLocaleMessages(props.locale))

provideContext({
  mode,
  icons,
  isDark,
  enableAnimate,
  parsedNodes,
  getContainer,
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
    <NodeList
      v-bind="props"
      :markdown-parser="markdownParser"
      :node-renderers="nodeRenderers"
      :nodes="parsedNodes"
      :get-container="getContainer"
    />
  </div>
</template>
