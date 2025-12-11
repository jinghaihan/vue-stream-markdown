<script setup lang="ts">
import type { BuiltinLanguage } from 'shiki'
import type { Component, CSSProperties } from 'vue'
import type { CodeNodeRendererProps, SelectItem } from '../../types'
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

interface Action {
  key: string
  name: string
  icon: Component
  iconStyle?: CSSProperties
  options?: SelectItem[]
  onClick: (event: MouseEvent, item?: SelectItem) => void
}

const CodeNode = defineAsyncComponent(() => import('../renderers/code/index.vue'))

const { controls, previewers, codeOptions } = toRefs(props)

const { t } = useI18n()
const { icons } = useContext()

const { isControlEnabled } = useControls({
  controls,
})
const { installed: hasMermaid } = useMermaid()

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const { onCopied } = useContext()
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
  const builtin = LANGUAGE_ICONS[language.value] || LANGUAGE_ICONS.text
  return builtin
})

const previewable = computed((): boolean => {
  if (previewers.value === false)
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
    if (previewers.value[language.value] === false)
      return false

    if (language.value === 'html' && html)
      return true
    if (language.value === 'mermaid' && mermaid)
      return true

    // Custom previewer component, load when is completed
    const component = previewers.value[language.value]
    if (typeof component === 'object' && !props.node.loading)
      return !!component

    return false
  }

  return false
})

const PreviewComponent = computed((): Component => {
  if (!previewers.value || typeof previewers.value === 'boolean')
    return CODE_PREVIEWERS[language.value]

  const data = previewers.value[language.value]
  if (data === false)
    return CODE_PREVIEWERS[language.value]

  if (data && typeof data !== 'boolean')
    return data as Component

  return CODE_PREVIEWERS[language.value]
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

const actions = computed((): Action[] => {
  return [
    {
      name: t('button.collapse'),
      key: 'collapse',
      icon: icons.value.collapse,
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
      icon: copied.value ? icons.value.check : icons.value.copy,
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
      icon: icons.value.download,
      options: downloadOptions.value.length > 0 ? downloadOptions.value : undefined,
      visible: () => showDownload.value && !!LANGUAGE_EXTENSIONS[language.value],
      onClick: (_event: MouseEvent, item?: SelectItem) => {
        if (props.node.loading)
          return

        if (!item || item.value === 'code') {
          const extension = LANGUAGE_EXTENSIONS[language.value]
          save(`file.${extension}`, props.node.value, 'text/plain')
          return
        }

        if (item?.value === 'svg' || item?.value === 'png')
          saveMermaid(item?.value as 'svg' | 'png', props.node.value)
      },
    },
    {
      name: fullscreen.value ? t('button.minimize') : t('button.maximize'),
      key: 'fullscreen',
      icon: fullscreen.value ? icons.value.minimize : icons.value.maximize,
      visible: () => showFullscreen.value,
      onClick: () => fullscreen.value = !fullscreen.value,
    },
  ].filter(button => !button.visible || button.visible())
})
const ModalActions = computed(() => actions.value.filter(i => i.key !== 'collapse'))

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
  <DefineTemplate>
    <LanguageTitle
      v-if="showLanguageTitle"
      :icon="icon"
      :language="language"
      :show-icon="showLanguageIcon"
      :show-name="showLanguageName"
    />
    <PreviewSegmented
      v-else-if="previewable"
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
      'dark': props.isDark,
    }"
  >
    <header data-stream-markdown="code-block-header">
      <slot name="title">
        <ReuseTemplate />
      </slot>

      <slot name="header-center">
        <PreviewSegmented
          v-if="previewable && showLanguageTitle"
          v-model:mode="mode"
          v-model:collapsed="collapsed"
        />
        <div v-else />
      </slot>

      <slot name="actions">
        <Actions :actions="actions" />
      </slot>
    </header>

    <main v-show="!collapsed" data-stream-markdown="code-block-content">
      <component
        :is="PreviewComponent"
        v-if="previewable"
        v-show="mode === 'preview'"
        v-bind="props"
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
        <ReuseTemplate />
      </template>

      <template #header-center>
        <PreviewSegmented
          v-if="previewable && showLanguageTitle"
          v-model:mode="mode"
          v-model:collapsed="collapsed"
        />
      </template>

      <template #actions>
        <Actions :actions="ModalActions" />
      </template>

      <component
        :is="PreviewComponent"
        v-if="previewable"
        v-show="mode === 'preview'"
        v-bind="props"
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
