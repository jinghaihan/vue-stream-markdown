import type { KatexRuntime, MathRuntimeOptions, RenderMathOptions } from './types'
import { createKatexCdnLoader } from './cdn'

async function hasBundledKatexModule() {
  try {
    await import('katex')
    return true
  }
  catch {
    return false
  }
}

export function createKatexRuntime(options: MathRuntimeOptions = {}): KatexRuntime {
  const cdnLoader = createKatexCdnLoader({
    cdnOptions: options.cdnOptions,
  })

  async function hasKatex() {
    return cdnLoader.getCdnUrl() ? true : await hasBundledKatexModule()
  }

  async function getKatex(): Promise<typeof import('katex')> {
    return await cdnLoader.loadCdn() ?? await import('katex')
  }

  async function renderToHtml(code: string, options?: RenderMathOptions) {
    const { renderToString } = await getKatex()

    try {
      const html = renderToString(code, {
        output: 'html',
        strict: 'ignore',
        ...(options?.config ?? {}),
        displayMode: options?.displayMode,
      })

      return { html }
    }
    catch (error) {
      return { error: (error as Error).message }
    }
  }

  async function preload() {
    if (await hasKatex())
      await getKatex()
  }

  return {
    installed: hasKatex(),
    preload,
    dispose: () => {},
    ensureCss: () => cdnLoader.loadCss(),
    getKatex,
    renderToHtml,
  }
}
