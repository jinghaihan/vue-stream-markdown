<script setup lang="ts">
import type { Component, CSSProperties } from 'vue'
import type { SelectItem } from '../types'
import { computed, h } from 'vue'
import Dropdown from './dropdown.vue'
import Tooltip from './tooltip.vue'

const props = withDefaults(defineProps<{
  variant?: 'icon' | 'text'
  name: string
  buttonClass?: string | string[] | Record<string, unknown>
  buttonStyle?: CSSProperties
  icon?: Component
  iconWidth?: number
  iconHeight?: number
  iconClass?: string | string[] | Record<string, unknown>
  iconStyle?: CSSProperties
  options?: SelectItem[]
}>(), {
  variant: 'icon',
  buttonStyle: () => ({}),
  iconWidth: 14,
  iconHeight: 14,
  iconStyle: () => ({}),
  options: () => [],
})

const emits = defineEmits<{
  (e: 'click', event: MouseEvent, item?: SelectItem): void
}>()

const isDropdown = computed(() => props.options.length > 0)

function onClick(event: MouseEvent) {
  if (isDropdown.value)
    return
  emits('click', event)
}

function onDropdownClick(event: MouseEvent, item: SelectItem) {
  if (item)
    emits('click', event, item)
}

const Icon = computed(() => {
  if (!props.icon)
    return null

  return h(props.icon, {
    width: props.iconWidth,
    height: props.iconHeight,
    class: props.iconClass,
    style: props.iconStyle,
  })
})
</script>

<template>
  <component
    :is="isDropdown ? Dropdown : Tooltip"
    v-if="variant === 'icon'"
    :content="isDropdown ? undefined : name"
    :title="name"
    :options="options"
    @click="onDropdownClick"
  >
    <button
      data-stream-markdown="button"
      type="button"
      :class="buttonClass"
      :style="buttonStyle"
      @click="onClick"
    >
      <component :is="Icon" />
    </button>
  </component>

  <button
    v-else-if="variant === 'text' && !isDropdown"
    data-stream-markdown="button"
    type="button"
    :class="buttonClass"
    :style="buttonStyle"
    @click="onClick"
  >
    <component :is="Icon" />
    {{ name }}
  </button>

  <Dropdown v-else :title="name" :options="options" @click="onDropdownClick">
    <button
      data-stream-markdown="button"
      type="button"
      :class="buttonClass"
      :style="buttonStyle"
      @click="onClick"
    >
      <component :is="Icon" />
      {{ name }}
    </button>
  </Dropdown>
</template>

<style>
.stream-markdown [data-stream-markdown='button'] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  line-height: 1rem;
  background-color: transparent;
  color: var(--muted-foreground);
  transition-duration: var(--default-transition-duration);
}

.stream-markdown [data-stream-markdown='button']:hover {
  color: var(--foreground);
  background-color: var(--accent);
}
</style>
