// @vitest-environment jsdom

import type { Root } from 'react-dom/client'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Streamdown } from 'streamdown'
import { afterAll, beforeAll, bench, describe } from 'vitest'
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
  ['document with a code block', WITH_CODE],
] as const

const benchmarkOptions = {
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
    }, content))
  })
}

function expectedStableText(document: string): string {
  return document === WITH_CODE ? 'export const rate' : 'EMEA'
}

async function waitForVue(
  host: HTMLElement,
  expectedText: string,
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await Promise.resolve()
    await nextTick()
    if (host.textContent?.includes(expectedText))
      return
  }

  throw new Error(`Timed out waiting for Vue output: ${expectedText}`)
}

async function runVueSession(document: string, steps: number): Promise<number> {
  const host = createHost()
  renderVue(host, document)
  await waitForVue(host, expectedStableText(document))

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderVue(host, content)
    await waitForVue(host, tail.trimEnd())
  }

  const checksum = host.textContent?.length ?? 0
  render(null, host)
  host.remove()
  return checksum
}

function runReactSession(document: string, steps: number): number {
  const host = createHost()
  const root = createRoot(host)
  renderReact(root, document)

  let tail = ''
  for (let step = 0; step < steps; step += 1) {
    const content = appendTail(document, step, tail)
    tail = content.slice(document.length + 2)
    renderReact(root, content)
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

function inspectSession(
  document: string,
  mount: (host: HTMLElement, content: string) => () => void,
): MutationStats {
  const host = createHost()
  const unmount = mount(host, document)
  const heading = host.querySelector('h1')
  const observer = new MutationObserver(() => {})
  const stats: MutationStats = {
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
    mount(host, content)
    collectMutations(observer, stats)
  }

  stats.stableHeading = heading !== null && heading === host.querySelector('h1')
  stats.elementCount = host.querySelectorAll('*').length
  stats.textLength = host.textContent?.length ?? 0
  observer.disconnect()
  unmount()
  host.remove()
  return stats
}

function createReactMount(): (host: HTMLElement, content: string) => () => void {
  let root: Root | undefined
  return (host, content) => {
    root ??= createRoot(host)
    renderReact(root, content)
    return () => {
      if (root) {
        flushSync(() => root?.unmount())
      }
    }
  }
}

async function inspectVueSession(document: string): Promise<MutationStats> {
  const host = createHost()
  renderVue(host, document)
  await waitForVue(host, expectedStableText(document))

  const heading = host.querySelector('h1')
  const stats: MutationStats = {
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
    await waitForVue(host, tail.trimEnd())
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
  const vueHost = createHost()
  renderVue(vueHost, WITH_CODE)
  await new Promise(resolve => setTimeout(resolve, 1000))
  await nextTick()
  render(null, vueHost)
  vueHost.remove()

  for (const [name, document] of scenarios) {
    console.error('streaming render DOM diagnostics', {
      name,
      streamdown: inspectSession(document, createReactMount()),
      vueStreamMarkdown: await inspectVueSession(document),
    })
  }
}, 30_000)

for (const [name, document] of scenarios) {
  describe(`${name} initial render`, () => {
    bench('vue-stream-markdown', async () => {
      benchmarkResult = await runVueSession(document, 0)
    }, benchmarkOptions)
    bench('streamdown', () => {
      benchmarkResult = runReactSession(document, 0)
    }, benchmarkOptions)
  })

  describe(`${name} with 20 streaming appends`, () => {
    bench('vue-stream-markdown', async () => {
      benchmarkResult = await runVueSession(document, 20)
    }, benchmarkOptions)
    bench('streamdown', () => {
      benchmarkResult = runReactSession(document, 20)
    }, benchmarkOptions)
  })
}
