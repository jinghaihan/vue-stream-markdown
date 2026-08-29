<script setup lang="ts">
import type { ElementNode } from 'comark'
import { openExternalUrl } from '@stream-markdown/core'
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useI18n, useSanitizers } from '../../composables'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  attributes: Record<string, unknown>
  loading?: boolean
  node: ElementNode
  nodeKey: string
}>()

const { uiComponents: UI, linkOptions, hardenOptions } = useContext()
const { t } = useI18n()
const open = ref(false)
const alertMounted = ref(false)
const { copy, copied } = useClipboard({ legacy: true })

const url = computed(() => String(props.attributes.href ?? ''))
const internal = computed(() => url.value.startsWith('#'))
const { transformedUrl, isHardenUrl } = useSanitizers({
  url,
  hardenOptions,
  loading: () => props.loading,
})
const Error = computed(() => hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)

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
</script>

<template>
  <span data-stream-markdown="link-container" class="inline">
    <a
      v-if="!isHardenUrl && typeof transformedUrl === 'string'"
      v-bind="attributes"
      :href="transformedUrl"
      data-stream-markdown="link"
      :data-stream-markdown-loading="loading || undefined"
      :rel="internal ? undefined : 'noreferrer'"
      :target="internal ? undefined : '_blank'"
      class="text-primary underline cursor-pointer [overflow-wrap:anywhere] data-[stream-markdown-loading=true]:no-underline data-[stream-markdown-loading=true]:cursor-default data-[stream-markdown-loading=true]:pointer-events-none"
      @click="handleClick"
    >
      <slot />
    </a>

    <component :is="Error" v-else variant="harden-link">
      <slot />
    </component>

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
