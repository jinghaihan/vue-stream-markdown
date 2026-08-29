import type { TextNode } from '@stream-markdown/core'
import type { VNodeRenderContext, VNodeRendererProps } from './types'
import { createTextModel, DISABLED_TRANSITION_NAME } from '@stream-markdown/core'
import { createTextVNode, h, TransitionGroup } from 'vue'

const CSS_TEXT_ANIMATIONS = new Set(['blur-in', 'fade-in', 'slide-up'])

export function renderText(
  props: VNodeRendererProps<TextNode>,
  context: VNodeRenderContext,
) {
  context.renderedTextKeys.add(props.nodeKey)
  const model = createTextModel({
    node: props.node,
    nodeKey: props.nodeKey,
    enableAnimate: context.enableAnimate,
    animation: context.animation,
    animationSplit: context.animationSplit,
    hideCaret: props.hideCaret,
  })
  if (model.shouldAnimate)
    context.animatedTextKeys.add(props.nodeKey)

  const caret = model.showCaret && context.enableCaret
    ? h('span', {
        'key': 'stream-markdown-caret',
        'data-stream-markdown': 'caret',
      }, context.caret)
    : undefined

  if (!context.animatedTextKeys.has(props.nodeKey) && !caret)
    return createTextVNode(props.node.value)

  if (context.animatedTextKeys.has(props.nodeKey)) {
    const useCssAnimation = CSS_TEXT_ANIMATIONS.has(context.animation)
    const children = () => [
      ...model.parts.map(part => h('span', {
        'key': part.key,
        'data-stream-markdown': part.whitespace ? 'text-space' : `text-${part.animationSplit}`,
        'class': [
          '[text-decoration:inherit]',
          !part.whitespace && 'inline-block max-w-full whitespace-pre-wrap break-words',
          useCssAnimation && `stream-markdown-text-${context.animation}`,
        ],
      }, part.value)),
      caret,
    ]

    if (useCssAnimation) {
      return h('span', {
        'key': props.nodeKey,
        'data-stream-markdown': 'text',
        'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
      }, children())
    }

    return h(TransitionGroup, {
      'key': props.nodeKey,
      'name': model.shouldAnimate ? model.transitionName : DISABLED_TRANSITION_NAME,
      'tag': 'span',
      'data-stream-markdown': 'text',
      'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
    }, children)
  }

  return h('span', {
    'key': props.nodeKey,
    'data-stream-markdown': 'text',
    'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
  }, [props.node.value, caret])
}
