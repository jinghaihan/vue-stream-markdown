<script setup lang="ts">
import type { UIIconProps } from '../types'
import { computed } from 'vue'
import { useContext } from '../composables'

const props = withDefaults(defineProps<UIIconProps>(), {
  width: 14,
  height: 14,
})

const { icons } = useContext()

const Icon = computed(() => typeof props.icon === 'string' ? icons.value[props.icon] : props.icon)
const iconStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
}))
</script>

<template>
  <div data-stream-markdown="icon" :style="iconStyle">
    <Icon
      :width="width" :height="height"
      :class="props.class"
      :style="style"
    />
  </div>
</template>
