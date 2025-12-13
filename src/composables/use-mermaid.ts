import type { Mermaid, MermaidConfig } from 'mermaid'
import type { MaybeRef } from 'vue'
import type { MermaidOptions } from '../types'
import { randomStr } from '@antfu/utils'
import { computed, ref, unref } from 'vue'
import { hasMermaid, isClient, save, svgToPngBlob } from '../utils'

interface UseMermaidOptions {
  mermaidOptions?: MaybeRef<MermaidOptions | undefined>
  isDark?: MaybeRef<boolean>
}

let mermaid: Mermaid | null = null

export function useMermaid(options?: UseMermaidOptions) {
  const installed = ref<boolean>(false)

  const mermaidConfig = computed((): MermaidConfig => unref(options?.mermaidOptions)?.config ?? {})
  const mermaidTheme = computed(() => unref(options?.mermaidOptions)?.theme ?? ['neutral', 'dark'])

  const isDark = computed(() => unref(options?.isDark) ?? false)
  const lightTheme = computed(() => mermaidTheme.value[0] ?? 'neutral')
  const darkTheme = computed(() => mermaidTheme.value[1] ?? 'dark')
  const theme = computed(() => isDark.value ? darkTheme.value : lightTheme.value)

  const chart = ref<string>('')

  async function getMermaid() {
    if (mermaid)
      return mermaid

    const { default: module } = await import('mermaid')
    module.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      ...mermaidConfig.value,
    })
    mermaid = module
    return mermaid
  }

  function wrapThemeCode(code: string) {
    if (code.startsWith('%%{'))
      return code
    const themeCode = `%%{init: {"theme": "${theme.value}"}}%%\n`
    return `${themeCode}${code}`
  }

  async function parseMermaid(code: string): Promise<boolean> {
    try {
      const mermaid = await getMermaid()
      chart.value = wrapThemeCode(code)
      await mermaid.parse(chart.value)
      return true
    }
    catch {
      return false
    }
  }

  async function renderMermaid(code: string): Promise<string | null> {
    const isValid = await parseMermaid(code)
    if (!isValid || !isClient())
      return null

    const id = `mermaid-${randomStr()}`
    try {
      const mermaid = await getMermaid()
      const result = await mermaid.render(id, wrapThemeCode(code))
      return result.svg
    }
    catch {
      const element = document.getElementById(`d${id}`)
      if (element)
        element.remove()
      return null
    }
  }

  async function saveMermaid(
    format: 'svg' | 'png',
    code: string = chart.value,
    onError?: (error: Error) => void,
  ) {
    try {
      const svg = await renderMermaid(code)
      if (!svg) {
        onError?.(new Error('SVG not found. Please wait for the diagram to render.'))
        return
      }

      if (format === 'svg') {
        const filename = 'diagram.svg'
        const mimeType = 'image/svg+xml'
        save(filename, svg, mimeType)
      }

      if (format === 'png') {
        const blob = await svgToPngBlob(svg)
        if (blob)
          save('diagram.png', blob, 'image/png')
      }
    }
    catch (error) {
      onError?.(error as Error)
    }
  }

  async function preload() {
    if (mermaid)
      return

    installed.value = await hasMermaid()
    if (installed.value)
      await getMermaid()
  }

  function dispose() {
    chart.value = ''
  }

  if (isClient()) {
    (async () => {
      if (mermaid) {
        installed.value = true
        return
      }
      installed.value = await hasMermaid()
    })()
  }

  return {
    installed,
    getMermaid,
    parseMermaid,
    renderMermaid,
    saveMermaid,
    preload,
    dispose,
  }
}
