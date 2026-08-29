import { stripVersionRangePrefix } from '@stream-markdown/core'
import { devDependencies } from '../package.json'

export const MERMAID_VERSION = stripVersionRangePrefix(devDependencies.mermaid)

export const DEFAULT_MERMAID_THEME = [
  'neutral',
  'dark',
] as const
