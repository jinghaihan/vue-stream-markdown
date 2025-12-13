<script setup lang="ts">
import type { ButtonProps, SelectOption } from '../types'
import { createReusableTemplate } from '@vueuse/core'
import { computed } from 'vue'
import Dropdown from './dropdown.vue'
import Icon from './icon.vue'
import Tooltip from './tooltip.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'icon',
  buttonStyle: () => ({}),
  iconWidth: 14,
  iconHeight: 14,
  iconStyle: () => ({}),
  options: () => [],
})

const emits = defineEmits<{
  (e: 'click', event: MouseEvent, item?: SelectOption): void
}>()

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const isDropdown = computed(() => props.options.length > 0)

function onClick(event: MouseEvent) {
  if (isDropdown.value)
    return
  emits('click', event)
}

function onDropdownClick(event: MouseEvent, item: SelectOption) {
  if (item)
    emits('click', event, item)
}
</script>

<template>
  <DefineTemplate>
    <Icon
      v-if="icon"
      :icon="icon"
      :width="iconWidth"
      :height="iconHeight"
      :class="iconClass"
      :style="iconStyle"
    />
  </DefineTemplate>

  <component
    v-bind="$attrs"
    :is="isDropdown ? Dropdown : Tooltip"
    v-if="variant === 'icon'"
    :content="isDropdown ? undefined : name"
    :title="name"
    :options="options"
    @click="onDropdownClick"
  >
    <button
      v-bind="$attrs"
      data-stream-markdown="button"
      type="button"
      :class="buttonClass"
      :style="buttonStyle"
      @click="onClick"
    >
      <ReuseTemplate />
    </button>
  </component>

  <button
    v-else-if="variant === 'text' && !isDropdown"
    v-bind="$attrs"
    data-stream-markdown="button"
    type="button"
    :class="buttonClass"
    :style="buttonStyle"
    @click="onClick"
  >
    <ReuseTemplate />

    {{ name }}
  </button>

  <Dropdown v-else v-bind="$attrs" :title="name" :options="options" @click="onDropdownClick">
    <button
      data-stream-markdown="button"
      type="button"
      :class="buttonClass"
      :style="buttonStyle"
      @click="onClick"
    >
      <ReuseTemplate />

      {{ name }}
    </button>
  </Dropdown>
</template>
