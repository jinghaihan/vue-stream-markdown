import type { CSVSeparator } from './table'

export type ZoomControlPosition
  = | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'

export interface DownloadControlOptions {
  filename: string
}

export type DownloadControlConfig = boolean | DownloadControlOptions

export type TableControlsConfig<TTransformer = unknown>
  = | boolean
    | {
      copy?: boolean | string
      csvSeparator?: CSVSeparator
      download?: DownloadControlConfig | string
      fullscreen?: boolean
      customize?: TTransformer
    }

export type CodeControlsConfig<TTransformer = unknown>
  = | boolean
    | {
      collapse?: boolean
      copy?: boolean
      download?: DownloadControlConfig
      fullscreen?: boolean
      customize?: TTransformer
    }

export type ImageControlsConfig<TTransformer = unknown>
  = | boolean
    | {
      preview?: boolean
      download?: boolean
      carousel?: boolean
      flip?: boolean
      rotate?: boolean
      controlPosition?: ZoomControlPosition
      customize?: TTransformer
    }

export type MermaidControlsConfig<TTransformer = unknown>
  = | boolean
    | {
      download?: DownloadControlConfig
      inlineInteractive?: boolean
      position?: ZoomControlPosition
      customize?: TTransformer
    }

export type ControlsConfig<
  TTableTransformer = unknown,
  TCodeTransformer = unknown,
  TImageTransformer = unknown,
  TMermaidTransformer = unknown,
>
  = | boolean
    | {
      table?: boolean | TableControlsConfig<TTableTransformer>
      code?: boolean | CodeControlsConfig<TCodeTransformer>
      image?: boolean | ImageControlsConfig<TImageTransformer>
      mermaid?: boolean | MermaidControlsConfig<TMermaidTransformer>
    }
