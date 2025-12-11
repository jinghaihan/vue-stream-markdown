<script setup lang="ts">
import type { Component } from 'vue'
import type { IconName, NodeRenderers, StreamMarkdownProps } from './types'
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue'
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
  locale: 'en-US',
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const { shikiOptions, mermaidOptions, isDark } = toRefs(props)

const containerRef = ref<HTMLDivElement>()

const { provideContext } = useContext()

const markdownParser = new MarkdownParser({
  mode: props.mode,
  mdastOptions: props.mdastOptions,
  postprocess: props.postprocess,
  preprocess: props.preprocess,
})

const parsedNodes = computed(() => markdownParser.parseMarkdown(props.content))

const nodeRenderers = computed((): NodeRenderers => ({
  ...NODE_RENDERERS,
  ...props.nodeRenderers,
}))

const icons = computed((): Record<IconName, Component> => ({
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

bootstrap()

watch(() => props.mode, () => markdownParser.updateMode(props.mode))
watch(() => props.locale, () => loadLocaleMessages(props.locale))

provideContext({
  icons,
  isDark,
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
