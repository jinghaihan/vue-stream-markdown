<script setup lang="ts">
import type { ImageNodeRendererProps } from '../../types'
import { computed, ref, toRefs } from 'vue'
import { useContext, useControls, useI18n, useSanitizers } from '../../composables'
import { saveImage } from '../../utils'

const props = withDefaults(defineProps<ImageNodeRendererProps>(), {})

const { beforeDownload, uiComponents: UI } = useContext()

const { t } = useI18n()

const { controls, hardenOptions } = toRefs(props)

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
  ? (hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)
  : (props.imageOptions?.errorComponent ?? UI.value.ErrorComponent))

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
    class="inline-block"
    :style="{
      width: isLoading || !imageLoaded ? '100%' : 'auto',
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      data-stream-markdown="image-wrapper"
      class="text-center relative"
    >
      <div
        v-if="!isHardenUrl"
        ref="maskRef"
        data-stream-markdown="image-mask"
        class="rounded-lg bg-[rgb(0_0_0_/_0.1)] opacity-0 pointer-events-none transition-opacity duration-[var(--default-transition-duration)] ease inset-0 absolute"
      >
        <component
          :is="UI.Button"
          v-if="!isLoading && enableDownload"
          data-stream-markdown="image-download-button"
          class="pointer-events-auto bottom-2 right-2 absolute"
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

      <component :is="UI.Spin" v-if="(isLoading || !imageLoaded) && !isHardenUrl" />

      <component
        :is="UI.Image"
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

    <figcaption
      v-if="showCaption && title"
      data-stream-markdown="image-caption"
      class="text-sm text-center italic"
    >
      {{ title }}
    </figcaption>
  </figure>
</template>
