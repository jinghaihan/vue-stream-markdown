import type { CompletionInfo } from '@markmend/parser'
import type { ComputedRef, InjectionKey } from 'vue'
import type { MarkdownComponents } from '../../../types'

interface MarkdownRenderContext {
  completionInfo: ComputedRef<CompletionInfo | undefined>
  components: ComputedRef<MarkdownComponents>
  imageSources: ComputedRef<string[]>
}

export const MARKDOWN_RENDER_CONTEXT: InjectionKey<MarkdownRenderContext> = Symbol('markdown-render-context')
