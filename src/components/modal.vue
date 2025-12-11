<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useEventListener } from '@vueuse/core'
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  zIndex?: number
  headerStyle?: CSSProperties
  getContainer?: () => HTMLElement | undefined
}>(), {
  zIndex: 1000,
})

const slots = useSlots()

const open = defineModel<boolean>('open', { required: false, default: false })

const container = props.getContainer ? props.getContainer() || 'body' : 'body'

const modalStyle = computed(() => ({
  zIndex: props.zIndex,
}))
const showHeader = computed(() => !!props.title || !!slots.title || !!slots.extra)

useEventListener(document, 'keyup', (event) => {
  if (event.key === 'Escape' || event.key === 'Esc')
    open.value = false
})
</script>

<template>
  <teleport :to="container">
    <Transition name="modal" appear>
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
    </Transition>
  </teleport>
</template>
