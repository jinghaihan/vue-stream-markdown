<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { useI18n } from '../composables'
import { ICONS } from '../constants'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  variant?: ErrorVariant
  icon?: Component
  message?: string
}>(), {
  variant: 'vanilla',
})

type ErrorVariant = 'vanilla' | 'image' | 'mermaid' | 'katex' | 'harden-image' | 'harden-link'

const { t } = useI18n()

const messages = computed((): Record<ErrorVariant, string> => ({
  'vanilla': t('error.vanilla'),
  'image': t('error.image'),
  'mermaid': t('error.mermaid'),
  'katex': t('error.katex'),
  'harden-image': t('error.harden'),
  'harden-link': t('error.harden'),
}))

const icon = computed(() => {
  if (props.icon)
    return props.icon
  if (ICONS[props.variant])
    return ICONS[props.variant]
  return ICONS[props.variant.replace('harden-', '')] || ICONS.error
})

const message = computed(() => props.message
  ? props.message
  : messages.value[props.variant!] || messages.value.vanilla)

const isHarden = computed(() => props.variant?.startsWith?.('harden-'))
</script>

<template>
  <span data-stream-markdown="error-component">
    <div data-stream-markdown="error-component-icon">
      <component :is="icon" />
    </div>
    <slot v-if="isHarden" />
    [{{ message }}]
  </span>
</template>

<style>
.stream-markdown [data-stream-markdown='error-component'] {
  display: inline-block;
  color: var(--muted-foreground);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.stream-markdown [data-stream-markdown='error-component'] span {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.stream-markdown [data-stream-markdown='error-component-icon'] {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  vertical-align: text-bottom;
  margin-right: 0.5rem;
}
</style>
