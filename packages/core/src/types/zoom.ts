import type { ZoomControlPosition } from './controls'

export interface ZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  wheelSensitivity?: number
  initialZoom?: number
  initialTranslateX?: number
  initialTranslateY?: number
}

export interface ZoomState {
  zoom: number
  translateX: number
  translateY: number
}

export interface ZoomPoint {
  x: number
  y: number
}

export interface ZoomRect {
  left: number
  top: number
  width: number
  height: number
}

export interface TouchZoomState {
  initialDistance: number
  initialZoom: number
  initialTranslateX: number
  initialTranslateY: number
  centerX: number
  centerY: number
}

export interface ZoomControlPositionStyle {
  top?: string
  right?: string
  bottom?: string
  left?: string
  transform?: string
}

export interface MediumZoomTransformInput {
  rect: ZoomRect
  naturalWidth: number
  naturalHeight: number
  viewportWidth: number
  viewportHeight: number
  margin: number
}

export interface MediumZoomTransformResult {
  initialTransform: string
  targetTransform: string
}

export interface MediumZoomOutTransformInput {
  originalRect: ZoomRect
  zoomRect: ZoomRect
  currentTransform: string
}

export interface WheelZoomInput {
  state: ZoomState
  point: ZoomPoint
  rect: ZoomRect
  deltaY: number
  ctrlKey?: boolean
  metaKey?: boolean
  options?: ZoomOptions
}

export interface TouchZoomInput {
  state: ZoomState
  rect: ZoomRect
  touches: [ZoomPoint, ZoomPoint]
  options?: ZoomOptions
}

export interface TouchZoomMoveInput {
  rect: ZoomRect
  touches: [ZoomPoint, ZoomPoint]
  touchState: TouchZoomState
  options?: ZoomOptions
}

export type { ZoomControlPosition }
