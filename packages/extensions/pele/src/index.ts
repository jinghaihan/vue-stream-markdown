import type { MaybeGetter, MermaidExtension } from '@stream-markdown/core'
import type { PeleColors } from './theme'
import { resolveGetter } from '@stream-markdown/core'
import { detectType, renderAsync } from 'pele/lazy'
import { getPeleStyle } from './theme'

export type { PeleColors } from './theme'

export interface PeleExtensionOptions<TErrorComponent = never> {
  /** Override the diagram palette with hex colors. */
  colors?: MaybeGetter<PeleColors | undefined>
  errorComponent?: TErrorComponent
}

let diagramId = 0

export function pele<TErrorComponent = never>(
  options: PeleExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  function supports(code: string) {
    try {
      return detectType(code) !== null
    }
    catch {
      return false
    }
  }

  return {
    errorComponent: options.errorComponent,
    // Pele loads each diagram type on demand and shares the loaded modules.
    preload() {},
    dispose() {},
    supports,
    async render({ code, isDark, theme }) {
      if (!supports(code))
        return { supported: false, valid: false }

      try {
        const { svg } = await renderAsync(code, {
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
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },
  }
}
