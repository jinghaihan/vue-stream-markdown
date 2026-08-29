import type { ElementNode, Node } from 'comark'
import type { PropType, VNodeChild } from 'vue'
import type { MarkdownComponents } from '../../types'
import { createCommentVNode, defineAsyncComponent, defineComponent, h } from 'vue'
import { useContext } from '../../composables'

const ComarkCode = defineAsyncComponent(() => import('../comark-code.vue'))
const ComarkMath = defineAsyncComponent(() => import('../comark-math.vue'))

const BLOCK_STYLES: Record<string, string> = {
  blockquote: 'text-muted-foreground mx-0 my-4 pl-4 border-l-4 border-l-muted-foreground/30 italic relative [&_p]:mb-0',
  h1: 'font-semibold mb-2 mt-6 text-3xl',
  h2: 'font-semibold mb-2 mt-6 text-2xl',
  h3: 'font-semibold mb-2 mt-6 text-xl',
  h4: 'font-semibold mb-2 mt-6 text-lg',
  h5: 'font-semibold mb-2 mt-6 text-base',
  h6: 'font-semibold mb-2 mt-6 text-sm',
  ol: 'leading-6 pl-5 whitespace-normal list-decimal',
  p: 'my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease',
  ul: 'leading-6 pl-5 whitespace-normal list-disc',
}

const ELEMENT_STYLES: Record<string, string> = {
  a: 'text-primary underline cursor-pointer [overflow-wrap:anywhere]',
  code: 'text-sm font-mono px-1.5 py-0.5 rounded bg-muted whitespace-normal break-words',
  del: 'line-through',
  em: 'italic',
  hr: 'my-6 border-t border-border',
  img: 'rounded-lg max-w-full h-auto',
  input: 'mr-2 align-middle',
  li: 'py-1 pl-1 [&_p]:m-0',
  strong: 'font-semibold',
  sup: 'text-primary',
  table: 'border border-border rounded-lg w-full overflow-hidden border-collapse [&_p]:m-0 [&_tr]:border-b [&_tr]:border-border',
  tbody: 'font-semibold border-y border-border bg-muted/40 relative [&_td]:text-sm [&_td]:px-4 [&_td]:py-2',
  td: 'text-sm px-4 py-2',
  th: 'text-sm px-4 py-2 whitespace-nowrap',
  thead: 'bg-muted/80 relative',
}

export default defineComponent({
  name: 'ComarkNodeList',
  props: {
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: () => ({}),
    },
    loading: Boolean,
    nodes: {
      type: Array as PropType<Node[]>,
      default: () => [],
    },
  },
  setup(props) {
    const context = useContext()

    function renderNodes(nodes: Node[], loading: boolean, parentKey = 'root'): VNodeChild[] {
      const lastIndex = findLastRenderableIndex(nodes)
      return nodes.map((node, index) => renderNode(
        node,
        loading && index === lastIndex,
        `${parentKey}-${index}`,
      ))
    }

    function renderNode(node: Node, loading: boolean, path: string): VNodeChild {
      if (typeof node === 'string') {
        const caret = loading && context.enableCaret.value
          ? h('span', {
              'data-stream-markdown': 'caret',
            }, context.caret.value)
          : undefined

        return h('span', {
          'key': `${path}-text`,
          'data-stream-markdown': 'text',
          'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
        }, [node, caret])
      }

      const [tag, attrs, ...children] = node
      if (tag === null)
        return createCommentVNode(String(children[0] ?? ''))

      const key = `${path}-${tag}`
      const component = props.components[tag]
      if (component) {
        return h(component, {
          ...resolveAttributes(attrs),
          key,
          node,
        }, {
          default: () => renderNodes(children, loading, key),
        })
      }

      if (tag === 'pre') {
        return h(ComarkCode, {
          key,
          loading,
          node,
          nodeKey: key,
        })
      }

      if (tag === 'math') {
        return h(ComarkMath, {
          key,
          node,
          nodeKey: key,
        })
      }

      const resolvedAttrs = resolveAttributes(attrs)
      const className = [
        BLOCK_STYLES[tag],
        ELEMENT_STYLES[tag],
        resolvedAttrs.class,
      ]

      if (tag === 'a') {
        const internal = typeof resolvedAttrs.href === 'string' && resolvedAttrs.href.startsWith('#')
        if (!internal) {
          resolvedAttrs.rel ??= 'noreferrer'
          resolvedAttrs.target ??= '_blank'
        }
        if (loading) {
          className.push('no-underline cursor-default pointer-events-none')
          resolvedAttrs['data-stream-markdown-loading'] = true
        }
      }

      if (tag === 'img') {
        return h('figure', {
          key,
          'class': 'inline-block',
          'data-stream-markdown': 'image-figure',
        }, [
          h('img', {
            ...resolvedAttrs,
            'class': className,
            'data-stream-markdown': 'image',
          }),
          resolvedAttrs.title
            ? h('figcaption', {
                'class': 'text-sm text-center italic',
                'data-stream-markdown': 'image-caption',
              }, String(resolvedAttrs.title))
            : undefined,
        ])
      }

      const rendered = h(tag, {
        ...resolvedAttrs,
        'key': key,
        'class': className,
        'data-stream-markdown': resolveDataAttribute(tag),
        'dir': tag === 'code' ? 'ltr' : resolvedAttrs.dir,
      }, renderNodes(children, loading, key))

      if (tag === 'table') {
        return h('div', {
          'key': `${key}-wrapper`,
          'class': 'my-4 w-full overflow-x-auto overflow-y-auto',
          'data-stream-markdown': 'table-wrapper',
        }, rendered)
      }

      return rendered
    }

    return () => renderNodes(props.nodes, props.loading)
  },
})

function findLastRenderableIndex(nodes: Node[]): number {
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index]!
    if (typeof node === 'string' || node[0] !== null)
      return index
  }
  return -1
}

function resolveAttributes(attrs: ElementNode[1]): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}
  for (const [rawName, rawValue] of Object.entries(attrs)) {
    if (rawName === '$')
      continue

    const name = rawName.startsWith(':') ? rawName.slice(1) : rawName
    resolved[name] = rawName.startsWith(':') ? resolveBoundValue(rawValue) : rawValue
  }
  return resolved
}

function resolveBoundValue(value: unknown): unknown {
  if (value === 'true')
    return true
  if (value === 'false')
    return false
  if (value === 'null')
    return null
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value))
    return Number(value)
  return value
}

function resolveDataAttribute(tag: string): string {
  if (/^h[1-6]$/.test(tag))
    return `heading-${tag.slice(1)}`
  if (tag === 'em')
    return 'emphasis'
  if (tag === 'del')
    return 'delete'
  if (tag === 'hr')
    return 'thematic-break'
  if (tag === 'a')
    return 'link'
  return tag
}
