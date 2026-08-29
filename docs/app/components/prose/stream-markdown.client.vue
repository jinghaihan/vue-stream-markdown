<script setup lang="ts">
import type {
  CodeOptions,
  ControlsConfig,
  ImageOptions,
  PreviewerConfig,
} from 'vue-stream-markdown'
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { code } from '@stream-markdown/code'
import { math } from '@stream-markdown/math'
import { mermaid } from '@stream-markdown/mermaid'
import { useMediaQuery } from '@vueuse/core'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import { exampleGroups } from '../../examples'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  example: string
  mode?: 'streaming' | 'static'
  settledMode?: 'streaming' | 'static'
  caret?: 'block' | 'circle'
  typingDelay?: number
  codeOptionsExample?: string
  controlsExample?: string
  previewersExample?: string
  imageCaption?: string | boolean
  imageFallback?: string
}>(), {
  mode: 'static',
  settledMode: 'static',
  caret: undefined,
  typingDelay: 16,
  codeOptionsExample: undefined,
  controlsExample: undefined,
  previewersExample: undefined,
  imageCaption: undefined,
  imageFallback: undefined,
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const isMobile = useMediaQuery('(max-width: 1023px)')

const isTyping = ref(false)
const typingIndex = ref(0)
const container = ref<HTMLDivElement>()
const minHeight = ref<number>()
let interval: ReturnType<typeof setInterval> | undefined

const content = computed(() => String(resolveExample(props.example) ?? ''))
const currentMode = computed<'streaming' | 'static'>(() => {
  if (props.mode === 'streaming' || isTyping.value)
    return 'streaming'
  return props.settledMode
})
const renderedContent = computed(() => {
  if (props.mode === 'streaming')
    return content.value
  return isTyping.value
    ? content.value.slice(0, typingIndex.value)
    : content.value
})

const codeOptions = computed<CodeOptions>(() => {
  const configured = resolveExample(props.codeOptionsExample)
  if (configured)
    return configured as CodeOptions

  const language = {
    languageIcon: !isMobile.value,
    languageName: !isMobile.value,
  }
  return {
    language: {
      mermaid: language,
      html: language,
    },
  }
})

const controls = computed(() => resolveExample(props.controlsExample) as ControlsConfig | undefined)
const previewers = computed(() => resolveExample(props.previewersExample) as PreviewerConfig | undefined)
const imageOptions = computed<ImageOptions | undefined>(() => {
  if (props.imageCaption === undefined && !props.imageFallback)
    return undefined
  return {
    caption: props.imageCaption === undefined ? undefined : props.imageCaption !== 'false' && props.imageCaption !== false,
    fallback: props.imageFallback,
  }
})

const playable = computed(() => props.mode === 'static')
const isMermaid = computed(() => content.value.includes('```mermaid'))
const mermaidRenderer = ref<'vanilla' | 'beautiful'>('beautiful')
const codeExtension = code({ theme: ['github-light', 'github-dark'] })
const mathExtension = math()
const mermaidExtension = mermaid()
const beautifulMermaidExtension = beautifulMermaid()
const extensions = computed(() => ({
  code: codeExtension,
  math: mathExtension,
  mermaid: mermaidExtension,
  ...(mermaidRenderer.value === 'beautiful'
    ? { beautifulMermaid: beautifulMermaidExtension }
    : {}),
}))

function toggleTyping() {
  if (isTyping.value) {
    stopTyping()
    return
  }

  if (container.value)
    minHeight.value = container.value.getBoundingClientRect().height

  typingIndex.value = 0
  isTyping.value = true
  interval = setInterval(() => {
    typingIndex.value++
    if (typingIndex.value >= content.value.length)
      stopTyping()
  }, props.typingDelay)
}

function stopTyping() {
  if (interval)
    clearInterval(interval)
  interval = undefined
  isTyping.value = false
  minHeight.value = undefined
}

function resolveExample(path?: string): unknown {
  if (!path)
    return undefined
  const separator = path.lastIndexOf('.')
  if (separator < 0)
    return undefined
  const group = path.slice(0, separator) as keyof typeof exampleGroups
  const name = path.slice(separator + 1)
  return (exampleGroups[group] as Record<string, unknown> | undefined)?.[name]
}

onBeforeUnmount(stopTyping)
</script>

<template>
  <div
    ref="container"
    class="group mt-4 min-h-4 relative"
    :style="{ minHeight: minHeight ? `${minHeight}px` : undefined }"
  >
    <Markdown
      v-bind="$attrs"
      locale="en-US"
      :mode="currentMode"
      :content="renderedContent"
      :caret="caret"
      :is-dark="isDark"
      :extensions="extensions"
      :code-options="codeOptions"
      :controls="controls"
      :previewers="previewers"
      :image-options="imageOptions"
    />

    <div class="opacity-0 flex gap-1 transition-opacity absolute z-10 group-hover:opacity-100 hover:opacity-100 -left-4 -top-4">
      <UButton
        v-if="playable"
        :aria-label="isTyping ? 'Stop typing' : 'Start typing'"
        :icon="isTyping ? 'i-lucide-circle-pause' : 'i-lucide-circle-play'"
        color="neutral"
        variant="ghost"
        size="xs"
        class="rounded-full"
        @click="toggleTyping"
      />
      <UButton
        v-if="isMermaid"
        aria-label="Change Mermaid renderer"
        icon="i-lucide-loader-pinwheel"
        color="neutral"
        variant="ghost"
        size="xs"
        class="rounded-full"
        @click="mermaidRenderer = mermaidRenderer === 'vanilla' ? 'beautiful' : 'vanilla'"
      />
    </div>
  </div>
</template>
