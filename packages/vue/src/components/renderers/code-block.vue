<script setup lang="ts">
import type { ElementNode } from '@markmend/parser'
import type { CodeBlockNode } from '../../types'
import { computed } from 'vue'
import CodeRenderer from './code/index.vue'

const props = defineProps<{
  loading?: boolean
  node: ElementNode
  nodeKey: string
}>()

const codeNode = computed<CodeBlockNode>(() => {
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
    meta: typeof attrs.meta === 'string' ? attrs.meta : undefined,
    loading: props.loading,
  }
})
</script>

<template>
  <CodeRenderer
    :node="codeNode"
    :node-key="nodeKey"
  />
</template>
