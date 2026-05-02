<script setup lang="ts">
import type { CodeNodeRendererProps, Control } from '../../types'
import { throttle } from '@antfu/utils'
import {
  applyMermaidRenderResult,
  createMermaidPreviewControllerState,
  createMermaidPreviewModel,
  measureSvgContainerHeight,
  setMermaidMeasuredHeight,
  shouldEagerRenderMermaidAfterLoading,
  startMermaidRenderAttempt,
} from '@stream-markdown/core'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { useContext, useControls, useDeferredRender, useMermaid } from '../../composables'

const props = withDefaults(defineProps<CodeNodeRendererProps & {
  interactive?: boolean
  throttle?: number
  minHeight?: number
  immediateRender?: boolean
  containerHeight?: string | number
}>(), {
  interactive: true,
  throttle: 300,
  minHeight: 60,
  immediateRender: false,
})

const {
  cdnOptions,
  controls,
  mermaidOptions,
  shikiOptions,
  isDark,
  uiComponents: UI,
} = useContext()

const { resolveControls } = useControls({
  controls,
})

const previewState = ref(createMermaidPreviewControllerState())
const containerRef = ref<HTMLDivElement>()

const nodeLoading = computed(() => !!props.node.loading)

const Error = computed(() => mermaidOptions.value?.errorComponent ?? UI.value.ErrorComponent)

const model = computed(() => createMermaidPreviewModel({
  code: props.node.value,
  nodeLoading: nodeLoading.value,
  svg: previewState.value.svg,
  renderFlag: previewState.value.renderFlag,
  minHeight: props.minHeight,
  containerHeight: props.containerHeight,
  measuredHeight: previewState.value.measuredHeight,
  controls: controls.value,
}))

const code = computed(() => model.value.code)
const svg = computed(() => previewState.value.svg)
const error = computed(() => previewState.value.error)
const loading = computed(() => model.value.loading)
const showControl = computed(() => model.value.showControl)
const controlPosition = computed(() => model.value.controlPosition)
const height = computed(() => model.value.height)

const { shouldRender } = useDeferredRender({
  targetRef: containerRef,
  immediate: props.immediateRender,
})

const { renderMermaid } = useMermaid({
  mermaidOptions,
  cdnOptions,
  shikiOptions,
  isDark,
})

function updateHeight() {
  if (props.containerHeight)
    return

  if (!containerRef.value)
    return

  const height = measureSvgContainerHeight(containerRef.value)
  if (height)
    previewState.value = setMermaidMeasuredHeight(previewState.value, height)
}

const render = throttle(
  props.throttle,
  async () => {
    if (!shouldRender.value)
      return

    const result = await renderMermaid(code.value)
    previewState.value = applyMermaidRenderResult(previewState.value, result)
    if (result.valid) {
      nextTick(() => {
        updateHeight()
      })
    }
  },
)

function eagerRender() {
  previewState.value = startMermaidRenderAttempt(previewState.value)
  render()
}

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
    if (shouldEagerRenderMermaidAfterLoading(
      previewState.value,
      curr,
      prev,
    )) {
      eagerRender()
    }
  },
  { immediate: true },
)

watch(
  shouldRender,
  (curr, prev) => {
    if (curr && !prev)
      eagerRender()
  },
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
    class="text-center"
    :style="{
      minHeight: `${minHeight}px`,
      height,
    }"
  >
    <template v-if="!svg">
      <component :is="UI.Spin" v-if="loading" size="large" />
      <component
        :is="Error"
        v-else
        class="p-4"
        variant="mermaid"
        :message="error"
        :show-icon="false"
      />
    </template>

    <component
      :is="UI.ZoomContainer"
      :show-control="showControl"
      :position="controlPosition"
      :interactive="interactive"
    >
      <template #controls="buttonProps">
        <component
          :is="UI.Button"
          v-for="item in mermaidControls"
          v-bind="{ ...buttonProps, ...item }"
          :key="item.key"
          @click="item.onClick"
        />
      </template>

      <div
        data-stream-markdown="mermaid"
        class="flex select-none justify-center [&>svg]:!bg-transparent"
        v-html="svg"
      />
    </component>
  </div>
</template>
