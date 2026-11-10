import type { PeleExtensionOptions } from './types'
import { dynamicImport, isClient, removeTrailingSlash, resolveGetter, stripVersionRangePrefix } from '@stream-markdown/core'
import { renderAsync } from 'pele/lazy'
import { dependencies } from '../package.json'

type PeleRenderer = typeof renderAsync | typeof import('pele/lazy').render
type PeleCdnModule = Partial<Pick<typeof import('pele/lazy'), 'renderAsync' | 'render'>>

const PELE_VERSION = stripVersionRangePrefix(dependencies.pele)

export function createPeleCdnLoader(options: PeleExtensionOptions['cdnOptions']) {
  let cdnRenderer: { url: string, promise: Promise<PeleRenderer> } | undefined

  function getRenderer(): PeleRenderer | Promise<PeleRenderer> {
    const cdnOptions = resolveGetter(options)
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

  return {
    getRenderer,
    dispose() {
      cdnRenderer = undefined
    },
  }
}
