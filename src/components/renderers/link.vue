<script setup lang="ts">
import type { LinkNodeRendererProps } from '../../types'
import { useClipboard } from '@vueuse/core'
import { computed, ref, toRefs } from 'vue'
import { useContext, useI18n, useSanitizers } from '../../composables'
import NodeList from '../node-list.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LinkNodeRendererProps>(), {})

const { uiComponents: UI } = useContext()

const { linkOptions, hardenOptions } = toRefs(props)
const { t } = useI18n()

const open = ref<boolean>(false)

const { copy, copied } = useClipboard({
  legacy: true,
})

const url = computed(() => props.node.url)
const loading = computed(
  () => props.node.loading
    || props.markdownParser.hasLoadingNode(props.node.children)
    || !url.value,
)

const { transformedUrl, isHardenUrl } = useSanitizers({
  url,
  hardenOptions,
  loading,
})

const Error = computed(() => hardenOptions.value?.errorComponent ?? UI.value.ErrorComponent)

const safetyCheck = computed(() => linkOptions.value?.safetyCheck ?? true)

async function checkTrusted(): Promise<boolean> {
  if (!safetyCheck.value)
    return true
  const fn = linkOptions.value?.isTrusted
  if (typeof fn !== 'function')
    return false
  const url = transformedUrl.value ?? ''
  const result = fn(url)
  return await Promise.resolve(result)
}

async function handleClick(event: MouseEvent) {
  if (!transformedUrl.value)
    return

  event.preventDefault()

  const trusted = await checkTrusted()

  if (trusted) {
    window.open(transformedUrl.value, '_blank')
    return
  }

  open.value = true
}

function handleConfirm() {
  if (transformedUrl.value)
    window.open(transformedUrl.value, '_blank')
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
  <a
    v-if="!isHardenUrl && typeof transformedUrl === 'string'"
    data-stream-markdown="link"
    :data-stream-markdown-loading="loading"
    rel="noreferrer"
    target="_blank"
    @click="handleClick"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </a>

  <component :is="Error" v-else v-bind="props" variant="harden-link">
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
    <code data-stream-markdown="link-url">{{ transformedUrl }}</code>
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
</template>

<style>
:where(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='link'] {
    cursor: pointer;
    color: var(--primary);
    text-decoration: underline;
    overflow-wrap: anywhere;

    &[data-stream-markdown-loading='true'] {
      position: relative;
      cursor: default;
      text-decoration: none;
      pointer-events: none;
    }
  }

  & [data-stream-markdown='link-url'] {
    display: inline-block;
    width: 100%;
    padding: 0.75rem;
    background-color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.25rem;
    border-radius: 0.5rem;
  }
}
</style>
