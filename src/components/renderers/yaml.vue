<script setup lang="ts">
import type { YamlNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<YamlNodeRendererProps>(), {})

const { uiComponents: UI } = useContext()

const reg = /\s*:\s*/
const data = computed(
  () => props.node.value
    .trim()
    .split('\n')
    .map(line => line.split(reg)),
)

const headers = computed(() => data.value.map(line => line[0]))
const rows = computed(() => [{ children: data.value.map(line => line[1]) }])
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
