<script setup lang="ts">
import type { ExtensionRuntime } from '@stream-markdown/core'
import type { MarkdownProviderProps } from './types'
import { computed, onBeforeUnmount, onMounted, toRefs } from 'vue'
import {
  useDarkDetector,
  useTailwindV3Theme,
} from './composables'
import { provideMarkdownProvider } from './composables/use-provider'

const props = withDefaults(defineProps<MarkdownProviderProps>(), {
  isDark: undefined,
})

const { extensions, isDark: darkProp } = toRefs(props)
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
