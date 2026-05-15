import { stripVersionRangePrefix } from '@stream-markdown/core'
import { dependencies } from '../package.json'

export {
  DEFAULT_SHIKI_DARK_THEME,
  DEFAULT_SHIKI_LIGHT_THEME,
  LANGUAGE_ALIAS,
  LANGUAGE_EXTENSIONS,
} from '@stream-markdown/core'

export const SHIKI_VERSION = stripVersionRangePrefix(dependencies.shiki)
