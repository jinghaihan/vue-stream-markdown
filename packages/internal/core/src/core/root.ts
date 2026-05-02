import type {
  MarkdownAstParserOptions,
  MarkdownAstParserResult,
  ParsedNode,
} from '@markmend/ast'
import type {
  AnimationType,
  BuiltinNodeRenderers,
  PreloadConfig,
} from '../types'
import type {
  StreamMarkdownMode,
  StreamMarkdownProcessed,
} from './types'
import {
  MarkdownAstParser,
} from '@markmend/ast'
import {
  CARETS,
  DEFAULT_ANIMATION,
  PRELOAD_NODE_RENDERER,
  STREAM_MARKDOWN_CSS_VARIABLES,
} from '../constants'
import {
  normalizeAnimationDuration,
} from '../utils'

export interface StreamMarkdownEngineOptions extends MarkdownAstParserOptions {
  mode: StreamMarkdownMode
}

export interface RootStateOptions {
  mode: StreamMarkdownMode
  enableAnimate?: boolean
  caret?: string
  animation?: AnimationType
  animationDuration?: number | string
}

export function createStreamMarkdownEngine(options: StreamMarkdownEngineOptions) {
  const markdownParser = new MarkdownAstParser(options)

  return {
    markdownParser,
    parse(content: string): MarkdownAstParserResult {
      return markdownParser.parseMarkdown(content)
    },
    updateMode(mode: StreamMarkdownMode) {
      markdownParser.updateMode(mode)
    },
    hasLoadingNode(nodes?: ParsedNode[]) {
      return markdownParser.hasLoadingNode(nodes)
    },
  }
}

export function createProcessedMarkdownModel(processed?: MarkdownAstParserResult): StreamMarkdownProcessed {
  const blocks = processed?.asts ?? []
  return {
    blocks,
    parsedNodes: blocks.flatMap(block => block.children),
    processedContent: (processed?.contents ?? []).join(''),
  }
}

export function resolveEnableAnimate(mode: StreamMarkdownMode, enableAnimate?: boolean): boolean {
  if (typeof enableAnimate === 'boolean')
    return enableAnimate
  return mode === 'streaming'
}

export function resolveEnableCaret(mode: StreamMarkdownMode, caret?: string): boolean {
  return !!caret && mode === 'streaming'
}

export function resolveAnimation(animation?: AnimationType): AnimationType {
  return animation ?? DEFAULT_ANIMATION
}

export function resolveCaret(caret?: string): string | undefined {
  if (!caret || !(caret in CARETS))
    return undefined
  return CARETS[caret as keyof typeof CARETS]
}

export function createRootStyle(
  cssVariables: Record<string, string>,
  animationDuration?: number | string,
): Record<string, string> {
  const style = { ...cssVariables }
  const duration = normalizeAnimationDuration(animationDuration)
  if (duration !== undefined)
    style[STREAM_MARKDOWN_CSS_VARIABLES.animationDuration] = duration
  return style
}

export function resolvePreloadNodeRenderers(
  preload?: PreloadConfig<BuiltinNodeRenderers>,
): BuiltinNodeRenderers[]
export function resolvePreloadNodeRenderers<TBuiltinNodeRenderer extends string>(
  preload?: PreloadConfig<TBuiltinNodeRenderer>,
  fallback?: readonly TBuiltinNodeRenderer[],
): TBuiltinNodeRenderer[]
export function resolvePreloadNodeRenderers<TBuiltinNodeRenderer extends string>(
  preload?: PreloadConfig<TBuiltinNodeRenderer>,
  fallback?: readonly TBuiltinNodeRenderer[],
): TBuiltinNodeRenderer[] {
  const resolvedFallback = fallback ?? (PRELOAD_NODE_RENDERER as unknown as readonly TBuiltinNodeRenderer[])
  return preload?.nodeRenderers ?? Array.from(resolvedFallback)
}
