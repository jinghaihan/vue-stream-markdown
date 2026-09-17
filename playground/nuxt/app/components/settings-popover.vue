<script setup lang="ts">
import type { CodeBlockVariant, SelectOption, StreamMarkdownProps } from 'vue-stream-markdown'
import { THEMES } from 'beautiful-mermaid'
import { bundledThemesInfo } from 'shiki'
import { ANIMATION_SPLITS, ANIMATION_TYPES, CARETS } from 'vue-stream-markdown'
import { useI18n } from '../composables/use-i18n'
import { Settings } from '../icons'

const props = withDefaults(defineProps<{
  toStep: (index: number) => void
}>(), {})

const autoScroll = defineModel<boolean>('autoScroll', { required: false, default: false })
const staticMode = defineModel<boolean>('staticMode', { required: false, default: false })

const typingIndex = defineModel<number>('typingIndex', { required: false, default: 0 })
const typedStepMin = defineModel<number>('typedStepMin', { required: false, default: 1 })
const typedStepMax = defineModel<number>('typedStepMax', { required: false, default: 3 })
const typedDelay = defineModel<number>('typedDelay', { required: false, default: 16 })

const shikiLightTheme = defineModel<string>('shikiLightTheme', { required: false, default: 'github-light' })
const shikiDarkTheme = defineModel<string>('shikiDarkTheme', { required: false, default: 'github-dark' })

const mermaidRenderer = defineModel<string>('mermaidRenderer', { required: false, default: 'vanilla' })
const mermaidLightTheme = defineModel<string>('mermaidLightTheme', { required: false, default: 'neutral' })
const mermaidDarkTheme = defineModel<string>('mermaidDarkTheme', { required: false, default: 'dark' })
const mermaidBeautifulLightTheme = defineModel<string>('mermaidBeautifulLightTheme', { required: false, default: 'default' })
const mermaidBeautifulDarkTheme = defineModel<string>('mermaidBeautifulDarkTheme', { required: false, default: 'zinc-dark' })

const caret = defineModel<NonNullable<StreamMarkdownProps['caret']> | ''>('caret', { required: false, default: '' })
const animation = defineModel<NonNullable<StreamMarkdownProps['animation']>>('animation', { required: false, default: 'fade-in' })
const animationSplit = defineModel<NonNullable<StreamMarkdownProps['animationSplit']>>('animationSplit', { required: false, default: 'auto' })
const animationDuration = defineModel<number>('animationDuration', { required: false, default: 180 })
const animationStagger = defineModel<number>('animationStagger', { required: false, default: 40 })
const codeBlockVariant = defineModel<CodeBlockVariant>('codeBlockVariant', { required: false, default: 'modern' })
const { t } = useI18n()

const animationDurationInput = computed({
  get: () => animationDuration.value,
  set: (value: number | string) => {
    const nextValue = Number(value)
    animationDuration.value = Number.isFinite(nextValue) ? nextValue : 180
  },
})

const animationStaggerInput = computed({
  get: () => animationStagger.value,
  set: (value: number | string) => {
    const nextValue = Number(value)
    animationStagger.value = Number.isFinite(nextValue) ? Math.max(0, nextValue) : 40
  },
})

watch(() => typedStepMin.value, (value) => {
  if (typedStepMax.value < value)
    typedStepMax.value = value
})

watch(() => typedStepMax.value, (value) => {
  if (typedStepMin.value > value)
    typedStepMin.value = value
})

const BLOCK_CLASSES = [
  'min-h-10',
  'py-1',
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
  'w-32',
  'whitespace-pre-line',
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

const MERMAID_RENDERERS = computed<SelectOption[]>(() => [
  { label: t('settings.options.mermaid'), value: 'vanilla' },
  { label: t('settings.options.beautifulMermaid'), value: 'beautiful' },
])

const MERMAID_THEMES = computed<SelectOption[]>(() => [
  { label: t('settings.options.default'), value: 'default' },
  { label: t('settings.options.dark'), value: 'dark' },
  { label: t('settings.options.forest'), value: 'forest' },
  { label: t('settings.options.neutral'), value: 'neutral' },
  { label: t('settings.options.base'), value: 'base' },
])

const MERMAID_BEAUTIFUL_THEMES = computed<SelectOption[]>(() => [
  { label: t('settings.options.default'), value: 'default' },
  ...Object.keys(THEMES).map(key => ({
    label: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: key,
  })),
  ...SHIKI_THEMES,
])

const CARETS_OPTIONS = computed<SelectOption[]>(() => [
  { label: t('settings.options.none'), value: '' },
  ...Object.entries(CARETS).map(([key, value]) => ({ label: value, value: key })),
])

const ANIMATION_OPTIONS = computed<SelectOption[]>(() => [
  { label: t('settings.options.none'), value: '' },
  ...ANIMATION_TYPES.map(value => ({
    label: value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value,
  })),
])

const ANIMATION_SPLIT_OPTIONS = computed<SelectOption[]>(() => ANIMATION_SPLITS.map(value => ({
  label: {
    auto: t('settings.options.auto'),
    word: t('settings.options.word'),
    char: t('settings.options.character'),
  }[value],
  value,
})))

const CODE_BLOCK_VARIANT_OPTIONS = computed<SelectOption[]>(() => [
  { label: t('settings.options.modern'), value: 'modern' },
  { label: t('settings.options.classic'), value: 'classic' },
  { label: t('settings.options.minimal'), value: 'minimal' },
])

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
      <div class="px-2 py-3 overscroll-contain flex flex-col max-h-[80vh] overflow-x-hidden overflow-y-auto">
        <h3 :class="BLOCK_TITLE_CLASSES">
          {{ t('settings.sections.general') }}
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.staticMode') }}</Label>
          <Switch v-model:value="staticMode" />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.autoScroll') }}</Label>
          <Switch v-model:value="autoScroll" />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.typingIndex') }}</Label>
          <Input
            v-model:value="typingIndex"
            :class="CONTROL_CLASSES"
            type="number"
            :placeholder="t('settings.placeholders.typingIndex')"
            @change="onTypingIndexChange"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.stepMin') }}</Label>
          <Input
            v-model:value="typedStepMin"
            :class="CONTROL_CLASSES"
            type="number"
            min="1"
            step="1"
            :placeholder="t('settings.placeholders.minimumStep')"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.stepMax') }}</Label>
          <Input
            v-model:value="typedStepMax"
            :class="CONTROL_CLASSES"
            type="number"
            min="1"
            step="1"
            :placeholder="t('settings.placeholders.maximumStep')"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.typedDelay') }}</Label>
          <Input
            v-model:value="typedDelay"
            :class="CONTROL_CLASSES"
            type="number"
            :placeholder="t('settings.placeholders.typedDelay')"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          {{ t('settings.sections.codeBlock') }}
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.variant') }}</Label>
          <Select
            v-model:value="codeBlockVariant"
            :class="CONTROL_CLASSES"
            :options="CODE_BLOCK_VARIANT_OPTIONS"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          {{ t('settings.sections.shiki') }}
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.lightTheme') }}</Label>
          <Select
            v-model:value="shikiLightTheme"
            :class="CONTROL_CLASSES"
            :options="SHIKI_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.darkTheme') }}</Label>
          <Select
            v-model:value="shikiDarkTheme"
            :class="CONTROL_CLASSES"
            :options="SHIKI_THEMES"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          {{ t('settings.sections.mermaid') }}
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.renderer') }}</Label>
          <Select
            v-model:value="mermaidRenderer"
            :class="CONTROL_CLASSES"
            :options="MERMAID_RENDERERS"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.mermaidLightTheme') }}</Label>
          <Select
            v-model:value="mermaidLightTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.mermaidDarkTheme') }}</Label>
          <Select
            v-model:value="mermaidDarkTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.beautifulMermaidLightTheme') }}</Label>
          <Select
            v-model:value="mermaidBeautifulLightTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_BEAUTIFUL_THEMES"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.beautifulMermaidDarkTheme') }}</Label>
          <Select
            v-model:value="mermaidBeautifulDarkTheme"
            :class="CONTROL_CLASSES"
            :options="MERMAID_BEAUTIFUL_THEMES"
          />
        </div>

        <hr :class="DIVIDER_CLASSES">
        <h3 :class="BLOCK_TITLE_CLASSES">
          {{ t('settings.sections.caret') }}
        </h3>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.caret') }}</Label>
          <Select
            v-model:value="caret"
            :class="CONTROL_CLASSES"
            :options="CARETS_OPTIONS"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.animation') }}</Label>
          <Select
            v-model:value="animation"
            :class="CONTROL_CLASSES"
            :options="ANIMATION_OPTIONS"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.split') }}</Label>
          <Select
            v-model:value="animationSplit"
            :class="CONTROL_CLASSES"
            :options="ANIMATION_SPLIT_OPTIONS"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.duration') }}</Label>
          <Input
            v-model:value="animationDurationInput"
            :class="CONTROL_CLASSES"
            type="number"
            min="0"
            step="50"
            :placeholder="t('settings.placeholders.duration')"
          />
        </div>

        <div :class="BLOCK_CLASSES">
          <Label :class="LABEL_CLASSES">{{ t('settings.labels.stagger') }}</Label>
          <Input
            v-model:value="animationStaggerInput"
            :class="CONTROL_CLASSES"
            type="number"
            min="0"
            step="10"
            :placeholder="t('settings.placeholders.stagger')"
          />
        </div>
      </div>
    </template>
  </Tooltip>
</template>
