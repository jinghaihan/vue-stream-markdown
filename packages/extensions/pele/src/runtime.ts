import type { MermaidExtensionRenderResult, MermaidRenderInput } from '@stream-markdown/core'
import type { PeleExtensionOptions } from './types'
import { resolveGetter } from '@stream-markdown/core'
import { detectType } from 'pele/lazy'
import { createPeleCdnLoader } from './cdn'
import { getPeleStyle } from './theme'

let diagramId = 0

export function createPeleRuntime(options: Pick<PeleExtensionOptions, 'cdnOptions' | 'colors'>) {
  const { getRenderer, dispose } = createPeleCdnLoader(options.cdnOptions)

  function supports(code: string) {
    try {
      return detectType(code) !== null
    }
    catch {
      return false
    }
  }

  return {
    // Pele loads each diagram type on demand and shares the loaded modules.
    preload() {},
    dispose,
    supports,
    async render({ code, isDark, theme }: MermaidRenderInput): Promise<MermaidExtensionRenderResult> {
      if (!supports(code))
        return { supported: false, valid: false }

      try {
        const render = await getRenderer()
        const { svg } = await render(code, {
          idPrefix: `stream-markdown-pele-${++diagramId}`,
          responsive: false,
        })
        const style = getPeleStyle(isDark, theme, resolveGetter(options.colors))
        const themedSvg = svg.replace(/^(<svg\b[^>]*?\sstyle=")/, `$1${style}`)
        return { supported: true, svg: themedSvg, valid: true }
      }
      catch (error) {
        return {
          supported: true,
          valid: false,
          error: error instanceof Error
            ? error.message
            : String(error),
        }
      }
    },
  }
}
