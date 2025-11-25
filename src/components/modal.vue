<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  closable?: boolean
  zIndex?: number
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
const showHeader = computed(() => !!props.title || props.closable || !!slots.title || !!slots.extra)
</script>

<template>
  <teleport :to="container">
    <Transition name="modal" appear>
      <div v-if="open" data-stream-markdown="modal" :style="modalStyle">
        <header v-if="showHeader" data-stream-markdown="modal-header">
          <slot name="title">
            {{ title }}
          </slot>
          <slot name="header-center">
            <div />
          </slot>
          <div data-stream-markdown="modal-actions">
            <slot name="actions" />
          </div>
        </header>
        <main data-stream-markdown="modal-body">
          <slot />
        </main>
      </div>
    </Transition>
  </teleport>
</template>

<style>
.stream-markdown [data-stream-markdown='modal'] {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
}

.stream-markdown [data-stream-markdown='modal-header'] {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding-inline: 1rem;
  padding-block: 0.5rem;
  background-color: color-mix(in oklab, var(--muted) 80%, transparent);
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
}

.stream-markdown [data-stream-markdown='modal-actions'] {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stream-markdown [data-stream-markdown='modal-body'] {
  flex: 1 1 0%;
  overflow: auto;
}

.stream-markdown .modal-enter-from,
.stream-markdown .modal-leave-to {
  opacity: 0;
}
.stream-markdown .modal-enter-active,
.stream-markdown .modal-leave-active {
  transition: opacity var(--default-transition-duration) ease;
}

.stream-markdown [data-stream-markdown='modal-header'] > :first-child {
  flex: 1;
}
.stream-markdown [data-stream-markdown='modal-header'] > :last-child {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
.stream-markdown [data-stream-markdown='modal-header'] > :nth-child(2) {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
