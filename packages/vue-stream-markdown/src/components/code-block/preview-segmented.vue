<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables'
import Segmented from '../segmented.vue'

const mode = defineModel<'preview' | 'source'>('mode', { required: false, default: 'source' })
const collapsed = defineModel<boolean>('collapsed', { required: false, default: false })

const { t } = useI18n()

const SEGMENTED_OPTIONS = computed(() => [
  { label: t('button.preview'), value: 'preview', icon: 'preview' },
  { label: t('button.source'), value: 'source', icon: 'code' },
])
</script>

<template>
  <Segmented
    v-model:value="mode"
    :options="SEGMENTED_OPTIONS"
    :button-style="{
      fontFamily: 'var(--font-mono)',
    }"
    @change="() => collapsed = false"
  />
</template>
