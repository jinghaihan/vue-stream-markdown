<script setup lang="ts">
import { ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { isDark } from '../composable'

withDefaults(defineProps<{
  content?: string
}>(), {
  content: '',
})

const tippyRef = ref()

defineExpose({
  show: () => tippyRef.value?.show(),
  hide: () => tippyRef.value?.hide(),
})
</script>

<template>
  <Tippy ref="tippyRef" :theme="isDark ? '' : 'light'">
    <template #content>
      <slot name="content">
        <pre>{{ content }}</pre>
      </slot>
    </template>
    <slot />
  </Tippy>
</template>
