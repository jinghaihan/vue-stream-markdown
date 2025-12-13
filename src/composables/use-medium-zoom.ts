import type { MaybeRef } from 'vue'
import { computed, nextTick, ref, unref } from 'vue'
import { isClient } from '../utils'

interface UseMediumZoomOptions {
  margin?: MaybeRef<number>
  open?: () => void
  close?: () => void
}

export function useMediumZoom(options: UseMediumZoomOptions) {
  const margin = computed(() => unref(options.margin) ?? 0)

  const elementRef = ref<HTMLElement>()
  const clonedElementRef = ref<HTMLElement>()
  const zoomElementRef = ref<HTMLElement>()

  const isAnimating = ref<boolean>(false)
  const showClonedElement = ref<boolean>(false)

  const initialTransform = ref<string>('')
  const targetTransform = ref<string>('')

  const elementStyle = computed(() => {
    if (!isClient())
      return { opacity: 1 }

    return {
      opacity: showClonedElement.value ? 0 : 1,
    }
  })

  function cloneElement() {
    const original = elementRef.value
    if (!original)
      return

    const cloned = original.cloneNode(true) as HTMLImageElement
    const rect = original.getBoundingClientRect()

    cloned.style.position = 'fixed'
    cloned.style.top = `${rect.top}px`
    cloned.style.left = `${rect.left}px`
    cloned.style.width = `${rect.width}px`
    cloned.style.height = `${rect.height}px`
    cloned.style.margin = '0'
    cloned.style.padding = '0'
    cloned.style.pointerEvents = 'none'
    cloned.style.zIndex = '10000'
    cloned.style.willChange = 'transform'
    cloned.style.transformOrigin = 'top left'

    // For images, we can use the currentSrc property to get the original source
    if (original instanceof HTMLImageElement && original.currentSrc)
      cloned.src = original.currentSrc

    return cloned
  }

  function calculateTransforms() {
    const original = elementRef.value
    if (!original || !clonedElementRef.value)
      return

    const rect = original.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const naturalWidth = (original as HTMLImageElement).naturalWidth || rect.width
    const naturalHeight = (original as HTMLImageElement).naturalHeight || rect.height

    const maxWidth = viewportWidth - margin.value * 2
    const maxHeight = viewportHeight - margin.value * 2

    const scaleX = Math.min(maxWidth / rect.width, naturalWidth / rect.width)
    const scaleY = Math.min(maxHeight / rect.height, naturalHeight / rect.height)

    const scale = Math.min(scaleX, scaleY, 1)
    const targetX = (viewportWidth - rect.width * scale) / 2
    const targetY = (viewportHeight - rect.height * scale) / 2

    const translateX = targetX - rect.left
    const translateY = targetY - rect.top

    initialTransform.value = `translate3d(0, 0, 0) scale(1)`
    targetTransform.value = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
  }

  async function zoomIn() {
    const el = elementRef.value
    if (!el)
      return

    const cloned = cloneElement()
    if (!cloned)
      return

    el.style.visibility = 'hidden'

    document.body.appendChild(cloned)
    clonedElementRef.value = cloned
    showClonedElement.value = true

    await nextTick()

    calculateTransforms()

    if (clonedElementRef.value) {
      clonedElementRef.value.style.transform = initialTransform.value
      clonedElementRef.value.style.transition = 'none'
    }

    void clonedElementRef.value?.offsetHeight

    await nextTick()

    isAnimating.value = true
    if (clonedElementRef.value) {
      clonedElementRef.value.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
      clonedElementRef.value.style.transform = targetTransform.value
    }

    options.open?.()

    const handleAnimationEnd = () => {
      isAnimating.value = false
      if (clonedElementRef.value)
        clonedElementRef.value.style.opacity = '0'

      showClonedElement.value = false
      cloned.removeEventListener('transitionend', handleAnimationEnd)
    }
    cloned.addEventListener('transitionend', handleAnimationEnd, { once: true })
  }

  async function zoomOut() {
    if (!clonedElementRef.value) {
      options.close?.()
      return
    }

    await nextTick()

    showClonedElement.value = true
    if (clonedElementRef.value)
      clonedElementRef.value.style.opacity = '1'

    await nextTick()

    if (!clonedElementRef.value)
      return

    const el = elementRef.value
    const zoomEl = zoomElementRef.value
    if (!el || !zoomEl)
      return

    const originalRect = el.getBoundingClientRect()
    const zoomRect = zoomEl.getBoundingClientRect()
    const cloned = clonedElementRef.value

    // Get the computed transform of the zoomed element
    const computedStyle = window.getComputedStyle(zoomEl)
    const currentTransform = computedStyle.transform || 'none'

    // Calculate centers in viewport coordinates
    const currentCenterX = zoomRect.left + zoomRect.width / 2
    const currentCenterY = zoomRect.top + zoomRect.height / 2
    const targetCenterX = originalRect.left + originalRect.width / 2
    const targetCenterY = originalRect.top + originalRect.height / 2

    // Calculate scale from current zoomed size to original size
    const scale = Math.min(
      originalRect.width / zoomRect.width,
      originalRect.height / zoomRect.height,
    )

    // Set up cloned element to match current zoomed state
    cloned.style.top = `${zoomRect.top}px`
    cloned.style.left = `${zoomRect.left}px`
    cloned.style.width = `${zoomRect.width}px`
    cloned.style.height = `${zoomRect.height}px`

    // Apply the current transform to match the visual state
    cloned.style.transform = currentTransform !== 'none'
      ? currentTransform
      : 'translate3d(0, 0, 0) scale(1)'
    cloned.style.transformOrigin = 'center center'
    cloned.style.transition = 'none'

    // Force reflow
    void cloned.offsetHeight

    await nextTick()

    isAnimating.value = true

    // Calculate translation in viewport coordinates
    const translateX = targetCenterX - currentCenterX
    const translateY = targetCenterY - currentCenterY

    cloned.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'

    if (currentTransform !== 'none') {
      // Use DOMMatrix to handle transform composition correctly
      try {
        const currentMatrix = new DOMMatrix(currentTransform)

        // Create the inverse matrix to convert viewport coordinates to local coordinates
        const inverseMatrix = currentMatrix.inverse()

        const point = new DOMPoint(translateX, translateY)
        const transformedPoint = point.matrixTransform(inverseMatrix)

        // Compose the final transform
        // CSS applies right to left, so: scale -> translate(local) -> currentTransform
        cloned.style.transform = `${currentTransform} translate3d(${transformedPoint.x}px, ${transformedPoint.y}px, 0) scale(${scale})`
      }
      catch {
        // Fallback if DOMMatrix is not available or fails
        cloned.style.transform = `${currentTransform} translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
      }
    }
    else {
      cloned.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
    }

    const handleAnimationEnd = () => {
      const cloned = clonedElementRef.value
      if (cloned && cloned.parentNode)
        cloned.parentNode.removeChild(cloned)

      clonedElementRef.value = undefined

      if (elementRef.value)
        elementRef.value.style.visibility = 'visible'

      options.close?.()
      isAnimating.value = false
      showClonedElement.value = false
    }

    cloned.addEventListener('transitionend', handleAnimationEnd, { once: true })
  }

  return {
    isAnimating,
    elementStyle,
    elementRef,
    zoomElementRef,
    zoomIn,
    zoomOut,
  }
}
