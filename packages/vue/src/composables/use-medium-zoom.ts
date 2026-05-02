import type { MaybeRefOrGetter } from 'vue'
import {
  calculateMediumZoomInTransforms,
  cloneMediumZoomElement,
  isClient,
  mountMediumZoomClone,
  playMediumZoomInClone,
  playMediumZoomOutClone,
  prepareMediumZoomInClone,
  prepareMediumZoomOutClone,
  readMediumZoomElementTransform,
  setMediumZoomOriginalVisibility,
  unmountMediumZoomClone,
} from '@stream-markdown/core'
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

    return cloneMediumZoomElement(original)
  }

  function calculateTransforms() {
    const original = elementRef.value
    if (!original || !clonedElementRef.value)
      return

    const transforms = calculateMediumZoomInTransforms({
      original,
      cloned: clonedElementRef.value,
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

    setMediumZoomOriginalVisibility(el, false)

    if (!mountMediumZoomClone(cloned)) {
      setMediumZoomOriginalVisibility(el, true)
      return
    }

    clonedElementRef.value = cloned
    showClonedElement.value = true

    await nextTick()

    calculateTransforms()

    if (clonedElementRef.value)
      prepareMediumZoomInClone(clonedElementRef.value, initialTransform.value)

    void clonedElementRef.value?.offsetHeight

    await nextTick()

    isAnimating.value = true
    if (clonedElementRef.value)
      playMediumZoomInClone(clonedElementRef.value, targetTransform.value)

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

    const cloned = clonedElementRef.value

    const currentTransform = readMediumZoomElementTransform(zoomEl)

    prepareMediumZoomOutClone({
      cloned,
      zoomElement: zoomEl,
      currentTransform,
    })

    // Force reflow
    void cloned.offsetHeight

    await nextTick()

    isAnimating.value = true

    playMediumZoomOutClone({
      cloned,
      original: el,
      zoomElement: zoomEl,
      currentTransform,
    })

    const handleAnimationEnd = () => {
      const cloned = clonedElementRef.value
      if (cloned)
        unmountMediumZoomClone(cloned)

      clonedElementRef.value = undefined

      if (elementRef.value)
        setMediumZoomOriginalVisibility(elementRef.value, true)

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
