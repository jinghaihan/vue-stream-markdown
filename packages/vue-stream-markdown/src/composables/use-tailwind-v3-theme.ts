import {
  getDocumentElement,
  readThemeVariables,
  resolveThemeElement,
} from '@stream-markdown/core'
import { useMutationObserver } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'

interface UseTailwindV3ThemeOptions {
  element?: () => HTMLElement | undefined
}

export function useTailwindV3Theme(options: UseTailwindV3ThemeOptions) {
  const cssVariables = ref<Record<string, string>>({})
  const element = computed((): HTMLElement | undefined => {
    return resolveThemeElement(options.element)
  })

  function generateCSS() {
    cssVariables.value = readThemeVariables(element.value)
  }

  watchEffect(generateCSS)
  const { stop } = useMutationObserver(
    () => {
      const documentElement = getDocumentElement()
      return element.value && documentElement ? [element.value, documentElement] : []
    },
    generateCSS,
    {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: false,
    },
  )

  return {
    element,
    cssVariables,
    generateCSS,
    stop,
  }
}
