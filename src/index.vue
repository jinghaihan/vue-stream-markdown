<script setup lang="ts">
import type { StreamMarkdownProps } from './types'
import mediumZoom from 'medium-zoom'
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue'
import NodeList from './components/node-list.vue'
import { NODE_RENDERERS } from './components/renderers'
import { useContext, useKatex, useMermaid, useShiki, useTippy } from './composables'
import { loadLocaleMessages } from './locales'
import { MarkdownParser } from './markdown-parser'
import 'medium-zoom/dist/style.css'

const props = withDefaults(defineProps<StreamMarkdownProps>(), {
  mode: 'streaming',
  content: '',
  nodeRenderers: () => ({}),
  controls: true,
  previewers: true,
  isDark: false,
  locale: 'en-US',
})

const emits = defineEmits<{
  (e: 'copied', content: string): void
}>()

const { isDark } = toRefs(props)

const containerRef = ref<HTMLDivElement>()

const { provideContext } = useContext()

const { initTippy } = useTippy({
  isDark,
})

const zoom = mediumZoom('[data-zoomable]', {
  background: 'color-mix(in oklab, var(--background) 80%, transparent)',
})

const markdownParser = new MarkdownParser({
  mode: props.mode,
  mdastOptions: props.mdastOptions,
  postprocess: props.postprocess,
  preprocess: props.preprocess,
})

const parsedNodes = computed(() => markdownParser.parseMarkdown(props.content))

const nodeRenderers = computed(() => ({
  ...NODE_RENDERERS,
  ...props.nodeRenderers,
}))

function getContainer(): HTMLElement | undefined {
  return containerRef.value
}

const { preload: preloadShiki, dispose: disposeShiki } = useShiki()
const { preload: preloadMermaid, dispose: disposeMermaid } = useMermaid()
const { preload: preloadKatex, dispose: disposeKatex } = useKatex()

async function bootstrap() {
  initTippy()

  const tasks = []
  if (props.locale !== 'en-US')
    tasks.push(loadLocaleMessages(props.locale))

  await Promise.all([...tasks, preloadShiki(), preloadMermaid(), preloadKatex()])
}

bootstrap()

watch(() => props.mode, () => markdownParser.updateMode(props.mode))
watch(() => props.locale, () => loadLocaleMessages(props.locale))

provideContext({
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
      :medium-zoom="zoom"
      :get-container="getContainer"
    />
  </div>
</template>

<style>
.stream-markdown {
  --default-transition-duration: 150ms;
  --typewriter-transition-duration: 900ms;

  --font-sans:
    'Geist', 'Geist Fallback', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-serif: 'Geist', 'Geist Fallback', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --font-mono:
    'Geist Mono', 'Geist Mono Fallback', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;

  --radius: 0.5rem;

  font-family: var(--font-sans);
  color: var(--foreground);
}
.stream-markdown * {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}

.stream-markdown .tippy-box {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--border);
}
.stream-markdown .tippy-arrow {
  color: var(--popover);
}
.stream-markdown .tippy-box > .tippy-svg-arrow {
  border-top-color: var(--popover);
}

.stream-markdown ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.stream-markdown ::-webkit-scrollbar-track {
  background: transparent;
}
.stream-markdown ::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
.stream-markdown ::-webkit-scrollbar-thumb:hover {
  background: var(--border);
  opacity: 0.5;
}
</style>
