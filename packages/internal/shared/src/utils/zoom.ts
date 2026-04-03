import type {
  TouchZoomInput,
  TouchZoomMoveInput,
  TouchZoomState,
  WheelZoomInput,
  ZoomControlPosition,
  ZoomControlPositionStyle,
  ZoomOptions,
  ZoomPoint,
  ZoomState,
} from '../types'

const DEFAULT_ZOOM_OPTIONS: Required<ZoomOptions> = {
  minZoom: 0.5,
  maxZoom: 3,
  zoomStep: 0.1,
  wheelSensitivity: 0.01,
  initialZoom: 1,
  initialTranslateX: 0,
  initialTranslateY: 0,
}

export function resolveZoomOptions(options: ZoomOptions = {}): Required<ZoomOptions> {
  return {
    ...DEFAULT_ZOOM_OPTIONS,
    ...options,
  }
}

export function clampZoom(value: number, minZoom: number, maxZoom: number): number {
  return Math.min(Math.max(value, minZoom), maxZoom)
}

export function createZoomState(options: ZoomOptions = {}): ZoomState {
  const resolvedOptions = resolveZoomOptions(options)
  return {
    zoom: resolvedOptions.initialZoom,
    translateX: resolvedOptions.initialTranslateX,
    translateY: resolvedOptions.initialTranslateY,
  }
}

export function zoomInState(state: ZoomState, options: ZoomOptions = {}): ZoomState {
  const { maxZoom, zoomStep } = resolveZoomOptions(options)
  if (state.zoom >= maxZoom)
    return state

  return {
    ...state,
    zoom: Math.min(state.zoom + zoomStep, maxZoom),
  }
}

export function zoomOutState(state: ZoomState, options: ZoomOptions = {}): ZoomState {
  const { minZoom, zoomStep } = resolveZoomOptions(options)
  if (state.zoom <= minZoom)
    return state

  return {
    ...state,
    zoom: Math.max(state.zoom - zoomStep, minZoom),
  }
}

export function resetZoomState(options: ZoomOptions = {}): ZoomState {
  return createZoomState(options)
}

export function setZoomState(state: ZoomState, value: number, options: ZoomOptions = {}): ZoomState {
  const { minZoom, maxZoom } = resolveZoomOptions(options)
  return {
    ...state,
    zoom: clampZoom(value, minZoom, maxZoom),
  }
}

export function createDragStart(point: ZoomPoint, state: ZoomState): ZoomPoint {
  return {
    x: point.x - state.translateX,
    y: point.y - state.translateY,
  }
}

export function createDraggedState(point: ZoomPoint, dragStart: ZoomPoint): Pick<ZoomState, 'translateX' | 'translateY'> {
  return {
    translateX: point.x - dragStart.x,
    translateY: point.y - dragStart.y,
  }
}

export function getTouchDistance(firstTouch: ZoomPoint, secondTouch: ZoomPoint): number {
  const dx = firstTouch.x - secondTouch.x
  const dy = firstTouch.y - secondTouch.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function createTouchZoomState({
  state,
  rect,
  touches,
}: TouchZoomInput): TouchZoomState {
  const [firstTouch, secondTouch] = touches
  const distance = getTouchDistance(firstTouch, secondTouch)
  const centerX = (firstTouch.x + secondTouch.x) / 2
  const centerY = (firstTouch.y + secondTouch.y) / 2
  const containerCenterX = rect.width / 2
  const containerCenterY = rect.height / 2
  const offsetX = centerX - rect.left - containerCenterX
  const offsetY = centerY - rect.top - containerCenterY

  return {
    initialDistance: distance,
    initialZoom: state.zoom,
    initialTranslateX: state.translateX,
    initialTranslateY: state.translateY,
    centerX: offsetX,
    centerY: offsetY,
  }
}

export function createTouchMovedState({
  rect,
  touches,
  touchState,
  options = {},
}: TouchZoomMoveInput): ZoomState {
  const [firstTouch, secondTouch] = touches
  const { minZoom, maxZoom } = resolveZoomOptions(options)
  const currentDistance = getTouchDistance(firstTouch, secondTouch)
  const scale = currentDistance / touchState.initialDistance
  const nextZoom = clampZoom(touchState.initialZoom * scale, minZoom, maxZoom)
  const centerX = (firstTouch.x + secondTouch.x) / 2
  const centerY = (firstTouch.y + secondTouch.y) / 2
  const containerCenterX = rect.width / 2
  const containerCenterY = rect.height / 2
  const offsetX = centerX - rect.left - containerCenterX
  const offsetY = centerY - rect.top - containerCenterY
  const contentFocalX = (touchState.centerX - touchState.initialTranslateX) / touchState.initialZoom
  const contentFocalY = (touchState.centerY - touchState.initialTranslateY) / touchState.initialZoom

  return {
    zoom: nextZoom,
    translateX: offsetX - contentFocalX * nextZoom,
    translateY: offsetY - contentFocalY * nextZoom,
  }
}

export function createWheelZoomState({
  state,
  point,
  rect,
  deltaY,
  ctrlKey,
  metaKey,
  options = {},
}: WheelZoomInput): ZoomState | null {
  if (!ctrlKey && !metaKey)
    return null

  const { minZoom, maxZoom, wheelSensitivity } = resolveZoomOptions(options)
  const mouseX = point.x - rect.left
  const mouseY = point.y - rect.top
  const containerCenterX = rect.width / 2
  const containerCenterY = rect.height / 2
  const offsetX = mouseX - containerCenterX
  const offsetY = mouseY - containerCenterY
  const contentMouseX = (offsetX - state.translateX) / state.zoom
  const contentMouseY = (offsetY - state.translateY) / state.zoom
  const delta = -deltaY * wheelSensitivity
  const nextZoom = clampZoom(state.zoom + delta, minZoom, maxZoom)

  if (nextZoom === state.zoom)
    return state

  return {
    zoom: nextZoom,
    translateX: offsetX - contentMouseX * nextZoom,
    translateY: offsetY - contentMouseY * nextZoom,
  }
}

export function createZoomTransformStyle(state: ZoomState): { transform: string } {
  return {
    transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.zoom})`,
  }
}

export function resolveZoomControlPosition(position: ZoomControlPosition): ZoomControlPositionStyle {
  switch (position) {
    case 'top-left':
      return {
        top: '0.5rem',
        left: '0.5rem',
      }
    case 'top-right':
      return {
        top: '0.5rem',
        right: '0.5rem',
      }
    case 'top-center':
      return {
        top: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-left':
      return {
        bottom: '0.5rem',
        left: '0.5rem',
      }
    case 'bottom-center':
      return {
        bottom: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'bottom-right':
    default:
      return {
        bottom: '0.5rem',
        right: '0.5rem',
      }
  }
}
