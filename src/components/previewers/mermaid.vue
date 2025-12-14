<script setup lang="ts">
import type { CodeNodeRendererProps, Control, ZoomControlPosition } from '../../types'
import { throttle } from '@antfu/utils'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { useControls, useMermaid } from '../../composables'
import Button from '../button.vue'
import ErrorComponent from '../error-component.vue'
import Spin from '../spin.vue'
import ZoomContainer from '../zoom-container.vue'

const props = withDefaults(defineProps<CodeNodeRendererProps & {
  throttle?: number
  minHeight?: number
  containerHeight?: string | number
}>(), {
  throttle: 300,
  minHeight: 60,
})

const { controls, mermaidOptions, isDark } = toRefs(props)

const { isControlEnabled, getControlValue, resolveControls } = useControls({
  controls,
})

const showControl = computed(() => isControlEnabled('mermaid.position'))
const controlPosition = computed((): ZoomControlPosition | undefined => {
  const position = getControlValue('mermaid.position')
  if (typeof position === 'string')
    return position as ZoomControlPosition
  return 'bottom-right'
})

const renderFlag = ref<boolean>(false)
const svg = ref<string>()
const containerRef = ref<HTMLDivElement>()

const code = computed(() => props.node.value.trim())
const nodeLoading = computed(() => !!props.node.loading)
const loading = computed(() => nodeLoading.value || !renderFlag.value)

const Error = computed(() => mermaidOptions.value?.errorComponent ?? ErrorComponent)

const containerHeight = ref<number>(0)
const height = computed(() => {
  if (typeof props.containerHeight === 'string')
    return props.containerHeight

  if (typeof props.containerHeight === 'number')
    return props.containerHeight

  return containerHeight.value ? `${containerHeight.value}px` : 'auto'
})

const { renderMermaid } = useMermaid({
  mermaidOptions,
  isDark,
})

function updateHeight() {
  if (props.containerHeight)
    return

  if (!containerRef.value)
    return

  const svgElement = containerRef.value.querySelector('[data-stream-markdown="mermaid"] svg') as SVGSVGElement
  if (!svgElement)
    return

  let w: number = 0
  let h: number = 0

  const viewBox = svgElement.getAttribute('viewBox')
  const width = svgElement.getAttribute('width')
  const height = svgElement.getAttribute('height')

  if (viewBox) {
    const parts = viewBox.split(' ')
    if (parts.length === 4) {
      w = Number.parseFloat(parts[2]!)
      h = Number.parseFloat(parts[3]!)
    }
  }

  if (!w || !h) {
    if (width && height) {
      w = Number.parseFloat(width)
      h = Number.parseFloat(height)
    }
  }

  if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
    const bbox = svgElement.getBBox()
    if (bbox && bbox.width > 0 && bbox.height > 0) {
      w = bbox.width
      h = bbox.height
    }
  }

  if (w > 0 && h > 0) {
    const aspectRatio = h / w
    const { width } = containerRef.value.getBoundingClientRect()
    const data = width * aspectRatio
    if (data > h)
      containerHeight.value = h
    else
      containerHeight.value = data
  }
}

const render = throttle(
  props.throttle,
  async () => {
    const data = await renderMermaid(code.value)
    if (data) {
      svg.value = data
      nextTick(() => {
        updateHeight()
      })
    }
    renderFlag.value = true
  },
)

const mermaidControls = computed(
  (): Control[] => resolveControls<CodeNodeRendererProps>('mermaid', [], props),
)

watch(
  () => [
    code.value,
    mermaidOptions.value,
    isDark.value,
    nodeLoading.value,
  ],
  render,
  { immediate: true },
)

watch(
  loading,
  (curr, prev) => {
    // if loading changed from true to false, set `renderFla` to false
    // avoid render error component when svg is not rendered yet
    if (!curr && prev)
      renderFlag.value = false
  },
  { immediate: true },
)

if (!props.containerHeight) {
  useResizeObserver(containerRef, () => {
    updateHeight()
  })
}
</script>

<template>
  <div
    ref="containerRef"
    data-stream-markdown="mermaid-previewer"
    :style="{
      minHeight: `${minHeight}px`,
      height,
    }"
  >
    <template v-if="!svg">
      <Spin v-if="loading" size="large" />
      <component
        :is="Error"
        v-else
        variant="mermaid"
        v-bind="props"
      />
    </template>

    <ZoomContainer :show-control="showControl" :position="controlPosition">
      <template #controls="buttonProps">
        <Button
          v-for="item in mermaidControls"
          v-bind="{ ...buttonProps, ...item }"
          :key="item.key"
          @click="item.onClick"
        />
      </template>

      <div data-stream-markdown="mermaid" v-html="svg" />
    </ZoomContainer>
  </div>
</template>
