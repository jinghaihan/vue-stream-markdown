<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { createTextModel, DISABLED_TRANSITION_NAME } from '@stream-markdown/core'
import { computed, ref, watch } from 'vue'
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
const usesAnimatedStructure = ref(shouldAnimate.value)
const transitionName = computed(() => model.value.transitionName)
const parts = computed(() => model.value.parts)

watch(shouldAnimate, (value) => {
  if (value)
    usesAnimatedStructure.value = true
})
</script>

<template>
  <TransitionGroup
    v-if="usesAnimatedStructure"
    :name="shouldAnimate ? transitionName : DISABLED_TRANSITION_NAME"
    tag="span"
    data-stream-markdown="text"
    class="whitespace-pre-wrap break-words [text-decoration:inherit]"
  >
    <span
      v-for="part in parts"
      :key="part.key"
      :data-stream-markdown="part.whitespace ? 'text-space' : `text-${part.animationSplit}`"
      class="[text-decoration:inherit]"
      :class="!part.whitespace && 'inline-block max-w-full whitespace-pre-wrap break-words'"
    >{{ part.value }}</span>
    <Caret v-if="showCaret" key="stream-markdown-caret" />
  </TransitionGroup>

  <span
    v-else
    data-stream-markdown="text"
    class="whitespace-pre-wrap break-words [text-decoration:inherit]"
  >
    {{ node.value }}<Caret v-if="showCaret" />
  </span>
</template>
