import type { MaybePromise } from './common'

export interface ExtensionRuntime {
  /** Prepare extension resources. Use a no-op when no preload work is needed. */
  preload: () => MaybePromise<void>
  /** Release extension-owned resources. Use a no-op when resources are shared or permanent. */
  dispose: () => MaybePromise<void>
}

export interface CodeToken {
  content: string
  htmlStyle?: Record<string, string | number | undefined>
}

export interface CodeHighlightResult {
  bg?: string
  fg?: string
  grammarState?: {
    lang?: string
  }
  themeName?: string
  tokens: CodeToken[][]
}

export interface CodeHighlightInput {
  code: string
  isDark: boolean
  language: string
}

export interface CodeExtension extends ExtensionRuntime {
  highlight: (input: CodeHighlightInput) => Promise<CodeHighlightResult>
  getTheme?: (isDark: boolean) => Promise<Record<string, unknown> | null>
}

export interface MathRenderInput {
  code: string
  displayMode: boolean
}

export interface MathRenderResult {
  error?: string
  html?: string
}

export interface MathExtension<
  TParserPlugin = unknown,
  TErrorComponent = unknown,
> extends ExtensionRuntime {
  ensureCss?: () => MaybePromise<void>
  errorComponent?: TErrorComponent
  parserPlugin: TParserPlugin
  render: (input: MathRenderInput) => Promise<MathRenderResult>
}

export interface MermaidRenderInput {
  code: string
  isDark: boolean
  theme?: Record<string, unknown> | null
}

export interface MermaidExtensionRenderResult {
  error?: string
  supported?: boolean
  svg?: string
  valid: boolean
}

export interface MermaidExtension<TErrorComponent = unknown> extends ExtensionRuntime {
  errorComponent?: TErrorComponent
  render: (input: MermaidRenderInput) => Promise<MermaidExtensionRenderResult>
  supports: (code: string) => boolean
}

export interface StreamMarkdownExtensions<
  TParserPlugin = unknown,
  TComponent = unknown,
> {
  beautifulMermaid?: MermaidExtension<TComponent>
  code?: CodeExtension
  math?: MathExtension<TParserPlugin, TComponent>
  mermaid?: MermaidExtension<TComponent>
}
