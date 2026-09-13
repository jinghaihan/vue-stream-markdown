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

function assertKatexModule(
  module: unknown,
  source: string,
): asserts module is typeof import('katex') {
  const candidate = module as Partial<typeof import('katex')> | null
  const missing = [
    typeof candidate?.renderToString === 'function' ? undefined : 'renderToString',
  ].filter((name): name is string => !!name)

  if (missing.length > 0) {
    const exports = candidate && typeof candidate === 'object'
      ? Object.keys(candidate).sort().join(', ') || '(none)'
      : typeof candidate
    throw new Error(
      `[vue-stream-markdown] Invalid KaTeX module from ${source}. `
      + `Missing: ${missing.join(', ')}. `
      + `Received exports: ${exports}. Expected the KaTeX runtime API.`,
    )
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
    const katexImport = await cdnLoader.loadCdn() ?? await import('katex')
    const katexModule = katexImport.default && typeof katexImport.default === 'object'
      ? { ...katexImport, ...katexImport.default }
      : katexImport
    assertKatexModule(katexModule, cdnLoader.getCdnUrl() ?? 'the local "katex" package')
    return katexModule
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
