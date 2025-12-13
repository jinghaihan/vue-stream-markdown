<script setup lang="ts">
import type { Control } from '../../types'
import Button from '../button.vue'

withDefaults(defineProps<{
  actions?: Control[]
}>(), {
  actions: () => [],
})
</script>

<template>
  <div data-stream-markdown="actions">
    <Button
      v-for="item in actions"
      v-bind="item"
      :key="item.key"
      @click="item.onClick"
    />
  </div>
</template>
