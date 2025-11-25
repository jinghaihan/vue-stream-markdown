<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import type { SelectItem } from '../../types'
import Button from '../button.vue'

interface Action {
  key: string
  name: string
  icon: Component
  iconStyle?: CSSProperties
  options?: SelectItem[]
  onClick: (event: MouseEvent, item?: SelectItem) => void
}

withDefaults(defineProps<{
  actions?: Action[]
}>(), {
  actions: () => [],
})
</script>

<template>
  <div data-stream-markdown="actions">
    <Button
      v-for="action in actions"
      :key="action.key"
      :name="action.name"
      :icon="action.icon"
      :icon-style="action.iconStyle"
      :options="action.options"
      @click="action.onClick"
    />
  </div>
</template>

<style>
.stream-markdown [data-stream-markdown='actions'] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
