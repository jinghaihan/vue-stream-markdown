<script setup lang="ts">
import type { ElementNode } from '@markmend/parser'
import { createImageModel, resolveTextDirection, saveImage } from '@stream-markdown/core'
import { computed, ref } from 'vue'
import { useContext, useControls, useI18n, useSanitizers } from '../../composables'

const props = defineProps<{
  loading?: boolean
  node: ElementNode
  nodeKey: string
  sources?: string[]
}>()

const {
  beforeDownload,
  controls,
  dir,
  hardenOptions,
  imageOptions,
  uiComponents: UI,
} = useContext()

const { t } = useI18n()
const { isControlEnabled } = useControls({ controls })

const maskRef = ref<HTMLElement>()
const loadError = ref(false)
const imageLoaded = ref(false)
const fallbackAttempted = ref(false)

const imageNode = computed(() => ({
  url: String(props.node[1].src ?? ''),
  alt: typeof props.node[1].alt === 'string' ? props.node[1].alt : null,
  title: typeof props.node[1].title === 'string' ? props.node[1].title : null,
  loading: props.loading,
}))

const baseImageModel = computed(() => createImageModel({
  node: imageNode.value,
  imageOptions: imageOptions.value,
  fallbackAttempted: fallbackAttempted.value,
  imageLoaded: imageLoaded.value,
}))

const isLoading = computed(() => baseImageModel.value.isLoading)
const enableDownload = computed(() => isControlEnabled('image.download'))
const enablePreview = computed(() => isControlEnabled('image.preview'))
const fallback = computed(() => baseImageModel.value.fallback)
const imageSrc = computed(() => baseImageModel.value.imageSrc)

const { transformedUrl, isHardenUrl, transformHardenUrl } = useSanitizers({
  url: imageSrc,
  hardenOptions,
  loading: isLoading,
  isImage: true,
})

const imageModel = computed(() => createImageModel({
  node: imageNode.value,
  imageOptions: imageOptions.value,
  fallbackAttempted: fallbackAttempted.value,
  imageLoaded: imageLoaded.value,
  isHardenUrl: isHardenUrl.value,
  loadError: loadError.value,
}))

const alt = computed(() => imageModel.value.alt)
const title = computed(() => imageModel.value.title)
const showCaption = computed(() => imageModel.value.showCaption)
const direction = computed(() => resolveTextDirection(title.value, dir.value))
const controlContext = computed(() => ({ node: props.node, nodeKey: props.nodeKey }))

const Error = computed(() => isHardenUrl.value
  ? (hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)
  : (imageOptions.value?.errorComponent ?? UI.value.ErrorComponent))

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
  if (await beforeDownload({ type: 'image', url }))
    saveImage(url, alt.value)
}

function setMaskOpacity(opacity: number) {
  if (maskRef.value)
    maskRef.value.style.opacity = String(opacity)
}
</script>

<template>
  <figure
    data-stream-markdown="image-figure"
    class="inline-block"
    :style="{ width: imageModel.figureWidth }"
    @mouseenter="setMaskOpacity(1)"
    @mouseleave="setMaskOpacity(0)"
  >
    <div data-stream-markdown="image-wrapper" class="text-center relative">
      <div
        v-if="!isHardenUrl"
        ref="maskRef"
        data-stream-markdown="image-mask"
        class="rounded-lg bg-[rgb(0_0_0_/_0.1)] opacity-0 pointer-events-none transition-opacity duration-[var(--default-transition-duration)] ease inset-0 absolute"
      >
        <div v-if="!isLoading && enableDownload" class="pointer-events-auto bottom-2 right-2 absolute">
          <component
            :is="UI.Button"
            data-stream-markdown="image-download-button"
            icon="download"
            :name="t('button.download')"
            :icon-width="16"
            :icon-height="16"
            :button-style="{ backgroundColor: 'color-mix(in oklab, var(--background) 90%, transparent)' }"
            @click="() => handleDownload(imageSrc)"
          />
        </div>
      </div>

      <component :is="UI.Spin" v-if="imageModel.showSpin" />
      <component
        :is="UI.Image"
        v-if="imageModel.showImage && typeof transformedUrl === 'string'"
        :key="transformedUrl"
        :src="transformedUrl"
        :alt="alt"
        :title="title"
        :preview="!fallbackAttempted && enablePreview"
        :referrer-policy="imageOptions?.referrerPolicy"
        :sources="sources"
        :controls="controls"
        :transform-harden-url="transformHardenUrl"
        :node-props="controlContext"
        :handle-download="handleDownload"
        @load="handleLoaded"
        @error="handleError"
      />
      <component :is="Error" v-else-if="imageModel.showError" :variant="imageModel.errorVariant">
        {{ title }}
      </component>
    </div>

    <figcaption
      v-if="showCaption && title"
      data-stream-markdown="image-caption"
      :dir="direction"
      class="text-sm text-center italic"
    >
      {{ title }}
    </figcaption>
  </figure>
</template>
