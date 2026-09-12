import type { Mermaid } from 'mermaid'
import type {
  MermaidParseResult,
  MermaidRenderResult,
  MermaidRuntime,
  MermaidRuntimeOptions,
} from './types'
import { randomStr } from '@antfu/utils'
import { isClient, resolveGetter } from '@stream-markdown/core'
import { DEFAULT_MERMAID_THEME } from './constants'
import { createMermaidCdnLoader } from './mermaid-cdn'

async function hasBundledMermaidModule() {
  try {
    await import('mermaid')
    return true
  }
  catch {
    return false
  }
}

function toError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function assertMermaidModule(
  module: unknown,
  source: string,
): asserts module is Mermaid {
  const candidate = module as Partial<Mermaid> | null
  const missing = [
    typeof candidate?.initialize === 'function' ? undefined : 'initialize',
    typeof candidate?.parse === 'function' ? undefined : 'parse',
    typeof candidate?.render === 'function' ? undefined : 'render',
  ].filter((name): name is string => !!name)

  if (missing.length > 0) {
    const exports = candidate && typeof candidate === 'object'
      ? Object.keys(candidate).sort().join(', ') || '(none)'
      : typeof candidate
    throw new Error(
      `[vue-stream-markdown] Invalid Mermaid module from ${source}. `
      + `Missing: ${missing.join(', ')}. `
      + `Received exports: ${exports}. Expected the Mermaid runtime API.`,
    )
  }
}

export function createMermaidRuntime(options: MermaidRuntimeOptions = {}): MermaidRuntime {
  let loaded = false
  let mermaid: Mermaid | null = null

  function wrapThemeCode(code: string): string {
    if (code.startsWith('%%{'))
      return code

    const [light, dark] = resolveGetter(options.theme) ?? DEFAULT_MERMAID_THEME
    const theme = resolveGetter(options.isDark) ? dark : light
    return `%%{init: {"theme": "${theme}"}}%%\n${code}`
  }

  function createCdnLoader() {
    return createMermaidCdnLoader({ cdnOptions: options.cdnOptions })
  }

  async function isEnabled(): Promise<boolean> {
    try {
      if (await hasBundledMermaidModule())
        return true

      return !!createCdnLoader().getCdnUrl()
    }
    catch {
      return false
    }
  }

  async function load(): Promise<void> {
    if (mermaid)
      return

    const cdnLoader = createCdnLoader()
    const hasRuntime = cdnLoader.getCdnUrl() ? true : await hasBundledMermaidModule()
    if (!hasRuntime)
      throw new Error('Mermaid module is not available')

    const mermaidImport = await cdnLoader.loadCdn() ?? await import('mermaid')
    const mermaidCandidate = mermaidImport.default ?? mermaidImport
    assertMermaidModule(mermaidCandidate, cdnLoader.getCdnUrl() ?? 'the local "mermaid" package')
    mermaid = mermaidCandidate
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      ...(resolveGetter(options.config) ?? {}),
    })
    loaded = true
  }

  async function ensureLoaded(): Promise<void> {
    if (!loaded)
      await load()
  }

  async function parse(code: string): Promise<MermaidParseResult> {
    try {
      await ensureLoaded()
      await mermaid!.parse(wrapThemeCode(code))
      return { valid: true }
    }
    catch (error) {
      return { valid: false, error: toError(error) }
    }
  }

  async function render(code: string): Promise<MermaidRenderResult> {
    const parseResult = await parse(code)
    if (!parseResult.valid || !isClient())
      return { error: parseResult.error, valid: false }

    const id = `mermaid-${randomStr()}`

    try {
      const result = await mermaid!.render(id, wrapThemeCode(code))
      return { svg: result.svg, valid: true }
    }
    catch (error) {
      document.getElementById(`d${id}`)?.remove()
      return { valid: false, error: toError(error) }
    }
  }

  async function preload() {
    if (!await isEnabled() || loaded)
      return

    await load()
  }

  return {
    installed: isEnabled(),
    preload,
    load,
    dispose() {
      // Mermaid owns a process-wide module singleton and has no disposal API.
    },
    parse,
    render,
  }
}
