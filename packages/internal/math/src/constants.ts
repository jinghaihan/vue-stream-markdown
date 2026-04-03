import { stripVersionRangePrefix } from '@stream-markdown/shared'
import { dependencies } from '../package.json'

export const KATEX_VERSION = stripVersionRangePrefix(dependencies.katex)
