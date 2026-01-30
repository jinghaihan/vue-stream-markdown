<script setup lang="ts">
import type { Component } from 'vue'
import type { UIErrorComponentProps, UIErrorVariant } from '../types'
import { computed } from 'vue'
import { useContext, useI18n } from '../composables'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<UIErrorComponentProps>(), {
  variant: 'vanilla',
  showIcon: true,
})

const { icons, uiComponents: UI } = useContext()

const { t } = useI18n()

const messages = computed((): Record<UIErrorVariant, string> => ({
  'vanilla': t('error.vanilla'),
  'image': t('error.image'),
  'mermaid': t('error.mermaid'),
  'katex': t('error.katex'),
  'harden-image': t('error.harden'),
  'harden-link': t('error.harden'),
}))

const icon = computed((): string | Component => {
  if (props.icon)
    return props.icon
  if (icons.value[props.variant])
    return props.variant
  const name = props.variant.replace('harden-', '')
  if (icons.value[name])
    return name
  return 'error'
})

const message = computed(() => props.message
  ? props.message
  : messages.value[props.variant!] || messages.value.vanilla)

const isHarden = computed(() => props.variant?.startsWith?.('harden-'))
</script>

<template>
  <span data-stream-markdown="error-component">
    <div v-if="showIcon" data-stream-markdown="error-component-icon">
      <component :is="UI.Icon" v-if="typeof icon === 'string'" :icon="icon" />
      <component :is="icon" v-else />
    </div>
    <slot v-if="isHarden" />
    [{{ message }}]
  </span>
</template>

<style>
:where(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='error-component'] {
    display: inline-block;
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.25rem;

    & span {
      flex: 1;
      min-width: 0;
      word-break: break-word;
      overflow-wrap: break-word;
    }
  }

  & [data-stream-markdown='error-component-icon'] {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    vertical-align: text-bottom;
    margin-right: 0.5rem;
  }
}
</style>
