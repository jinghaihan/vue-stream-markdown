<script setup lang="ts">
import type { CodeOptions, MermaidOptions, SelectOption, ShikiOptions } from 'vue-stream-markdown'
import { throttle } from '@antfu/utils'
import { useCycleList, useResizeObserver } from '@vueuse/core'
import { decompressFromEncodedURIComponent } from 'lz-string'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { Markdown, SUPPORT_LANGUAGES } from 'vue-stream-markdown'
import ChartPie from '~icons/lucide/chart-pie'
import Actions from './components/actions.vue'
import AstResult from './components/ast-result.vue'
import CopyButton from './components/copy-button.vue'
import Layout from './components/layout.vue'
import Monaco from './components/monaco.vue'
import PresetSelect from './components/preset-select.vue'
import ScrollTriggerGroup from './components/scroll-trigger-group.vue'
import Title from './components/title.vue'
import { isDark, isMobile, userConfig, useTypedEffect } from './composable'
import { DEFAULT_MARKDOWN_PATH, getPresetContent } from './markdown'
import { getContentFromUrl } from './utils'
import 'vue-stream-markdown/index.css'

const EChartsPreviewer = defineAsyncComponent(() => import('./components/echarts.vue'))

const markdownRef = ref()
const parsedNodes = computed(() => markdownRef.value?.getParsedNodes() ?? [])
const processedContent = computed(() => markdownRef.value?.getProcessedContent() ?? '')

const containerRef = ref<HTMLDivElement>()
const monacoRef = ref()
const content = ref<string>('')

const { state: locale, next: toggleLanguage } = useCycleList(SUPPORT_LANGUAGES, {
  initialValue: userConfig.value.locale,
})

const typedEnable = ref<boolean>(false)

const typedStep = computed(() => userConfig.value.typedStep)
const typedDelay = computed(() => userConfig.value.typedDelay)

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
const markdownContent = computed(() => mode.value === 'static' ? content.value : typedContent.value)

const copyContent = computed(() => {
  return JSON.stringify({
    raw: markdownContent.value,
    processed: processedContent.value,
  }, null, 2)
})

const shikiOptions = computed((): ShikiOptions => {
  return {
    theme: [userConfig.value.shikiLightTheme, userConfig.value.shikiDarkTheme],
    langAlias: {
      echarts: 'json',
    },
  }
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

const mermaidOptions = computed((): MermaidOptions => {
  return {
    theme: [userConfig.value.mermaidLightTheme, userConfig.value.mermaidDarkTheme],
  }
})

function onEditorChange(data: string) {
  content.value = data
}

async function changePresetContent(item: SelectOption) {
  terminateTypeWriting()

  const data = await getPresetContent(item.value)
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
    userConfig.value.showAstResult = false
  terminate()
}

async function initContent() {
  const compressedContent = getContentFromUrl()
  try {
    if (compressedContent)
      content.value = decompressFromEncodedURIComponent(compressedContent)
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

const scrollToBottom = throttle(800, () => {
  if (!userConfig.value.autoScroll)
    return

  const container = containerRef.value
  if (!container)
    return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth',
  })
})

// const { generateCSS } = useTailwindV3Theme({
//   styleScope: 'body',
// })
// watch(
//   () => isDark.value,
//   () => {
//     nextTick(generateCSS)
//   },
// )

watch(() => isTyping.value, () => {
  typedEnable.value = isTyping.value
  if (!isTyping.value)
    userConfig.value.autoScroll = false
})
watch(() => mode.value, terminateTypeWriting)
watch(() => locale.value, () => userConfig.value.locale = locale.value)

useResizeObserver(() => markdownRef.value?.$el, () => {
  scrollToBottom()
})

initContent()
</script>

<template>
  <Layout
    v-model:typed-enable="typedEnable"
    v-model:show-input-editor="userConfig.showInputEditor"
    v-model:show-ast-result="userConfig.showAstResult"
    :stop="stopTypeWriting"
    class="vue-stream-markdown"
  >
    <template #actions>
      <div class="flex flex-col gap-2 items-center md:flex-row md:gap-4">
        <Title />
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
        v-model:show-ast-result="userConfig.showAstResult"
        v-model:shiki-light-theme="userConfig.shikiLightTheme"
        v-model:shiki-dark-theme="userConfig.shikiDarkTheme"
        v-model:mermaid-light-theme="userConfig.mermaidLightTheme"
        v-model:mermaid-dark-theme="userConfig.mermaidDarkTheme"
        :content="content"
        :prev-step="prevStep"
        :next-step="nextStep"
        :to-step="toStep"
        :terminate-type-writing="terminateTypeWriting"
        :toggle-language="toggleLanguage"
      />
    </template>

    <template #editor>
      <Monaco
        ref="monacoRef"
        :content="content"
        :theme="shikiOptions.theme"
        @change="onEditorChange"
      />
    </template>

    <template #markdown>
      <ScrollTriggerGroup :get-container="getContainer">
        <CopyButton :content="copyContent" />
      </ScrollTriggerGroup>

      <div ref="containerRef" class="scrollbar-gutter-stable pr-4 h-full overflow-auto">
        <Markdown
          ref="markdownRef"
          class="flex flex-col gap-3"
          :mode="mode"
          :content="markdownContent"
          :locale="locale"
          :is-dark="isDark"
          :shiki-options="shikiOptions"
          :code-options="codeOptions"
          :mermaid-options="mermaidOptions"
          :previewers="{
            echarts: EChartsPreviewer,
          }"
        />
      </div>
    </template>

    <template #ast>
      <AstResult :parsed-nodes="parsedNodes" />
    </template>
  </Layout>
</template>

<style>
.scrollbar-gutter-stable {
  scrollbar-gutter: stable;
}
</style>
