<script setup lang="ts">
import type { ElementNode } from 'comark'
import type { CodeNode, MarkdownAstParser, NodeRenderers } from '../types'
import { computed } from 'vue'
import CodeRenderer from './renderers/code/index.vue'

const props = defineProps<{
  loading?: boolean
  node: ElementNode
  nodeKey: string
}>()

const markdownParser = {} as MarkdownAstParser
const nodeRenderers: NodeRenderers = {}

const codeNode = computed<CodeNode>(() => {
  const [, attrs, ...children] = props.node
  const codeElement = children.find(
    child => Array.isArray(child) && child[0] === 'code',
  ) as ElementNode | undefined
  const code = codeElement
    ? codeElement.slice(2).filter((child): child is string => typeof child === 'string').join('')
    : children.filter(child => typeof child === 'string').join('')
  const language = typeof attrs.language === 'string'
    ? attrs.language
    : typeof codeElement?.[1]?.class === 'string'
      ? codeElement[1].class.replace(/^language-/, '')
      : undefined

  return {
    type: 'code',
    value: code.replace(/\n$/, ''),
    lang: language,
    meta: null,
    loading: props.loading,
  }
})
</script>

<template>
  <CodeRenderer
    :node="codeNode"
    :node-key="nodeKey"
    :deep="0"
    :markdown-parser="markdownParser"
    :node-renderers="nodeRenderers"
  />
</template>
