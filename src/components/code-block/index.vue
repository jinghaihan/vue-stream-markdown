<script setup lang="ts">
import type { BuiltinLanguage } from 'shiki'
import type { Component } from 'vue'
import type { CodeNodeRendererProps, Control, PreviewSegmentedPlacement, SelectOption } from '../../types'
import { createReusableTemplate, useClipboard } from '@vueuse/core'
import { computed, defineAsyncComponent, ref, toRefs, watch } from 'vue'
import { useCodeOptions, useContext, useControls, useI18n, useMermaid } from '../../composables'
import {
  LANGUAGE_ALIAS,
  LANGUAGE_EXTENSIONS,
  LANGUAGE_ICONS,
} from '../../constants'
import { save } from '../../utils'
import Modal from '../modal.vue'
import { CODE_PREVIEWERS } from '../previewers'
import Actions from './actions.vue'
import LanguageTitle from './language-title.vue'
import PreviewSegmented from './preview-segmented.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CodeNodeRendererProps>(), {})

const CodeNode = defineAsyncComponent(() => import('../renderers/code/index.vue'))

const { controls, previewers, codeOptions } = toRefs(props)

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const { t } = useI18n()

const { isControlEnabled, getControlValue, resolveControls } = useControls({
  controls,
})
const { installed: hasMermaid } = useMermaid()

const { icons: commonIcons, beforeDownload, onCopied } = useContext()
const { copy, copied } = useClipboard({
  legacy: true,
})

const { saveMermaid } = useMermaid()

const collapsed = ref<boolean>(false)
const fullscreen = ref<boolean>(false)
const mode = ref<'preview' | 'source'>('source')

const language = computed((): BuiltinLanguage => {
  const lang = props.node.lang
  if (!lang)
    return 'plaintext' as unknown as BuiltinLanguage
  if (LANGUAGE_ALIAS[lang])
    return LANGUAGE_ALIAS[lang]
  return lang as BuiltinLanguage
})

const { showLanguageIcon, showLanguageName } = useCodeOptions({
  codeOptions,
  language,
})

const showLanguageTitle = computed(() => showLanguageIcon.value || showLanguageName.value)

const showCollapse = computed(() => isControlEnabled('code.collapse'))
const showCopy = computed(() => isControlEnabled('code.copy'))
const showDownload = computed(() => isControlEnabled('code.download'))
const showFullscreen = computed(() => isControlEnabled('code.fullscreen'))

const icon = computed(() => {
  const custom = codeOptions.value?.language?.[language.value]?.languageIcon
  // Custom language icon component
  if (typeof custom === 'object')
    return custom
  return LANGUAGE_ICONS[language.value] || commonIcons.value.code
})

const progressiveRender = computed(() => {
  if (typeof previewers.value === 'boolean') {
    if (language.value === 'mermaid')
      return true
    return false
  }

  const data = previewers.value?.progressive?.[language.value]
  if (typeof data === 'boolean')
    return data
  if (language.value === 'mermaid')
    return true
  return false
})

const previewPlacement = computed((): PreviewSegmentedPlacement => {
  if (typeof previewers.value === 'boolean'
    || !previewers.value?.placement
    || previewers.value?.placement === 'auto') {
    return showLanguageTitle.value ? 'center' : 'left'
  }
  return previewers.value.placement
})

const previewable = computed((): boolean => {
  if (previewers.value === false)
    return false

  if (!progressiveRender.value && props.node.loading)
    return false

  const html = language.value === 'html' && !props.node.loading
  const mermaid = language.value === 'mermaid' && hasMermaid.value

  if (previewers.value === true) {
    if (language.value === 'html' && html)
      return true
    if (language.value === 'mermaid' && mermaid)
      return true
    return false
  }

  if (typeof previewers.value === 'object') {
    if (previewers.value.components?.[language.value] === false)
      return false

    if (language.value === 'html' && html)
      return true
    if (language.value === 'mermaid' && mermaid)
      return true

    // Custom previewer component
    const component = previewers.value.components?.[language.value]
    if (typeof component === 'object' && (progressiveRender.value || !props.node.loading))
      return !!component

    return false
  }

  return false
})

const PreviewComponent = computed((): Component | undefined => {
  const previewer = CODE_PREVIEWERS[language.value]
  if (!previewers.value || typeof previewers.value === 'boolean')
    return previewer

  const data = previewers.value.components?.[language.value]
  if (data === false)
    return previewer

  if (data && typeof data !== 'boolean')
    return data as Component

  return previewer
})

const inlineInteractive = computed(() => getControlValue('mermaid.inlineInteractive') ?? true)

function normalizeHeight(height: string | number) {
  return typeof height === 'number' ? `${height}px` : height
}

const maxHeight = computed((): string | undefined => {
  if (mode.value === 'preview')
    return undefined

  const specific = codeOptions.value?.language?.[language.value]?.maxHeight
  if (specific)
    return normalizeHeight(specific)

  const height = codeOptions.value?.maxHeight
  if (height)
    return normalizeHeight(height)

  return undefined
})

const downloadOptions = computed(() => {
  if (language.value !== 'mermaid' || !hasMermaid.value)
    return []
  return [
    { label: 'SVG', value: 'svg' },
    { label: 'PNG', value: 'png' },
    { label: 'MMD', value: 'code' },
  ]
})

const builtinControls = computed((): Control[] => [
  {
    name: t('button.collapse'),
    key: 'collapse',
    icon: 'collapse',
    iconStyle: {
      transform: collapsed.value ? 'rotate(180deg)' : undefined,
      transition: 'transform var(--default-transition-duration)',
    },
    visible: () => showCollapse.value,
    onClick: () => collapsed.value = !collapsed.value,
  },
  {
    name: t('button.copy'),
    key: 'copy',
    icon: copied.value ? 'check' : 'copy',
    visible: () => showCopy.value,
    onClick: () => {
      if (!props.node.value)
        return
      copy(props.node.value)
      onCopied(props.node.value)
    },
  },
  {
    name: t('button.download'),
    key: 'download',
    icon: 'download',
    options: downloadOptions.value.length > 0 ? downloadOptions.value : undefined,
    visible: () => showDownload.value && !!LANGUAGE_EXTENSIONS[language.value],
    onClick: async (_event: MouseEvent, item?: SelectOption) => {
      if (props.node.loading)
        return

      // Download code as plain text
      if (!item || item.value === 'code') {
        const extension = LANGUAGE_EXTENSIONS[language.value]
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
    },
  },
  {
    name: fullscreen.value ? t('button.minimize') : t('button.maximize'),
    key: 'fullscreen',
    icon: fullscreen.value ? 'minimize' : 'maximize',
    visible: () => showFullscreen.value,
    onClick: () => fullscreen.value = !fullscreen.value,
  },
])

const headerControls = computed(
  () => resolveControls<CodeNodeRendererProps>('code', builtinControls.value, props),
)

const modalControls = computed(
  () => resolveControls<CodeNodeRendererProps>('code', headerControls.value, props).filter(i => i.key !== 'collapse'),
)

watch(
  () => previewable.value,
  () => {
    if (previewable.value)
      mode.value = 'preview'
  },
  { immediate: true },
)
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
    :class="{
      'code-loading': props.node.loading,
    }"
  >
    <header data-stream-markdown="code-block-header">
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
        <div data-stream-markdown="actions">
          <PreviewSegmented
            v-if="previewable && previewPlacement === 'right'"
            v-model:mode="mode"
            v-model:collapsed="collapsed"
          />
          <Actions :actions="headerControls" />
        </div>
      </slot>
    </header>

    <main v-show="!collapsed" data-stream-markdown="code-block-content" :style="{ maxHeight }">
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

    <Modal
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
        <div data-stream-markdown="actions">
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
    </Modal>
  </div>
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='actions'] {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  & [data-stream-markdown='code-block'] {
    margin-block: 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border);
    overflow: clip;

    &[data-collapsed='true'] [data-stream-markdown='code-block-header'] {
      border-bottom: none;
    }
  }

  & [data-stream-markdown='code-block-header'] {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 1rem;
    padding-block: 0.375rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.875rem;
    line-height: 1.25rem;
    background-color: color-mix(in oklab, var(--muted) 80%, transparent);
    color: var(--muted-foreground);

    & > :first-child {
      flex: 1;
    }

    & > :last-child {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }

    & > :nth-child(2) {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  & [data-stream-markdown='code-block-content'] {
    overflow: auto;
  }

  & [data-stream-markdown='language-title'] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  & [data-stream-markdown='language-name'] {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-transform: lowercase;
  }
}

@media (max-width: 1024px) {
  :is(.stream-markdown, .stream-markdown-overlay) {
    & [data-stream-markdown='code-block-header'] {
      padding-inline: 0.75rem;
    }
  }
}
</style>
