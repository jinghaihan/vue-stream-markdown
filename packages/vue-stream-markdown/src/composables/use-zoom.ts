import type {
  TouchZoomState,
  ZoomOptions,
  ZoomPoint,
  ZoomState,
} from '@stream-markdown/shared'
import {
  createDraggedState,
  createDragStart,
  createTouchMovedState,
  createTouchZoomState,
  createWheelZoomState,
  createZoomState,
  createZoomTransformStyle,
  resetZoomState,
  setZoomState,
  zoomInState,
  zoomOutState,
} from '@stream-markdown/shared'
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

  function getPointer(clientX: number, clientY: number): ZoomPoint {
    return { x: clientX, y: clientY }
  }

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
    dragStart.value = createDragStart(getPointer(e.clientX, e.clientY), getState())

    if (e.pointerType !== 'mouse') {
      if (e.target instanceof HTMLElement)
        e.target.setPointerCapture(e.pointerId)
    }
  }

  function onDrag(e: PointerEvent) {
    if (!isDragging.value || isPinching.value)
      return

    const nextState = createDraggedState(getPointer(e.clientX, e.clientY), dragStart.value)
    translateX.value = nextState.translateX
    translateY.value = nextState.translateY
  }

  function stopDrag() {
    isDragging.value = false
  }

  function handleWheel(event: WheelEvent, containerElement: HTMLElement) {
    const nextState = createWheelZoomState({
      state: getState(),
      point: getPointer(event.clientX, event.clientY),
      rect: containerElement.getBoundingClientRect(),
      deltaY: event.deltaY,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      options,
    })
    if (!nextState)
      return

    event.preventDefault()
    updateState(nextState)
  }

  function handleTouchStart(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2) {
      event.preventDefault()
      isPinching.value = true
      touchZoomState.value = createTouchZoomState({
        state: getState(),
        rect: containerElement.getBoundingClientRect(),
        touches: [
          getPointer(event.touches[0]!.clientX, event.touches[0]!.clientY),
          getPointer(event.touches[1]!.clientX, event.touches[1]!.clientY),
        ],
      })
    }
  }

  function handleTouchMove(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2 && touchZoomState.value) {
      event.preventDefault()
      updateState(createTouchMovedState({
        rect: containerElement.getBoundingClientRect(),
        touches: [
          getPointer(event.touches[0]!.clientX, event.touches[0]!.clientY),
          getPointer(event.touches[1]!.clientX, event.touches[1]!.clientY),
        ],
        touchState: touchZoomState.value,
        options,
      }))
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
