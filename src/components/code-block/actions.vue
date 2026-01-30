<script setup lang="ts">
import type { Control } from '../../types'
import { useContext } from '../../composables'

withDefaults(defineProps<{
  actions?: Control[]
}>(), {
  actions: () => [],
})

const { uiComponents: UI } = useContext()
</script>

<template>
  <div data-stream-markdown="actions">
    <component
      :is="UI.Button"
      v-for="item in actions"
      v-bind="item"
      :key="item.key"
      @click="item.onClick"
    />
  </div>
</template>
