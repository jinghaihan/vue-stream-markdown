<script setup lang="ts">
import type { YamlNodeRendererProps } from '../../types'
import { createYamlTableModel } from '@stream-markdown/core'
import { computed } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<YamlNodeRendererProps>(), {})

const { uiComponents: UI } = useContext()

const model = computed(() => createYamlTableModel(props.node))
const headers = computed(() => model.value.headers)
const rows = computed(() => model.value.rows)
</script>

<template>
  <div
    data-stream-markdown="yaml"
    class="w-full overflow-x-auto"
  >
    <component :is="UI.Table" :headers="headers" :rows="rows">
      <template #header-cell="{ cell }">
        {{ cell }}
      </template>
      <template #body-cell="{ cell }">
        {{ cell }}
      </template>
    </component>
  </div>
</template>
