<script setup lang="ts">
import type { Component } from 'vue'
import IconButton from '@shared/components/icon-button.vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed, ref, useAttrs } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import CirclePause from '~icons/lucide/circle-pause'
import CirclePlay from '~icons/lucide/circle-play'
import SwatchBook from '~icons/lucide/swatch-book'

const props = withDefaults(defineProps<{
  mode?: 'streaming' | 'static'
  content?: string
  typingDelay?: number
}>(), {
  mode: 'static',
  content: '',
  typingDelay: 16,
})

const attrs = useAttrs()

const mode = ref<'streaming' | 'static'>(props.mode)

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

const codeOptions = computed(() => {
  if (attrs['code-options'])
    return attrs['code-options']

  const options = {
    languageIcon: !isMobile.value,
    languageName: !isMobile.value,
  }

  return {
    language: {
      mermaid: options,
      html: options,
    },
  }
})

const playable = computed(() => props.mode === 'static')

const typingIndex = ref<number>(0)
const interval = ref<ReturnType<typeof setInterval> | null>(null)

const containerRef = ref<HTMLDivElement>()
const minHeight = ref<number>()

const { isDark } = useData()

const markdownContent = computed(
  () => props.mode === 'streaming'
    ? props.content
    : mode.value === 'streaming'
      ? props.content.slice(0, typingIndex.value)
      : props.content,
)

const name = computed(
  () => mode.value === 'streaming'
    ? 'Stop Typing'
    : 'Start Typing',
)

const icon = computed(
  (): Component => mode.value === 'streaming' ? CirclePause : CirclePlay,
)

function toggle() {
  if (mode.value === 'streaming') {
    cleanup()
    return
  }

  // generate min height to avoid height jumping when toggling
  if (containerRef.value && mode.value === 'static') {
    const { height } = containerRef.value.getBoundingClientRect()
    minHeight.value = height
  }

  mode.value = mode.value === 'static' ? 'streaming' : 'static'
  typingIndex.value = 0

  if (mode.value === 'static') {
    cleanup()
    return
  }

  interval.value = setInterval(
    () => {
      typingIndex.value++
      if (typingIndex.value >= props.content.length)
        cleanup()
    },
    props.typingDelay,
  )
}

function cleanup() {
  interval.value && clearInterval(interval.value)
  mode.value = 'static'
  minHeight.value = undefined
}

const isMermaid = computed(() => props.content.includes('```mermaid'))
const mermaidRenderer = ref<'vanilla' | 'beautiful'>('vanilla')
function toggleMermaidRenderer() {
  mermaidRenderer.value = mermaidRenderer.value === 'vanilla' ? 'beautiful' : 'vanilla'
}
</script>

<template>
  <div
    ref="containerRef"
    class="group mt-4 min-h-4 relative"
    :style="{
      minHeight: minHeight ? `${minHeight}px` : undefined,
    }"
  >
    <Markdown
      v-bind="$attrs"
      locale="en-US"
      :mode="mode"
      :content="markdownContent"
      :is-dark="isDark"
      :shiki-options="{
        theme: ['github-light', 'github-dark'],
      }"
      :mermaid-options="{
        renderer: mermaidRenderer,
      }"
      :code-options="codeOptions"
    />

    <div class="opacity-0 flex gap-1 duration-300 absolute z-10 group-hover:opacity-100 hover:opacity-100 -left-4 -top-4">
      <IconButton
        v-if="playable"
        :name="name"
        :icon="icon"
        :button-class="['rounded-full', 'bg-background', 'p-1']"
        @click="() => toggle()"
      />
      <IconButton
        v-if="isMermaid"
        name="Change Renderer"
        :icon="SwatchBook"
        :button-class="['rounded-full', 'bg-background', 'p-1']"
        @click="() => toggleMermaidRenderer()"
      />
    </div>
  </div>
</template>
