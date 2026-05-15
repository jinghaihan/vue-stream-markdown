export type ModuleStrategy = 'esm' | 'umd'

export type CdnModule = 'shiki' | 'mermaid' | 'beautiful-mermaid' | 'katex' | 'katex-css'

export interface CdnOptions {
  baseUrl?: string
  getUrl?: (module: CdnModule, version: string) => string | undefined
  shiki?: boolean
  mermaid?: ModuleStrategy | false
  beautifulMermaid?: ModuleStrategy | false
  katex?: ModuleStrategy | false
}

export type SharedCdnModule = CdnModule

export type SharedCdnOptions = CdnOptions
