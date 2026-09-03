<script setup lang="ts">
import type { ExtensionRuntime } from '@stream-markdown/core'
import type { PropType } from 'vue'
import type { Extensions, MarkdownProviderProps } from './types'
import { computed, onBeforeUnmount, onMounted, toRef } from 'vue'
import {
  provideMarkdownProvider,
  useDarkDetector,
  useTailwindV3Theme,
} from './composables'

const props = defineProps({
  extensions: Object as PropType<Extensions>,
  isDark: {
    type: Boolean,
    default: undefined,
  },
  themeElement: Function as PropType<MarkdownProviderProps['themeElement']>,
})

const extensions = toRef(props, 'extensions')
const darkProp = toRef(props, 'isDark')
const { cssVariables, stop: stopTailwindV3ThemeObserver } = useTailwindV3Theme({
  element: props.themeElement,
})
const { isDark, stop: stopDarkModeObserver } = useDarkDetector(darkProp, cssVariables)

provideMarkdownProvider({
  cssVariables,
  extensions: computed(() => extensions.value),
  isDark,
})

let ownedExtensions: ExtensionRuntime[] = []

async function preloadExtensions() {
  ownedExtensions = Object.values(extensions.value ?? {})
  await Promise.all(ownedExtensions.map(extension => extension.preload()))
}

onMounted(preloadExtensions)

onBeforeUnmount(() => {
  for (const extension of ownedExtensions)
    void extension.dispose()

  stopTailwindV3ThemeObserver()
  stopDarkModeObserver()
})
</script>

<template>
  <slot />
</template>
