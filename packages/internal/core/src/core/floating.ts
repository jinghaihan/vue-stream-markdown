export type FloatingDelay = number | [number, number]

export interface FloatingPositionState {
  x?: number | null
  y?: number | null
  strategy?: 'absolute' | 'fixed'
}

export function resolveFloatingDelay(delay: FloatingDelay = [100, 100]) {
  if (Array.isArray(delay)) {
    return {
      show: delay[0] ?? 0,
      hide: delay[1] ?? 0,
    }
  }

  return {
    show: delay,
    hide: delay,
  }
}

export function createFloatingStyle(state: FloatingPositionState) {
  return {
    position: state.strategy ?? 'absolute',
    top: `${state.y ?? 0}px`,
    left: `${state.x ?? 0}px`,
  }
}

export function isClickInsideFloating(
  target: Node,
  referenceEl?: HTMLElement,
  floatingEl?: HTMLElement,
): boolean {
  return !!referenceEl?.contains(target) || !!floatingEl?.contains(target)
}
