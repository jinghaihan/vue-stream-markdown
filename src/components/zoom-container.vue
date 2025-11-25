<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n, useZoom } from '../composables'
import { ICONS } from '../constants'
import Button from './button.vue'

const props = withDefaults(defineProps<{
  showControl?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}>(), {
  showControl: true,
  position: 'bottom-right',
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
</script>

<template>
  <div
    ref="containerRef"
    data-stream-markdown="zoom-container"
    @wheel="onWheel"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @touchstart.passive="startDrag"
    @touchmove.passive="onDrag"
    @touchend.passive="stopDrag"
  >
    <div v-if="showControl" data-stream-markdown="zoom-controls" :style="controlsStyle">
      <Button
        :icon="ICONS.zoomIn"
        :name="t('button.zoomIn')"
        @click="zoomIn"
      />
      <Button
        :icon="ICONS.zoomOut"
        :name="t('button.zoomOut')"
        @click="zoomOut"
      />
      <Button
        :title="t('button.resetZoom')"
        :name="zoomPercent"
        variant="text"
        @click="resetZoom"
      />
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

<style>
.stream-markdown [data-stream-markdown='zoom-container'] {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.stream-markdown [data-stream-markdown='zoom-inner'] {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.stream-markdown [data-stream-markdown='zoom-transform-container'] {
  width: 100%;
  flex-shrink: 0;
}

.stream-markdown [data-stream-markdown='zoom-controls'] {
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background-color: var(--background);
}
</style>
