<script setup lang="ts">
import type { MermaidRenderResult, SvgIntrinsicSize } from '@stream-markdown/core'
import type { CodeBlockProps, Control } from '../../types'
import {
  applyMermaidRenderResult,
  createMermaidPreviewControllerState,
  createMermaidPreviewModel,
  getSvgIntrinsicSize,
  measureSvgContainerHeight,
  setMermaidMeasuredHeight,
  startMermaidRenderAttempt,
} from '@stream-markdown/core'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import { useContext, useControls, useDeferredRender, useMermaid } from '../../composables'

const props = withDefaults(defineProps<CodeBlockProps & {
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
  controls,
  extensions,
  isDark,
  uiComponents: UI,
} = useContext()

const { resolveControls } = useControls({
  controls,
})

const previewState = ref(createMermaidPreviewControllerState())
const containerRef = ref<HTMLDivElement>()
const contentSize = ref<SvgIntrinsicSize>()

const nodeLoading = computed(() => !!props.node.loading)

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
const height = computed(() => model.value.height === 'auto'
  ? `${model.value.minHeight}px`
  : model.value.height)

const { shouldRender } = useDeferredRender({
  targetRef: containerRef,
  immediate: props.immediateRender,
})

const { renderMermaid, resolveExtension } = useMermaid({
  extensions,
  isDark,
})

const ErrorComponent = computed(() => resolveExtension(code.value)?.errorComponent ?? UI.value.ErrorComponent)

function updateHeight() {
  if (!containerRef.value)
    return

  const element = containerRef.value.querySelector<SVGSVGElement>('[data-stream-markdown="mermaid"] svg')
  if (!element)
    return
  const size = getSvgIntrinsicSize(element)
  if (size && (size.width !== contentSize.value?.width || size.height !== contentSize.value?.height))
    contentSize.value = size

  if (props.containerHeight)
    return

  const height = measureSvgContainerHeight(containerRef.value)
  if (height && height !== previewState.value.measuredHeight)
    previewState.value = setMermaidMeasuredHeight(previewState.value, height)
}

const renderContext = computed(() => [
  props.nodeKey,
  isDark.value,
  extensions.value?.beautifulMermaid,
  extensions.value?.mermaid,
  extensions.value?.code,
] as const)
interface RenderRequest {
  code: string
  context: typeof renderContext.value
}
let latestRequest: RenderRequest | undefined
let inFlight = false
let disposed = false
let wake: (() => void) | undefined

async function pauseWhileStreaming(duration: number) {
  if (!nodeLoading.value)
    return

  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, duration)
    wake = () => {
      clearTimeout(timer)
      resolve()
    }
  })
  wake = undefined
}

async function renderLatest() {
  inFlight = true
  try {
    let request = latestRequest
    while (request) {
      const startedAt = performance.now()
      previewState.value = startMermaidRenderAttempt(previewState.value)
      let result: MermaidRenderResult
      try {
        result = await renderMermaid(request.code)
      }
      catch (error) {
        result = { valid: false, error: error instanceof Error ? error.message : String(error) }
      }

      if (disposed)
        return

      if (request.context === renderContext.value) {
        // Successful intermediate diagrams remain visible even while more code arrives.
        if (result.valid || request === latestRequest)
          previewState.value = applyMermaidRenderResult(previewState.value, result)

        if (result.valid) {
          void nextTick(updateHeight)
          await pauseWhileStreaming(Math.max(props.throttle, performance.now() - startedAt))
        }
      }

      if (disposed || request === latestRequest)
        return
      request = latestRequest
    }
  }
  finally {
    inFlight = false
  }
}

watch(
  () => [code.value, renderContext.value, shouldRender.value] as const,
  () => {
    if (!shouldRender.value)
      return

    const previousContext = latestRequest?.context
    latestRequest = { code: code.value, context: renderContext.value }
    if (previousContext !== latestRequest.context)
      wake?.()
    if (!inFlight)
      void renderLatest()
  },
  { immediate: true },
)

watch(nodeLoading, (streaming) => {
  if (!streaming)
    wake?.()
})

onScopeDispose(() => {
  disposed = true
  wake?.()
})

const mermaidControls = computed(
  (): Control[] => resolveControls<CodeBlockProps>('mermaid', [], props),
)

useResizeObserver(containerRef, updateHeight)
watch(() => props.containerHeight, () => nextTick(updateHeight))
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
        :is="ErrorComponent"
        v-else
        class="p-4"
        variant="mermaid"
        :message="error"
        :show-icon="false"
      />
    </template>

    <component
      :is="UI.ZoomContainer"
      auto-fit
      :content-size="contentSize"
      :fit-key="nodeKey"
      :container-style="contentSize ? { width: `${contentSize.width}px`, height: `${contentSize.height}px` } : undefined"
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
        class="flex h-full select-none justify-center [&>svg]:!bg-transparent [&>svg]:!h-full [&>svg]:!max-w-none [&>svg]:!w-full"
        v-html="svg"
      />
    </component>
  </div>
</template>
