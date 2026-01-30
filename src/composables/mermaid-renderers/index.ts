import type { MaybeRef } from 'vue'
import type { CdnOptions, MermaidOptions, ShikiOptions } from '../../types'
import type { MermaidRenderer } from './types'
import { BeautifulMermaidRenderer } from './beautiful'
import { VanillaMermaidRenderer } from './vanilla'

export { BeautifulMermaidRenderer } from './beautiful'
export type { MermaidParseResult, MermaidRenderer, MermaidRenderResult } from './types'
export { VanillaMermaidRenderer } from './vanilla'

export function createMermaidRenderer(
  options: MermaidOptions,
  cdnOptions?: CdnOptions,
  shikiOptions?: ShikiOptions,
  isDark?: MaybeRef<boolean>,
): MermaidRenderer {
  return options.renderer === 'beautiful'
    ? new BeautifulMermaidRenderer(options, cdnOptions, shikiOptions, isDark)
    : new VanillaMermaidRenderer(options, cdnOptions, isDark)
}
