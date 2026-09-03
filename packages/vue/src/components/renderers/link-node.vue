<script setup lang="ts">
import type { ElementNode } from '@markmend/parser'
import { getDocumentBody, openExternalUrl, scrollToElement } from '@stream-markdown/core'
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useI18n, useLinkFavicon, useSanitizers } from '../../composables'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  attributes: Record<string, unknown>
  loading?: boolean
  node: ElementNode
  nodeKey: string
  waitingForDestination?: boolean
}>()

const { uiComponents: UI, linkOptions, hardenOptions, getContainer } = useContext()
const { t } = useI18n()
const open = ref(false)
const alertMounted = ref(false)
const { copy, copied } = useClipboard({ legacy: true })

const url = computed(() => String(props.attributes.href ?? ''))
const internal = computed(() => url.value.startsWith('#'))
const footnoteBackref = computed(() => String(props.attributes.class ?? '').split(/\s+/).includes('footnote-backref'))
const { transformedUrl, isHardenUrl } = useSanitizers({
  url,
  hardenOptions,
  loading: () => props.loading,
})
const Error = computed(() => hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)
const showFavicon = computed(() => !internal.value && !footnoteBackref.value && !isHardenUrl.value)
const {
  failed: faviconFailed,
  handleError: handleFaviconError,
  handleLoad: handleFaviconLoad,
  loaded: faviconLoaded,
  show: faviconEnabled,
  source: faviconSource,
} = useLinkFavicon({
  enabled: showFavicon,
  favicon: () => linkOptions.value?.favicon,
  loading: () => props.loading,
  url: transformedUrl,
  waitingForDestination: () => props.waitingForDestination,
})
const { transformedUrl: transformedFaviconUrl, isHardenUrl: isHardenFaviconUrl } = useSanitizers({
  url: faviconSource,
  hardenOptions,
  isImage: true,
})
const faviconUrl = computed(() => isHardenFaviconUrl.value ? undefined : transformedFaviconUrl.value)

async function isTrusted(): Promise<boolean> {
  if (linkOptions.value?.safetyCheck === false)
    return true
  return await Promise.resolve(linkOptions.value?.isTrusted?.(transformedUrl.value ?? '') ?? false)
}

async function handleClick(event: MouseEvent) {
  if (internal.value || !transformedUrl.value || props.loading)
    return

  event.preventDefault()
  if (await isTrusted()) {
    openExternalUrl(transformedUrl.value)
    return
  }

  alertMounted.value = true
  open.value = true
}

function handleConfirm() {
  if (transformedUrl.value)
    openExternalUrl(transformedUrl.value)
  open.value = false
}

function handleFootnoteBackref() {
  const container = getContainer() ?? getDocumentBody()
  if (container && internal.value)
    scrollToElement(container, url.value)
}
</script>

<template>
  <span data-stream-markdown="link-container" class="inline">
    <component
      :is="UI.Button"
      v-if="footnoteBackref"
      data-stream-markdown="footnote-definition-button"
      class="ml-1 align-middle inline-block"
      :name="t('button.back')"
      icon="cornerDownLeft"
      :icon-style="{ color: 'var(--primary)' }"
      :button-style="{ padding: '0.25rem' }"
      @click="handleFootnoteBackref"
    />

    <a
      v-else-if="!isHardenUrl && typeof transformedUrl === 'string'"
      v-bind="attributes"
      :href="transformedUrl"
      data-stream-markdown="link"
      :data-stream-markdown-loading="loading || undefined"
      :rel="internal ? undefined : 'noreferrer'"
      :target="internal ? undefined : '_blank'"
      class="text-primary underline cursor-pointer [overflow-wrap:anywhere] data-[stream-markdown-loading=true]:no-underline data-[stream-markdown-loading=true]:cursor-default data-[stream-markdown-loading=true]:pointer-events-none"
      @click="handleClick"
    >
      <span
        v-if="faviconEnabled"
        data-stream-markdown="link-favicon"
        class="mr-1 align-[-0.125em] rounded-sm inline-flex size-[1em] items-center justify-center relative overflow-hidden"
      >
        <img
          v-if="faviconUrl && !faviconFailed"
          :src="faviconUrl"
          alt=""
          aria-hidden="true"
          data-stream-markdown="link-favicon-image"
          referrerpolicy="no-referrer"
          class="rounded-sm size-full transition-opacity duration-[var(--default-transition-duration)] inset-0 absolute"
          :class="faviconLoaded ? 'opacity-100' : 'opacity-0'"
          @load="handleFaviconLoad"
          @error="handleFaviconError"
        >
        <span
          v-if="!faviconLoaded && !faviconFailed"
          aria-hidden="true"
          data-stream-markdown="link-favicon-placeholder"
          class="rounded-sm bg-muted size-full animate-pulse"
        />
        <component
          :is="UI.Icon"
          v-if="faviconFailed"
          data-stream-markdown="link-favicon-fallback"
          icon="globe"
          :width="14"
          :height="14"
        />
      </span>
      <slot />
    </a>

    <component :is="Error" v-else variant="harden-link">
      <slot />
    </component>

    <component
      :is="UI.Spin"
      v-if="waitingForDestination"
      :style="{
        width: '0.75em',
        height: '0.75em',
        margin: '0 0 0 0.25em',
        verticalAlign: '-0.0625em',
      }"
    />

    <component
      :is="UI.Alert"
      v-if="alertMounted"
      v-model:open="open"
      :title="t('link.title')"
      :description="t('link.description')"
      icon="externalLink"
      @confirm="handleConfirm"
    >
      <code data-stream-markdown="link-url" class="text-sm font-mono p-3 rounded-lg bg-muted w-full inline-block overflow-x-auto">
        {{ transformedUrl }}
      </code>
      <template #footer>
        <component
          :is="UI.Button"
          variant="text"
          :name="copied ? t('button.copied') : t('link.copy')"
          :icon="copied ? 'check' : 'copy'"
          :icon-height="16"
          :icon-width="16"
          @click="copy(transformedUrl ?? '')"
        />
        <component
          :is="UI.Button"
          data-stream-markdown="open-link-button"
          variant="text"
          :name="t('link.open')"
          icon="externalLink"
          :icon-height="16"
          :icon-width="16"
          @click="handleConfirm"
        />
      </template>
    </component>
  </span>
</template>
