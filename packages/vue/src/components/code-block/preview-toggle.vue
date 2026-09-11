<script setup lang="ts">
import { computed } from 'vue'
import { useContext, useI18n } from '../../composables'

const mode = defineModel<'preview' | 'source'>('mode', { required: true })
const collapsed = defineModel<boolean>('collapsed', { required: true })

const { icons, uiComponents: UI } = useContext()
const { t } = useI18n()

const name = computed(() => t(mode.value === 'source' ? 'button.preview' : 'button.source'))
const icon = computed(() => mode.value === 'source' ? icons.value.preview : icons.value.code)

function toggle() {
  mode.value = mode.value === 'source' ? 'preview' : 'source'
  collapsed.value = false
}
</script>

<template>
  <component
    :is="UI.Button"
    data-stream-markdown="code-block-preview-toggle"
    :name="name"
    :icon="icon"
    :aria-pressed="mode === 'preview'"
    @click="toggle"
  />
</template>
