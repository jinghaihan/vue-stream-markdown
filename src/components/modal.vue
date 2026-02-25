<script setup lang="ts">
import type { UIModalProps } from '../types'
import { createReusableTemplate, useEventListener } from '@vueuse/core'
import { computed, onMounted, useSlots } from 'vue'
import { getOverlayContainer, isClient } from '../utils'

const props = withDefaults(defineProps<UIModalProps>(), {
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

onMounted(() => {
  useEventListener(document, 'keyup', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (props.close)
        props.close()
      else
        open.value = false
    }
  })
})
</script>

<template>
  <DefineTemplate>
    <div
      v-if="open"
      data-stream-markdown="modal"
      class="bg-background flex flex-col inset-0 fixed"
      :style="modalStyle"
    >
      <header
        v-if="showHeader"
        data-stream-markdown="modal-header"
        class="px-4 py-2 flex shrink-0 items-center justify-between relative [&>*:last-child]:flex [&>*:first-child]:flex-1 [&>*:last-child]:flex-1 [&>*:nth-child(2)]:left-1/2 [&>*:last-child]:justify-end [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-translate-x-1/2"
        :style="headerStyle"
      >
        <slot name="title">
          {{ title }}
        </slot>
        <slot name="header-center">
          <div />
        </slot>
        <slot name="actions" />
      </header>
      <main
        data-stream-markdown="modal-body"
        class="flex-1 basis-0 overflow-auto"
      >
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
