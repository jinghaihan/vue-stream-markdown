<script setup lang="ts">
import type { LinkNodeRendererProps } from '../../types'
import { checkTrustedLink, createLinkModel, openExternalUrl } from '@stream-markdown/core'
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useContext, useI18n, useSanitizers } from '../../composables'
import NodeList from '../node-list.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LinkNodeRendererProps>(), {})

const { uiComponents: UI, linkOptions, hardenOptions } = useContext()
const { t } = useI18n()

const open = ref<boolean>(false)

const { copy, copied } = useClipboard({
  legacy: true,
})

const baseModel = computed(() => createLinkModel({
  node: props.node,
  linkOptions: linkOptions.value,
  hasLoadingNode: nodes => props.markdownParser.hasLoadingNode(nodes),
}))

const url = computed(() => baseModel.value.url)
const loading = computed(() => baseModel.value.loading)

const { transformedUrl, isHardenUrl } = useSanitizers({
  url,
  hardenOptions,
  loading,
})

const model = computed(() => createLinkModel({
  node: props.node,
  transformedUrl: transformedUrl.value,
  isHardenUrl: isHardenUrl.value,
  linkOptions: linkOptions.value,
  hasLoadingNode: nodes => props.markdownParser.hasLoadingNode(nodes),
}))

const Error = computed(() => hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)

async function checkTrusted(): Promise<boolean> {
  return await checkTrustedLink(transformedUrl.value ?? '', linkOptions.value)
}

async function handleClick(event: MouseEvent) {
  if (!transformedUrl.value)
    return

  event.preventDefault()

  const trusted = await checkTrusted()

  if (trusted) {
    openExternalUrl(transformedUrl.value)
    return
  }

  open.value = true
}

function handleConfirm() {
  if (transformedUrl.value)
    openExternalUrl(transformedUrl.value)
  handleClose()
}

async function handleCopy() {
  if (transformedUrl.value)
    copy(transformedUrl.value)
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <span data-stream-markdown="link-container" class="inline">
    <a
      v-if="model.showLink"
      data-stream-markdown="link"
      :data-stream-markdown-loading="loading"
      class="text-primary underline cursor-pointer [overflow-wrap:anywhere] data-[stream-markdown-loading=true]:no-underline data-[stream-markdown-loading=true]:cursor-default data-[stream-markdown-loading=true]:pointer-events-none data-[stream-markdown-loading=true]:relative"
      rel="noreferrer"
      target="_blank"
      @click="handleClick"
    >
      <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
    </a>

    <component :is="Error" v-else :variant="model.errorVariant">
      <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
    </component>

    <component
      :is="UI.Alert"
      v-model:open="open"
      :title="t('link.title')"
      :description="`${t('link.description')}`"
      icon="externalLink"
      @confirm="handleConfirm"
    >
      <code
        data-stream-markdown="link-url"
        class="text-sm font-mono p-3 rounded-lg bg-muted w-full inline-block overflow-x-auto"
      >
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
          @click="handleCopy"
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
