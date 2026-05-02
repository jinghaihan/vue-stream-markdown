import { stripVersionRangePrefix } from '@stream-markdown/core'
import { dependencies } from '../package.json'

export const KATEX_VERSION = stripVersionRangePrefix(dependencies.katex)
