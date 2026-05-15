import type { TouchZoomState, ZoomOptions, ZoomPoint, ZoomState } from '../types'
import {
  createDraggedState,
  createDragStart,
  createTouchMovedState,
  createTouchZoomState,
  createWheelZoomState,
} from '../utils'

export interface BrowserWheelZoomInput {
  event: WheelEvent
  element: Element
  state: ZoomState
  options?: ZoomOptions
}

export interface BrowserTouchZoomInput {
  event: TouchEvent
  element: Element
  state: ZoomState
}

export interface BrowserTouchZoomMoveInput {
  event: TouchEvent
  element: Element
  touchState: TouchZoomState
  options?: ZoomOptions
}

export function createZoomPoint(clientX: number, clientY: number): ZoomPoint {
  return {
    x: clientX,
    y: clientY,
  }
}

export function createPointerDragStart(event: PointerEvent, state: ZoomState): ZoomPoint {
  return createDragStart(createZoomPoint(event.clientX, event.clientY), state)
}

export function createPointerDraggedState(
  event: PointerEvent,
  dragStart: ZoomPoint,
): Pick<ZoomState, 'translateX' | 'translateY'> {
  return createDraggedState(createZoomPoint(event.clientX, event.clientY), dragStart)
}

export function capturePointerForNonMouseEvent(event: PointerEvent): boolean {
  if (event.pointerType === 'mouse')
    return false

  if (!(event.target instanceof HTMLElement))
    return false

  event.target.setPointerCapture(event.pointerId)
  return true
}

export function createBrowserWheelZoomState({
  event,
  element,
  state,
  options,
}: BrowserWheelZoomInput): ZoomState | null {
  return createWheelZoomState({
    state,
    point: createZoomPoint(event.clientX, event.clientY),
    rect: element.getBoundingClientRect(),
    deltaY: event.deltaY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    options,
  })
}

export function createBrowserTouchZoomState({
  event,
  element,
  state,
}: BrowserTouchZoomInput): TouchZoomState | null {
  if (event.touches.length !== 2)
    return null

  return createTouchZoomState({
    state,
    rect: element.getBoundingClientRect(),
    touches: [
      createZoomPoint(event.touches[0]!.clientX, event.touches[0]!.clientY),
      createZoomPoint(event.touches[1]!.clientX, event.touches[1]!.clientY),
    ],
  })
}

export function createBrowserTouchMovedState({
  event,
  element,
  touchState,
  options,
}: BrowserTouchZoomMoveInput): ZoomState | null {
  if (event.touches.length !== 2)
    return null

  return createTouchMovedState({
    rect: element.getBoundingClientRect(),
    touches: [
      createZoomPoint(event.touches[0]!.clientX, event.touches[0]!.clientY),
      createZoomPoint(event.touches[1]!.clientX, event.touches[1]!.clientY),
    ],
    touchState,
    options,
  })
}
