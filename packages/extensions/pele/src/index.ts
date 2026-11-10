import type { MaybeGetter, MermaidExtension, SharedCdnOptions } from '@stream-markdown/core'
import type { PeleColors } from './theme'
import { dynamicImport, isClient, removeTrailingSlash, resolveGetter, stripVersionRangePrefix } from '@stream-markdown/core'
import { detectType, renderAsync } from 'pele/lazy'
import { dependencies } from '../package.json'
import { getPeleStyle } from './theme'

export type { PeleColors } from './theme'

export interface PeleExtensionOptions<TErrorComponent = never> {
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  /** Override the diagram palette with hex colors. */
  colors?: MaybeGetter<PeleColors | undefined>
  errorComponent?: TErrorComponent
}

type PeleRenderer = typeof renderAsync | typeof import('pele/lazy').render
type PeleCdnModule = Partial<Pick<typeof import('pele/lazy'), 'renderAsync' | 'render'>>

const PELE_VERSION = stripVersionRangePrefix(dependencies.pele)
let diagramId = 0

export function pele<TErrorComponent = never>(
  options: PeleExtensionOptions<TErrorComponent> = {},
): MermaidExtension<TErrorComponent> {
  let cdnRenderer: { url: string, promise: Promise<PeleRenderer> } | undefined

  function getRenderer(): PeleRenderer | Promise<PeleRenderer> {
    const cdnOptions = resolveGetter(options.cdnOptions)
    if (!isClient() || cdnOptions?.pele === false)
      return renderAsync

    const baseUrl = cdnOptions?.baseUrl
    const url = cdnOptions?.getUrl?.('pele', PELE_VERSION)
      ?? (baseUrl ? `${removeTrailingSlash(baseUrl)}/pele@${PELE_VERSION}/dist/esm/lazy.js` : undefined)
    if (!url)
      return renderAsync

    if (cdnRenderer?.url !== url) {
      const promise = dynamicImport<PeleCdnModule>(url).then((module) => {
        if (typeof module.renderAsync === 'function')
          return module.renderAsync
        if (typeof module.render === 'function')
          return module.render
        throw new Error(`[vue-stream-markdown] Invalid Pele module from ${url}. Expected renderAsync or render.`)
      }).catch((error) => {
        if (cdnRenderer?.promise === promise)
          cdnRenderer = undefined
        throw error
      })
      cdnRenderer = { url, promise }
    }
    return cdnRenderer.promise
  }

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
    dispose() {
      cdnRenderer = undefined
    },
    supports,
    async render({ code, isDark, theme }) {
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
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },
  }
}
