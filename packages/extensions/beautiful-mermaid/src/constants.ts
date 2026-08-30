import type { RenderOptions, ThemeName } from 'beautiful-mermaid'
import { stripVersionRangePrefix } from '@stream-markdown/core'
import { dependencies } from '../package.json'

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

export const PRESET_BEAUTIFUL_MERMAID_CONFIG: RenderOptions = {
  padding: 8,
}

export const DEFAULT_BEAUTIFUL_MERMAID_THEME: [ThemeName, ThemeName] = [
  'github-light',
  'github-dark',
]
