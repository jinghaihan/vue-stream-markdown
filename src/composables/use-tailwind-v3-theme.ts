import { useMutationObserver } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { SHADCN_SCHEMAS } from '../constants'
import { isClient } from '../utils'

const reg = /^(?:hsl|rgb|oklch|lab|lch)\(/

interface UseTailwindV3ThemeOptions {
  element?: () => HTMLElement | undefined
}

export function useTailwindV3Theme(options: UseTailwindV3ThemeOptions) {
  const cssVariables = ref<Record<string, string>>({})
  const element = computed((): HTMLElement | undefined => {
    if (!isClient())
      return
    const el = typeof options.element === 'function' ? options.element() : null
    return el || document.body
  })

  function generateCSS() {
    if (!isClient() || !element.value)
      return

    const computedStyle = window.getComputedStyle(element.value)
    const variables: Record<string, string> = {}

    for (const schema of SHADCN_SCHEMAS) {
      const name = `--${schema}`
      const value = computedStyle.getPropertyValue(name).trim()

      if (value && !reg.test(value))
        variables[name] = `hsl(${value})`
    }

    if (Object.keys(variables).length > 0)
      cssVariables.value = variables
    else
      cssVariables.value = {}
  }

  watchEffect(generateCSS)
  const { stop } = useMutationObserver(
    () => element.value ? [element.value, document.documentElement] : [],
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
