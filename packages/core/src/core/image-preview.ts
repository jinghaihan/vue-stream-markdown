import type { ControlDescriptor, UIStyleValue, ZoomControlPosition } from '../types'
import { getConfigValue, isConfigEnabled } from '../utils'

export interface ImagePreviewTransformState {
  scaleX: number
  scaleY: number
  rotate: number
}

export interface ImagePreviewIconAvailability {
  arrowRight?: boolean
  flipVertical?: boolean
  rotateRight?: boolean
}

export interface ImagePreviewModelOptions {
  sources?: string[]
  src?: string
  controls?: unknown
  transformHardenUrl?: (url: string) => string | null
  hasDownload?: boolean
  preview?: boolean
  loaded?: boolean
  hasElement?: boolean
  state?: Partial<ImagePreviewTransformState>
  icons?: ImagePreviewIconAvailability
  elementStyle?: UIStyleValue
}

export type ImagePreviewControlKey
  = | 'download'
    | 'previous'
    | 'next'
    | 'flipX'
    | 'flipY'
    | 'rotateLeft'
    | 'rotateRight'

export interface ImagePreviewControlDescriptor extends ControlDescriptor {
  key: ImagePreviewControlKey
}

const DEFAULT_IMAGE_PREVIEW_TRANSFORM_STATE: ImagePreviewTransformState = {
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
}

export function createImagePreviewSources(
  sources: string[] = [],
  transformHardenUrl?: (url: string) => string | null,
): string[] {
  const resolved: string[] = []
  const seen = new Set<string>()

  sources.forEach((url) => {
    const transformed = transformHardenUrl ? transformHardenUrl(url) : url
    if (!transformed || seen.has(url))
      return

    seen.add(url)
    resolved.push(url)
  })

  return resolved
}

export function resolveImageControlPosition(controls: unknown): ZoomControlPosition {
  const position = getConfigValue<ZoomControlPosition | boolean>(controls, 'image.controlPosition')
  if (typeof position === 'string')
    return position
  return 'bottom-center'
}

export function createImagePreviewTransformState(
  state: Partial<ImagePreviewTransformState> = {},
): ImagePreviewTransformState {
  return {
    ...DEFAULT_IMAGE_PREVIEW_TRANSFORM_STATE,
    ...state,
  }
}

export function flipImagePreviewHorizontal(
  state: ImagePreviewTransformState,
): ImagePreviewTransformState {
  return {
    ...state,
    scaleX: state.scaleX * -1,
  }
}

export function flipImagePreviewVertical(
  state: ImagePreviewTransformState,
): ImagePreviewTransformState {
  return {
    ...state,
    scaleY: state.scaleY * -1,
  }
}

export function rotateImagePreviewLeft(
  state: ImagePreviewTransformState,
): ImagePreviewTransformState {
  return {
    ...state,
    rotate: state.rotate - 90,
  }
}

export function rotateImagePreviewRight(
  state: ImagePreviewTransformState,
): ImagePreviewTransformState {
  return {
    ...state,
    rotate: state.rotate + 90,
  }
}

export function resetImagePreviewTransformState(): ImagePreviewTransformState {
  return { ...DEFAULT_IMAGE_PREVIEW_TRANSFORM_STATE }
}

export function createImagePreviewTransformStyle(
  state: Partial<ImagePreviewTransformState> = {},
  elementStyle: UIStyleValue = {},
): UIStyleValue {
  const resolvedState = createImagePreviewTransformState(state)
  return {
    transform: `scaleX(${resolvedState.scaleX}) scaleY(${resolvedState.scaleY}) rotate(${resolvedState.rotate}deg)`,
    transition: 'transform 0.3s ease',
    ...elementStyle,
  }
}

export function createImagePreviewControlDescriptors(
  options: Pick<
    ImagePreviewModelOptions,
    'controls' | 'hasDownload' | 'icons'
  > & {
    imageCount?: number
    imageSrc?: string
  },
): ImagePreviewControlDescriptor[] {
  const enableDownload = isConfigEnabled(options.controls, 'image.download') && !!options.hasDownload
  const enableCarousel = isConfigEnabled(options.controls, 'image.carousel')
  const enableFlip = isConfigEnabled(options.controls, 'image.flip')
  const enableRotate = isConfigEnabled(options.controls, 'image.rotate')
  const imageCount = options.imageCount ?? 0

  return [
    {
      key: 'download',
      icon: 'download',
      labelKey: 'button.download',
      visible: !!options.imageSrc && enableDownload,
    },
    {
      key: 'previous',
      icon: 'arrowLeft',
      labelKey: 'button.previous',
      visible: imageCount > 1 && enableCarousel,
    },
    {
      key: 'next',
      icon: options.icons?.arrowRight ? 'arrowRight' : 'arrowLeft',
      labelKey: 'button.next',
      buttonStyle: options.icons?.arrowRight
        ? undefined
        : { transform: 'scaleX(-1)' },
      visible: imageCount > 1 && enableCarousel,
    },
    {
      key: 'flipX',
      icon: 'flipHorizontal',
      labelKey: 'button.flipX',
      visible: enableFlip,
    },
    {
      key: 'flipY',
      icon: options.icons?.flipVertical ? 'flipVertical' : 'flipHorizontal',
      labelKey: 'button.flipY',
      buttonStyle: options.icons?.flipVertical
        ? undefined
        : { rotate: '90deg' },
      visible: enableFlip,
    },
    {
      key: 'rotateLeft',
      icon: 'rotateLeft',
      labelKey: 'button.rotateLeft',
      visible: enableRotate,
    },
    {
      key: 'rotateRight',
      icon: options.icons?.rotateRight ? 'rotateRight' : 'rotateLeft',
      labelKey: 'button.rotateRight',
      buttonStyle: options.icons?.rotateRight
        ? undefined
        : { transform: 'scaleX(-1)' },
      visible: enableRotate,
    },
  ]
}

export function createImagePreviewModel(options: ImagePreviewModelOptions) {
  const sources = createImagePreviewSources(options.sources, options.transformHardenUrl)
  const state = createImagePreviewTransformState(options.state)

  return {
    sources,
    controlPosition: resolveImageControlPosition(options.controls),
    canOpen: !!options.preview && !!options.loaded && !!options.hasElement,
    transformState: state,
    imageStyle: createImagePreviewTransformStyle(state, options.elementStyle),
    controls: createImagePreviewControlDescriptors({
      controls: options.controls,
      hasDownload: options.hasDownload,
      icons: options.icons,
      imageCount: sources.length,
      imageSrc: options.src,
    }),
  }
}
