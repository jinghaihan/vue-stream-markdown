import { stripVersionRangePrefix } from '@stream-markdown/core'
import { dependencies } from '../package.json'

export const MERMAID_VERSION = stripVersionRangePrefix(dependencies.mermaid)

export const DEFAULT_MERMAID_THEME = [
  'neutral',
  'dark',
] as const
