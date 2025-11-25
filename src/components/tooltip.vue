<script setup lang="ts">
import type { DefaultProps } from 'tippy.js'
import { computed, ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { useContext } from '../composables'

withDefaults(defineProps<{
  content?: string
  trigger?: DefaultProps['trigger']
  placement?: DefaultProps['placement']
  interactive?: DefaultProps['interactive']
}>(), {})

const { isDark, getContainer } = useContext()

const tippyRef = ref()

const appendTo = computed(() => getContainer() || 'parent')

defineExpose({
  show: () => tippyRef.value?.show(),
  hide: () => tippyRef.value?.hide(),
})
</script>

<template>
  <Tippy
    ref="tippyRef"
    :trigger="trigger"
    :placement="placement"
    :interactive="interactive"
    :append-to="appendTo"
    :theme="isDark ? '' : 'light'"
    data-stream-markdown="tooltip"
  >
    <template #content>
      <slot name="content">
        <pre data-stream-markdown="tooltip-overlay">{{ content }}</pre>
      </slot>
    </template>
    <slot />
  </Tippy>
</template>

<style>
.stream-markdown [data-stream-markdown='tooltip-overlay'] {
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
}
</style>
