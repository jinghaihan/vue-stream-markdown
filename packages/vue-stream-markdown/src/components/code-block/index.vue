<script setup lang="ts">
import type { Component } from 'vue'
import type { CodeNodeRendererProps, Control, SelectOption } from '../../types'
import {
  createCodeBlockControlDescriptors,
  createCodeBlockModel,
  getCodeFileExtension,
  resolveCodePreviewComponent,
  save,
} from '@stream-markdown/core'
import { createReusableTemplate, useClipboard } from '@vueuse/core'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useContext, useControls, useI18n, useMermaid } from '../../composables'
import { CODE_PREVIEWERS } from '../previewers'
import Actions from './actions.vue'
import { LANGUAGE_ICONS } from './language-icons'
import LanguageTitle from './language-title.vue'
import PreviewSegmented from './preview-segmented.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const {
  beforeDownload,
  cdnOptions,
  codeOptions,
  controls,
  icons: commonIcons,
  isDark,
  mermaidOptions,
  onCopied,
  previewers,
  shikiOptions,
  uiComponents: UI,
} = useContext()

const CodeNode = defineAsyncComponent(() => import('../renderers/code/index.vue'))

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const { t } = useI18n()

const { isControlEnabled, resolveControls } = useControls({
  controls,
})

const { copy, copied } = useClipboard({
  legacy: true,
})

const { installed: hasMermaid, saveMermaid } = useMermaid({
  mermaidOptions,
  cdnOptions,
  shikiOptions,
  isDark,
})

const collapsed = ref<boolean>(false)
const fullscreen = ref<boolean>(false)
const mode = ref<'preview' | 'source'>('source')

const codeBlockModel = computed(() => createCodeBlockModel<Component>({
  node: props.node,
  codeOptions: codeOptions.value,
  controls: controls.value,
  previewers: previewers.value,
  hasMermaid: hasMermaid.value,
  mode: mode.value,
  isPreviewComponent: isVueComponent,
}))

const language = computed(() => codeBlockModel.value.language)
const showLanguageIcon = computed(() => codeBlockModel.value.showLanguageIcon)
const showLanguageName = computed(() => codeBlockModel.value.showLanguageName)
const showLanguageTitle = computed(() => codeBlockModel.value.showLanguageTitle)

const showCollapse = computed(() => isControlEnabled('code.collapse'))
const showCopy = computed(() => isControlEnabled('code.copy'))
const showDownload = computed(() => isControlEnabled('code.download'))
const showFullscreen = computed(() => isControlEnabled('code.fullscreen'))

const icon = computed(() => {
  const custom = codeOptions.value?.language?.[language.value]?.languageIcon
  // Custom language icon component
  if (typeof custom === 'object')
    return custom
  return LANGUAGE_ICONS[language.value as keyof typeof LANGUAGE_ICONS] || commonIcons.value.code
})

const previewPlacement = computed(() => codeBlockModel.value.previewPlacement)
const previewable = computed(() => codeBlockModel.value.previewable)

const PreviewComponent = computed((): Component | undefined => {
  return resolveCodePreviewComponent<Component>(
    language.value,
    previewers.value,
    CODE_PREVIEWERS,
    isVueComponent,
  )
})

const inlineInteractive = computed(() => codeBlockModel.value.inlineInteractive)
const maxHeight = computed(() => codeBlockModel.value.maxHeight)
const downloadOptions = computed(() => codeBlockModel.value.downloadOptions)

const builtinControls = computed((): Control[] => createCodeBlockControlDescriptors({
  collapsed: collapsed.value,
  fullscreen: fullscreen.value,
  copied: copied.value,
  language: language.value,
  showCollapse: showCollapse.value,
  showCopy: showCopy.value,
  showDownload: showDownload.value,
  showFullscreen: showFullscreen.value,
  downloadOptions: downloadOptions.value,
}).map(item => ({
  ...item,
  name: t(item.labelKey ?? ''),
  onClick: (_event: MouseEvent, select?: SelectOption) => handleControlClick(item.key, select),
  visible: () => item.visible ?? true,
})))

const headerControls = computed(
  () => resolveControls<CodeNodeRendererProps>('code', builtinControls.value, props),
)

const modalControls = computed(
  () => resolveControls<CodeNodeRendererProps>('code', headerControls.value, props)
    .filter(i => i.key !== 'collapse'),
)

watch(
  () => previewable.value,
  () => {
    if (previewable.value)
      mode.value = 'preview'
  },
  { immediate: true },
)

function isVueComponent(component: unknown) {
  return !!component && typeof component !== 'boolean'
}

async function handleControlClick(key: string, item?: SelectOption) {
  if (key === 'collapse') {
    collapsed.value = !collapsed.value
    return
  }

  if (key === 'copy') {
    if (!props.node.value)
      return
    copy(props.node.value)
    onCopied(props.node.value)
    return
  }

  if (key === 'fullscreen') {
    fullscreen.value = !fullscreen.value
    return
  }

  if (key !== 'download' || props.node.loading)
    return

  // Download code as plain text
  if (!item || item.value === 'code') {
    const extension = getCodeFileExtension(language.value)
    if (!extension)
      return
    const result = await beforeDownload({
      type: 'code',
      content: props.node.value,
    })
    if (result)
      save(`file.${extension}`, props.node.value, 'text/plain')
    return
  }

  // Download mermaid diagram as SVG or PNG
  if (item?.value === 'svg' || item?.value === 'png') {
    const result = await beforeDownload({
      type: 'mermaid',
      content: props.node.value,
    })
    if (result)
      saveMermaid(item?.value as 'svg' | 'png', props.node.value)
  }
}
</script>

<template>
  <DefineTemplate v-slot="{ showPreview }">
    <LanguageTitle
      v-if="showLanguageTitle"
      :icon="icon"
      :language="language"
      :show-icon="showLanguageIcon"
      :show-name="showLanguageName"
    />
    <PreviewSegmented
      v-else-if="previewable && showPreview"
      v-model:mode="mode"
      v-model:collapsed="collapsed"
    />
    <div v-else />
  </DefineTemplate>

  <div
    data-stream-markdown="code-block"
    :data-collapsed="collapsed"
    class="my-4 border border-border rounded-xl overflow-clip data-[collapsed=true]:[&_.code-block-header]:border-b-0"
    :class="[
      { 'code-loading': props.node.loading },
    ]"
  >
    <header
      data-stream-markdown="code-block-header"
      :class="[
        { 'border-b': !collapsed },
      ]"
      class="code-block-header text-sm text-muted-foreground px-4 py-1.5 border-border bg-muted/80 flex items-center top-0 justify-between sticky z-[5] max-lg:px-3 [&>*:last-child]:flex [&>*:first-child]:flex-1 [&>*:last-child]:flex-1 [&>*:nth-child(2)]:left-1/2 [&>*:last-child]:justify-end [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-translate-x-1/2"
    >
      <slot name="title">
        <ReuseTemplate :show-preview="previewPlacement === 'left'" />
      </slot>

      <slot name="header-center">
        <PreviewSegmented
          v-if="previewable && previewPlacement === 'center'"
          v-model:mode="mode"
          v-model:collapsed="collapsed"
        />
        <div v-else />
      </slot>

      <slot name="actions">
        <div
          data-stream-markdown="actions"
          class="flex gap-1 items-center"
        >
          <PreviewSegmented
            v-if="previewable && previewPlacement === 'right'"
            v-model:mode="mode"
            v-model:collapsed="collapsed"
          />
          <Actions :actions="headerControls" />
        </div>
      </slot>
    </header>

    <main
      v-show="!collapsed"
      data-stream-markdown="code-block-content"
      class="overflow-auto"
      :style="{ maxHeight }"
    >
      <component
        :is="PreviewComponent"
        v-if="previewable"
        v-show="mode === 'preview'"
        v-bind="props"
        :interactive="inlineInteractive"
      />
      <main v-show="mode === 'source'">
        <slot />
      </main>
    </main>

    <component
      :is="UI.Modal"
      v-model:open="fullscreen"
      :header-style="{
        backgroundColor: 'color-mix(in oklab, var(--muted) 80%, transparent)',
        color: 'var(--muted-foreground)',
        borderBottom: '1px solid var(--border)',
      }"
    >
      <template #title>
        <ReuseTemplate :show-preview="previewPlacement === 'left'" />
      </template>

      <template #header-center>
        <PreviewSegmented
          v-if="previewable && previewPlacement === 'center'"
          v-model:mode="mode"
          v-model:collapsed="collapsed"
        />
      </template>

      <template #actions>
        <div
          data-stream-markdown="actions"
          class="flex gap-1 items-center"
        >
          <PreviewSegmented
            v-if="previewable && previewPlacement === 'right'"
            v-model:mode="mode"
            v-model:collapsed="collapsed"
          />
          <Actions :actions="modalControls" />
        </div>
      </template>

      <component
        :is="PreviewComponent"
        v-if="previewable"
        v-show="mode === 'preview'"
        v-bind="props"
        :immediate-render="true"
        container-height="100%"
      />
      <CodeNode
        v-show="mode === 'source'"
        v-bind="props"
        :show-header="false"
      />
    </component>
  </div>
</template>
