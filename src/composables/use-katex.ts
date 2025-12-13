import type { KatexOptions } from 'katex'
import { ref } from 'vue'
import { hasKatex, isClient } from '../utils'

let existingKatex: boolean = false

export function useKatex() {
  const installed = ref<boolean>(false)

  async function render(code: string, options: KatexOptions = {}): Promise<{
    html?: string
    error?: string
  }> {
    const { renderToString } = await import('katex')
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
      // Dynamically import CSS only in client environment
      // Using a function to prevent Vite from analyzing this import during SSR
      const loadCSS = async () => {
        if (isClient())
          await import('katex/dist/katex.min.css')
      }
      await loadCSS()
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
