import type { ZoomControlPosition } from '../types'
import { getConfigValue } from '../utils'

export interface MermaidPreviewModelOptions {
  code: string
  nodeLoading?: boolean
  svg?: string
  renderFlag?: boolean
  minHeight?: number
  containerHeight?: number | string
  measuredHeight?: number
  controls?: unknown
}

export function createMermaidPreviewModel(options: MermaidPreviewModelOptions) {
  const loading = !options.svg && (!!options.nodeLoading || !options.renderFlag)
  return {
    code: options.code.trim(),
    loading,
    showControl: getConfigValue(options.controls, 'mermaid.position') !== false,
    controlPosition: resolveMermaidControlPosition(options.controls),
    minHeight: options.minHeight ?? 60,
    height: resolveMermaidContainerHeight(options.containerHeight, options.measuredHeight),
  }
}

export function resolveMermaidInlineInteractive(controls: unknown): boolean {
  return getConfigValue<boolean>(controls, 'mermaid.inlineInteractive') ?? true
}

export function resolveMermaidControlPosition(controls: unknown): ZoomControlPosition {
  const position = getConfigValue<ZoomControlPosition>(controls, 'mermaid.position')
  if (typeof position === 'string')
    return position
  return 'bottom-right'
}

export function resolveMermaidContainerHeight(
  containerHeight?: number | string,
  measuredHeight?: number,
): string {
  if (typeof containerHeight === 'string')
    return containerHeight
  if (typeof containerHeight === 'number')
    return `${containerHeight}px`
  return measuredHeight ? `${measuredHeight}px` : 'auto'
}

export interface MermaidRenderState {
  renderFlag: boolean
  renderAttempt: boolean
}

export interface MermaidPreviewControllerState extends MermaidRenderState {
  svg?: string
  error?: string
  measuredHeight: number
}

export interface MermaidRenderResult {
  valid: boolean
  svg?: string
  error?: string
}

export function createMermaidRenderState(
  state: Partial<MermaidRenderState> = {},
): MermaidRenderState {
  return {
    renderFlag: false,
    renderAttempt: false,
    ...state,
  }
}

export function createMermaidPreviewControllerState(
  state: Partial<MermaidPreviewControllerState> = {},
): MermaidPreviewControllerState {
  return {
    ...createMermaidRenderState(state),
    svg: undefined,
    error: undefined,
    measuredHeight: 0,
    ...state,
  }
}

export function startMermaidRenderAttempt(
  state: MermaidPreviewControllerState,
): MermaidPreviewControllerState
export function startMermaidRenderAttempt(
  state: MermaidRenderState,
): MermaidRenderState
export function startMermaidRenderAttempt(
  state: MermaidRenderState,
): MermaidRenderState {
  return {
    ...state,
    renderAttempt: true,
    renderFlag: false,
  }
}

export function applyMermaidRenderResult(
  state: MermaidPreviewControllerState,
  result: MermaidRenderResult,
): MermaidPreviewControllerState {
  if (result.valid) {
    return {
      ...state,
      svg: result.svg,
      error: undefined,
      renderFlag: true,
    }
  }

  return {
    ...state,
    error: result.error,
    renderFlag: true,
  }
}

export function setMermaidMeasuredHeight(
  state: MermaidPreviewControllerState,
  measuredHeight: number,
): MermaidPreviewControllerState {
  return {
    ...state,
    measuredHeight,
  }
}

export function shouldEagerRenderMermaidAfterLoading(
  state: MermaidRenderState,
  currentLoading: boolean,
  previousLoading: boolean | undefined,
): boolean {
  return !state.renderAttempt && !currentLoading && previousLoading === true
}
