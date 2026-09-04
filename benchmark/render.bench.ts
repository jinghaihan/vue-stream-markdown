// @vitest-environment jsdom

import type { Root } from 'react-dom/client'
import type { BenchRunOptions } from 'vitest'
import { code as createCodeExtension } from '@stream-markdown/code'
import { code } from '@streamdown/code'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Streamdown } from 'streamdown'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { h, nextTick, render } from 'vue'
import { Markdown as VueStreamMarkdown } from 'vue-stream-markdown'

const PROSE = `# Quarterly review

Revenue grew across every region this quarter, with **enterprise** leading and
*self-serve* close behind. See the [summary](https://example.com) for detail.

- Enterprise: up 18%
- Self-serve: up 11%
- Partner: flat

> Retention held at 94%.

| Region | Growth |
| ------ | ------ |
| NA     | 14%    |
| EMEA   | 9%     |
`

const WITH_CODE = `${PROSE}

\`\`\`ts
export const rate = (a: number, b: number) => a / b;
\`\`\`
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

const scenarios = [
  ['prose document', PROSE],
  ['document with a stable code block', WITH_CODE],
] as const

const streamdownCodePlugins = { code }
const vueExtensions = { code: createCodeExtension() }

const benchmarkOptions: BenchRunOptions = {
  time: 1000,
  warmupTime: 500,
}
let benchmarkResult: unknown

afterAll(() => {
  if (benchmarkResult === undefined)
    throw new Error('Streaming render benchmarks did not produce a result')
})

interface MutationStats {
  addedNodes: number
  attributeNames: Record<string, number>
  attributes: number
  characterData: number
  elementCount: number
  records: number
  removedNodes: number
  stableHeading: boolean
  textLength: number
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

function renderVue(host: HTMLElement, content: string): void {
  render(h(VueStreamMarkdown, {
    content,
    controls: false,
    enableAnimate: false,
    extensions: vueExtensions,
    isDark: false,
    mode: 'streaming',
    previewers: false,
  }), host)
}

function renderReact(root: Root, content: string): void {
  flushSync(() => {
    root.render(createElement(Streamdown, {
      controls: false,
      isAnimating: false,
      mode: 'streaming',
      plugins: content.includes('```') ? streamdownCodePlugins : undefined,
    }, content))
  })
}

function expectedStableText(document: string): string {
  return document === WITH_CODE ? 'export const rate' : 'EMEA'
}

function expectsHighlight(document: string): boolean {
  return document === WITH_CODE
}

function hasStreamdownHighlight(host: HTMLElement): boolean {
  const tokens = host.querySelectorAll<HTMLElement>(
    '[data-streamdown="code-block-body"] code > span > span',
  )
  return Array.from(tokens).some((token) => {
    const color = token.style.getPropertyValue('--sdm-c')
    return color !== '' && color !== 'inherit'
  })
}

async function waitForVue(
  host: HTMLElement,
  expectedText: string,
  highlight: boolean,
): Promise<void> {
  const deadline = performance.now() + 10_000
  while (performance.now() < deadline) {
    await Promise.resolve()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    if (host.textContent?.includes(expectedText)
      && (!highlight || host.querySelector('[data-stream-markdown="shiki"]'))) {
      return
    }
  }

  throw new Error(`Timed out waiting for Vue output: ${expectedText}`)
}

async function waitForReact(
  host: HTMLElement,
  expectedText: string,
  highlight: boolean,
): Promise<void> {
  const deadline = performance.now() + 10_000
  while (performance.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 0))
    if (host.textContent?.includes(expectedText)
      && (!highlight || hasStreamdownHighlight(host))) {
      return
    }
  }

  throw new Error(`Timed out waiting for Streamdown output: ${expectedText}`)
}

async function runVueSession(document: string, steps: number): Promise<number> {
  const host = createHost()
  renderVue(host, document)
  await waitForVue(host, expectedStableText(document), expectsHighlight(document))

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderVue(host, content)
    await waitForVue(host, tail.trimEnd(), expectsHighlight(document))
  }

  const checksum = host.textContent?.length ?? 0
  render(null, host)
  host.remove()
  return checksum
}

async function runReactSession(document: string, steps: number): Promise<number> {
  const host = createHost()
  const root = createRoot(host)
  renderReact(root, document)
  await waitForReact(host, expectedStableText(document), expectsHighlight(document))

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderReact(root, content)
    await waitForReact(host, tail.trimEnd(), expectsHighlight(document))
  }

  const checksum = host.textContent?.length ?? 0
  flushSync(() => root.unmount())
  host.remove()
  return checksum
}

function collectMutationRecords(
  records: MutationRecord[],
  stats: MutationStats,
): void {
  for (const mutation of records) {
    stats.records += 1
    if (mutation.type === 'attributes') {
      stats.attributes += 1
      const element = mutation.target as Element
      const key = `${element.tagName.toLowerCase()}:${mutation.attributeName}`
      stats.attributeNames[key] = (stats.attributeNames[key] ?? 0) + 1
    }
    else if (mutation.type === 'characterData') {
      stats.characterData += 1
    }
    else if (mutation.type === 'childList') {
      stats.addedNodes += mutation.addedNodes.length
      stats.removedNodes += mutation.removedNodes.length
    }
  }
}

function collectMutations(observer: MutationObserver, stats: MutationStats): void {
  collectMutationRecords(observer.takeRecords(), stats)
}

function createMutationStats(): MutationStats {
  return {
    addedNodes: 0,
    attributeNames: {},
    attributes: 0,
    characterData: 0,
    elementCount: 0,
    records: 0,
    removedNodes: 0,
    stableHeading: false,
    textLength: 0,
  }
}

async function inspectReactSession(document: string): Promise<MutationStats> {
  const host = createHost()
  const root = createRoot(host)
  renderReact(root, document)
  await waitForReact(host, expectedStableText(document), expectsHighlight(document))

  const heading = host.querySelector('h1')
  const stats = createMutationStats()
  const observer = new MutationObserver(records => collectMutationRecords(records, stats))
  observer.observe(host, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })

  let tail = ''
  for (let step = 0; step < 20; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderReact(root, content)
    await waitForReact(host, tail.trimEnd(), expectsHighlight(document))
    collectMutations(observer, stats)
  }

  stats.stableHeading = heading !== null && heading === host.querySelector('h1')
  stats.elementCount = host.querySelectorAll('*').length
  stats.textLength = host.textContent?.length ?? 0
  observer.disconnect()
  flushSync(() => root.unmount())
  host.remove()
  return stats
}

async function inspectVueSession(document: string): Promise<MutationStats> {
  const host = createHost()
  renderVue(host, document)
  await waitForVue(host, expectedStableText(document), expectsHighlight(document))

  const heading = host.querySelector('h1')
  const stats = createMutationStats()
  const observer = new MutationObserver(records => collectMutationRecords(records, stats))
  observer.observe(host, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })

  let tail = ''
  for (let step = 0; step < 20; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderVue(host, content)
    await waitForVue(host, tail.trimEnd(), expectsHighlight(document))
    collectMutations(observer, stats)
  }

  stats.stableHeading = heading !== null && heading === host.querySelector('h1')
  stats.elementCount = host.querySelectorAll('*').length
  stats.textLength = host.textContent?.length ?? 0
  observer.disconnect()
  render(null, host)
  host.remove()
  return stats
}

beforeAll(async () => {
  await runVueSession(WITH_CODE, 0)
  await runReactSession(WITH_CODE, 0)

  for (const [name, document] of scenarios) {
    console.error('streaming render DOM diagnostics', {
      name,
      streamdown: await inspectReactSession(document),
      vueStreamMarkdown: await inspectVueSession(document),
    })
  }
}, 30_000)

for (const [name, document] of scenarios) {
  describe(`${name} initial render`, () => {
    it('vue-stream-markdown', async ({ bench }) => {
      await bench('vue-stream-markdown', async () => {
        benchmarkResult = await runVueSession(document, 0)
      }).run(benchmarkOptions)
    })
    it('streamdown', async ({ bench }) => {
      await bench('streamdown', async () => {
        benchmarkResult = await runReactSession(document, 0)
      }).run(benchmarkOptions)
    })
  })

  describe(`${name} with 20 streaming appends`, () => {
    it('vue-stream-markdown', async ({ bench }) => {
      await bench('vue-stream-markdown', async () => {
        benchmarkResult = await runVueSession(document, 20)
      }).run(benchmarkOptions)
    })
    it('streamdown', async ({ bench }) => {
      await bench('streamdown', async () => {
        benchmarkResult = await runReactSession(document, 20)
      }).run(benchmarkOptions)
    })
  })
}
