<script setup lang="ts">
import type {
  Icons,
  MarkdownDocument,
  StreamMarkdownParserOptions,
  StreamMarkdownProps,
  UIComponents,
} from './types'
import {
  createRootStyle,
  DEFAULT_ANIMATION,
  DEFAULT_ANIMATION_SPLIT,
  resolveEnableAnimate,
  resolveEnableCaret,
} from '@stream-markdown/core'
import footnotes from 'comark/plugins/footnotes'
import math from 'comark/plugins/math'
import security from 'comark/plugins/security'
import { computed, onBeforeUnmount, onMounted, shallowRef, toRefs, watch } from 'vue'
import { UI } from './components'
import { ICONS } from './components/icons'
import ComarkNodeList from './components/renderers/node-list'
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
import { createComarkParserEngine } from './parser'
import { preloadAsyncComponents } from './utils'
import './style.css'

const props = withDefaults(defineProps<StreamMarkdownProps>(), {
  mode: 'streaming',
  content: '',
  components: () => ({}),
  uiComponents: () => ({}),
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
  cdnOptions: props.cdnOptions,
})

const containerRef = shallowRef<HTMLDivElement>()
const document = shallowRef<MarkdownDocument>({
  frontmatter: {},
  meta: {},
  nodes: [],
})

const parserOptions: StreamMarkdownParserOptions = {
  ...props.parserOptions,
  plugins: [
    ...(props.parserOptions?.plugins ?? []),
    security({
      allowedImagePrefixes: props.hardenOptions?.allowedImagePrefixes,
      allowedLinkPrefixes: props.hardenOptions?.allowedLinkPrefixes,
      allowedProtocols: props.hardenOptions?.allowedProtocols,
      allowDataImages: props.hardenOptions?.allowDataImages,
      defaultOrigin: props.hardenOptions?.defaultOrigin,
    }),
    footnotes(),
    math(),
  ],
}

const parser = createComarkParserEngine({
  completion: props.completion,
  parserOptions,
})

const enableAnimate = computed(() => resolveEnableAnimate(mode.value, props.enableAnimate))
const enableCaret = computed(() => resolveEnableCaret(mode.value, props.caret))
const rootStyle = computed(() => createRootStyle(cssVariables.value, props.animationDuration))

const icons = computed((): Icons => ({
  ...ICONS,
  ...props.icons,
}))

const uiComponents = computed((): UIComponents => ({
  ...UI,
  ...props.uiComponents,
}))

let active = true

watch(
  [content, mode],
  ([markdown, currentMode]) => {
    void parser.parse(markdown, currentMode).then((nextDocument) => {
      if (active)
        document.value = nextDocument
    })
  },
  { immediate: true },
)

watch(locale, () => loadLocaleMessages(locale.value))

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

  await Promise.all(tasks)
}

onMounted(bootstrap)

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
  icons,
  uiComponents,
  uiOptions,
  isDark,
  enableAnimate,
  animation,
  animationSplit,
  enableCaret,
  caret,
  getContainer,
  beforeDownload: props.beforeDownload,
  onCopied: (copiedContent: string) => {
    emits('copied', copiedContent)
  },
})

onBeforeUnmount(() => {
  active = false
  disposeShiki()
  disposeMermaid()
  disposeKatex()

  stopTailwindV3ThemeObserver()
  stopDarkModeObserver()
})

defineExpose({
  getDocument: () => document.value,
  getParsedNodes: () => document.value.nodes,
  getProcessedContent: () => props.content,
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
    <ComarkNodeList
      :components="components"
      :loading="mode === 'streaming'"
      :nodes="document.nodes"
    />
  </div>
</template>
