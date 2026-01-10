import type { KatexOptions } from 'katex'
import type { CdnOptions } from '../types'
import { ref } from 'vue'
import { hasKatexModule, isClient } from '../utils'
import { useCdnLoader } from './use-cdn-loader'

interface UseKatexOptions {
  cdnOptions?: CdnOptions
}

let existingKatex: boolean = false

export function useKatex(options: UseKatexOptions) {
  const { cdnOptions } = options ?? {}

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

  async function preload() {
    if (!isClient())
      return

    if (await hasKatex()) {
      // Because `katex.min.css` is not included in the bundle, you need to import it manually when not using CDN.
      // If using CDN, the CSS file will be automatically loaded.
      loadCdnKatexCss()
    }
  }

  function dispose() {

  }

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
  }
}
