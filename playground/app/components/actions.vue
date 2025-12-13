<script setup lang="ts">
import type { Action } from '../types'
import { useClipboard } from '@vueuse/core'
import { compressToEncodedURIComponent } from 'lz-string'
import { homepage } from '../../../package.json'
import {
  BookOpenText,
  BrushClean,
  Check,
  CirclePause,
  CirclePlay,
  CircleStop,
  Github,
  Languages,
  ListTree,
  Moon,
  Share,
  SkipBack,
  SkipForward,
  SquareCode,
  Sun,
} from '../icons'

const props = withDefaults(defineProps<{
  content?: string
  prevStep: () => void
  nextStep: () => void
  toStep: (index: number) => void
  terminateTypeWriting: () => void
  toggleLanguage: () => void
}>(), {
  isTyping: true,
  content: '',
})

const { isDark, toggleDark } = useDark()

const { copy, copied } = useClipboard({
  legacy: true,
})

const staticMode = defineModel<boolean>('staticMode', { required: false, default: false })
const autoScroll = defineModel<boolean>('autoScroll', { required: false, default: false })

const typedEnable = defineModel<boolean>('typedEnable', { required: false, default: false })
const typingIndex = defineModel<number>('typingIndex', { required: false, default: 0 })
const typedStep = defineModel<number>('typedStep', { required: false, default: 1 })
const typedDelay = defineModel<number>('typedDelay', { required: false, default: 16 })

const showInputEditor = defineModel<boolean>('showInputEditor', { required: false, default: false })
const showAstResult = defineModel<boolean>('showAstResult', { required: false, default: false })

const shikiLightTheme = defineModel<string>('shikiLightTheme', { required: false, default: 'github-light' })
const shikiDarkTheme = defineModel<string>('shikiDarkTheme', { required: false, default: 'github-dark' })
const mermaidLightTheme = defineModel<string>('mermaidLightTheme', { required: false, default: 'neutral' })
const mermaidDarkTheme = defineModel<string>('mermaidDarkTheme', { required: false, default: 'dark' })

function wrapAction(action: Omit<Action, 'key'>): Action | null {
  if (action.visible && !action.visible?.())
    return null

  const variant = action.variant ? action.variant : 'default'
  const active = action.defaultActive || false
  return {
    ...action,
    key: `${action.name}_[data-variant="${variant}"]_[data-action="${active}"]`,
  }
}

const actions = computed((): Action[] => {
  return [
    wrapAction({
      name: 'Generate Share Links',
      icon: copied.value ? Check : Share,
      onClick: () => {
        if (!props.content)
          return

        const compressed = compressToEncodedURIComponent(props.content)
        copy(`${location.origin}?content=${compressed}`)

        const url = new URL(location.href)
        url.searchParams.set('content', compressed)
        history.pushState({}, '', url.toString())
      },
    }),
    wrapAction({
      name: 'Clear Content',
      icon: typedEnable.value ? CircleStop : BrushClean,
      buttonClass: typedEnable.value
        ? [isDark.value
            ? 'bg-destructive/30 hover:bg-destructive/50'
            : 'bg-destructive hover:bg-red text-white']
        : [],
      visible: () => !staticMode.value,
      onClick: () => props.terminateTypeWriting(),
    }),
    wrapAction({
      name: 'Previous Step',
      icon: SkipBack,
      visible: () => !staticMode.value,
      onClick: () => props.prevStep(),
    }),
    wrapAction({
      name: typedEnable.value ? 'Stop Typing' : 'Start Typing',
      icon: typedEnable.value ? CirclePause : CirclePlay,
      buttonClass: typedEnable.value
        ? []
        : [isDark.value ? 'text-green-200' : 'text-green-800'],
      variant: 'toggle',
      defaultActive: typedEnable.value,
      onClick: () => {
        if (!typedEnable.value)
          staticMode.value = false
        nextTick(() => {
          typedEnable.value = !typedEnable.value
        })
      },
    }),
    wrapAction({
      name: 'Next Step',
      icon: SkipForward,
      visible: () => !staticMode.value,
      onClick: () => props.nextStep(),
    }),
    wrapAction({
      name: 'Toggle Input Editor',
      icon: SquareCode,
      variant: 'toggle',
      defaultActive: showInputEditor.value,
      onClick: () => showInputEditor.value = !showInputEditor.value,
    }),
    wrapAction({
      name: 'Toggle Ast Result',
      icon: ListTree,
      variant: 'toggle',
      defaultActive: showAstResult.value,
      onClick: () => showAstResult.value = !showAstResult.value,
    }),
    wrapAction({
      name: 'Change Languages',
      icon: Languages,
      onClick: () => props.toggleLanguage(),
    }),
    wrapAction({
      name: 'Toggle Dark Mode',
      icon: isDark.value ? Sun : Moon,
      onClick: toggleDark,
    }),
    wrapAction({
      name: 'Documentation',
      icon: BookOpenText,
      onClick: () => window.open('https://docs-vue-stream-markdown.netlify.app', '_blank'),
    }),
    wrapAction({
      name: 'View on GitHub',
      icon: Github,
      onClick: () => window.open(homepage, '_blank'),
    }),
  ].filter(Boolean) as Action[]
})
</script>

<template>
  <div class="flex flex-wrap gap-1 max-sm:w-full max-sm:justify-center">
    <SettingsPopover
      v-model:auto-scroll="autoScroll"
      v-model:static-mode="staticMode"
      v-model:typing-index="typingIndex"
      v-model:typed-step="typedStep"
      v-model:typed-delay="typedDelay"
      v-model:shiki-light-theme="shikiLightTheme"
      v-model:shiki-dark-theme="shikiDarkTheme"
      v-model:mermaid-light-theme="mermaidLightTheme"
      v-model:mermaid-dark-theme="mermaidDarkTheme"
      :to-step="toStep"
    />

    <IconButton
      v-for="action in actions"
      :key="action.key"
      :icon="action.icon"
      :name="action.name"
      :variant="action.variant"
      :default-active="action.defaultActive"
      :button-class="action.buttonClass"
      @click="action.onClick"
    />
  </div>
</template>
