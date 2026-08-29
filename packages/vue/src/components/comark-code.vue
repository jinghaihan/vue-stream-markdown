<script setup lang="ts">
import type { ElementNode } from 'comark'
import type { CodeNode } from '../types'
import { computed } from 'vue'
import CodeRenderer from './renderers/code/index.vue'

const props = defineProps<{
  loading?: boolean
  node: ElementNode
  nodeKey: string
}>()

const codeNode = computed<CodeNode>(() => {
  const [, attrs, ...children] = props.node
  const codeElement = children.find(child => Array.isArray(child) && child[0] === 'code')
  const code = codeElement
    ? codeElement.slice(2).filter(child => typeof child === 'string').join('')
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
  />
</template>
