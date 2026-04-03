import type { MaybeRefOrGetter } from 'vue'
import {
  calculateMediumZoomOutTransform,
  calculateMediumZoomTransforms,
  isClient,
} from '@stream-markdown/shared'
import { computed, nextTick, ref, toValue } from 'vue'

interface UseMediumZoomOptions {
  margin?: MaybeRefOrGetter<number>
  open?: () => void
  close?: () => void
}

export function useMediumZoom(options: UseMediumZoomOptions) {
  const margin = computed(() => toValue(options.margin) ?? 0)

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

    const transforms = calculateMediumZoomTransforms({
      rect,
      naturalWidth,
      naturalHeight,
      viewportWidth,
      viewportHeight,
      margin: margin.value,
    })

    initialTransform.value = transforms.initialTransform
    targetTransform.value = transforms.targetTransform
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

    cloned.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
    cloned.style.transform = calculateMediumZoomOutTransform({
      originalRect,
      zoomRect,
      currentTransform,
    })

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
