export interface PreloadConfig<TBuiltinNodeRenderer extends string = string> {
  nodeRenderers?: TBuiltinNodeRenderer[]
}

export type PreviewSegmentedPlacement = 'left' | 'center' | 'right' | 'auto'

export type PreviewerConfig<TComponent = unknown>
  = | boolean
    | {
      placement?: PreviewSegmentedPlacement
      progressive?: Record<string, boolean>
      components?: {
        mermaid?: boolean | TComponent
        html?: boolean | TComponent
      } & Record<string, TComponent>
    }

export interface ShikiOptions<
  TTheme = string,
  TLanguage = string,
  TCodeToTokenOptions = unknown,
> {
  theme?: [TTheme, TTheme]
  langs?: TLanguage[]
  langAlias?: Record<string, string>
  codeToTokenOptions?: TCodeToTokenOptions
}

export interface MermaidOptions<
  TComponent = unknown,
  TConfig = unknown,
  TBeautifulTheme = string,
  TBeautifulConfig = unknown,
> {
  renderer?: 'vanilla' | 'beautiful'
  theme?: [string, string]
  config?: TConfig
  beautifulTheme?: [TBeautifulTheme, TBeautifulTheme]
  beautifulConfig?: TBeautifulConfig
  errorComponent?: TComponent
}

export interface KatexOptions<TComponent = unknown, TConfig = unknown> {
  config?: TConfig
  errorComponent?: TComponent
}

export interface ImageOptions<TComponent = unknown> {
  fallback?: string
  caption?: boolean
  errorComponent?: TComponent
}

export interface LinkOptions {
  safetyCheck?: boolean
  isTrusted?: (url: string) => Promise<boolean> | boolean
}

export interface CodeOptions<TComponent = unknown> {
  languageIcon?: boolean
  languageName?: boolean
  lineNumbers?: boolean
  maxHeight?: number | string
  language?: Record<string, CodeOptionsLanguage<TComponent>>
}

export interface CodeOptionsLanguage<TComponent = unknown> extends Omit<CodeOptions<TComponent>, 'languageIcon'> {
  languageIcon?: boolean | TComponent
}

export interface HardenOptions<TComponent = unknown> {
  defaultOrigin?: string
  allowedLinkPrefixes?: string[]
  allowedImagePrefixes?: string[]
  allowedProtocols?: string[]
  allowDataImages?: boolean
  errorComponent?: TComponent
}

export interface UIOptions {
  hideTooltip?: boolean
}
