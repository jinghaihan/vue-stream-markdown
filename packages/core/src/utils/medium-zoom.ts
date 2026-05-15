import type {
  MediumZoomOutTransformInput,
  MediumZoomTransformInput,
  MediumZoomTransformResult,
} from '../types'

export function calculateMediumZoomTransforms({
  rect,
  naturalWidth,
  naturalHeight,
  viewportWidth,
  viewportHeight,
  margin,
}: MediumZoomTransformInput): MediumZoomTransformResult {
  const maxWidth = viewportWidth - margin * 2
  const maxHeight = viewportHeight - margin * 2
  const scaleX = Math.min(maxWidth / rect.width, naturalWidth / rect.width)
  const scaleY = Math.min(maxHeight / rect.height, naturalHeight / rect.height)
  const scale = Math.min(scaleX, scaleY, 1)
  const targetX = (viewportWidth - rect.width * scale) / 2
  const targetY = (viewportHeight - rect.height * scale) / 2
  const translateX = targetX - rect.left
  const translateY = targetY - rect.top

  return {
    initialTransform: 'translate3d(0, 0, 0) scale(1)',
    targetTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
  }
}

export function calculateMediumZoomOutTransform({
  originalRect,
  zoomRect,
  currentTransform,
}: MediumZoomOutTransformInput): string {
  const currentCenterX = zoomRect.left + zoomRect.width / 2
  const currentCenterY = zoomRect.top + zoomRect.height / 2
  const targetCenterX = originalRect.left + originalRect.width / 2
  const targetCenterY = originalRect.top + originalRect.height / 2
  const scale = Math.min(
    originalRect.width / zoomRect.width,
    originalRect.height / zoomRect.height,
  )
  const translateX = targetCenterX - currentCenterX
  const translateY = targetCenterY - currentCenterY

  if (currentTransform !== 'none') {
    try {
      const currentMatrix = new DOMMatrix(currentTransform)
      const inverseMatrix = currentMatrix.inverse()
      const point = new DOMPoint(translateX, translateY)
      const transformedPoint = point.matrixTransform(inverseMatrix)
      return `${currentTransform} translate3d(${transformedPoint.x}px, ${transformedPoint.y}px, 0) scale(${scale})`
    }
    catch {
      return `${currentTransform} translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
    }
  }

  return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
}
