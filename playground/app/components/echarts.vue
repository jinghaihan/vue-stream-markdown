<script setup lang="ts">
import type { CodeNodeRendererProps } from 'vue-stream-markdown'
import { useResizeObserver } from '@vueuse/core'
import * as echarts from 'echarts'
import { UI } from 'vue-stream-markdown'

const props = defineProps<CodeNodeRendererProps>()

const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()

const code = computed(() => props.node.value.trim())
const loading = computed(() => !!props.node.loading)
const isDark = computed<boolean>(() => props.isDark)

const hasError = ref<boolean>(false)

const data = ref<Record<string, unknown>>()

function renderChart() {
  if (!chartRef.value || !data.value)
    return

  chart.value = echarts.init(chartRef.value, isDark.value ? 'dark' : 'default')
  chart.value.setOption(data.value)
}

watch(
  () => [code.value, loading.value],
  () => {
    if (loading.value)
      return

    try {
      // If you have a better solution, I’d love to hear from you.
      // eslint-disable-next-line no-eval
      data.value = eval(`(${code.value})`)
      nextTick(() => {
        renderChart()
      })
    }
    catch {
      hasError.value = true
    }
  },
  { immediate: true },
)

watch(() => isDark.value, () => {
  chart.value?.setTheme(isDark.value ? 'dark' : 'default')
}, { immediate: true })

onMounted(() => {
  if (data.value && !chart.value)
    renderChart()
})

useResizeObserver(chartRef, () => {
  chart.value?.resize()
})
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      ref="chartRef"
      class="h-100 w-full"
      :style="{
        display: loading ? 'none' : 'block',
      }"
    />
    <UI.Spin v-if="loading" />
    <UI.ErrorComponent v-if="hasError" />
  </div>
</template>
