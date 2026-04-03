import type { CdnOptions } from '@stream-markdown/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { MermaidOptions, ShikiOptions } from '../types'
import {
  createShikiRuntime,
  DEFAULT_SHIKI_DARK_THEME,
  DEFAULT_SHIKI_LIGHT_THEME,
} from '@stream-markdown/code'
import { createMermaidRuntime } from '@stream-markdown/mermaid'
import { isClient } from '@stream-markdown/shared'
import { ref, toValue } from 'vue'

interface UseMermaidOptions {
  mermaidOptions?: MaybeRefOrGetter<MermaidOptions | undefined>
  cdnOptions?: CdnOptions
  shikiOptions?: MaybeRefOrGetter<ShikiOptions | undefined>
  isDark?: MaybeRefOrGetter<boolean>
}

export function useMermaid(options?: UseMermaidOptions) {
  async function resolveThemeColorsFromShiki(): Promise<Record<string, string> | null> {
    try {
      const shikiTheme = (toValue(options?.shikiOptions)?.theme ?? [DEFAULT_SHIKI_LIGHT_THEME, DEFAULT_SHIKI_DARK_THEME])
      const currentShikiTheme = (toValue(options?.isDark) ?? false) ? shikiTheme[1] : shikiTheme[0]
      const shikiRuntime = createShikiRuntime({
        cdnOptions: () => options?.cdnOptions,
        isDark: () => toValue(options?.isDark) ?? false,
        theme: () => shikiTheme,
        langs: () => toValue(options?.shikiOptions)?.langs ?? [],
        langAlias: () => toValue(options?.shikiOptions)?.langAlias ?? {},
        codeToTokenOptions: () => toValue(options?.shikiOptions)?.codeToTokenOptions,
      })
      const [{ fromShikiTheme }, highlighter] = await Promise.all([
        import('beautiful-mermaid'),
        shikiRuntime.getHighlighter(),
      ])
      const theme = highlighter.getTheme(currentShikiTheme ?? DEFAULT_SHIKI_LIGHT_THEME)
      return fromShikiTheme(theme) as unknown as Record<string, string>
    }
    catch {
      return null
    }
  }

  const runtime = createMermaidRuntime({
    renderer: () => toValue(options?.mermaidOptions)?.renderer,
    theme: () => toValue(options?.mermaidOptions)?.theme,
    beautifulTheme: () => toValue(options?.mermaidOptions)?.beautifulTheme,
    config: () => toValue(options?.mermaidOptions)?.config,
    beautifulConfig: () => toValue(options?.mermaidOptions)?.beautifulConfig,
    cdnOptions: () => options?.cdnOptions,
    isDark: () => toValue(options?.isDark) ?? false,
    getThemeColors: resolveThemeColorsFromShiki,
  })

  async function parseMermaid(code: string) {
    return await runtime.parse(code)
  }

  async function renderMermaid(code: string) {
    return await runtime.render(code)
  }

  async function saveMermaid(
    format: 'svg' | 'png',
    code: string,
    onError?: (error: Error) => void,
  ) {
    try {
      await runtime.save(format, code)
    }
    catch (error) {
      onError?.(error as Error)
    }
  }

  const installed = ref<boolean>(false)

  async function preload() {
    installed.value = await runtime.installed
    if (installed.value)
      await runtime.preload()
  }

  if (isClient()) {
    (async () => {
      installed.value = await runtime.installed
    })()
  }

  return {
    installed,
    getMermaid: runtime.load,
    parseMermaid,
    renderMermaid,
    saveMermaid,
    preload,
    dispose: runtime.dispose,
  }
}
