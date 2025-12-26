<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { createReusableTemplate, useEventListener } from '@vueuse/core'
import { computed, useSlots } from 'vue'
import { getOverlayContainer, isClient } from '../utils'

const props = withDefaults(defineProps<{
  title?: string
  zIndex?: number
  modalStyle?: CSSProperties
  headerStyle?: CSSProperties
  transition?: string
  close?: () => void
}>(), {
  zIndex: 9999,
  transition: 'stream-markdown-modal',
})

const slots = useSlots()

const open = defineModel<boolean>('open', { required: false, default: false })

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const modalStyle = computed(() => ({
  ...props.modalStyle,
  zIndex: props.zIndex,
}))
const showHeader = computed(() => !!props.title || !!slots.title || !!slots.extra)

const container = computed(() => {
  if (!isClient())
    return 'body'
  return getOverlayContainer() || document.body
})

useEventListener(document, 'keyup', (event) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    if (props.close)
      props.close()
    else
      open.value = false
  }
})
</script>

<template>
  <DefineTemplate>
    <div v-if="open" data-stream-markdown="modal" :style="modalStyle">
      <header v-if="showHeader" data-stream-markdown="modal-header" :style="headerStyle">
        <slot name="title">
          {{ title }}
        </slot>
        <slot name="header-center">
          <div />
        </slot>
        <slot name="actions" />
      </header>
      <main data-stream-markdown="modal-body">
        <slot />
      </main>
    </div>
  </DefineTemplate>

  <teleport :to="container">
    <Transition v-if="transition" :name="transition" appear>
      <ReuseTemplate />
    </Transition>
    <ReuseTemplate v-else />
  </teleport>
</template>
