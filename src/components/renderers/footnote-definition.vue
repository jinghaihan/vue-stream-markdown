<script setup lang="ts">
import type { FootnoteDefinitionNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext, useI18n } from '../../composables'
import Button from '../button.vue'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<FootnoteDefinitionNodeRendererProps>(), {})

const { t } = useI18n()
const { getContainer } = useContext()

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
  <a :id="`footnote-definition-${id}`" data-stream-markdown="footnote-definition">
    <span data-stream-markdown="footnote-definition-label">{{ title }}</span>
    <NodeList v-bind="props" :nodes="node.children" />
    <Button
      data-stream-markdown="footnote-definition-button"
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
