<script setup lang="ts">
import type { SelectOption, UIButtonProps } from '../types'
import { createReusableTemplate } from '@vueuse/core'
import { computed, useAttrs } from 'vue'
import { useContext } from '../composables'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<UIButtonProps>(), {
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

const { uiComponents: UI } = useContext()
const attrs = useAttrs()

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const isDropdown = computed(() => props.options.length > 0)
const ariaLabel = computed(() => {
  const value = attrs['aria-label']
  return typeof value === 'string' ? value : props.name
})

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
    <component
      :is="UI.Icon"
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
    :is="isDropdown ? UI.Dropdown : UI.Tooltip"
    v-if="variant === 'icon'"
    :content="isDropdown ? undefined : name"
    :title="name"
    :options="options"
    @click="onDropdownClick"
  >
    <button
      v-bind="$attrs"
      :aria-label="ariaLabel"
      data-stream-markdown="button"
      type="button"
      class="text-xs text-muted-foreground p-2 rounded-md border-none bg-transparent flex gap-1 cursor-pointer transition-colors duration-[var(--default-transition-duration)] items-center justify-center hover:text-foreground hover:bg-accent"
      :class="[
        buttonClass,
      ]"
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
    class="text-xs text-muted-foreground p-2 rounded-md border-none bg-transparent flex gap-1 cursor-pointer transition-colors duration-[var(--default-transition-duration)] items-center justify-center hover:text-foreground hover:bg-accent"
    :class="[
      buttonClass,
    ]"
    :style="buttonStyle"
    @click="onClick"
  >
    <ReuseTemplate />

    {{ name }}
  </button>

  <component :is="UI.Dropdown" v-else v-bind="$attrs" :title="name" :options="options" @click="onDropdownClick">
    <button
      data-stream-markdown="button"
      type="button"
      class="text-xs text-muted-foreground p-2 rounded-md border-none bg-transparent flex gap-1 cursor-pointer transition-colors duration-[var(--default-transition-duration)] items-center justify-center hover:text-foreground hover:bg-accent"
      :class="[
        buttonClass,
      ]"
      :style="buttonStyle"
      @click="onClick"
    >
      <ReuseTemplate />

      {{ name }}
    </button>
  </component>

  <span
    v-if="announcement"
    data-stream-markdown="button-announcement"
    class="sr-only"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >{{ announcement }}</span>
</template>
