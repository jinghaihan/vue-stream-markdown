<script setup lang="ts">
import type { FootnoteReferenceNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<FootnoteReferenceNodeRendererProps>(), {})

const { getContainer } = useContext()

const id = computed(() => props.node.identifier)
const label = computed(() => props.node.label ?? id.value)

function scrollToFootnote() {
  const container = getContainer() || document.body
  const footnoteElement = container.querySelector(`#footnote-definition-${id.value}`)
  if (!footnoteElement)
    return
  footnoteElement.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <sup data-stream-markdown="footnote-reference" @click="scrollToFootnote">
    <a :id="`footnote-reference-${id}`">[{{ label }}]</a>
  </sup>
</template>
