<script setup lang="ts">
import type { Component } from 'vue'
import type { UIErrorComponentProps } from '../types'
import { createErrorModel } from '@stream-markdown/core'
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

const model = computed(() => createErrorModel({
  variant: props.variant,
  message: props.message,
  icon: props.icon,
  hasIcon: name => !!icons.value[name],
}))

const icon = computed(() => model.value.icon as string | Component)
const message = computed(() => model.value.message ?? t(model.value.messageKey))
const isHarden = computed(() => model.value.isHarden)
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
