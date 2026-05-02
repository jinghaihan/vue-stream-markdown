import type { LinkNode, ParsedNode } from '@markmend/ast'
import type { LinkOptions, UIErrorVariant } from '../types'

export interface LinkModelOptions {
  node: LinkNode
  transformedUrl?: string | null
  isHardenUrl?: boolean
  linkOptions?: LinkOptions
  hasLoadingNode?: (nodes?: ParsedNode[]) => boolean
}

export interface LinkModel {
  url: string
  loading: boolean
  safetyCheck: boolean
  showLink: boolean
  showError: boolean
  errorVariant: UIErrorVariant
}

export function createLinkModel(options: LinkModelOptions): LinkModel {
  const url = options.node.url
  const loading = !!options.node.loading
    || !!options.hasLoadingNode?.(options.node.children)
    || !url
  const safetyCheck = options.linkOptions?.safetyCheck ?? true

  return {
    url,
    loading,
    safetyCheck,
    showLink: !options.isHardenUrl && typeof options.transformedUrl === 'string',
    showError: !!options.isHardenUrl,
    errorVariant: 'harden-link',
  }
}

export async function checkTrustedLink(
  url: string,
  linkOptions?: LinkOptions,
): Promise<boolean> {
  if (linkOptions?.safetyCheck === false)
    return true

  const isTrusted = linkOptions?.isTrusted
  if (typeof isTrusted !== 'function')
    return false

  return await Promise.resolve(isTrusted(url))
}
