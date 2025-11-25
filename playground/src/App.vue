<script setup lang="ts">
import type { MermaidOptions, SelectItem, ShikiOptions } from 'vue-stream-markdown'
import { throttle } from '@antfu/utils'
import { useCycleList, useResizeObserver } from '@vueuse/core'
import { decompressFromEncodedURIComponent } from 'lz-string'
import { computed, ref, watch } from 'vue'
import { Markdown, SUPPORT_LANGUAGES, useTippy } from 'vue-stream-markdown'
import Actions from './components/actions.vue'
import AstResult from './components/ast-result.vue'
import CopyButton from './components/copy-button.vue'
import Layout from './components/layout.vue'
import Monaco from './components/monaco.vue'
import PresetSelect from './components/preset-select.vue'
import ScrollTriggerGroup from './components/scroll-trigger-group.vue'
import Title from './components/title.vue'
import { isDark, userConfig, useTypedEffect } from './composable'
import { DEFAULT_MARKDOWN_PATH, getPresetContent } from './markdown'
import { getContentFromUrl } from './utils'

const { initTippy } = useTippy({
  isDark,
})

const markdownRef = ref()
const parsedNodes = computed(() => markdownRef.value?.getParsedNodes() ?? [])

const containerRef = ref<HTMLDivElement>()
const monacoRef = ref()
const content = ref<string>('')

const { state: locale, next: toggleLanguage } = useCycleList(SUPPORT_LANGUAGES, {
  initialValue: userConfig.value.locale,
})

const typedEnable = ref<boolean>(false)

const typedStep = computed(() => userConfig.value.typedStep)
const typedDelay = computed(() => userConfig.value.typedDelay)

const { typedContent, isTyping, prevStep, nextStep, terminate } = useTypedEffect({
  enabled: typedEnable,
  content,
  step: typedStep,
  delay: typedDelay,
})

const mode = computed(() => userConfig.value.staticMode ? 'static' : 'streaming')
const markdownContent = computed(() => mode.value === 'static' ? content.value : typedContent.value)

const shikiOptions = computed((): ShikiOptions => {
  return {
    theme: [userConfig.value.shikiLightTheme, userConfig.value.shikiDarkTheme],
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

async function changePresetContent(item: SelectItem) {
  terminateTypeWriting()

  const data = await getPresetContent(item.value)
  content.value = data
  monacoRef.value?.setValue(data)

  containerRef.value?.scrollTo({
    top: 0,
    behavior: 'instant',
  })
}

function terminateTypeWriting() {
  typedEnable.value = false
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

watch(() => isTyping.value, () => typedEnable.value = isTyping.value)
watch(() => mode.value, terminateTypeWriting)
watch(() => locale.value, () => userConfig.value.locale = locale.value)

useResizeObserver(() => markdownRef.value?.$el, () => {
  scrollToBottom()
})

initTippy()
initContent()
</script>

<template>
  <Layout class="vue-stream-markdown">
    <template #actions>
      <div class="flex gap-4 items-center">
        <Title />
        <PresetSelect @select="changePresetContent" />
      </div>
      <Actions
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
        :terminate-type-writing="terminateTypeWriting"
        :toggle-language="toggleLanguage"
      />
    </template>
    <div class="py-1 bg-background flex flex-col gap-2 w-full lg:flex-1 lg:flex-row">
      <div
        v-show="userConfig.showInputEditor"
        class="border-r border-border flex-1 min-w-0 overflow-hidden"
      >
        <Monaco ref="monacoRef" :content="content" @change="onEditorChange" />
      </div>

      <div class="pl-4 border-r border-border flex-1 min-w-0 relative">
        <ScrollTriggerGroup :get-container="getContainer">
          <CopyButton :content="typedContent" />
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
            :mermaid-options="mermaidOptions"
          />
        </div>
      </div>

      <div v-if="userConfig.showAstResult" class="flex-1 min-w-0 overflow-auto">
        <AstResult :parsed-nodes="parsedNodes" />
      </div>
    </div>
  </Layout>
</template>

<style>
.scrollbar-gutter-stable {
  scrollbar-gutter: stable;
}
</style>
