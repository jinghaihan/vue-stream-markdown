import type { MaybeRefOrGetter } from 'vue'
import {
  getDocumentElement,
  readThemeVariables,
  resolveThemeElement,
} from '@stream-markdown/core'
import { useMutationObserver } from '@vueuse/core'
import { computed, ref, toValue, watchEffect } from 'vue'

interface UseTailwindV3ThemeOptions {
  element?: () => HTMLElement | undefined
  enabled?: MaybeRefOrGetter<boolean>
}

interface ThemeVariablesCacheEntry {
  signature: string
  variables: Record<string, string>
}

const themeVariablesCache = new WeakMap<HTMLElement, ThemeVariablesCacheEntry>()

function getThemeSignature(element: HTMLElement): string {
  const documentElement = getDocumentElement()
  return [
    element.getAttribute('class'),
    element.getAttribute('style'),
    documentElement === element ? null : documentElement?.getAttribute('class'),
    documentElement === element ? null : documentElement?.getAttribute('style'),
  ].join('\0')
}

function resolveCachedThemeVariables(element: HTMLElement): Record<string, string> {
  const signature = getThemeSignature(element)
  const cached = themeVariablesCache.get(element)
  if (cached?.signature === signature)
    return cached.variables

  const variables = readThemeVariables(element)
  themeVariablesCache.set(element, { signature, variables })
  return variables
}

export function useTailwindV3Theme(options: UseTailwindV3ThemeOptions) {
  const cssVariables = ref<Record<string, string>>({})
  const element = computed((): HTMLElement | undefined => {
    if (toValue(options.enabled) === false)
      return undefined
    return resolveThemeElement(options.element)
  })

  function generateCSS() {
    const themeElement = element.value
    cssVariables.value = themeElement
      ? resolveCachedThemeVariables(themeElement)
      : {}
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
