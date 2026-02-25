<script setup lang="ts">
import type { SelectOption, UIDropdownProps } from '../types'
import { ref, toRefs } from 'vue'
import { useContext } from '../composables'

const props = withDefaults(defineProps<UIDropdownProps>(), {
  options: () => [],
})

const emits = defineEmits<{
  (e: 'click', event: MouseEvent, item: SelectOption): void
}>()

const { uiComponents: UI } = useContext()

const { options } = toRefs(props)

const tooltipRef = ref()

const BUTTON_STYLE = {
  minWidth: '120px',
  display: 'flex',
  justifyContent: 'start',
  gap: '0.625rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
}

function handleClick(event: MouseEvent, item: SelectOption) {
  emits('click', event, item)
  tooltipRef.value?.hide()
}
</script>

<template>
  <component
    :is="UI.Tooltip"
    ref="tooltipRef"
    trigger="click"
    placement="bottom-end"
    data-stream-markdown="dropdown"
  >
    <template #content>
      <div
        data-stream-markdown="dropdown-overlay"
        class="p-1"
      >
        <component
          :is="UI.Button"
          v-for="option in options"
          :key="option.value"
          :name="option.label"
          :icon="option.icon"
          :button-style="BUTTON_STYLE"
          variant="text"
          @click="(e: MouseEvent) => handleClick(e, option)"
        />
      </div>
    </template>
    <slot />
  </component>
</template>
