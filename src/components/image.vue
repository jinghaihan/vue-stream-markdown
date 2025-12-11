<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useContext, useI18n, useMediumZoom } from '../composables'
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
}>(), {
  preview: true,
  margin: 0,
})

const emits = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const { margin } = toRefs(props)

const { t } = useI18n()
const { icons } = useContext()

const loaded = ref<boolean>(false)

const open = ref<boolean>(false)
const scaleX = ref<number>(1)
const scaleY = ref<number>(1)
const rotate = ref<number>(0)

const {
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

function download() {
  if (!props.src)
    return
  saveImage(props.src, props.alt)
}

function handleClose() {
  zoomOut()
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
  >
    <ZoomContainer
      position="bottom-center"
      control-size="large"
      :container-style="{
        width: 'auto',
        cursor: 'grab',
      }"
      @click="handleClose"
    >
      <template #controls="props">
        <Button
          v-if="src"
          v-bind="props"
          :icon="icons.download"
          :name="t('button.download')"
          @click="download"
        />
        <Button
          v-bind="props"
          :icon="icons.flipHorizontal"
          :name="t('button.flipX')"
          @click="flipHorizontal"
        />
        <Button
          v-bind="props"
          :icon="icons.flipVertical || icons.flipHorizontal"
          :name="t('button.flipY')"
          :button-style="{
            rotate: icons.flipVertical ? undefined : '90deg',
          }"
          @click="flipVertical"
        />
        <Button
          v-bind="props"
          :icon="icons.rotateLeft"
          :name="t('button.rotateLeft')"
          @click="rotateLeft"
        />
        <Button
          v-bind="props"
          :icon="icons.rotateRight || icons.rotateLeft"
          :name="t('button.rotateRight')"
          :button-style="{
            transform: icons.rotateRight ? undefined : 'scaleX(-1)',
          }"
          @click="rotateRight"
        />
      </template>

      <img ref="_zoomElementRef" :src="src" :alt="alt" :title="title" :style="imageStyle">
    </ZoomContainer>
  </Modal>
</template>
