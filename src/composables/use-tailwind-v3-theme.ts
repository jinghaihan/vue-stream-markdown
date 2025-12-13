import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import { useStyleTag } from '@vueuse/core'
import { computed, onBeforeUnmount, toValue, unref, watchEffect } from 'vue'
import { SHADCN_SCHEMAS } from '../constants'
import { isClient } from '../utils'

const reg = /^(?:hsl|rgb|oklch|lab|lch)\(/

interface UseTailwindV3ThemeOptions {
  element?: MaybeRefOrGetter<HTMLElement | undefined>
  styleScope?: MaybeRef<string>
}

export function useTailwindV3Theme(options: UseTailwindV3ThemeOptions) {
  const { id, css, load, unload, isLoaded } = useStyleTag('', {
    id: 'stream-markdown-tailwind-v3-theme',
    immediate: false,
  })

  const styleScope = computed(() => unref(options.styleScope) || '.stream-markdown')

  const element = computed((): Element | undefined => {
    const el = toValue(options.element)
    return el || (isClient() ? document.body : undefined)
  })

  function generateCSS() {
    if (!element.value || !isClient())
      return

    const computedStyle = window.getComputedStyle(element.value)
    const cssVariables: string[] = []

    for (const schema of SHADCN_SCHEMAS) {
      const name = `--${schema}`
      const value = computedStyle.getPropertyValue(name).trim()

      if (value && !reg.test(value))
        cssVariables.push(`  ${name}: hsl(${value});`)
    }

    if (cssVariables.length > 0) {
      css.value = `${styleScope.value} {\n${cssVariables.join('\n')}\n}`
      load()
    }
    else {
      css.value = ''
      unload()
    }
  }

  watchEffect(generateCSS)

  onBeforeUnmount(unload)

  return {
    element,
    id,
    css,
    load,
    unload,
    isLoaded,
    generateCSS,
  }
}
