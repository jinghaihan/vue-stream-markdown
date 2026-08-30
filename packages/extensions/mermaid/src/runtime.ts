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
    mermaid = mermaidImport.default
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
