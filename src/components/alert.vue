<script setup lang="ts">
import type { UIAlertProps } from '../types'
import { createReusableTemplate, useEventListener } from '@vueuse/core'
import { computed, onMounted } from 'vue'
import { useContext, useI18n } from '../composables'
import { getOverlayContainer, isClient } from '../utils'

const props = withDefaults(defineProps<UIAlertProps>(), {
  zIndex: 9999,
  icon: 'error',
})

const emits = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { uiComponents: UI } = useContext()

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

onMounted(() => {
  useEventListener(document, 'keyup', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc')
      handleCancel()
  })
})
</script>

<template>
  <DefineTemplate>
    <div
      v-if="open"
      data-stream-markdown="alert"
      class="p-6 border border-border rounded-xl bg-background flex flex-col gap-4 max-w-[28rem] w-full shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.1),0_8px_10px_-6px_rgb(0_0_0_/_0.1)] left-1/2 top-1/2 fixed -translate-x-1/2 -translate-y-1/2"
      :style="{ zIndex }"
      @click.stop
    >
      <header
        data-stream-markdown="alert-header"
        class="flex flex-col relative"
      >
        <div
          data-stream-markdown="alert-title"
          class="text-lg font-semibold mb-2 flex gap-2 items-center"
        >
          <component :is="UI.Icon" :icon="icon" :height="20" :width="20" />
          {{ title }}
        </div>
        <div
          data-stream-markdown="alert-description"
          class="text-sm text-muted-foreground"
        >
          {{ description }}
        </div>
        <component
          :is="UI.Button"
          data-stream-markdown="alert-close-button"
          icon="x"
          button-class="absolute -right-3 -top-3"
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
      <div
        data-stream-markdown="alert-footer"
        class="flex gap-2 [&>button]:!text-sm [&>button:last-child]:!text-primary-foreground [&>button]:!text-foreground [&>button]:!border [&>button]:!border-border [&>button]:!rounded-lg [&>button]:!border-solid [&>button:last-child:hover]:!bg-primary/90 [&>button:last-child]:!bg-primary [&>button]:!gap-2 [&>button]:!w-full"
      >
        <slot name="footer">
          <component
            :is="UI.Button"
            variant="text"
            :name="t('button.cancel')"
            type="button"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </component>
          <component
            :is="UI.Button"
            variant="text"
            :name="t('button.confirm')"
            type="button"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </component>
        </slot>
      </div>
    </div>
  </DefineTemplate>

  <Teleport :to="container">
    <div
      v-if="open"
      data-stream-markdown="alert-backdrop"
      class="bg-[rgb(0_0_0_/_0.5)] flex items-center inset-0 justify-center fixed backdrop-blur"
      :style="{ zIndex: zIndex - 1 }"
      @click="handleCancel"
    >
      <Transition name="stream-markdown-modal" appear>
        <ReuseTemplate />
      </Transition>
    </div>
  </Teleport>
</template>
