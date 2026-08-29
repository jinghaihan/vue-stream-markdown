// @vitest-environment jsdom

import type { Root } from 'react-dom/client'
import { code } from '@streamdown/code'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Streamdown } from 'streamdown'
import { afterAll, beforeAll, bench, describe } from 'vitest'
import { h, nextTick, render } from 'vue'
import { Markdown as VueStreamMarkdown } from 'vue-stream-markdown'

const APPEND_COUNT = 20
const benchmarkOptions = {
  time: 1000,
  warmupTime: 300,
}

let benchmarkResult: unknown
let sessionId = 0

afterAll(() => {
  if (benchmarkResult === undefined)
    throw new Error('Code block render benchmarks did not produce a result')
})

function createHost(): HTMLDivElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  return host
}

function createGrowingCodeInputs(baseLineCount: number, id: number): string[] {
  const lines = Array.from(
    { length: baseLineCount },
    (_, index) => `const stable${index} = ${index};`,
  )
  lines.unshift(`// benchmark-session-${id}`)

  const inputs: string[] = []
  for (let step = 0; step <= APPEND_COUNT; step += 1) {
    if (step > 0)
      lines.push(`const appended${step} = stable${step % baseLineCount};`)
    inputs.push(`## Generated code\n\n\`\`\`ts\n${lines.join('\n')}`)
  }
  return inputs
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
      plugins: { code },
    }, content))
  })
}

async function waitUntil(
  predicate: () => boolean,
  description: string,
): Promise<void> {
  const deadline = performance.now() + 10_000
  while (performance.now() < deadline) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    if (predicate())
      return
  }
  throw new Error(`Timed out waiting for ${description}`)
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

async function runVueSession(inputs: readonly string[]): Promise<number> {
  const host = createHost()
  for (const input of inputs) {
    renderVue(host, input)
    const expectedTail = input.slice(input.lastIndexOf('\n') + 1)
    await waitUntil(
      () => host.querySelector('[data-stream-markdown="shiki"]') !== null
        && (host.textContent?.includes(expectedTail) ?? false),
      'Vue Shiki output',
    )
  }

  const checksum = host.textContent?.length ?? 0
  render(null, host)
  host.remove()
  return checksum
}

async function runReactSession(inputs: readonly string[]): Promise<number> {
  const host = createHost()
  const root = createRoot(host)
  for (const input of inputs) {
    renderReact(root, input)
    const expectedTail = input.slice(input.lastIndexOf('\n') + 1)
    await waitUntil(
      () => hasStreamdownHighlight(host)
        && (host.textContent?.includes(expectedTail) ?? false),
      'Streamdown Shiki output',
    )
  }

  const checksum = host.textContent?.length ?? 0
  flushSync(() => root.unmount())
  host.remove()
  return checksum
}

async function warmHighlighters(): Promise<void> {
  const inputs = createGrowingCodeInputs(1, sessionId += 1).slice(0, 1)
  await runVueSession(inputs)
  await runReactSession(inputs)
}

beforeAll(warmHighlighters, 30_000)

function benchmarkGrowingCode(name: string, baseLineCount: number): void {
  describe(`${name} with ${APPEND_COUNT} streaming appends`, () => {
    bench('vue-stream-markdown', async () => {
      const inputs = createGrowingCodeInputs(baseLineCount, sessionId += 1)
      benchmarkResult = await runVueSession(inputs)
    }, benchmarkOptions)

    bench('streamdown', async () => {
      const inputs = createGrowingCodeInputs(baseLineCount, sessionId += 1)
      benchmarkResult = await runReactSession(inputs)
    }, benchmarkOptions)
  })
}

benchmarkGrowingCode('short growing code block', 2)
benchmarkGrowingCode('200-line growing code block', 200)
