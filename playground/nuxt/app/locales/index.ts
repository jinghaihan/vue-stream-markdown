import type { PlaygroundLanguage, PlaygroundLocale } from './types'
import enUS from './en-US'
import zhCN from './zh-CN'

export type { PlaygroundLanguage, PlaygroundLocale } from './types'

export const PLAYGROUND_LOCALES: Record<PlaygroundLanguage, PlaygroundLocale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}
