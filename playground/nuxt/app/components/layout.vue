<script setup lang="ts">
const props = withDefaults(defineProps<{
  stop?: () => void
}>(), {
  stop: () => {},
})

const typedEnable = defineModel<boolean>('typedEnable', { required: false, default: false })
const showInputEditor = defineModel<boolean>('showInputEditor', { required: false, default: false })
const showDocumentResult = defineModel<boolean>('showDocumentResult', { required: false, default: false })

const showMarkdown = computed(
  () => isMobile.value ? (!showInputEditor.value && !showDocumentResult.value) : true,
)

// when is mobile, only one section can be shown at a time
const shouldToggle = computed(
  () => isMobile.value && showInputEditor.value && showDocumentResult.value,
)

watch(
  () => isMobile.value,
  () => {
    if (!isMobile.value) {
      if (!showInputEditor.value && !showDocumentResult.value)
        showInputEditor.value = true
      return
    }

    showInputEditor.value = false
    showDocumentResult.value = false
  },
  { immediate: true },
)
watch(
  () => typedEnable.value,
  () => {
    if (!isMobile.value)
      return
    if (typedEnable.value) {
      showInputEditor.value = false
      showDocumentResult.value = false
    }
  },
)
watch(
  () => showInputEditor.value,
  () => {
    if (!isMobile.value)
      return
    if (shouldToggle.value)
      showDocumentResult.value = false
    if (showInputEditor.value)
      props.stop()
  },
)
watch(
  () => showDocumentResult.value,
  () => {
    if (!isMobile.value)
      return
    if (shouldToggle.value)
      showInputEditor.value = false
    if (showDocumentResult.value)
      props.stop()
  },
)
</script>

<template>
  <section class="flex flex-col size-full">
    <header class="p-2 border-b border-border flex flex-col gap-2 shadow-sm items-center justify-between z-10 lg:flex-row">
      <slot name="title" />
      <slot name="actions" />
    </header>
    <main class="bg-background flex flex-1 gap-2 min-h-0">
      <div
        v-show="showInputEditor"
        class="border-r border-border flex-1 min-w-0 lg:overflow-hidden"
      >
        <slot name="editor" />
      </div>

      <div v-show="showMarkdown" class="pl-4 border-r border-border flex-1 min-w-0 relative">
        <slot name="markdown" />
      </div>

      <div v-if="showDocumentResult" class="flex-1 min-w-0 lg:overflow-auto">
        <slot name="document" />
      </div>
    </main>
  </section>
</template>
