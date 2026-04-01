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
  <span
    data-stream-markdown="error-component"
    class="text-sm text-muted-foreground font-mono inline-block [&_span]:flex-1 [&_span]:min-w-0 [&_span]:break-words"
  >
    <div
      v-if="showIcon"
      data-stream-markdown="error-component-icon"
      class="leading-none mr-2 align-text-bottom inline-flex items-center"
    >
      <component :is="UI.Icon" v-if="typeof icon === 'string'" :icon="icon" />
      <component :is="icon" v-else />
    </div>
    <slot v-if="isHarden" />
    [{{ message }}]
  </span>
</template>
