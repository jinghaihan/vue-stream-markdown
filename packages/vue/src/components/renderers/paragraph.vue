<script setup lang="ts">
import type { ParagraphNodeRendererProps } from '../../types'
import { createParagraphModel } from '@stream-markdown/core'
import { computed } from 'vue'
import { useTextDirection } from '../../composables'
import NodeList from '../node-list.vue'

const props = withDefaults(defineProps<ParagraphNodeRendererProps>(), {})

const paragraphStyle = computed(() => {
  const { marginBottom, lineHeight } = createParagraphModel(props)
  const declarations: string[] = []
  if (marginBottom)
    declarations.push(`margin-bottom:${marginBottom}`)
  if (lineHeight)
    declarations.push(`line-height:${lineHeight}`)
  return declarations.join(';')
})
const direction = useTextDirection(() => props.node)
</script>

<template>
  <p
    data-stream-markdown="paragraph"
    :dir="direction"
    class="my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease"
    :style="paragraphStyle"
  >
    <NodeList v-bind="props" :parent-node="node" :nodes="node.children" :deep="deep + 1" />
  </p>
</template>
