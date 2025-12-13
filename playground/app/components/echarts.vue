<script setup lang="ts">
import type { CodeNodeRendererProps } from 'vue-stream-markdown'
import { useResizeObserver } from '@vueuse/core'
import * as echarts from 'echarts'
import { UI } from 'vue-stream-markdown'

const props = defineProps<CodeNodeRendererProps>()

const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()
const code = computed(() => props.node.value.trim())

const hasError = ref<boolean>(false)

const data = ref<Record<string, unknown>>()

watch(
  () => code.value,
  () => {
    try {
      // If you have a better solution, I’d love to hear from you.
      // eslint-disable-next-line no-eval
      data.value = eval(`(${code.value})`)
    }
    catch {
      hasError.value = true
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (!chartRef.value || !data.value)
    return

  chart.value = echarts.init(chartRef.value)
  chart.value.setOption(data.value)
})

useResizeObserver(chartRef, () => {
  chart.value?.resize()
})
</script>

<template>
  <div>
    <div ref="chartRef" class="h-100" />
    <UI.ErrorComponent v-if="hasError" />
  </div>
</template>
