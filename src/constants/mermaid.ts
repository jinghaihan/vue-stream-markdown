import type { RenderOptions as BeautifulMermaidConfig, ThemeName } from 'beautiful-mermaid'

export const BEAUTIFUL_MERMAID_SUPPORTED_TYPES = [
  'flowchart',
  'sequence',
  'class',
  'state',
  'er',
] as const

export const DEFAULT_MERMAID_THEME = ['neutral', 'dark'] as const

export const PRESET_BEAUTIFUL_MERMAID_CONFIG: BeautifulMermaidConfig = {
  padding: 8,
}

export const DEFAULT_BEAUTIFUL_MERMAID_THEME: [ThemeName, ThemeName] = ['default', 'zinc-dark']
