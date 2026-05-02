import type { ImageNode } from '@markmend/ast'
import type { ImageOptions } from '../types'

export interface ImageModelOptions<TComponent = unknown> {
  node: ImageNode
  imageOptions?: ImageOptions<TComponent>
  fallbackAttempted?: boolean
  imageLoaded?: boolean
  isHardenUrl?: boolean
  loadError?: boolean
}

export function createImageModel<TComponent = unknown>(options: ImageModelOptions<TComponent>) {
  const isLoading = !!options.node.loading || !options.node.url
  const fallback = options.imageOptions?.fallback ?? ''
  const imageSrc = options.fallbackAttempted && fallback ? fallback : options.node.url
  const alt = String(options.node.alt ?? options.node.title ?? '')
  const title = String(options.node.title ?? options.node.alt ?? '')
  const showCaption = (typeof options.imageOptions?.caption === 'boolean' ? options.imageOptions.caption : true)
    && !isLoading
    && !!title

  return {
    isLoading,
    fallback,
    imageSrc,
    alt,
    title,
    showCaption,
    figureWidth: isLoading || !options.imageLoaded ? '100%' : 'auto',
    showSpin: (isLoading || !options.imageLoaded) && !options.isHardenUrl,
    showImage: !isLoading && !options.isHardenUrl,
    showError: !!options.isHardenUrl || !!options.loadError,
    errorVariant: options.isHardenUrl ? 'harden-image' : 'image',
  } as const
}
