import type { KatexOptions as KatexConfig } from 'katex'
import type { MarkdownItAsync } from 'markdown-it-async'
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown'
import type { MermaidConfig } from 'mermaid'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { BuiltinTheme, BundledLanguage, BundledTheme, CodeToTokensOptions } from 'shiki'
import type { Component } from 'vue'
import type { NodeRenderers, SyntaxTree } from './core'
import type { LocaleConfig } from './locale'
import type { CodeNodeRendererProps, ImageNodeRendererProps, TableNodeRendererProps } from './renderer'
import type { ControlTransformer, Icons } from './shared'

export interface StreamMarkdownProps extends StreamMarkdownContext, MarkdownParserOptions {
  mode?: 'static' | 'streaming'
  content?: string
  nodeRenderers?: NodeRenderers
  icons?: Partial<Icons>
  locale?: string | LocaleConfig
  enableAnimate?: boolean
}

export interface MarkdownParserOptions {
  mdastOptions?: MdastOptions
  normalize?: (content: string) => string
  postNormalize?: (data: SyntaxTree) => SyntaxTree
  preprocess?: (content: string) => string
  postprocess?: (data: SyntaxTree) => SyntaxTree
  extendMarkdownIt?: (md: MarkdownItAsync) => void
}

export interface MdastOptions {
  from?: FromMarkdownExtension[]
  to?: ToMarkdownExtension[]
  micromark?: MicromarkExtension[]
}

export interface StreamMarkdownContext {
  controls?: ControlsConfig
  previewers?: PreviewerConfig
  shikiOptions?: ShikiOptions
  mermaidOptions?: MermaidOptions
  katexOptions?: KatexOptions
  hardenOptions?: HardenOptions
  codeOptions?: CodeOptions
  imageOptions?: ImageOptions
  isDark?: boolean
}

export type TableControlsConfig
  = | boolean
    | {
      copy?: boolean | string
      download?: boolean | string
      customize?: ControlTransformer<TableNodeRendererProps>
    }

export type CodeControlsConfig
  = | boolean
    | {
      collapse?: boolean
      copy?: boolean
      download?: boolean
      fullscreen?: boolean
      customize?: ControlTransformer<CodeNodeRendererProps>
    }

export type ImageControlsConfig
  = | boolean
    | {
      preview?: boolean
      download?: boolean
      carousel?: boolean
      flip?: boolean
      rotate?: boolean
      controlPosition?: ZoomControlPosition
      customize?: ControlTransformer<ImageNodeRendererProps>
    }

export type MermaidControlsConfig
  = | boolean
    | {
      position?: ZoomControlPosition
      customize?: ControlTransformer<CodeNodeRendererProps>
    }

export type ZoomControlPosition
  = | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'

export type ControlsConfig
  = | boolean
    | {
      table?: boolean | TableControlsConfig
      code?: boolean | CodeControlsConfig
      image?: boolean | ImageControlsConfig
      mermaid?: boolean | MermaidControlsConfig
    }

export type PreviewerConfig
  = | boolean
    | ({
      mermaid?: boolean | Component
      html?: boolean | Component
    } & {
      [key: string]: Component
    })

export interface ShikiOptions {
  theme?: [BuiltinTheme, BuiltinTheme]
  langs?: BundledLanguage[]
  langAlias?: Record<string, string>
  codeToTokenOptions?: CodeToTokensOptions<BundledLanguage, BundledTheme>
}

export interface MermaidOptions {
  theme?: [string, string]
  config?: MermaidConfig
  errorComponent?: Component
}

export interface KatexOptions {
  config?: KatexConfig
  errorComponent?: Component
}

export interface ImageOptions {
  fallback?: string
  caption?: boolean
  errorComponent?: Component
}

export interface CodeOptions {
  languageIcon?: boolean
  languageName?: boolean
  lineNumbers?: boolean
  maxHeight?: number | string
  /**
   * Language specific code options
   * @example
   * {
   *   mermaid: {
   *     languageIcon: false,
   *     languageName: false,
   *     lineNumbers: true,
   *   },
   * }
   */
  language?: Record<string, CodeOptionsLanguage>
}

export interface CodeOptionsLanguage extends Omit<CodeOptions, 'languageIcon'> {
  languageIcon?: boolean | Component
}

// https://github.com/vercel-labs/markdown-sanitizers
export interface HardenOptions {
  defaultOrigin?: string
  allowedLinkPrefixes?: string[]
  allowedImagePrefixes?: string[]
  allowedProtocols?: string[]
  allowDataImages?: boolean
  errorComponent?: Component
}
