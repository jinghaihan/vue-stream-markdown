import type { MaybeRefOrGetter } from 'vue'
import type { Extensions } from '../types'
import {
  save,
  serializeSvgForDownload,
  svgToPngBlob,
} from '@stream-markdown/core'
import { computed, toValue } from 'vue'

interface UseMermaidOptions {
  extensions?: MaybeRefOrGetter<Extensions | undefined>
  isDark?: MaybeRefOrGetter<boolean>
}

export function useMermaid(options: UseMermaidOptions = {}) {
  const extensions = computed(() => toValue(options.extensions))
  const isDark = computed(() => toValue(options.isDark) ?? false)

  function resolveExtension(code: string) {
    const configured = extensions.value
    if (configured?.beautifulMermaid?.supports(code))
      return configured.beautifulMermaid
    if (configured?.mermaid?.supports(code))
      return configured.mermaid
    return undefined
  }

  function canRender(code: string) {
    return !!resolveExtension(code)
  }

  async function renderMermaid(code: string) {
    const extension = resolveExtension(code)
    if (!extension) {
      return {
        error: 'No Mermaid extension supports this diagram.',
        supported: false,
        valid: false,
      }
    }

    const theme = await extensions.value?.code?.getTheme?.(isDark.value)
    return await extension.render({
      code,
      isDark: isDark.value,
      theme,
    })
  }

  async function saveMermaid(
    format: 'svg' | 'png',
    code: string,
    onError?: (error: Error) => void,
    filename = 'diagram',
  ) {
    try {
      const { svg } = await renderMermaid(code)
      if (!svg)
        throw new Error('SVG not found. Please wait for the diagram to render.')

      const serializedSvg = serializeSvgForDownload(svg)
      if (format === 'svg') {
        save(`${filename}.svg`, serializedSvg, 'image/svg+xml')
        return
      }

      const blob = await svgToPngBlob(serializedSvg)
      if (!blob)
        throw new Error('Failed to export PNG image')

      save(`${filename}.png`, blob, 'image/png')
    }
    catch (error) {
      onError?.(error as Error)
    }
  }

  return {
    canRender,
    renderMermaid,
    resolveExtension,
    saveMermaid,
  }
}
