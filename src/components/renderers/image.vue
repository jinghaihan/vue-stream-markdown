<script setup lang="ts">
import type { ImageNodeRendererProps } from '../../types'
import { computed, ref, toRefs } from 'vue'
import { useContext, useControls, useI18n, useSanitizers } from '../../composables'
import { saveImage } from '../../utils'
import Button from '../button.vue'
import ErrorComponent from '../error-component.vue'
import Image from '../image.vue'
import Spin from '../spin.vue'

const props = withDefaults(defineProps<ImageNodeRendererProps>(), {})

const { t } = useI18n()

const { controls, hardenOptions } = toRefs(props)

const { beforeDownload } = useContext()
const { isControlEnabled } = useControls({
  controls,
})

const maskRef = ref()

const loadError = ref<boolean>(false)
const imageLoaded = ref<boolean>(false)
const fallbackAttempted = ref<boolean>(false)

const isLoading = computed(() => props.node.loading || !props.node.url)

const enableDownload = computed(() => isControlEnabled('image.download'))
const enablePreview = computed(() => isControlEnabled('image.preview'))

const fallback = computed(() => props.imageOptions?.fallback ?? '')

const imageSrc = computed(() => fallbackAttempted.value && fallback.value ? fallback.value : props.node.url)

const { transformedUrl, isHardenUrl, transformHardenUrl } = useSanitizers({
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

async function handleDownload(url: string = imageSrc.value) {
  if (!url)
    return
  const result = await beforeDownload({
    type: 'image',
    url,
  })
  if (result)
    saveImage(url, alt.value)
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
          v-if="!isLoading && enableDownload"
          data-stream-markdown="image-download-button"
          icon="download"
          :name="t('button.download')"
          icon-class="test"
          :icon-width="16"
          :icon-height="16"
          :button-style="{
            backgroundColor: 'color-mix(in oklab, var(--background) 90%, transparent)',
          }"
          @click="() => handleDownload(imageSrc)"
        />
      </div>

      <Spin v-if="(isLoading || !imageLoaded) && !isHardenUrl" />

      <Image
        v-if="!isLoading && !isHardenUrl && typeof transformedUrl === 'string'"
        :key="transformedUrl"
        :src="transformedUrl"
        :alt="alt"
        :title="title"
        :preview="!fallbackAttempted && enablePreview"
        :controls="controls"
        :transform-harden-url="transformHardenUrl"
        :node-props="props"
        :handle-download="handleDownload"
        @load="handleLoaded"
        @error="handleError"
      />
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

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='image'] {
    display: block;
    height: auto;
    max-width: 100%;
    border-radius: 0.5rem;
    object-fit: contain;
    cursor: pointer;
  }

  & [data-stream-markdown='image-figure'] {
    display: inline-block;
  }

  & [data-stream-markdown='image-wrapper'] {
    position: relative;
    text-align: center;
  }

  & [data-stream-markdown='image-caption'] {
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-style: italic;
  }

  & [data-stream-markdown='image-mask'] {
    opacity: 0;
    position: absolute;
    inset: 0;
    border-radius: 0.5rem;
    background-color: rgb(0 0 0 / 0.1);
    pointer-events: none;
    transition: opacity var(--default-transition-duration) ease;
  }

  & [data-stream-markdown='image-download-button'] {
    pointer-events: all;
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
  }
}
</style>
