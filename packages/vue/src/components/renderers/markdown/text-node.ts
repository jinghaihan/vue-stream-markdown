import type { TextAnimationScheduler, TextPart } from '@stream-markdown/core'
import type { VNodeChild } from 'vue'
import type { StreamMarkdownResolvedContext } from '../../../types'
import {
  createTextParts,
  getTransitionName,
} from '@stream-markdown/core'
import { h, TransitionGroup } from 'vue'

export interface TextNodeRendererOptions {
  context: StreamMarkdownResolvedContext
  refreshTextAnimation: () => void
  textAnimationScheduler: TextAnimationScheduler
}

const CSS_TEXT_ANIMATIONS = new Set(['blur-in', 'fade-in', 'slide-up'])

export function renderTextNode(
  text: string,
  loading: boolean,
  path: string,
  textOffset: number | undefined,
  options: TextNodeRendererOptions,
): VNodeChild {
  const { context, refreshTextAnimation, textAnimationScheduler } = options
  const textKey = textOffset === undefined ? `${path}-text` : `text-${textOffset}`
  const caret = loading && context.enableCaret.value
    ? h('span', {
        'key': `${textKey}-caret`,
        'data-stream-markdown': 'caret',
      }, context.caret.value)
    : undefined

  if (!context.enableAnimate.value || !context.animation.value || !text.trim())
    return renderPlainText(textKey, text, caret)

  const useCssAnimation = CSS_TEXT_ANIMATIONS.has(context.animation.value)
  const parts = createTextParts(text, textKey, context.animationSplit.value)
  textAnimationScheduler.schedule(parts)
  const firstActiveIndex = parts.findIndex(part => (
    !part.whitespace && !textAnimationScheduler.getPartState(part.key)?.settled
  ))

  if (firstActiveIndex < 0)
    return renderPlainText(textKey, text, caret)

  const settledPrefix = parts
    .slice(0, firstActiveIndex)
    .map(part => part.value)
    .join('')
  const currentTime = textAnimationScheduler.getCurrentTime()
  const handleAnimationEnd = (event: Event) => {
    const key = (event.target as HTMLElement | null)?.dataset.streamMarkdownAnimationKey
    if (!key)
      return

    textAnimationScheduler.markPartSettled(key)
    const hasActiveParts = parts.some(part => (
      !part.whitespace && !textAnimationScheduler.getPartState(part.key)?.settled
    ))
    if (!hasActiveParts)
      refreshTextAnimation()
  }
  const children = () => [
    settledPrefix,
    ...parts.slice(firstActiveIndex).map(part => renderTextPart(
      part,
      currentTime,
      useCssAnimation,
      context.animation.value,
      textAnimationScheduler,
    )),
    caret,
  ]
  const attributes = {
    'key': textKey,
    'data-stream-markdown': 'text',
    'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
    'onAnimationend': handleAnimationEnd,
    'onTransitionend': handleAnimationEnd,
  }

  if (!useCssAnimation) {
    return h(TransitionGroup, {
      ...attributes,
      name: getTransitionName(context.animation.value),
      tag: 'span',
    }, children)
  }

  return h('span', attributes, children())
}

function renderPlainText(textKey: string, text: string, caret: VNodeChild): VNodeChild {
  return h('span', {
    'key': textKey,
    'data-stream-markdown': 'text',
    'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
  }, [text, caret])
}

function renderTextPart(
  part: TextPart,
  currentTime: number,
  useCssAnimation: boolean,
  animation: string,
  scheduler: TextAnimationScheduler,
): VNodeChild {
  if (part.whitespace)
    return part.value

  const state = scheduler.getPartState(part.key)
  const delay = state ? Math.round(state.startTime - currentTime) : 0
  const delayStyle = delay
    ? {
        animationDelay: `${delay}ms`,
        transitionDelay: `${delay}ms`,
      }
    : undefined

  return h('span', {
    'key': part.key,
    'data-stream-markdown': `text-${part.animationSplit}`,
    'data-stream-markdown-animation-key': part.key,
    'class': [
      '[text-decoration:inherit]',
      'inline-block max-w-full whitespace-pre-wrap break-words',
      useCssAnimation && `stream-markdown-text-${animation}`,
    ],
    'style': delayStyle,
  }, part.value)
}
