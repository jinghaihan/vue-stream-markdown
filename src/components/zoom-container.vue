<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Control, ZoomControlPosition } from '../types'
import { computed, ref } from 'vue'
import { useI18n, useZoom } from '../composables'
import Button from './button.vue'

const props = withDefaults(defineProps<{
  showControl?: boolean
  controlSize?: 'vanilla' | 'large'
  position?: ZoomControlPosition
  containerStyle?: CSSProperties
}>(), {
  showControl: true,
  controlSize: 'vanilla',
  position: 'bottom-right',
  containerStyle: () => ({}),
})

const containerRef = ref<HTMLElement>()

const { t } = useI18n()

const {
  zoom,
  isDragging,
  transformStyle,
  zoomIn,
  zoomOut,
  resetZoom,
  startDrag,
  onDrag,
  stopDrag,
  handleWheel,

  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useZoom()

const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)

const controlsPosition = computed(() => {
  switch (props.position) {
    case 'top-left':
      return {
        top: '0.5rem',
        left: '0.5rem',
      }
    case 'top-right':
      return {
        top: '0.5rem',
        right: '0.5rem',
      }
    case 'top-center':
      return {
        top: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-left':
      return {
        bottom: '0.5rem',
        left: '0.5rem',
      }
    case 'bottom-center':
      return {
        bottom: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-right':
    default:
      return {
        bottom: '0.5rem',
        right: '0.5rem',
      }
  }
})

const controlButtonProps = computed(() => {
  if (props.controlSize === 'vanilla')
    return {}

  return {
    iconWidth: 18,
    iconHeight: 18,
    buttonStyle: {
      fontSize: '0.875rem',
    },
  }
})

const controls = computed((): Control[] => [
  {
    ...controlButtonProps.value,
    key: 'zoomIn',
    icon: 'zoomIn',
    name: t('button.zoomIn'),
    onClick: zoomIn,
  },
  {
    ...controlButtonProps.value,
    key: 'zoomOut',
    icon: 'zoomOut',
    name: t('button.zoomOut'),
    onClick: zoomOut,
  },
  {
    ...controlButtonProps.value,
    key: 'resetZoom',
    variant: 'text',
    name: zoomPercent.value,
    onClick: resetZoom,
  },
])

function onWheel(event: WheelEvent) {
  if (containerRef.value)
    handleWheel(event, containerRef.value)
}

function onTouchStart(event: TouchEvent) {
  if (containerRef.value)
    handleTouchStart(event, containerRef.value)
}

function onTouchMove(event: TouchEvent) {
  if (containerRef.value)
    handleTouchMove(event, containerRef.value)
}

function onTouchEnd(event: TouchEvent) {
  handleTouchEnd(event)
}
</script>

<template>
  <div
    ref="containerRef"
    data-stream-markdown="zoom-container"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @pointerdown.prevent="startDrag"
    @pointermove.prevent="onDrag"
    @pointerup.prevent="stopDrag"
    @pointercancel.prevent="stopDrag"
    @pointerleave.prevent="stopDrag"
  >
    <div v-if="showControl" data-stream-markdown="zoom-controls" :style="controlsPosition" @click.stop>
      <slot name="controls" v-bind="controlButtonProps" />
      <Button
        v-for="item in controls"
        v-bind="item"
        :key="item.key"
        @click="item.onClick"
      />
    </div>

    <div data-stream-markdown="zoom-inner">
      <div
        data-stream-markdown="zoom-transform-container"
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
