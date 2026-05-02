<script setup lang="ts">
import type {
  ImagePreviewControlKey,
  ImagePreviewTransformState,
} from '@stream-markdown/core'
import type { Control, ImageNodeRendererProps, UIImageProps } from '../types'
import {
  createImagePreviewModel,
  createImagePreviewSources,
  flipImagePreviewHorizontal,
  flipImagePreviewVertical,
  resetImagePreviewTransformState,
  rotateImagePreviewLeft,
  rotateImagePreviewRight,
} from '@stream-markdown/core'
import { useCycleList } from '@vueuse/core'
import { computed, ref, toRefs, watch } from 'vue'
import { useContext, useControls, useI18n, useMediumZoom } from '../composables'

const props = withDefaults(defineProps<UIImageProps>(), {
  preview: true,
  margin: 16,
  controls: true,
})

const emits = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const { icons, parsedNodes, uiComponents: UI } = useContext()

const { margin, controls: controlsConfig } = toRefs(props)

const { t } = useI18n()
const { resolveControls } = useControls({
  controls: controlsConfig,
})

const loaded = ref<boolean>(false)

const open = ref<boolean>(false)
const scaleX = ref<number>(1)
const scaleY = ref<number>(1)
const rotate = ref<number>(0)

const transformState = computed<ImagePreviewTransformState>(() => ({
  scaleX: scaleX.value,
  scaleY: scaleY.value,
  rotate: rotate.value,
}))

const {
  isAnimating,
  elementRef,
  zoomElementRef: _zoomElementRef,
  elementStyle,
  zoomIn,
  zoomOut,
} = useMediumZoom({
  margin,
  open: () => open.value = true,
  close: () => open.value = false,
})

const imageList = computed(() => createImagePreviewSources(parsedNodes.value, props.transformHardenUrl))
const { state: imageSrc, prev, next } = useCycleList(imageList, {
  initialValue: props.src,
  fallbackIndex: 0,
})

const model = computed(() => createImagePreviewModel({
  parsedNodes: parsedNodes.value,
  src: imageSrc.value,
  controls: controlsConfig.value,
  transformHardenUrl: props.transformHardenUrl,
  hasDownload: !!props.handleDownload,
  preview: props.preview,
  loaded: loaded.value,
  hasElement: !!elementRef.value,
  state: transformState.value,
  elementStyle: elementStyle.value,
  icons: {
    arrowRight: !!icons.value.arrowRight,
    flipVertical: !!icons.value.flipVertical,
    rotateRight: !!icons.value.rotateRight,
  },
}))

const controlPosition = computed(() => model.value.controlPosition)
const imageStyle = computed(() => model.value.imageStyle)

const builtinControls = computed((): Control[] => model.value.controls.map(item => ({
  ...item,
  name: t(item.labelKey ?? ''),
  onClick: () => handleControlClick(item.key),
  visible: () => item.visible ?? true,
})))

const zoomControls = computed(
  () => resolveControls<ImageNodeRendererProps>('image', builtinControls.value, props.nodeProps),
)

function handleLoad(event: Event) {
  loaded.value = true
  emits('load', event)
}

function handleError(event: Event) {
  emits('error', event)
}

function handleOpen() {
  if (!model.value.canOpen)
    return
  zoomIn()
}

function handleClose() {
  if (isAnimating.value)
    return
  zoomOut()
}

function flipHorizontal() {
  setTransformState(flipImagePreviewHorizontal(transformState.value))
}

function flipVertical() {
  setTransformState(flipImagePreviewVertical(transformState.value))
}

function rotateLeft() {
  setTransformState(rotateImagePreviewLeft(transformState.value))
}

function rotateRight() {
  setTransformState(rotateImagePreviewRight(transformState.value))
}

function handleControlClick(key: ImagePreviewControlKey) {
  const actions: Record<ImagePreviewControlKey, () => void> = {
    download: () => props.handleDownload?.(imageSrc.value),
    previous: prev,
    next,
    flipX: flipHorizontal,
    flipY: flipVertical,
    rotateLeft,
    rotateRight,
  }

  actions[key]()
}

function setTransformState(state: ImagePreviewTransformState) {
  scaleX.value = state.scaleX
  scaleY.value = state.scaleY
  rotate.value = state.rotate
}

watch(open, (data) => {
  if (!data) {
    setTransformState(resetImagePreviewTransformState())

    // restore the initial image src
    if (props.src)
      imageSrc.value = props.src
  }
})
</script>

<template>
  <img
    ref="elementRef"
    data-stream-markdown="image"
    class="rounded-lg h-auto max-w-full block cursor-pointer object-contain"
    :src="src"
    :alt="alt"
    :title="title"
    :style="{
      transition: 'transform 300ms cubic-bezier(0.2, 0, 0.2, 1)',
    }"
    loading="lazy"
    decoding="async"
    @load="handleLoad"
    @error="handleError"
    @click="handleOpen"
  >

  <component
    :is="UI.Modal"
    v-model:open="open"
    transition=""
    :modal-style="{
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    }"
    :close="handleClose"
  >
    <component
      :is="UI.ZoomContainer"
      control-size="large"
      :position="controlPosition"
      :container-style="{
        width: 'auto',
        maxWidth: `calc(100% - ${props.margin * 2}px)`,
        cursor: 'grab',
      }"
      @click="handleClose"
    >
      <template #controls="buttonProps">
        <component
          :is="UI.Button"
          v-for="item in zoomControls"
          v-bind="{ ...buttonProps, ...item }"
          :key="item.key"
          @click="item.onClick"
        />
      </template>

      <img
        ref="_zoomElementRef"
        :src="imageSrc"
        :alt="alt"
        :title="title"
        :style="imageStyle"
      >
    </component>
  </component>
</template>
