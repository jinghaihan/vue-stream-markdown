<script setup lang="ts">
import type { Component, VNodeRef } from 'vue'
import type { CodeBlockProps, Control, SelectOption } from '../../types'
import {
  createCodeBlockControlDescriptors,
  createCodeBlockModel,
  getDownloadFilename,
  handleCodeBlockControlAction,
  resolveCodePreviewComponent,
  save,
} from '@stream-markdown/core'
import { createReusableTemplate, useClipboard } from '@vueuse/core'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useContext, useControls, useI18n, useMermaid, usePinnedScroll } from '../../composables'
import { CODE_PREVIEWERS } from '../previewers'
import Actions from './actions.vue'
import { LANGUAGE_ICONS } from './language-icons'
import LanguageTitle from './language-title.vue'
import PreviewSegmented from './preview-segmented.vue'
import PreviewToggle from './preview-toggle.vue'
import ClassicVariant from './variants/classic.vue'
import MinimalVariant from './variants/minimal.vue'
import ModernVariant from './variants/modern.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CodeBlockProps>(), {})

const {
  beforeDownload,
  codeOptions,
  controls,
  extensions,
  icons: commonIcons,
  isDark,
  onCopied,
  previewers,
  uiComponents: UI,
} = useContext()

const CodeNode = defineAsyncComponent(() => import('../renderers/code/index.vue'))

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const { t } = useI18n()

const { getControlValue, isControlEnabled, resolveControls } = useControls({
  controls,
})

const { copy, copied } = useClipboard({
  legacy: true,
})

const { canRender: canRenderMermaid, saveMermaid } = useMermaid({
  extensions,
  isDark,
})

const hasMermaid = computed(() => canRenderMermaid(props.node.value))

const collapsed = ref<boolean>(false)
const fullscreen = ref<boolean>(false)
const modalMounted = ref<boolean>(false)
const mode = ref<'preview' | 'source'>('source')
const scrollRef = ref<HTMLElement>()

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
const variant = computed(() => codeBlockModel.value.variant)
const showLanguageIcon = computed(() => codeBlockModel.value.showLanguageIcon)
const showLanguageName = computed(() => codeBlockModel.value.showLanguageName)
const showLanguageTitle = computed(() => codeBlockModel.value.showLanguageTitle)

const showCollapse = computed(() => variant.value !== 'minimal' && isControlEnabled('code.collapse'))
const showCopy = computed(() => isControlEnabled('code.copy'))
const showDownload = computed(() => {
  if (language.value !== 'mermaid')
    return isControlEnabled('code.download')

  const mermaidDownload = getControlValue('mermaid.download')
  return mermaidDownload === undefined
    ? isControlEnabled('code.download')
    : mermaidDownload !== false
})
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
const previewVisible = computed(() => previewable.value && mode.value === 'preview')
const minimalPreviewMinHeight = computed(() => {
  if (variant.value !== 'minimal' || !previewVisible.value)
    return undefined

  return 128
})
const VariantComponent = computed(() => ({
  modern: ModernVariant,
  classic: ClassicVariant,
  minimal: MinimalVariant,
}[variant.value]))
const downloadOptions = computed(() => codeBlockModel.value.downloadOptions)
const downloadFilename = computed(() => {
  const type = language.value === 'mermaid' ? 'mermaid' : 'code'
  const fallback = type === 'mermaid' ? 'diagram' : 'file'
  return getDownloadFilename(controls.value, type, fallback)
})

usePinnedScroll({
  target: scrollRef,
  active: () => !!props.node.loading && mode.value === 'source',
  enabled: () => !!maxHeight.value && mode.value === 'source',
  contentKey: () => props.node.value,
})

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
  announcement: item.key === 'copy' && copied.value ? t('button.copied') : undefined,
  onClick: (_event: MouseEvent, select?: SelectOption) => handleControlClick(item.key, select),
  visible: () => item.visible ?? true,
})))

const headerControls = computed(
  () => resolveControls<CodeBlockProps>('code', builtinControls.value, props)
    .filter(item => variant.value !== 'minimal' || item.key !== 'collapse'),
)

const actionCount = computed(() => headerControls.value.length
  + (variant.value === 'minimal' && previewable.value ? 1 : 0))

const modalControls = computed(
  () => resolveControls<CodeBlockProps>('code', headerControls.value, props)
    .filter(i => i.key !== 'collapse'),
)

const modalLabel = computed(() => t('dialog.fullscreen', 'button.maximize'))
const modalTitleId = computed(() => showLanguageName.value ? `${props.nodeKey}-fullscreen-title` : undefined)

const setScrollRef: VNodeRef = (element) => {
  scrollRef.value = element instanceof HTMLElement ? element : undefined
}

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
  const state = await handleCodeBlockControlAction({
    key,
    select: item,
    filename: downloadFilename.value,
    state: {
      collapsed: collapsed.value,
      fullscreen: fullscreen.value,
    },
    node: props.node,
    language: language.value,
    beforeDownload,
    copyText: copy,
    onCopied,
    saveFile: save,
    saveMermaid: (format, code, filename) => saveMermaid(format, code, undefined, filename),
  })

  if (state.fullscreen)
    modalMounted.value = true

  collapsed.value = state.collapsed
  fullscreen.value = state.fullscreen
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

  <component
    :is="VariantComponent"
    :collapsed="collapsed"
    :loading="!!props.node.loading"
    :max-height="maxHeight"
    :action-count="actionCount"
    :set-scroll-ref="setScrollRef"
  >
    <template #title>
      <slot name="title">
        <ReuseTemplate :show-preview="previewPlacement === 'left'" />
      </slot>
    </template>

    <template #header-center>
      <slot name="header-center">
        <PreviewSegmented
          v-if="previewable && previewPlacement === 'center'"
          v-model:mode="mode"
          v-model:collapsed="collapsed"
        />
        <div v-else />
      </slot>
    </template>

    <template #actions>
      <slot name="actions">
        <div
          data-stream-markdown="actions"
          class="flex gap-1 items-center"
        >
          <PreviewToggle
            v-if="variant === 'minimal' && previewable"
            v-model:mode="mode"
            v-model:collapsed="collapsed"
          />
          <PreviewSegmented
            v-else-if="previewable && previewPlacement === 'right'"
            v-model:mode="mode"
            v-model:collapsed="collapsed"
          />
          <Actions :actions="headerControls" />
        </div>
      </slot>
    </template>

    <template #default>
      <component
        :is="PreviewComponent"
        v-if="previewable"
        v-show="mode === 'preview'"
        v-bind="props"
        :interactive="inlineInteractive"
        :min-height="minimalPreviewMinHeight"
      />
      <main v-show="mode === 'source'">
        <slot />
      </main>
    </template>
  </component>

  <component
    :is="UI.Modal"
    v-if="modalMounted"
    v-model:open="fullscreen"
    :aria-label="modalLabel"
    :title-id="modalTitleId"
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
      :min-height="minimalPreviewMinHeight"
    />
    <CodeNode
      v-show="mode === 'source'"
      v-bind="props"
      :show-header="false"
    />
  </component>
</template>
