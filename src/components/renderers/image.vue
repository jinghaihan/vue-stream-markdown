<script setup lang="ts">
import type { ImageNodeRendererProps } from '../../types'
import { computed, ref, toRefs } from 'vue'
import { useControls, useHardenSanitizers, useI18n } from '../../composables'
import { ICONS } from '../../constants'
import { save } from '../../utils'
import Button from '../button.vue'
import ErrorComponent from '../error-component.vue'
import Spin from '../spin.vue'

const props = withDefaults(defineProps<ImageNodeRendererProps>(), {})

const fileExtensionPattern = /\.[^/.]+$/

const { t } = useI18n()

const { controls, hardenOptions } = toRefs(props)
const { isControlEnabled } = useControls({
  controls,
})

const imgRef = ref()
const maskRef = ref()

const loadError = ref<boolean>(false)
const imageLoaded = ref<boolean>(false)
const fallbackAttempted = ref<boolean>(false)

const isLoading = computed(() => props.node.loading || !props.node.url)

const showDownload = computed(() => isControlEnabled('image.download'))

const fallback = computed(() => props.imageOptions?.fallback ?? '')

const imageSrc = computed(() => fallbackAttempted.value && fallback.value ? fallback.value : props.node.url)

const { transformedUrl, isHardenUrl } = useHardenSanitizers({
  url: imageSrc,
  hardenOptions,
  loading: isLoading,
  isImage: true,
})

const alt = computed(() => String(props.node.alt ?? props.node.title ?? ''))
const title = computed(() => String(props.node.title ?? props.node.alt ?? ''))

const showCaption = computed((): boolean =>
  (typeof props.imageOptions?.caption === 'boolean' ? props.imageOptions.caption : true)
  && !isLoading.value && !!title.value,
)

const Error = computed(() => isHardenUrl.value
  ? (hardenOptions.value?.errorComponent ?? ErrorComponent)
  : (props.imageOptions?.errorComponent ?? ErrorComponent))

function handleLoaded() {
  imageLoaded.value = true

  if (fallbackAttempted.value)
    return

  if (imgRef.value)
    props.mediumZoom.attach(imgRef.value)
}

function handleError() {
  if (fallback.value && !fallbackAttempted.value) {
    fallbackAttempted.value = true
    return
  }
  loadError.value = true
}

async function handleDownload() {
  if (!imageSrc.value)
    return

  const response = await fetch(imageSrc.value)
  const blob = await response.blob()
  const urlPath = new URL(imageSrc.value, window.location.origin).pathname
  const originalFilename = urlPath.split('/').pop() || ''
  const extension = originalFilename.split('.').pop()
  const hasExtension
    = originalFilename.includes('.')
      && extension !== undefined
      && extension.length <= 4

  let filename = ''

  if (hasExtension) {
    filename = originalFilename
  }
  else {
    // Determine extension from blob type
    const mimeType = blob.type
    let fileExtension = 'png' // default

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      fileExtension = 'jpg'
    }
    else if (mimeType.includes('png')) {
      fileExtension = 'png'
    }
    else if (mimeType.includes('svg')) {
      fileExtension = 'svg'
    }
    else if (mimeType.includes('gif')) {
      fileExtension = 'gif'
    }
    else if (mimeType.includes('webp')) {
      fileExtension = 'webp'
    }

    const baseName = alt.value || originalFilename || 'image'
    filename = `${baseName.replace(fileExtensionPattern, '')}.${fileExtension}`
  }

  save(filename, blob, blob.type)
}

function handleMouseEnter() {
  if (maskRef.value)
    maskRef.value.style.display = 'block'
}

function handleMouseLeave() {
  if (maskRef.value)
    maskRef.value.style.display = 'none'
}
</script>

<template>
  <figure
    data-stream-markdown="image-figure"
    :style="{
      width: isLoading || !imageLoaded ? '100%' : 'auto',
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div data-stream-markdown="image-wrapper">
      <div v-if="!isHardenUrl" ref="maskRef" data-stream-markdown="image-mask">
        <Button
          v-if="!isLoading && showDownload"
          data-stream-markdown="image-download-button"
          :icon="ICONS.download"
          :name="t('button.download')"
          icon-class="test"
          :icon-width="16"
          :icon-height="16"
          :button-style="{
            backgroundColor: 'color-mix(in oklab, var(--background) 90%, transparent)',
          }"
          @click="handleDownload"
        />
      </div>

      <Spin v-if="(isLoading || !imageLoaded) && !isHardenUrl" />

      <Transition name="img-switch" mode="out-in">
        <img
          v-if="!isLoading && !isHardenUrl && typeof transformedUrl === 'string'"
          ref="imgRef"
          :key="transformedUrl"
          data-stream-markdown="image"
          :src="transformedUrl"
          :alt="alt"
          :title="title"
          :style="{
            opacity: isLoading ? 0 : 1,
            cursor: isLoading ? 'default' : 'pointer',
          }"
          loading="lazy"
          decoding="async"
          data-zoomable
          @load="handleLoaded"
          @error="handleError"
        >
        <component
          :is="Error"
          v-else-if="isHardenUrl || loadError"
          :variant="isHardenUrl ? 'harden-image' : 'image'"
          v-bind="props"
        >
          {{ title }}
        </component>
      </transition>
    </div>

    <figcaption v-if="showCaption && title" data-stream-markdown="image-caption">
      {{ title }}
    </figcaption>
  </figure>
</template>

<style>
.stream-markdown [data-stream-markdown='image-figure'] {
  display: inline-block;
}

.stream-markdown [data-stream-markdown='image-wrapper'] {
  position: relative;
  text-align: center;
}

.stream-markdown [data-stream-markdown='image'] {
  display: block;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 0.5rem;
}

.stream-markdown [data-stream-markdown='image-caption'] {
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-style: italic;
}

.stream-markdown [data-stream-markdown='image-mask'] {
  display: none;
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  background-color: rgb(0 0 0 / 0.1);
  pointer-events: none;
}

.stream-markdown [data-stream-markdown='image-download-button'] {
  pointer-events: all;
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}

.stream-markdown .img-switch-enter-active,
.stream-markdown .img-switch-leave-active {
  transition:
    opacity var(--default-transition-duration) ease,
    transform var(--default-transition-duration) ease;
}
.stream-markdown .img-switch-enter-from,
.stream-markdown .img-switch-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.stream-markdown .img-switch-enter-to,
.stream-markdown .img-switch-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
