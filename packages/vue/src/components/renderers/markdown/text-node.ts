import type { VNodeChild } from 'vue'
import type { StreamMarkdownResolvedContext } from '../../../types'
import {
  createTextParts,
  DISABLED_TRANSITION_NAME,
  getTransitionName,
} from '@stream-markdown/core'
import { h, TransitionGroup } from 'vue'

const CSS_TEXT_ANIMATIONS = new Set(['blur-in', 'fade-in', 'slide-up'])

export interface TextNodeRendererOptions {
  animatedTextKeys: Set<string>
  context: StreamMarkdownResolvedContext
  markTextRendered: (key: string) => void
}

export function renderTextNode(
  text: string,
  loading: boolean,
  path: string,
  options: TextNodeRendererOptions,
): VNodeChild {
  const { animatedTextKeys, context, markTextRendered } = options
  const textKey = `${path}-text`
  markTextRendered(textKey)
  if (context.enableAnimate.value && text.trim())
    animatedTextKeys.add(textKey)

  const caret = loading && context.enableCaret.value
    ? h('span', {
        'key': `${textKey}-caret`,
        'data-stream-markdown': 'caret',
      }, context.caret.value)
    : undefined

  if (!animatedTextKeys.has(textKey)) {
    return h('span', {
      'key': textKey,
      'data-stream-markdown': 'text',
      'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
    }, [text, caret])
  }

  const useCssAnimation = CSS_TEXT_ANIMATIONS.has(context.animation.value)
  const parts = createTextParts(text, textKey, context.animationSplit.value)
  const children = () => [
    ...parts.map(part => h('span', {
      'key': part.key,
      'data-stream-markdown': part.whitespace ? 'text-space' : `text-${part.animationSplit}`,
      'class': [
        '[text-decoration:inherit]',
        !part.whitespace && 'inline-block max-w-full whitespace-pre-wrap break-words',
        useCssAnimation && `stream-markdown-text-${context.animation.value}`,
      ],
    }, part.value)),
    caret,
  ]

  if (!useCssAnimation) {
    return h(TransitionGroup, {
      'key': textKey,
      'name': context.enableAnimate.value
        ? getTransitionName(context.animation.value)
        : DISABLED_TRANSITION_NAME,
      'tag': 'span',
      'data-stream-markdown': 'text',
      'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
    }, children)
  }

  return h('span', {
    'key': textKey,
    'data-stream-markdown': 'text',
    'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
  }, children())
}
