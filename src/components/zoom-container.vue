<script setup lang="ts">
import type { ZoomControlPosition } from '../types'
import { computed, ref } from 'vue'
import { useContext, useI18n, useZoom } from '../composables'
import Button from './button.vue'

const props = withDefaults(defineProps<{
  showControl?: boolean
  position?: ZoomControlPosition
}>(), {
  showControl: true,
  position: 'bottom-right',
})

const containerRef = ref<HTMLElement>()

const { t } = useI18n()
const { icons } = useContext()

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

const controlsStyle = computed(() => {
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
    <div v-if="showControl" data-stream-markdown="zoom-controls" :style="controlsStyle">
      <slot name="controls">
        <Button
          :icon="icons.zoomIn"
          :name="t('button.zoomIn')"
          @click="zoomIn"
        />
        <Button
          :icon="icons.zoomOut"
          :name="t('button.zoomOut')"
          @click="zoomOut"
        />
        <Button
          :title="t('button.resetZoom')"
          :name="zoomPercent"
          variant="text"
          @click="resetZoom"
        />
      </slot>
    </div>

    <div data-stream-markdown="zoom-inner">
      <div
        data-stream-markdown="zoom-transform-container"
        :style="{
          ...transformStyle,
          cursor: isDragging ? 'grabbing' : 'grab',
        }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
