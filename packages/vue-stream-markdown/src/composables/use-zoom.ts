import type {
  TouchZoomState,
  ZoomOptions,
  ZoomState,
} from '@stream-markdown/core'
import {
  capturePointerForNonMouseEvent,
  createBrowserTouchMovedState,
  createBrowserTouchZoomState,
  createBrowserWheelZoomState,
  createPointerDraggedState,
  createPointerDragStart,
  createZoomState,
  createZoomTransformStyle,
  resetZoomState,
  setZoomState,
  zoomInState,
  zoomOutState,
} from '@stream-markdown/core'
import { computed, ref } from 'vue'

export function useZoom(options: ZoomOptions = {}) {
  const zoomState = createZoomState(options)

  const zoom = ref(zoomState.zoom)
  const translateX = ref(zoomState.translateX)
  const translateY = ref(zoomState.translateY)
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })

  const isPinching = ref(false)
  const touchZoomState = ref<TouchZoomState | null>(null)

  const transformStyle = computed(() => createZoomTransformStyle(getState()))

  function zoomIn() {
    updateState(zoomInState(getState(), options))
  }

  function zoomOut() {
    updateState(zoomOutState(getState(), options))
  }

  function resetZoom() {
    updateState(resetZoomState(options))
  }

  function setZoom(value: number) {
    updateState(setZoomState(getState(), value, options))
  }

  function updateState(state: ZoomState) {
    zoom.value = state.zoom
    translateX.value = state.translateX
    translateY.value = state.translateY
  }

  function startDrag(e: PointerEvent) {
    if (isPinching.value)
      return

    isDragging.value = true
    dragStart.value = createPointerDragStart(e, getState())
    capturePointerForNonMouseEvent(e)
  }

  function onDrag(e: PointerEvent) {
    if (!isDragging.value || isPinching.value)
      return

    const nextState = createPointerDraggedState(e, dragStart.value)
    translateX.value = nextState.translateX
    translateY.value = nextState.translateY
  }

  function stopDrag() {
    isDragging.value = false
  }

  function handleWheel(event: WheelEvent, containerElement: HTMLElement) {
    const nextState = createBrowserWheelZoomState({
      event,
      element: containerElement,
      state: getState(),
      options,
    })
    if (!nextState)
      return

    event.preventDefault()
    updateState(nextState)
  }

  function handleTouchStart(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2) {
      const nextTouchZoomState = createBrowserTouchZoomState({
        event,
        element: containerElement,
        state: getState(),
      })
      if (!nextTouchZoomState)
        return

      event.preventDefault()
      isPinching.value = true
      touchZoomState.value = nextTouchZoomState
    }
  }

  function handleTouchMove(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2 && touchZoomState.value) {
      const nextState = createBrowserTouchMovedState({
        event,
        element: containerElement,
        touchState: touchZoomState.value,
        options,
      })
      if (!nextState)
        return

      event.preventDefault()
      updateState(nextState)
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      touchZoomState.value = null
      isPinching.value = false
    }
  }

  function getState(): ZoomState {
    return {
      zoom: zoom.value,
      translateX: translateX.value,
      translateY: translateY.value,
    }
  }

  function setState(state: Partial<ZoomState>) {
    if (typeof state.zoom === 'number')
      zoom.value = setZoomState(getState(), state.zoom, options).zoom

    if (typeof state.translateX === 'number')
      translateX.value = state.translateX

    if (typeof state.translateY === 'number')
      translateY.value = state.translateY
  }

  return {
    zoom,
    translateX,
    translateY,
    isDragging,
    transformStyle,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    startDrag,
    onDrag,
    stopDrag,
    handleWheel,
    getState,
    setState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
