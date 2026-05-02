import type { MediumZoomTransformInput } from '../types'
import { calculateMediumZoomOutTransform, calculateMediumZoomTransforms } from '../utils'
import { getDocumentBody } from './dom'

export function cloneMediumZoomElement(original: HTMLElement): HTMLElement {
  const cloned = original.cloneNode(true) as HTMLElement
  const rect = original.getBoundingClientRect()

  Object.assign(cloned.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    padding: '0',
    pointerEvents: 'none',
    zIndex: '10000',
    willChange: 'transform',
    transformOrigin: 'top left',
  })

  if (original instanceof HTMLImageElement && cloned instanceof HTMLImageElement && original.currentSrc)
    cloned.src = original.currentSrc

  return cloned
}

export function mountMediumZoomClone(cloned: HTMLElement, container?: HTMLElement): boolean {
  const target = container ?? getDocumentBody()
  if (!target)
    return false

  target.appendChild(cloned)
  return true
}

export function unmountMediumZoomClone(cloned: HTMLElement) {
  if (cloned.parentNode)
    cloned.parentNode.removeChild(cloned)
}

export function setMediumZoomOriginalVisibility(original: HTMLElement, visible: boolean) {
  original.style.visibility = visible ? 'visible' : 'hidden'
}

export function readMediumZoomElementTransform(element: HTMLElement): string {
  const view = element.ownerDocument.defaultView
  if (!view)
    return 'none'

  return view.getComputedStyle(element).transform || 'none'
}

export function calculateMediumZoomInTransforms(options: {
  original: HTMLElement
  cloned: HTMLElement
  margin: number
}): ReturnType<typeof calculateMediumZoomTransforms> {
  const rect = options.original.getBoundingClientRect()
  const naturalWidth = (options.original as HTMLImageElement).naturalWidth || rect.width
  const naturalHeight = (options.original as HTMLImageElement).naturalHeight || rect.height

  return calculateMediumZoomTransforms({
    rect,
    naturalWidth,
    naturalHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    margin: options.margin,
  } satisfies MediumZoomTransformInput)
}

export function prepareMediumZoomInClone(cloned: HTMLElement, initialTransform: string) {
  cloned.style.transform = initialTransform
  cloned.style.transition = 'none'
}

export function playMediumZoomInClone(cloned: HTMLElement, targetTransform: string) {
  cloned.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
  cloned.style.transform = targetTransform
}

export function prepareMediumZoomOutClone(options: {
  cloned: HTMLElement
  zoomElement: HTMLElement
  currentTransform: string
}) {
  const zoomRect = options.zoomElement.getBoundingClientRect()

  options.cloned.style.top = `${zoomRect.top}px`
  options.cloned.style.left = `${zoomRect.left}px`
  options.cloned.style.width = `${zoomRect.width}px`
  options.cloned.style.height = `${zoomRect.height}px`
  options.cloned.style.transform = options.currentTransform !== 'none'
    ? options.currentTransform
    : 'translate3d(0, 0, 0) scale(1)'
  options.cloned.style.transformOrigin = 'center center'
  options.cloned.style.transition = 'none'
}

export function playMediumZoomOutClone(options: {
  cloned: HTMLElement
  original: HTMLElement
  zoomElement: HTMLElement
  currentTransform: string
}) {
  options.cloned.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
  options.cloned.style.transform = calculateMediumZoomOutTransform({
    originalRect: options.original.getBoundingClientRect(),
    zoomRect: options.zoomElement.getBoundingClientRect(),
    currentTransform: options.currentTransform,
  })
}
