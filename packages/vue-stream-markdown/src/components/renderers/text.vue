<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { computed } from 'vue'
import { useContext } from '../../composables'
import Caret from '../caret.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextNodeRendererProps>(), {})

const WHITESPACE_RE = /\s/

interface TextPart {
  key: string
  value: string
  whitespace: boolean
}

const { enableAnimate, animation } = useContext()

const loading = computed(() => props.node.loading)
const showCaret = computed(() => loading.value && !props.hideCaret)
const shouldAnimate = computed(() => enableAnimate.value && props.node.value.trim().length > 0)
const transitionName = computed(() => `stream-markdown-${animation.value}`)

const parts = computed<TextPart[]>(() => {
  let offset = 0
  return splitByWord(props.node.value).map((value) => {
    const start = offset
    offset += value.length

    return {
      key: `${props.nodeKey}-${start}`,
      value,
      whitespace: value.trim().length === 0,
    }
  })
})

function splitByWord(text: string): string[] {
  const parts: string[] = []
  let current = ''
  let inWhitespace = false

  for (const char of text) {
    const isWhitespace = WHITESPACE_RE.test(char)
    if (isWhitespace !== inWhitespace && current) {
      parts.push(current)
      current = ''
    }

    current += char
    inWhitespace = isWhitespace
  }

  if (current)
    parts.push(current)

  return parts
}
</script>

<template>
  <TransitionGroup
    v-if="shouldAnimate"
    :name="transitionName"
    tag="span"
    data-stream-markdown="text"
    class="whitespace-pre-wrap break-words"
  >
    <span
      v-for="part in parts"
      :key="part.key"
      :data-stream-markdown="part.whitespace ? 'text-space' : 'text-word'"
      :class="part.whitespace ? '' : 'inline-block max-w-full whitespace-pre-wrap break-words'"
    >{{ part.value }}</span>
    <Caret v-if="showCaret" key="stream-markdown-caret" />
  </TransitionGroup>

  <span
    v-else
    data-stream-markdown="text"
    class="whitespace-pre-wrap break-words"
  >
    {{ node.value }}<Caret v-if="showCaret" />
  </span>
</template>
