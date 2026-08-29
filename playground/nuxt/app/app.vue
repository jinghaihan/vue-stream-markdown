<script setup lang="ts">
import type { CdnOptions } from '@stream-markdown/core'
import type {
  CodeOptions,
  ControlsConfig,
  PreviewerConfig,
  SelectOption,
  StreamMarkdownProps,
  UIOptions,
} from 'vue-stream-markdown'
import { throttle } from '@antfu/utils'
import { beautifulMermaid } from '@stream-markdown/beautiful-mermaid'
import { code } from '@stream-markdown/code'
import { math } from '@stream-markdown/math'
import { mermaid } from '@stream-markdown/mermaid'
import { useCycleList, useResizeObserver } from '@vueuse/core'
import * as LZString from 'lz-string'
import { hydrateOnVisible } from 'vue'
import { Markdown, SUPPORT_LANGUAGES, useTailwindV3Theme } from 'vue-stream-markdown'
import { ChartPie } from './icons'
import { DEFAULT_MARKDOWN_PATH, getPresetContent } from './markdown'
import { getContentFromUrl } from './utils'

const githubComponent = defineAsyncComponent({
  loader: () => import('./components/github-card.vue'),
  hydrate: hydrateOnVisible(),
})
const markdownComponents: StreamMarkdownProps['components'] = {
  github: githubComponent,
}

const { cssVariables } = useTailwindV3Theme({})

const userConfig = useUserConfig()

const markdownRef = ref()
const documentNodes = computed(() => markdownRef.value?.getDocument()?.nodes ?? [])

const containerRef = ref<HTMLDivElement>()
const monacoRef = ref()
const content = ref<string>('')

const { state: locale, next: toggleLanguage } = useCycleList(SUPPORT_LANGUAGES, {
  initialValue: userConfig.value.locale,
})

const typedEnable = ref<boolean>(false)

const typedStep = computed(() => userConfig.value.typedStep)
const typedDelay = computed(() => userConfig.value.typedDelay)

const pauseAutoScroll = ref<boolean>(false)
const lastScrollTop = ref<number>(0)

const {
  typedContent,
  typingIndex,
  isTyping,
  stop,
  prevStep,
  nextStep,
  toStep,
  terminate,
} = useTypedEffect({
  enabled: typedEnable,
  content,
  step: typedStep,
  delay: typedDelay,
})

const mode = computed(() => userConfig.value.staticMode ? 'static' : 'streaming')
const renderMode = computed(() => {
  if (userConfig.value.staticMode)
    return 'static'

  const completed = !isTyping.value && typingIndex.value >= content.value.length
  return completed ? 'static' : 'streaming'
})
const markdownContent = computed(() => renderMode.value === 'static' ? content.value : typedContent.value)

const copyContent = computed(() => {
  return markdownContent.value
})

const codeOptions = computed((): CodeOptions => {
  const options: CodeOptions = {
    languageIcon: !isMobile.value,
    languageName: !isMobile.value,
  }

  return {
    language: {
      mermaid: options,
      html: options,
      echarts: {
        ...options,
        languageIcon: options.languageIcon === false ? false : ChartPie,
      },
    },
  }
})

const uiOptions = computed((): UIOptions => {
  return {
    hideTooltip: isMobile.value,
  }
})

const cdnOptions: CdnOptions = {
  getUrl: (module, version) => {
    switch (module) {
      case 'shiki':
        return `https://esm.sh/shiki@${version}`
      case 'mermaid':
        return `https://esm.sh/mermaid@${version}`
      case 'beautiful-mermaid':
        return `https://esm.sh/beautiful-mermaid@${version}`
      case 'katex':
        return `https://esm.sh/katex@${version}`
      case 'katex-css':
        return `https://esm.sh/katex@${version}/dist/katex.min.css`
      default:
        return undefined
    }
  },
}

const codeExtension = code({
  cdnOptions,
  theme: () => [userConfig.value.shikiLightTheme, userConfig.value.shikiDarkTheme],
  langAlias: {
    echarts: 'json',
  },
})
const mathExtension = math({ cdnOptions })
const mermaidExtension = mermaid({
  cdnOptions,
  theme: () => [userConfig.value.mermaidLightTheme, userConfig.value.mermaidDarkTheme],
})
const beautifulMermaidExtension = beautifulMermaid({
  cdnOptions,
  theme: () => [
    userConfig.value.mermaidBeautifulLightTheme,
    userConfig.value.mermaidBeautifulDarkTheme,
  ],
})
const extensions = computed(() => ({
  code: codeExtension,
  math: mathExtension,
  mermaid: mermaidExtension,
  ...(userConfig.value.mermaidRenderer === 'beautiful'
    ? { beautifulMermaid: beautifulMermaidExtension }
    : {}),
}))

const controlsConfig = computed((): ControlsConfig => {
  return {
    mermaid: {
      inlineInteractive: !isMobile.value,
    },
  }
})

const previewerConfig: PreviewerConfig = {
  progressive: {
    echarts: true,
  },
  components: {
    echarts: defineAsyncComponent({
      loader: () => import('./components/echarts.vue'),
      hydrate: hydrateOnVisible(),
    }),
  },
}

const caret = computed(() => userConfig.value.caret ? userConfig.value.caret : undefined)

function onEditorChange(data: string) {
  content.value = data
}

async function changePresetContent(item: SelectOption) {
  terminateTypeWriting()

  const data = await getPresetContent(String(item.value))
  content.value = data
  monacoRef.value?.setValue(data)

  containerRef.value?.scrollTo({
    top: 0,
    behavior: 'instant',
  })
}

function stopTypeWriting() {
  typedEnable.value = false
  stop()
}

function terminateTypeWriting() {
  typedEnable.value = false
  if (!userConfig.value.staticMode)
    userConfig.value.showDocumentResult = false
  terminate()
}

async function initContent() {
  const compressedContent = getContentFromUrl(location.href)
  try {
    if (compressedContent)
      content.value = LZString.decompressFromEncodedURIComponent(compressedContent)
    else
      content.value = await getPresetContent(DEFAULT_MARKDOWN_PATH)
  }
  catch (error) {
    console.error(error)
    content.value = await getPresetContent(DEFAULT_MARKDOWN_PATH)
  }
  finally {
    monacoRef.value?.setValue(content.value)
  }
}

function getContainer() {
  return containerRef.value
}

function onScroll() {
  const element = containerRef.value
  if (!element)
    return

  const isScrollUp = element.scrollTop < lastScrollTop.value
  lastScrollTop.value = element.scrollTop

  const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
  if (isScrollUp && distanceFromBottom > 65)
    pauseAutoScroll.value = true
  else if (distanceFromBottom <= 20)
    pauseAutoScroll.value = false
}

const scrollToBottom = throttle(800, () => {
  if (!userConfig.value.autoScroll || pauseAutoScroll.value)
    return

  const container = containerRef.value
  if (!container)
    return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth',
  })
})

function resetScrollState() {
  userConfig.value.autoScroll = false
  pauseAutoScroll.value = false
  lastScrollTop.value = 0
}

watch(() => isTyping.value, (value) => {
  typedEnable.value = value

  if (!value)
    resetScrollState()
})
watch(() => mode.value, terminateTypeWriting)
watch(() => locale.value, () => userConfig.value.locale = locale.value)

useResizeObserver(() => markdownRef.value?.$el, () => {
  scrollToBottom()
})

onMounted(() => {
  initContent()
})
</script>

<template>
  <Layout
    v-model:typed-enable="typedEnable"
    v-model:show-input-editor="userConfig.showInputEditor"
    v-model:show-document-result="userConfig.showDocumentResult"
    :stop="stopTypeWriting"
    class="vue-stream-markdown"
    :style="cssVariables"
  >
    <template #actions>
      <div class="flex flex-col gap-2 items-center md:flex-row md:gap-4">
        <Name />
        <PresetSelect @select="changePresetContent" />
      </div>

      <Actions
        v-model:typing-index="typingIndex"
        v-model:static-mode="userConfig.staticMode"
        v-model:auto-scroll="userConfig.autoScroll"
        v-model:typed-enable="typedEnable"
        v-model:typed-step="userConfig.typedStep"
        v-model:typed-delay="userConfig.typedDelay"
        v-model:show-input-editor="userConfig.showInputEditor"
        v-model:show-document-result="userConfig.showDocumentResult"
        v-model:shiki-light-theme="userConfig.shikiLightTheme"
        v-model:shiki-dark-theme="userConfig.shikiDarkTheme"
        v-model:mermaid-renderer="userConfig.mermaidRenderer"
        v-model:mermaid-light-theme="userConfig.mermaidLightTheme"
        v-model:mermaid-dark-theme="userConfig.mermaidDarkTheme"
        v-model:mermaid-beautiful-light-theme="userConfig.mermaidBeautifulLightTheme"
        v-model:mermaid-beautiful-dark-theme="userConfig.mermaidBeautifulDarkTheme"
        v-model:caret="userConfig.caret"
        v-model:animation="userConfig.animation"
        v-model:animation-split="userConfig.animationSplit"
        v-model:animation-duration="userConfig.animationDuration"
        :content="content"
        :prev-step="prevStep"
        :next-step="nextStep"
        :to-step="toStep"
        :terminate-type-writing="terminateTypeWriting"
        :toggle-language="toggleLanguage"
      />
    </template>

    <template #editor>
      <ClientOnly>
        <Monaco
          ref="monacoRef"
          :content="content"
          :theme="[userConfig.shikiLightTheme, userConfig.shikiDarkTheme]"
          @change="onEditorChange"
        />
      </ClientOnly>
    </template>

    <template #markdown>
      <ScrollTriggerGroup :get-container="getContainer">
        <CopyButton :content="copyContent" />
      </ScrollTriggerGroup>

      <div
        ref="containerRef"
        class="pr-4 h-full overflow-x-hidden overflow-y-auto"
        :style="{
          scrollbarGutter: 'stable',
        }"
        @scroll="onScroll"
      >
        <Markdown
          ref="markdownRef"
          class="my-4"
          :mode="renderMode"
          :caret="caret"
          :animation="userConfig.animation"
          :animation-split="userConfig.animationSplit"
          :animation-duration="userConfig.animationDuration"
          :content="markdownContent"
          :controls="controlsConfig"
          :previewers="previewerConfig"
          :components="markdownComponents"
          :locale="locale"
          :code-options="codeOptions"
          :extensions="extensions"
          :ui-options="uiOptions"
        />
      </div>
    </template>

    <template #document>
      <DocumentResult :nodes="documentNodes" />
    </template>
  </Layout>
</template>
