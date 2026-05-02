<script setup lang="ts">
import type { TextNodeRendererProps } from '../../types'
import { createTextParts, getTransitionName } from '@stream-markdown/shared'
import { computed } from 'vue'
import { useContext } from '../../composables'
import Caret from '../caret.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextNodeRendererProps>(), {})

const { enableAnimate, animation } = useContext()

const loading = computed(() => props.node.loading)
const showCaret = computed(() => loading.value && !props.hideCaret)
const shouldAnimate = computed(() => enableAnimate.value && props.node.value.trim().length > 0)
const transitionName = computed(() => getTransitionName(animation.value))

const parts = computed(() => createTextParts(props.node.value, props.nodeKey))
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
