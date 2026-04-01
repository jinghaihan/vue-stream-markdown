import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../types'
import { ref } from 'vue'
import { isClient, save, svgToPngBlob } from '../utils'
import { createMermaidRenderer } from './mermaid-renderers'

interface UseMermaidOptions {
  mermaidOptions?: MaybeRef<MermaidOptions | undefined>
  cdnOptions?: CdnOptions
  shikiOptions?: MaybeRef<ShikiOptions | undefined>
  isDark?: MaybeRef<boolean>
}

export function useMermaid(options?: UseMermaidOptions) {
  const renderer = createMermaidRenderer(
    options?.mermaidOptions,
    options?.cdnOptions,
    options?.shikiOptions,
    options?.isDark,
  )

  async function parseMermaid(code: string) {
    return renderer.parse(code)
  }

  async function renderMermaid(code: string) {
    return renderer.render(code)
  }

  async function saveMermaid(
    format: 'svg' | 'png',
    code: string,
    onError?: (error: Error) => void,
  ) {
    try {
      const { svg } = await renderer.render(code)
      if (!svg) {
        onError?.(new Error('SVG not found. Please wait for the diagram to render.'))
        return
      }

      if (format === 'svg') {
        const mimeType = 'image/svg+xml'
        save('diagram.svg', svg, mimeType)
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
    if (!await renderer.isEnabled())
      return
    if (!renderer.isLoaded())
      await renderer.load()
  }

  function dispose() {
    // Renderer cleanup if needed
  }

  const installed = ref<boolean>(false)

  if (isClient()) {
    (async () => {
      installed.value = await renderer.isEnabled()
    })()
  }

  return {
    installed,
    getMermaid: () => renderer.load(),
    parseMermaid,
    renderMermaid,
    saveMermaid,
    preload,
    dispose,
  }
}
