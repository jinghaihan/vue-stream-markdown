<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { isDark } from '../composable'
import { filterObjectKeys } from '../utils'
import CopyButton from './copy-button.vue'
import Input from './input.vue'
import Label from './label.vue'
import ScrollTriggerGroup from './scroll-trigger-group.vue'
import 'vue-json-pretty/lib/styles.css'

const props = withDefaults(defineProps<{
  parsedNodes?: unknown[]
}>(), {
  parsedNodes: () => [],
})

const containerRef = ref<HTMLDivElement>()
const height = ref<number>(0)

const theme = computed(() => isDark.value ? 'dark' : 'light')

const hideKeysValue = ref<string>('position')
const hideKeys = computed(() => {
  try {
    return hideKeysValue.value.split(',').map(v => v.trim())
  }
  catch {
    return []
  }
})

const ast = computed(() => {
  try {
    return JSON.parse(filterObjectKeys(props.parsedNodes, hideKeys.value))
  }
  catch {
    return props.parsedNodes
  }
})

const content = computed(() => {
  try {
    return JSON.stringify(ast.value, null, 2)
  }
  catch {
    return ''
  }
})

function updateHeight() {
  const element = containerRef.value
  if (!element)
    return

  const { height: rectHeight } = element.getBoundingClientRect()
  height.value = rectHeight || element.clientHeight || 0
}

function getContainer() {
  if (containerRef.value)
    return containerRef.value.querySelector('.vjs-tree')
}

useResizeObserver(containerRef, updateHeight)
onMounted(updateHeight)
</script>

<template>
  <div ref="containerRef" class="size-full relative">
    <ScrollTriggerGroup :get-container="getContainer">
      <div class="flex gap-1 w-80">
        <CopyButton :content="content" />
        <Label class="shrink-0">Hide Keys:</Label>
        <Input v-model:value="hideKeysValue" class="pointer-events-auto" placeholder="field1, field2, ..." />
      </div>
    </ScrollTriggerGroup>

    <VueJsonPretty
      :data="ast"
      :show-line-number="true"
      :show-icon="true"
      :virtual="true"
      :height="height"
      :theme="theme"
    />
  </div>
</template>
