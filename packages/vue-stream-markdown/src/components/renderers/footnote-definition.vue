<script setup lang="ts">
import type { FootnoteDefinitionNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext, useI18n } from '../../composables'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<FootnoteDefinitionNodeRendererProps>(), {})

const { getContainer, uiComponents: UI } = useContext()

const { t } = useI18n()

const id = computed(() => props.node.identifier)
const label = computed(() => props.node.label ?? id.value)

const title = computed(() => `${label.value}.`)

function scrollToReference() {
  const container = getContainer() || document.body
  const footnoteElement = container.querySelector(`#footnote-reference-${id.value}`)
  if (!footnoteElement)
    return
  footnoteElement.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <a
    :id="`footnote-definition-${id}`"
    data-stream-markdown="footnote-definition"
    class="text-muted-foreground block [&_p]:inline"
  >
    <span
      data-stream-markdown="footnote-definition-label"
      class="mr-1 align-middle inline-block"
    >{{ title }}</span>
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" />
    <component
      :is="UI.Button"
      data-stream-markdown="footnote-definition-button"
      class="ml-1 align-middle inline-block"
      :name="t('button.back')"
      icon="cornerDownLeft"
      :icon-style="{
        color: 'var(--primary)',
      }"
      :button-style="{
        padding: '0.25rem',
      }"
      @click="scrollToReference"
    />
  </a>
</template>
