<script setup lang="ts">
import type { ImageNodeRendererProps } from '../../types'
import { computed, ref, toRefs } from 'vue'
import { useContext, useControls, useHardenSanitizers, useI18n } from '../../composables'
import { save } from '../../utils'
import Button from '../button.vue'
import ErrorComponent from '../error-component.vue'
import Spin from '../spin.vue'

const props = withDefaults(defineProps<ImageNodeRendererProps>(), {})

const fileExtensionPattern = /\.[^/.]+$/

const { t } = useI18n()
const { icons } = useContext()

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
    maskRef.value.style.opacity = 1
}

function handleMouseLeave() {
  if (maskRef.value)
    maskRef.value.style.opacity = 0
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
          :icon="icons.download"
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

      <img
        v-if="!isLoading && !isHardenUrl && typeof transformedUrl === 'string'"
        :ref="imgRef"
        :key="transformedUrl"
        data-stream-markdown="image"
        :src="transformedUrl"
        :alt="alt"
        :title="title"
        loading="lazy"
        decoding="async"
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
    </div>

    <figcaption v-if="showCaption && title" data-stream-markdown="image-caption">
      {{ title }}
    </figcaption>
  </figure>
</template>
