// @vitest-environment jsdom

import type { Root as ReactRoot } from 'react-dom/client'
import type { ParsedNode, SyntaxTree } from 'vue-stream-markdown'
import {
  createParagraphModel,
  createProcessedMarkdownModel,
  createStreamMarkdownEngine,
  createTextParts,
  DISABLED_TRANSITION_NAME,
  getTransitionName,
  resolveNodeTextDirection,
  shouldAnimateNode,
} from '@stream-markdown/core'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Streamdown } from 'streamdown'
import { beforeAll, bench, describe } from 'vitest'
import {
  defineComponent,
  Fragment,
  h,
  nextTick,
  render,
  Transition,
  TransitionGroup,
} from 'vue'
import { Markdown as VueStreamMarkdown } from 'vue-stream-markdown'

const DOCUMENT = `# Quarterly review

Revenue grew across every region this quarter, with **enterprise adoption** leading and
*self-serve usage* close behind. The team expects another productive quarter.

## International update

تستمر الإيرادات في النمو مع **تحسن الاحتفاظ** و*زيادة الاستخدام* في جميع المناطق.
`

const TAIL_WORDS = [
  'and',
  'the',
  'trailing',
  'narrative',
  'continues',
  'to',
  'arrive',
  'one',
  'token',
  'at',
  'a',
  'time',
  'until',
  'the',
  'block',
  'is',
  'finally',
  'complete',
]

const benchmarkOptions = {
  time: 1000,
  warmupTime: 500,
}

let prototypeBlockRenderCount = 0

interface RenderOptions {
  animate: boolean
  blockIndex: number
  deep: number
  nodeKey: string
  parentNode?: ParsedNode
}

function createHost(): HTMLDivElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return host
}

function appendTail(document: string, step: number, tail: string): string {
  const word = TAIL_WORDS[step % TAIL_WORDS.length]
  return `${document}\n\n${tail}${word} `
}

function createParagraphStyle(
  node: Extract<ParsedNode, { type: 'paragraph' }>,
  parentNode: ParsedNode | undefined,
  nextNode: ParsedNode | undefined,
  deep: number,
): string {
  const { marginBottom, lineHeight } = createParagraphModel({
    deep,
    nextNode,
    node,
    parentNode,
  })
  const declarations: string[] = []
  if (marginBottom)
    declarations.push(`margin-bottom:${marginBottom}`)
  if (lineHeight)
    declarations.push(`line-height:${lineHeight}`)
  return declarations.join(';')
}

function renderText(
  node: Extract<ParsedNode, { type: 'text' }>,
  options: RenderOptions,
) {
  if (!options.animate) {
    return h('span', {
      'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
      'data-stream-markdown': 'text',
    }, node.value)
  }

  const parts = createTextParts(node.value, options.nodeKey, 'word')
  return h(TransitionGroup, {
    'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
    'data-stream-markdown': 'text',
    'name': getTransitionName('fade-in'),
    'tag': 'span',
  }, {
    default: () => parts.map(part => h('span', {
      'class': [
        '[text-decoration:inherit]',
        !part.whitespace && 'inline-block max-w-full whitespace-pre-wrap break-words',
      ],
      'data-stream-markdown': part.whitespace ? 'text-space' : `text-${part.animationSplit}`,
      'key': part.key,
    }, part.value)),
  })
}

function renderNode(
  node: ParsedNode,
  nextNode: ParsedNode | undefined,
  options: RenderOptions,
) {
  const childOptions = {
    ...options,
    deep: options.deep + 1,
    parentNode: node,
  }
  const children = 'children' in node
    ? renderNodes(node.children as ParsedNode[], childOptions)
    : undefined

  let vnode
  switch (node.type) {
    case 'text':
      vnode = renderText(node, options)
      break
    case 'paragraph':
      vnode = h('p', {
        'class': 'my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease',
        'data-stream-markdown': 'paragraph',
        'dir': resolveNodeTextDirection(node, 'auto'),
        'style': createParagraphStyle(node, options.parentNode, nextNode, options.deep),
      }, children)
      break
    case 'heading':
      vnode = h(`h${node.depth}`, {
        'class': [
          'font-semibold mb-2 mt-6',
          node.depth === 1 && 'text-3xl',
          node.depth === 2 && 'text-2xl',
          node.depth === 3 && 'text-xl',
          node.depth === 4 && 'text-lg',
          node.depth === 5 && 'text-base',
          (node.depth < 1 || node.depth > 5) && 'text-sm',
        ],
        'data-stream-markdown': `heading-${node.depth}`,
        'dir': resolveNodeTextDirection(node, 'auto'),
      }, children)
      break
    case 'strong':
      vnode = h('strong', {
        'class': 'font-semibold',
        'data-stream-markdown': 'strong',
      }, children)
      break
    case 'emphasis':
      vnode = h('em', {
        'class': 'italic',
        'data-stream-markdown': 'emphasis',
      }, children)
      break
    default:
      throw new Error(`Unsupported prototype node: ${node.type}`)
  }

  if (node.type === 'text' || !shouldAnimateNode(node.type))
    return vnode

  return h(Transition, {
    appear: true,
    name: options.animate ? getTransitionName('fade-in') : DISABLED_TRANSITION_NAME,
  }, {
    default: () => vnode,
  })
}

function renderNodes(nodes: ParsedNode[], options: RenderOptions) {
  return nodes.map((node, index) => renderNode(
    node,
    nodes[index + 1],
    {
      ...options,
      nodeKey: `${options.nodeKey}-${node.type}-${index}`,
    },
  ))
}

const VNodeBlock = defineComponent({
  props: {
    animate: Boolean,
    block: {
      required: true,
      type: Object as () => SyntaxTree,
    },
    blockIndex: {
      required: true,
      type: Number,
    },
  },
  setup(props) {
    return () => {
      prototypeBlockRenderCount += 1
      return h(Fragment, null, renderNodes(props.block.children as ParsedNode[], {
        animate: props.animate,
        blockIndex: props.blockIndex,
        deep: 0,
        nodeKey: `stream-markdown-block-${props.blockIndex}`,
      }))
    }
  },
})

const VNodeMarkdown = defineComponent({
  props: {
    animate: Boolean,
    content: {
      default: '',
      type: String,
    },
  },
  setup(props) {
    const { parse } = createStreamMarkdownEngine({ mode: 'streaming' })
    return () => {
      const { blocks } = createProcessedMarkdownModel(parse(props.content))
      return h('div', {
        class: 'stream-markdown light',
        dir: 'auto',
        style: '--stream-markdown-animation-duration:0ms',
      }, blocks.map((block, blockIndex) => h(VNodeBlock, {
        animate: props.animate,
        block,
        blockIndex,
        key: blockIndex,
      })))
    }
  },
})

function renderCurrentVue(host: HTMLElement, content: string, animate: boolean): void {
  render(h(VueStreamMarkdown, {
    animation: 'fade-in',
    animationDuration: 0,
    animationSplit: 'word',
    content,
    controls: false,
    dir: 'auto',
    enableAnimate: animate,
    isDark: false,
    mode: 'streaming',
    previewers: false,
  }), host)
}

function renderVNodeVue(host: HTMLElement, content: string, animate: boolean): void {
  render(h(VNodeMarkdown, { animate, content }), host)
}

function renderReact(root: ReactRoot, content: string, animate: boolean): void {
  flushSync(() => {
    root.render(createElement(Streamdown, {
      animated: animate
        ? { duration: 0, sep: 'word', stagger: 0 }
        : false,
      controls: false,
      dir: 'auto',
      isAnimating: animate,
      mode: 'streaming',
    }, content))
  })
}

function runVueSession(
  renderer: (host: HTMLElement, content: string, animate: boolean) => void,
  animate: boolean,
  steps: number,
): number {
  const host = createHost()
  renderer(host, DOCUMENT, animate)

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(DOCUMENT, step, tail)
    tail = content.slice(DOCUMENT.length + 2)
    renderer(host, content, animate)
  }

  const checksum = host.textContent?.length ?? 0
  render(null, host)
  host.remove()
  return checksum
}

function runReactSession(animate: boolean, steps: number): number {
  const host = createHost()
  const root = createRoot(host)
  renderReact(root, DOCUMENT, animate)

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(DOCUMENT, step, tail)
    tail = content.slice(DOCUMENT.length + 2)
    renderReact(root, content, animate)
  }

  const checksum = host.textContent?.length ?? 0
  flushSync(() => root.unmount())
  host.remove()
  return checksum
}

interface AnimatedTimings {
  elementCount: number
  initialMs: number
  stableHeading: boolean
  updatesMs: number
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function settleTransitions(): Promise<void> {
  await nextTick()
  await nextFrame()
  await nextFrame()
  await new Promise(resolve => setTimeout(resolve, 0))
}

// TransitionGroup completes class changes across animation frames. Measure the
// render plus Vue's queued update, then settle zero-duration transitions outside
// the timed window so consecutive streaming ticks do not overlap lifecycle work.
async function measureAnimatedVueSession(
  renderer: (host: HTMLElement, content: string, animate: boolean) => void,
): Promise<AnimatedTimings> {
  const host = createHost()
  prototypeBlockRenderCount = 0

  const initialStart = performance.now()
  renderer(host, DOCUMENT, true)
  await nextTick()
  const initialMs = performance.now() - initialStart
  const heading = host.querySelector('h1')
  await settleTransitions()

  let updatesMs = 0
  let tail = ''
  for (let step = 0; step < 20; step += 1) {
    const content = appendTail(DOCUMENT, step, tail)
    tail = content.slice(DOCUMENT.length + 2)
    const start = performance.now()
    renderer(host, content, true)
    await nextTick()
    updatesMs += performance.now() - start
    await settleTransitions()
  }

  const timings = {
    elementCount: host.querySelectorAll('*').length,
    initialMs,
    stableHeading: heading !== null && heading === host.querySelector('h1'),
    updatesMs,
  }
  render(null, host)
  host.remove()
  return timings
}

async function measureAnimatedReactSession(): Promise<AnimatedTimings> {
  const host = createHost()
  const root = createRoot(host)

  const initialStart = performance.now()
  renderReact(root, DOCUMENT, true)
  const initialMs = performance.now() - initialStart
  const heading = host.querySelector('h1')
  await settleTransitions()

  let updatesMs = 0
  let tail = ''
  for (let step = 0; step < 20; step += 1) {
    const content = appendTail(DOCUMENT, step, tail)
    tail = content.slice(DOCUMENT.length + 2)
    const start = performance.now()
    renderReact(root, content, true)
    updatesMs += performance.now() - start
    await settleTransitions()
  }

  const timings = {
    elementCount: host.querySelectorAll('*').length,
    initialMs,
    stableHeading: heading !== null && heading === host.querySelector('h1'),
    updatesMs,
  }
  flushSync(() => root.unmount())
  host.remove()
  return timings
}

function averageTimings(runs: AnimatedTimings[]) {
  const mean = (key: 'initialMs' | 'updatesMs') => runs.reduce((sum, run) => sum + run[key], 0) / runs.length
  const updatesMs = mean('updatesMs')
  return {
    elementCount: runs.at(-1)?.elementCount,
    initialMs: mean('initialMs'),
    perUpdateMs: updatesMs / 20,
    stableHeading: runs.every(run => run.stableHeading),
    updatesMs,
  }
}

async function measureSettledAnimatedSessions() {
  const currentVue: AnimatedTimings[] = []
  const vnodeVue: AnimatedTimings[] = []
  const streamdown: AnimatedTimings[] = []
  for (let run = 0; run < 3; run += 1) {
    currentVue.push(await measureAnimatedVueSession(renderCurrentVue))
    vnodeVue.push(await measureAnimatedVueSession(renderVNodeVue))
    streamdown.push(await measureAnimatedReactSession())
  }
  return {
    vnodePrototype: {
      ...averageTimings(vnodeVue),
      blockRenderCount: prototypeBlockRenderCount,
    },
    streamdown: averageTimings(streamdown),
    vueStreamMarkdown: averageTimings(currentVue),
  }
}

beforeAll(async () => {
  const host = createHost()
  renderCurrentVue(host, DOCUMENT, true)
  await new Promise(resolve => setTimeout(resolve, 1000))
  await nextTick()
  render(null, host)
  host.remove()

  console.error('settled animated streaming diagnostics', await measureSettledAnimatedSessions())
}, 30_000)

describe('non-animated simple document initial render', () => {
  bench('vue-stream-markdown', () => runVueSession(renderCurrentVue, false, 0), benchmarkOptions)
  bench('ast to VNode prototype', () => runVueSession(renderVNodeVue, false, 0), benchmarkOptions)
  bench('streamdown', () => runReactSession(false, 0), benchmarkOptions)
})

describe('non-animated simple document with 20 streaming appends', () => {
  bench('vue-stream-markdown', () => runVueSession(renderCurrentVue, false, 20), benchmarkOptions)
  bench('ast to VNode prototype', () => runVueSession(renderVNodeVue, false, 20), benchmarkOptions)
  bench('streamdown', () => runReactSession(false, 20), benchmarkOptions)
})
