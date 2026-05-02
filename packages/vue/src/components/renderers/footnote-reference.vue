<script setup lang="ts">
import type { FootnoteReferenceNodeRendererProps } from '../../types'
import {
  createFootnoteReferenceModel,
  getDocumentBody,
  scrollToElement,
} from '@stream-markdown/core'
import { computed } from 'vue'
import { useContext } from '../../composables'

const props = withDefaults(defineProps<FootnoteReferenceNodeRendererProps>(), {})

const { getContainer } = useContext()

const model = computed(() => createFootnoteReferenceModel(props.node))
const id = computed(() => model.value.id)
const label = computed(() => model.value.label)

function scrollToFootnote() {
  const container = getContainer() || getDocumentBody()
  if (!container)
    return

  scrollToElement(container, `#footnote-definition-${id.value}`)
}
</script>

<template>
  <sup
    data-stream-markdown="footnote-reference"
    class="text-primary cursor-pointer"
    @click="scrollToFootnote"
  >
    <a :id="`footnote-reference-${id}`">[{{ label }}]</a>
  </sup>
</template>
