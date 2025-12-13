<script setup lang="ts">
import type { Control, ControlsConfig, ImageNode, ImageNodeRendererProps, ParsedNode } from '../types'
import { useCycleList } from '@vueuse/core'
import { treeFlatFilter } from 'treechop'
import { computed, ref, toRefs, watch } from 'vue'
import { useContext, useControls, useI18n, useMediumZoom } from '../composables'
import { saveImage } from '../utils'
import Button from './button.vue'
import Modal from './modal.vue'
import ZoomContainer from './zoom-container.vue'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  title?: string
  preview?: boolean
  margin?: number
  controls?: ControlsConfig
  transformHardenUrl?: (url: string) => string | null
  nodeProps: ImageNodeRendererProps
}>(), {
  preview: true,
  margin: 16,
  controls: true,
})

const emits = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const { margin, controls } = toRefs(props)

const { t } = useI18n()
const { icons, parsedNodes } = useContext()
const { isControlEnabled, getControlValue, resolveControls } = useControls({
  controls,
})

const imageNodes = computed(
  () => treeFlatFilter(parsedNodes.value, (node: ParsedNode) => node.type === 'image' && !node.loading),
)
// Make sure the image list is unique and filtered by the security checks
const imageList = computed(() => {
  const data = [...new Set(imageNodes.value.map((node: ParsedNode) => (node as ImageNode).url))]
  return data.filter(url => props.transformHardenUrl ? props.transformHardenUrl(url) : url).filter(Boolean)
})
const { state: imageSrc, prev, next } = useCycleList(imageList, {
  initialValue: props.src,
  fallbackIndex: 0,
})

const enableDownload = computed(() => isControlEnabled('image.download'))
const enableCarousel = computed(() => isControlEnabled('image.carousel'))
const enableFlip = computed(() => isControlEnabled('image.flip'))
const enableRotate = computed(() => isControlEnabled('image.rotate'))

const controlPosition = computed(() => {
  const position = getControlValue('image.controlPosition')
  if (typeof position === 'boolean')
    return 'bottom-center'
  return position || 'bottom-center'
})

const loaded = ref<boolean>(false)

const open = ref<boolean>(false)
const scaleX = ref<number>(1)
const scaleY = ref<number>(1)
const rotate = ref<number>(0)

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

const imageStyle = computed(() => ({
  transform: `
    scaleX(${scaleX.value})
    scaleY(${scaleY.value})
    rotate(${rotate.value}deg)
  `,
  transition: 'transform 0.3s ease',
  ...elementStyle.value,
}))

const builtinControls = computed((): Control[] => [
  {
    key: 'download',
    icon: 'download',
    name: t('button.download'),
    onClick: download,
    visible: () => !!imageSrc.value && enableDownload.value,
  },
  {
    key: 'previous',
    icon: 'arrowLeft',
    name: t('button.previous'),
    onClick: () => prev(),
    visible: () => imageList.value.length > 1 && enableCarousel.value,
  },
  {
    key: 'next',
    icon: icons.value.arrowRight ? 'arrowRight' : 'arrowLeft',
    name: t('button.next'),
    onClick: () => next(),
    buttonStyle: icons.value.arrowRight
      ? undefined
      : { transform: 'scaleX(-1)' },
    visible: () => imageList.value.length > 1 && enableCarousel.value,
  },
  {
    key: 'flipX',
    icon: 'flipHorizontal',
    name: t('button.flipX'),
    onClick: flipHorizontal,
    visible: () => enableFlip.value,
  },
  {
    key: 'flipY',
    icon: icons.value.flipVertical ? 'flipVertical' : 'flipHorizontal',
    name: t('button.flipY'),
    onClick: flipVertical,
    buttonStyle: icons.value.flipVertical
      ? undefined
      : { rotate: '90deg' },
    visible: () => enableFlip.value,
  },
  {
    key: 'rotateLeft',
    icon: 'rotateLeft',
    name: t('button.rotateLeft'),
    onClick: rotateLeft,
    visible: () => enableRotate.value,
  },
  {
    key: 'rotateRight',
    icon: icons.value.rotateRight ? 'rotateRight' : 'rotateLeft',
    name: t('button.rotateRight'),
    onClick: rotateRight,
    buttonStyle: icons.value.rotateRight
      ? undefined
      : { transform: 'scaleX(-1)' },
    visible: () => enableRotate.value,
  },
])

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
  if (!props.preview || !elementRef.value || !loaded.value)
    return
  zoomIn()
}

function handleClose() {
  if (isAnimating.value)
    return
  zoomOut()
}

function download() {
  if (!imageSrc.value)
    return
  saveImage(imageSrc.value, props.alt)
}

function flipHorizontal() {
  scaleX.value *= -1
}

function flipVertical() {
  scaleY.value *= -1
}

function rotateLeft() {
  rotate.value -= 90
}

function rotateRight() {
  rotate.value += 90
}

watch(open, (data) => {
  if (!data) {
    scaleX.value = 1
    scaleY.value = 1
    rotate.value = 0

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

  <Modal
    v-model:open="open"
    transition=""
    :modal-style="{
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    }"
    :close="handleClose"
  >
    <ZoomContainer
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
        <Button
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
    </ZoomContainer>
  </Modal>
</template>
