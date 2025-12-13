import type { UserConfig } from '../types'
import { useStorage } from '@vueuse/core'

const storage = typeof window !== 'undefined' ? localStorage : undefined

export const userConfig = useStorage<UserConfig>(
  'user-config',
  (): UserConfig => ({
    locale: 'en-US',
    staticMode: false,
    autoScroll: false,
    typedStep: 1,
    typedDelay: 16,
    showInputEditor: true,
    showAstResult: false,
    shikiLightTheme: 'github-light',
    shikiDarkTheme: 'github-dark',
    mermaidLightTheme: 'neutral',
    mermaidDarkTheme: 'dark',
  }),
  storage,
  { mergeDefaults: true },
)
