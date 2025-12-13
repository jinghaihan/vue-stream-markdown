<script setup lang="ts">
import type { SelectOption } from 'vue-stream-markdown'
import { bundledThemesInfo } from 'shiki'
import { Settings } from '../icons'

const props = withDefaults(defineProps<{
  toStep: (index: number) => void
}>(), {})

const autoScroll = defineModel<boolean>('autoScroll', { required: false, default: false })
const staticMode = defineModel<boolean>('staticMode', { required: false, default: false })

const typingIndex = defineModel<number>('typingIndex', { required: false, default: 0 })
const typedStep = defineModel<number>('typedStep', { required: false, default: 1 })
const typedDelay = defineModel<number>('typedDelay', { required: false, default: 16 })

const shikiLightTheme = defineModel<string>('shikiLightTheme', { required: false, default: 'github-light' })
const shikiDarkTheme = defineModel<string>('shikiDarkTheme', { required: false, default: 'github-dark' })
const mermaidLightTheme = defineModel<string>('mermaidLightTheme', { required: false, default: 'neutral' })
const mermaidDarkTheme = defineModel<string>('mermaidDarkTheme', { required: false, default: 'dark' })

const BLOCK_CLASSES = [
  'h-10',
  'flex',
  'items-center',
  'justify-between',
  'rounded-md',
  'hover:bg-muted',
  'duration-150',
  'px-1',
]

const BLOCK_TITLE_CLASSES = [
  'font-semibold',
  'pl-1',
  'mb-1',
]

const LABEL_CLASSES = [
  'text-muted-foreground',
  'font-semibold',
  'shrink-0',
  'w-24',
]

const CONTROL_CLASSES = [
  'w-full',
]

const DIVIDER_CLASSES = [
  'my-2',
  'border-border',
]

const SHIKI_THEMES: SelectOption[] = bundledThemesInfo.map(theme => ({
  label: theme.displayName,
  value: theme.id,
}))

const MERMAID_THEMES: SelectOption[] = [
  { label: 'Default', value: 'default' },
  { label: 'Dark', value: 'dark' },
  { label: 'Forest', value: 'forest' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Base', value: 'base' },
]

function onTypingIndexChange() {
  props.toStep(typingIndex.value)
}

watch(() => autoScroll.value, () => {
  if (autoScroll.value)
    staticMode.value = false
})

watch(() => staticMode.value, () => {
  if (staticMode.value)
    autoScroll.value = false
})
</script>

<template>
  <Tooltip trigger="click" placement="bottom">
    <IconButton :icon="Settings" />

    <template #content>
      <div class="px-2 py-3 flex flex-col">
        <h3 :class="BLOCK_TITLE_CLASSES">
          General
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Static Mode</Label>
          <Switch v-model:value="staticMode" />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Auto Scroll</Label>
          <Switch v-model:value="autoScroll" />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Typing Index</Label>
          <Input
            v-model:value="typingIndex"
            :class="CONTROL_CLASSES"
            type="number"
            placeholder="Typing index"
            @change="onTypingIndexChange"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Typed Step</Label>
          <Input
            v-model:value="typedStep"
            :class="CONTROL_CLASSES"
            type="number"
            placeholder="Typed step"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Typed Delay</Label>
          <Input
            v-model:value="typedDelay"
            :class="CONTROL_CLASSES"
            type="number"
            placeholder="Typed delay"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          Shiki
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Light Theme</Label>
          <Select
            v-model:value="shikiLightTheme"
            :class="CONTROL_CLASSES"
            :options="SHIKI_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Dark Theme</Label>
          <Select
            v-model:value="shikiDarkTheme"
            :class="CONTROL_CLASSES"
            :options="SHIKI_THEMES"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          Mermaid
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Light Theme</Label>
          <Select
            v-model:value="mermaidLightTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">Dark Theme</Label>
          <Select
            v-model:value="mermaidDarkTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_THEMES"
          />
        </div>
      </div>
    </template>
  </Tooltip>
</template>
