import { STREAM_MARKDOWN_PREFIX } from '../constants'

export function getTransitionName(animation: string): string {
  return `${STREAM_MARKDOWN_PREFIX}-${animation}`
}

export function normalizeAnimationDuration(duration: number | string | undefined): string | undefined {
  if (duration === undefined)
    return undefined
  return typeof duration === 'number' ? `${duration}ms` : duration
}
