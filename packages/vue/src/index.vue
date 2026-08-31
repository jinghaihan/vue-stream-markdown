<script setup lang="ts">
import type { CompletionInfo } from '@markmend/parser'
import type {
  Icons,
  MarkdownDocument,
  StreamMarkdownProps,
  UIComponents,
} from './types'
import { createMarkmendParser } from '@markmend/parser'
import {
  createRootStyle,
  DEFAULT_ANIMATION,
  DEFAULT_ANIMATION_SPLIT,
  DEFAULT_ANIMATION_STAGGER,
  resolveEnableAnimate,
  resolveEnableCaret,
} from '@stream-markdown/core'
import { computed, onBeforeUnmount, onMounted, shallowRef, toRefs, watch } from 'vue'
import { UI } from './components'
import { ICONS } from './components/icons'
import MarkdownNodes from './components/renderers/markdown'
import {
  useContext,
  useDarkDetector,
  useLocaleDetector,
  useTailwindV3Theme,
} from './composables'
import {
  resolveExtensions,
  resolveOwnedExtensions,
  useMarkdownProvider,
} from './composables/use-provider'
import { loadLocaleMessages } from './locales'
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
  animationStagger: DEFAULT_ANIMATION_STAGGER,
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
  hardenOptions,
  extensions: extensionOverrides,
  uiOptions,
  animation,
  animationSplit,
  animationStagger,
  caret,
} = toRefs(props)

const { provideContext } = useContext()
const provider = useMarkdownProvider()

const observesLocalTheme = computed(() => !provider || props.themeElement !== undefined)
const {
  cssVariables: localCssVariables,
  stop: stopTailwindV3ThemeObserver,
} = useTailwindV3Theme({
  element: props.themeElement,
  enabled: observesLocalTheme,
})
const cssVariables = computed(() => {
  return observesLocalTheme.value
    ? localCssVariables.value
    : provider?.cssVariables.value ?? {}
})
const resolvedDarkProp = computed(() => {
  return typeof darkProp.value === 'boolean'
    ? darkProp.value
    : provider?.isDark.value
})
const { isDark, stop: stopDarkModeObserver } = useDarkDetector(
  resolvedDarkProp,
  cssVariables,
  { manageOverlay: () => !provider },
)
const { locale } = useLocaleDetector(localeProp)
const extensions = computed(() => resolveExtensions(
  provider?.extensions.value,
  extensionOverrides.value,
))

const containerRef = shallowRef<HTMLDivElement>()
const document = shallowRef<MarkdownDocument>({
  frontmatter: {},
  meta: {},
  nodes: [],
})
const completionInfo = shallowRef<CompletionInfo>()

const parser = createMarkmendParser({
  completion: props.completion,
  literalTagContent: props.literalTagContent,
  parserOptions: {
    ...props.parserOptions,
    plugins: [
      ...(props.parserOptions?.plugins ?? []),
      ...(extensions.value?.math ? [extensions.value.math.parserPlugin] : []),
    ],
  },
  syntax: {
    security: {
      allowedImagePrefixes: props.hardenOptions?.allowedImagePrefixes,
      allowedLinkPrefixes: props.hardenOptions?.allowedLinkPrefixes,
      allowedProtocols: props.hardenOptions?.allowedProtocols,
      allowDataImages: props.hardenOptions?.allowDataImages,
      defaultOrigin: props.hardenOptions?.defaultOrigin,
    },
  },
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
const ownedExtensions = resolveOwnedExtensions(
  provider?.extensions.value,
  extensionOverrides.value,
)

watch(
  [content, mode],
  ([markdown, currentMode]) => {
    void parser.parse(markdown, currentMode).then((result) => {
      if (active) {
        completionInfo.value = result.completion
        const nextDocument = result.document
        document.value = nextDocument
      }
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
    ...ownedExtensions.map(extension => extension.preload()),
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
  extensions,
  hardenOptions,
  codeOptions,
  tableOptions,
  imageOptions,
  linkOptions,
  mode,
  dir,
  icons,
  uiComponents,
  uiOptions,
  isDark,
  rootStyle,
  enableAnimate,
  animation,
  animationSplit,
  animationStagger,
  enableCaret,
  caret,
  documentNodes: computed(() => document.value.nodes),
  getContainer,
  beforeDownload: props.beforeDownload,
  onCopied: (copiedContent: string) => {
    emits('copied', copiedContent)
  },
})

onBeforeUnmount(() => {
  active = false
  for (const extension of ownedExtensions)
    void extension.dispose()

  stopTailwindV3ThemeObserver()
  stopDarkModeObserver()
})

defineExpose({
  getDocument: () => document.value,
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
    <MarkdownNodes
      :completion-info="completionInfo"
      :components="components"
      :loading="mode === 'streaming'"
      :nodes="document.nodes"
    />
  </div>
</template>
