import { computed, ref } from 'vue'

interface UseZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  wheelSensitivity?: number
  initialZoom?: number
  initialTranslateX?: number
  initialTranslateY?: number
}

interface ZoomState {
  zoom: number
  translateX: number
  translateY: number
}

export function useZoom(options: UseZoomOptions = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 3,
    zoomStep = 0.1,
    wheelSensitivity = 0.01,
    initialZoom = 1,
    initialTranslateX = 0,
    initialTranslateY = 0,
  } = options

  const zoom = ref(initialZoom)
  const translateX = ref(initialTranslateX)
  const translateY = ref(initialTranslateY)
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })

  const isPinching = ref(false)
  const touchZoomState = ref<{
    initialDistance: number
    initialZoom: number
    initialTranslateX: number
    initialTranslateY: number
    centerX: number
    centerY: number
  } | null>(null)

  const transformStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${zoom.value})`,
  }))

  function zoomIn() {
    if (zoom.value < maxZoom)
      zoom.value = Math.min(zoom.value + zoomStep, maxZoom)
  }

  function zoomOut() {
    if (zoom.value > minZoom)
      zoom.value = Math.max(zoom.value - zoomStep, minZoom)
  }

  function resetZoom() {
    zoom.value = initialZoom
    translateX.value = initialTranslateX
    translateY.value = initialTranslateY
  }

  function setZoom(value: number) {
    zoom.value = Math.min(Math.max(value, minZoom), maxZoom)
  }

  // Drag functionality
  function startDrag(e: PointerEvent) {
    if (isPinching.value)
      return

    isDragging.value = true
    dragStart.value = {
      x: e.clientX - translateX.value,
      y: e.clientY - translateY.value,
    }

    if (e.pointerType !== 'mouse') {
      if (e.target instanceof HTMLElement)
        e.target.setPointerCapture(e.pointerId)
    }
  }

  function onDrag(e: PointerEvent) {
    if (!isDragging.value || isPinching.value)
      return

    translateX.value = e.clientX - dragStart.value.x
    translateY.value = e.clientY - dragStart.value.y
  }

  function stopDrag() {
    isDragging.value = false
  }

  // Wheel zoom with focal point
  function handleWheel(event: WheelEvent, containerElement: HTMLElement) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()

      const rect = containerElement.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const containerCenterX = rect.width / 2
      const containerCenterY = rect.height / 2
      const offsetX = mouseX - containerCenterX
      const offsetY = mouseY - containerCenterY
      const contentMouseX = (offsetX - translateX.value) / zoom.value
      const contentMouseY = (offsetY - translateY.value) / zoom.value
      const delta = -event.deltaY * wheelSensitivity
      const newZoom = Math.min(Math.max(zoom.value + delta, minZoom), maxZoom)

      if (newZoom !== zoom.value) {
        translateX.value = offsetX - contentMouseX * newZoom
        translateY.value = offsetY - contentMouseY * newZoom
        zoom.value = newZoom
      }
    }
  }

  function getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2) {
      event.preventDefault()
      isPinching.value = true

      const touch1 = event.touches[0]!
      const touch2 = event.touches[1]!

      const distance = getTouchDistance(touch1, touch2)
      const centerX = (touch1.clientX + touch2.clientX) / 2
      const centerY = (touch1.clientY + touch2.clientY) / 2

      const rect = containerElement.getBoundingClientRect()
      const containerCenterX = rect.width / 2
      const containerCenterY = rect.height / 2
      const offsetX = centerX - rect.left - containerCenterX
      const offsetY = centerY - rect.top - containerCenterY

      touchZoomState.value = {
        initialDistance: distance,
        initialZoom: zoom.value,
        initialTranslateX: translateX.value,
        initialTranslateY: translateY.value,
        centerX: offsetX,
        centerY: offsetY,
      }
    }
  }

  function handleTouchMove(event: TouchEvent, containerElement: HTMLElement) {
    if (event.touches.length === 2 && touchZoomState.value) {
      event.preventDefault()

      const touch1 = event.touches[0]!
      const touch2 = event.touches[1]!

      const currentDistance = getTouchDistance(touch1, touch2)
      const scale = currentDistance / touchZoomState.value.initialDistance
      const newZoom = touchZoomState.value.initialZoom * scale

      // Clamp zoom value
      const clampedZoom = Math.min(Math.max(newZoom, minZoom), maxZoom)

      if (clampedZoom !== zoom.value) {
        // Calculate current center point
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        const rect = containerElement.getBoundingClientRect()
        const containerCenterX = rect.width / 2
        const containerCenterY = rect.height / 2
        const offsetX = centerX - rect.left - containerCenterX
        const offsetY = centerY - rect.top - containerCenterY

        // Calculate focal point in content coordinates
        const contentFocalX = (touchZoomState.value.centerX - touchZoomState.value.initialTranslateX) / touchZoomState.value.initialZoom
        const contentFocalY = (touchZoomState.value.centerY - touchZoomState.value.initialTranslateY) / touchZoomState.value.initialZoom

        // Update zoom and translate
        zoom.value = clampedZoom
        translateX.value = offsetX - contentFocalX * clampedZoom
        translateY.value = offsetY - contentFocalY * clampedZoom
      }
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      touchZoomState.value = null
      isPinching.value = false
    }
  }

  // Get current state
  function getState(): ZoomState {
    return {
      zoom: zoom.value,
      translateX: translateX.value,
      translateY: translateY.value,
    }
  }

  // Set state
  function setState(state: Partial<ZoomState>) {
    if (state.zoom)
      zoom.value = Math.min(Math.max(state.zoom, minZoom), maxZoom)

    if (state.translateX)
      translateX.value = state.translateX

    if (state.translateY)
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
