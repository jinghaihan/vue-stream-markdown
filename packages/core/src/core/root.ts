import type { AnimationSplit, AnimationType } from '../types'
import {
  CARETS,
  DEFAULT_ANIMATION,
  DEFAULT_ANIMATION_SPLIT,
  DEFAULT_ANIMATION_STAGGER,
  STREAM_MARKDOWN_CSS_VARIABLES,
} from '../constants'
import { normalizeAnimationDuration } from '../utils'

export type StreamMarkdownMode = 'static' | 'streaming'

export function resolveEnableAnimate(mode: StreamMarkdownMode, enableAnimate?: boolean): boolean {
  if (typeof enableAnimate === 'boolean')
    return enableAnimate
  return mode === 'streaming'
}

export function resolveEnableCaret(mode: StreamMarkdownMode, caret?: string): boolean {
  return !!caret && mode === 'streaming'
}

export function resolveAnimation(animation?: AnimationType): AnimationType {
  return animation ?? DEFAULT_ANIMATION
}

export function resolveAnimationSplit(animationSplit?: AnimationSplit): AnimationSplit {
  return animationSplit ?? DEFAULT_ANIMATION_SPLIT
}

export function resolveAnimationStagger(animationStagger?: number): number {
  if (!Number.isFinite(animationStagger))
    return DEFAULT_ANIMATION_STAGGER
  return Math.max(0, animationStagger ?? DEFAULT_ANIMATION_STAGGER)
}

export function resolveCaret(caret?: string): string | undefined {
  if (!caret || !(caret in CARETS))
    return undefined
  return CARETS[caret as keyof typeof CARETS]
}

export function createRootStyle(
  cssVariables: Record<string, string>,
  animationDuration?: number | string,
): Record<string, string> {
  const style = { ...cssVariables }
  const duration = normalizeAnimationDuration(animationDuration)
  if (duration !== undefined)
    style[STREAM_MARKDOWN_CSS_VARIABLES.animationDuration] = duration
  return style
}
