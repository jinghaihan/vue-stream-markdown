import type { KatexOptions } from 'katex'
import type { MaybeRef } from 'vue'
import type { CdnOptions, MdastOptions } from '../types'
import { checkMathSyntax } from 'markmend'
import { computed, ref, unref, watch } from 'vue'
import { hasKatexModule, isClient } from '../utils'
import { useCdnLoader } from './use-cdn-loader'

interface UseKatexOptions {
  markdown?: MaybeRef<string>
  mdastOptions?: MdastOptions
  cdnOptions?: CdnOptions
}

let existingKatex: boolean = false

export function useKatex(options: UseKatexOptions) {
  const { mdastOptions, cdnOptions } = options ?? {}

  const markdownContent = computed(() => unref(options.markdown) ?? '')
  const hasMathPlugin = mdastOptions?.builtin?.micromark?.math !== false
  const singleDollarTextMath = mdastOptions?.singleDollarTextMath === true
  const hasMathSyntax = computed(() => checkMathSyntax(markdownContent.value, singleDollarTextMath))

  const { getCdnKatexUrl, loadCdnKatex, loadCdnKatexCss } = useCdnLoader({ cdnOptions })

  const installed = ref<boolean>(false)

  async function getKatex(): Promise<typeof import('katex')> {
    return await loadCdnKatex() ?? await import('katex')
  }

  async function hasKatex(): Promise<boolean> {
    return getCdnKatexUrl() ? true : await hasKatexModule()
  }

  async function render(code: string, options: KatexOptions = {}): Promise<{
    html?: string
    error?: string
  }> {
    const { renderToString } = await getKatex()
    try {
      const html = renderToString(code, {
        output: 'html',
        strict: 'ignore',
        ...options,
      })
      return { html }
    }
    catch (error) {
      return { error: (error as Error).message }
    }
  }

  async function preload() {}

  function dispose() {}

  watch(
    () => hasMathSyntax.value,
    (hasMathSyntax) => {
      if (hasMathSyntax && hasMathPlugin)
        // Because `katex.min.css` is not included in the bundle, you need to import it manually when not using CDN.
        // When using CDN, the CSS file will be automatically loaded when detected math syntax.
        loadCdnKatexCss()
    },
    { immediate: true },
  )

  if (isClient()) {
    (async () => {
      if (existingKatex === true) {
        installed.value = true
        return
      }

      installed.value = await hasKatex()
      existingKatex = installed.value
    })()
  }

  return {
    installed,
    render,
    preload,
    dispose,
    loadCdnKatexCss,
  }
}
