<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Control, SelectOption, UIZoomContainerProps } from '../types'
import { createZoomContainerModel } from '@stream-markdown/core'
import { useResizeObserver } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useContext, useI18n, useZoom } from '../composables'

const props = withDefaults(defineProps<UIZoomContainerProps>(), {
  interactive: true,
  showControl: true,
  controlSize: 'vanilla',
  position: 'bottom-right',
  containerStyle: () => ({}),
})

const { uiComponents: UI } = useContext()

const containerRef = ref<HTMLElement>()
const zoomOptions = { minZoom: 0.5 }
let userInteracted = false

const { t } = useI18n()

const {
  zoom,
  isDragging,
  transformStyle,
  zoomIn,
  zoomOut,
  resetZoom,
  setZoom,
  setState,
  startDrag,
  onDrag,
  stopDrag,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useZoom(zoomOptions)

function fitToContainer() {
  const element = containerRef.value
  const size = props.contentSize
  if (!props.autoFit || !element || !size
    || !(size.width > 0 && size.height > 0 && element.clientWidth > 0 && element.clientHeight > 0)) {
    return
  }

  const fit = Math.min(1, element.clientWidth / size.width, element.clientHeight / size.height)
  zoomOptions.minZoom = Math.min(0.5, fit)
  if (!userInteracted)
    setState({ zoom: fit, translateX: 0, translateY: 0 })
}

watch(() => props.fitKey, () => {
  userInteracted = false
}, { flush: 'pre' })
watch(() => [props.autoFit, props.contentSize, props.fitKey], fitToContainer, { flush: 'post' })
useResizeObserver(containerRef, fitToContainer)

const model = computed(() => createZoomContainerModel({
  zoom: zoom.value,
  position: props.position,
  controlSize: props.controlSize,
}))

const controlsPosition = computed(() => model.value.controlsPosition as CSSProperties)
const controlButtonProps = computed(() => model.value.controlButtonProps)

const controls = computed((): Control[] => {
  const items = [...model.value.controls]
  if (props.autoFit) {
    items.push({
      ...controlButtonProps.value,
      key: 'fitToContainer',
      icon: 'fitToContainer',
      labelKey: 'button.fitToContainer',
    })
  }
  return items.map((item) => {
    const { visible: _visible, ...rest } = item
    return {
      ...rest,
      name: item.label ?? t(item.labelKey ?? '', item.key === 'fitToContainer' ? 'button.resetZoom' : undefined),
      onClick: (_event: MouseEvent, select?: SelectOption) => {
        if (item.key === 'fitToContainer') {
          userInteracted = false
          fitToContainer()
          return
        }
        userInteracted = true
        if (item.key === 'zoomIn')
          zoomIn()
        else if (item.key === 'zoomOut')
          zoomOut()
        else if (item.key === 'updateZoom')
          updateZoom(select)
      },
    }
  })
})

function updateZoom(item?: SelectOption) {
  const value = item?.value || 100
  if (value === 100)
    resetZoom()
  else
    setZoom(Number(value) / 100)
}

function onWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey)
    userInteracted = true
  if (containerRef.value)
    handleWheel(event, containerRef.value)
}

function onPointerDown(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  userInteracted = true
  startDrag(event)
}

function onPointerMove(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  onDrag(event)
}

function onPointerUp(event: PointerEvent) {
  if (!props.interactive)
    return

  event.preventDefault()
  stopDrag()
}

function onTouchStart(event: TouchEvent) {
  if (!props.interactive)
    return

  if (event.touches.length === 2)
    userInteracted = true

  if (containerRef.value)
    handleTouchStart(event, containerRef.value)
}

function onTouchMove(event: TouchEvent) {
  if (!props.interactive)
    return

  if (containerRef.value)
    handleTouchMove(event, containerRef.value)
}

function onTouchEnd(event: TouchEvent) {
  if (!props.interactive)
    return

  handleTouchEnd(event)
}
</script>

<template>
  <div
    ref="containerRef"
    data-stream-markdown="zoom-container"
    class="h-full relative overflow-hidden"
    :style="{
      touchAction: interactive ? 'none' : 'auto',
    }"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <div
      v-if="showControl && interactive"
      data-stream-markdown="zoom-controls"
      class="p-1 border border-border rounded-xl bg-background flex gap-1 items-center absolute z-[1] max-lg:gap-0"
      :style="controlsPosition"
      @click.stop
    >
      <slot name="controls" v-bind="controlButtonProps" />
      <component
        :is="UI.Button"
        v-for="item in controls"
        v-bind="item"
        :key="item.key"
        @click="item.onClick"
      />
    </div>

    <div
      data-stream-markdown="zoom-inner"
      class="flex size-full items-center justify-center"
    >
      <div
        data-stream-markdown="zoom-transform-container"
        class="shrink-0 w-full"
        :style="{
          ...transformStyle,
          ...containerStyle,
          cursor: isDragging ? 'grabbing' : 'grab',
        }"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </div>
</template>
