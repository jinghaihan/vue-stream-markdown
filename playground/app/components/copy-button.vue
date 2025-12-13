<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Check, Copy } from '../icons'
import IconButton from './icon-button.vue'

const props = withDefaults(defineProps<{
  content?: string
}>(), {
  content: undefined,
})

const { copy, copied } = useClipboard({
  legacy: true,
})

function handleClick() {
  if (props.content)
    copy(props.content)
}
</script>

<template>
  <IconButton
    class="pointer-events-auto"
    name="Copy"
    placement="bottom"
    :icon="copied ? Check : Copy"
    @click="handleClick"
  />
</template>
