import type { KatexOptions as KatexConfig } from 'katex'
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown'
import type { MermaidConfig } from 'mermaid'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type { BuiltinTheme, BundledLanguage, BundledTheme, CodeToTokensOptions } from 'shiki'
import type { Component } from 'vue'
import type { CARETS } from '../constants'
import type { NodeRenderers, SyntaxTree } from './core'
import type { DownloadEvent } from './events'
import type { LocaleConfig } from './locale'
import type {
  BuiltinFromMdastExtension,
  BuiltinMicromarkExtension,
  BuiltinPluginControl,
  BuiltinToMdastExtension,
} from './plugins'
import type { CodeNodeRendererProps, ImageNodeRendererProps, TableNodeRendererProps } from './renderer'
import type { BuiltinNodeRenderers, ControlTransformer, Icons, MaybePromise } from './shared'

export interface StreamMarkdownProps extends StreamMarkdownContext, StreamMarkdownHooks, MarkdownParserOptions {
  mode?: 'static' | 'streaming'
  content?: string
  nodeRenderers?: NodeRenderers
  icons?: Partial<Icons>
  preload?: PreloadConfig
  locale?: string | LocaleConfig
  enableAnimate?: boolean
  caret?: keyof typeof CARETS
  themeElement?: () => HTMLElement | undefined
}

export interface PreloadConfig {
  nodeRenderers?: BuiltinNodeRenderers[]
}

export interface MarkdownParserOptions {
  mdastOptions?: MdastOptions
  normalize?: (content: string) => string
  preprocess?: (content: string) => string
  postNormalize?: (data: SyntaxTree) => SyntaxTree
  postprocess?: (data: SyntaxTree) => SyntaxTree
  parseMarkdownIntoBlocks?: (content: string) => string[]
}

export interface MdastOptions {
  from?: FromMarkdownExtension[]
  to?: ToMarkdownExtension[]
  micromark?: MicromarkExtension[]
  builtin?: {
    micromark?: BuiltinPluginControl<BuiltinMicromarkExtension, MicromarkExtension>
    from?: BuiltinPluginControl<BuiltinFromMdastExtension, FromMarkdownExtension>
    to?: BuiltinPluginControl<BuiltinToMdastExtension, ToMarkdownExtension>
  }
  singleDollarTextMath?: boolean
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
  uiOptions?: UIOptions
  cdnOptions?: CdnOptions
  isDark?: boolean
}

export interface StreamMarkdownHooks {
  beforeDownload?: (event: DownloadEvent) => MaybePromise<boolean>
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
      /**
       * Disable drag/pan in page preview (but keep it in fullscreen preview)
       * Useful for mobile devices where drag interactions can interfere with page scrolling
       * @default true
       */
      inlineInteractive?: boolean
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

export type PreviewSegmentedPlacement = 'left' | 'center' | 'right' | 'auto'

export type PreviewerConfig
  = | boolean
    | {
      placement?: PreviewSegmentedPlacement
      progressive?: Record<string, boolean>
      components?: {
        mermaid?: boolean | Component
        html?: boolean | Component
      } & Record<string, Component>
    }

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

export interface UIOptions {
  /**
   * Hide tooltips triggered by hover (but keep dropdowns triggered by click)
   * Useful for mobile devices where hover interactions don't work well
   * @default false
   */
  hideTooltip?: boolean
}

export interface CdnOptions {
  baseUrl?: string
  getUrl?: (module: 'shiki' | 'mermaid' | 'katex' | 'katex-css', version: string) => string
  shiki?: boolean
  mermaid?: 'esm' | 'umd' | false
  katex?: 'esm' | 'umd' | false
}

export interface PreprocessContext {
  singleDollarTextMath?: boolean
}

export {
  type FromMarkdownExtension,
  type MicromarkExtension,
  type ToMarkdownExtension,
}
