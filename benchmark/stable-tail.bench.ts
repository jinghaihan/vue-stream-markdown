// @vitest-environment happy-dom

import type { BenchRunOptions } from 'vitest'
import type { MarkdownComponents } from 'vue-stream-markdown'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { defineComponent, h, markRaw, nextTick, render } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const WORDS = [
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
]

const INITIAL_CONTENT = '::callout\nStable callout\n::\n\nTail'
const APPEND_COUNT = 20
const CHILD_COUNT = 1024

interface CustomRendererStats {
  renderCount: number
  renderTime: number
}

interface SessionResult extends CustomRendererStats {
  textLength: number
}

const benchmarkOptions: BenchRunOptions = {
  time: 1000,
  warmupTime: 500,
}
let benchmarkResult: SessionResult | undefined

function createCallout(stats: CustomRendererStats) {
  return markRaw(defineComponent({
    name: 'BenchmarkCallout',
    setup(_props, { slots }) {
      return () => {
        const startedAt = performance.now()
        stats.renderCount += 1
        const children = Array.from({ length: CHILD_COUNT }, (_, index) => (
          h('span', { key: index }, `child-${index}`)
        ))
        const rendered = h('aside', { 'data-benchmark-callout': '' }, [
          slots.default?.(),
          ...children,
        ])
        stats.renderTime += performance.now() - startedAt
        return rendered
      }
    },
  }))
}

function createHost(): HTMLDivElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return host
}

function renderSession(
  host: HTMLElement,
  content: string,
  components: MarkdownComponents,
): void {
  render(h(Markdown, {
    components,
    content,
    controls: false,
    enableAnimate: false,
    mode: 'streaming',
    previewers: false,
  }), host)
}

async function waitForText(host: HTMLElement, text: string): Promise<void> {
  const deadline = performance.now() + 10_000
  while (performance.now() < deadline) {
    await Promise.resolve()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    if (host.textContent?.includes(text))
      return
  }

  throw new Error(`Timed out waiting for Vue output: ${text}`)
}

async function runSession(): Promise<SessionResult> {
  const host = createHost()
  const stats: CustomRendererStats = { renderCount: 0, renderTime: 0 }
  const components = { callout: createCallout(stats) }
  let content = INITIAL_CONTENT

  renderSession(host, content, components)
  await waitForText(host, 'Stable callout')

  for (let step = 0; step < APPEND_COUNT; step += 1) {
    const word = WORDS[step % WORDS.length] ?? ''
    content += ` ${word}`
    renderSession(host, content, components)
    await waitForText(host, word)
  }

  const result = {
    renderCount: stats.renderCount,
    renderTime: stats.renderTime,
    textLength: host.textContent?.length ?? 0,
  }
  render(null, host)
  host.remove()
  return result
}

beforeAll(async () => {
  benchmarkResult = await runSession()
  console.error('stable tail custom renderer diagnostics', benchmarkResult)
}, 30_000)

afterAll(() => {
  if (benchmarkResult === undefined)
    throw new Error('Stable tail benchmark did not produce a result')
})

describe('stable tail custom renderer', () => {
  it('renders a stable custom component across 20 streaming appends', async ({ bench }) => {
    await bench('vue-stream-markdown', async () => {
      benchmarkResult = await runSession()
    }).run(benchmarkOptions)
  })
})
