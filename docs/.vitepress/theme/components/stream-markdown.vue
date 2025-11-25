<script setup lang="ts">
// @ts-expect-error ???
import IconButton from '@shared/components/icon-button.vue'
import { useData } from 'vitepress'
import { computed, defineComponent, h, ref } from 'vue'
// @ts-expect-error ???
import { Markdown } from 'vue-stream-markdown'

const props = withDefaults(defineProps<{
  mode?: 'streaming' | 'static'
  content?: string
  typingDelay?: number
}>(), {
  mode: 'static',
  content: '',
  typingDelay: 30,
})

const mode = ref<'streaming' | 'static'>(props.mode)

const playable = computed(() => props.mode === 'static')

const typingIndex = ref<number>(0)
const interval = ref<NodeJS.Timeout | null>(null)

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
  () => mode.value === 'streaming'
    ? 'i-lucide:circle-pause'
    : 'i-lucide:circle-play',
)

function generateIcon(icon: string) {
  return defineComponent({
    setup() {
      return () => h('i', { class: icon })
    },
  })
}

function toggle() {
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
</script>

<template>
  <div
    ref="containerRef"
    class="group min-h-4 relative"
    :style="{
      minHeight: minHeight ? `${minHeight}px` : undefined,
    }"
  >
    <div class="opacity-0 duration-300 absolute group-hover:opacity-100 hover:opacity-100 -left-9 -top-1">
      <IconButton
        v-if="playable"
        :name="name"
        :icon="generateIcon(icon)"
        :button-class="['rounded-full']"
        @click="toggle"
      />
    </div>

    <Markdown
      v-bind="$attrs"
      :mode="mode"
      :content="markdownContent"
      :is-dark="isDark"
      :shiki-options="{
        theme: ['kanagawa-lotus', 'kanagawa-dragon'],
      }"
    />
  </div>
</template>
