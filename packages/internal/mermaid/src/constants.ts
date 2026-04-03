import type { RenderOptions as BeautifulMermaidConfig, ThemeName } from 'beautiful-mermaid'
import { stripVersionRangePrefix } from '@stream-markdown/shared'
import { dependencies } from '../package.json'

export const MERMAID_VERSION = stripVersionRangePrefix(dependencies.mermaid)
export const BEAUTIFUL_MERMAID_VERSION = stripVersionRangePrefix(dependencies['beautiful-mermaid'])

export const BEAUTIFUL_MERMAID_SUPPORTED_PATTERNS = [
  'flowchart',
  'graph',
  'stateDiagram',
  'sequence',
  'classDiagram',
  'erDiagram',
  'xychart',
] as const

export const DEFAULT_MERMAID_THEME = [
  'neutral',
  'dark',
] as const

export const PRESET_BEAUTIFUL_MERMAID_CONFIG: BeautifulMermaidConfig = {
  padding: 8,
}

export const DEFAULT_BEAUTIFUL_MERMAID_THEME: [ThemeName, ThemeName] = [
  'github-light',
  'github-dark',
] as const
