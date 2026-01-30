<script setup lang="ts">
import { createReusableTemplate, useEventListener } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from '../composables'
import { getOverlayContainer, isClient } from '../utils'
import Button from './button.vue'
import Icon from './icon.vue'

const props = withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  zIndex?: number
  confirmText?: string
  cancelText?: string
}>(), {
  zIndex: 9999,
  icon: 'error',
})

const emits = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()

const open = defineModel<boolean>('open', { required: false, default: false })

const container = computed(() => {
  if (!isClient())
    return 'body'
  return getOverlayContainer() || document.body
})

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const confirmLabel = computed(() => props.confirmText || t('button.confirm'))
const cancelLabel = computed(() => props.cancelText || t('button.cancel'))

function handleConfirm() {
  emits('confirm')
  open.value = false
}

function handleCancel() {
  emits('cancel')
  open.value = false
}

useEventListener(document, 'keyup', (event) => {
  if (event.key === 'Escape' || event.key === 'Esc')
    handleCancel()
})
</script>

<template>
  <DefineTemplate>
    <div
      v-if="open"
      data-stream-markdown="alert"
      :style="{ zIndex }"
      @click.stop
    >
      <header data-stream-markdown="alert-header">
        <div data-stream-markdown="alert-title">
          <Icon :icon="icon" :height="20" :width="20" />
          {{ title }}
        </div>
        <div data-stream-markdown="alert-description">
          {{ description }}
        </div>
        <Button
          data-stream-markdown="alert-close-button"
          icon="x"
          :name="t('button.cancel')"
          :icon-height="20"
          :icon-width="20"
          @click="handleCancel"
        />
      </header>

      <!-- Body: Description -->
      <div data-stream-markdown="alert-content">
        <slot />
      </div>

      <!-- Footer: Actions -->
      <div data-stream-markdown="alert-footer">
        <slot name="footer">
          <Button
            :name="t('button.cancel')"
            type="button"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </Button>
          <Button
            :name="t('button.confirm')"
            type="button"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </Button>
        </slot>
      </div>
    </div>
  </DefineTemplate>

  <Teleport :to="container">
    <div
      v-if="open"
      data-stream-markdown="alert-backdrop"
      :style="{ zIndex: zIndex - 1 }"
      @click="handleCancel"
    >
      <Transition name="stream-markdown-modal" appear>
        <ReuseTemplate />
      </Transition>
    </div>
  </Teleport>
</template>

<style>
:where(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='alert-backdrop'] {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(0 0 0 / 0.5);
    backdrop-filter: blur(4px);
  }

  & [data-stream-markdown='alert'] {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 28rem;
    padding: 1.5rem;
    background-color: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }

  & [data-stream-markdown='alert-header'] {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  & [data-stream-markdown='alert-title'] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
  }

  & [data-stream-markdown='alert-description'] {
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  & [data-stream-markdown='alert-close-button'] {
    position: absolute;
    top: -0.75rem;
    right: -0.75rem;
  }

  & [data-stream-markdown='alert-footer'] {
    display: flex;
    gap: 0.5rem;
    & > button {
      width: 100%;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      gap: 0.5rem;
    }
    & > button:nth-last-child(1) {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }
  }
}
</style>
