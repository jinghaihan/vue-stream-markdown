<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { createTextModel } from '@stream-markdown/core'
import { computed } from 'vue'
import { useContext } from '../../composables'
import Caret from '../caret.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextNodeRendererProps>(), {})

const { enableAnimate, animation, animationSplit } = useContext()

const model = computed(() => createTextModel({
  node: props.node,
  nodeKey: props.nodeKey,
  enableAnimate: enableAnimate.value,
  animation: animation.value,
  animationSplit: animationSplit.value,
  hideCaret: props.hideCaret,
}))

const showCaret = computed(() => model.value.showCaret)
const shouldAnimate = computed(() => model.value.shouldAnimate)
const transitionName = computed(() => model.value.transitionName)
const parts = computed(() => model.value.parts)
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
      :data-stream-markdown="part.whitespace ? 'text-space' : `text-${animationSplit}`"
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
