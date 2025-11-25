import type { KatexOptions } from 'katex'
import { ref } from 'vue'
import { hasKatex } from '../utils'

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
    if (await hasKatex())
      import('katex/dist/katex.min.css')
  }

  function dispose() {

  }

  (async () => {
    if (existingKatex === true) {
      installed.value = true
      return
    }

    installed.value = await hasKatex()
    existingKatex = installed.value
  })()

  return {
    installed,
    render,
    preload,
    dispose,
  }
}
