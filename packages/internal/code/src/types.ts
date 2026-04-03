import type { MaybeGetter, SharedCdnOptions } from '@stream-markdown/shared'
import type {
  BuiltinLanguage,
  BuiltinTheme,
  BundledLanguage,
  BundledTheme,
  CodeToTokensOptions,
  Highlighter,
  TokensResult,
} from 'shiki'

export type { MaybeGetter }

export interface CodeRuntimeOptions {
  lang?: MaybeGetter<string | undefined>
  isDark?: MaybeGetter<boolean | undefined>
  cdnOptions?: MaybeGetter<SharedCdnOptions | undefined>
  theme?: MaybeGetter<[BuiltinTheme, BuiltinTheme] | undefined>
  langs?: MaybeGetter<BundledLanguage[] | undefined>
  langAlias?: MaybeGetter<Record<string, string> | undefined>
  codeToTokenOptions?: MaybeGetter<CodeToTokensOptions<BundledLanguage, BundledTheme> | undefined>
}

export interface ShikiRuntime {
  installed: Promise<boolean>
  preload: () => Promise<void>
  dispose: () => void
  getShiki: () => Promise<typeof import('shiki')>
  getHighlighter: () => Promise<Highlighter>
  codeToTokens: (code: string) => Promise<TokensResult>
  getLanguage: () => Promise<BuiltinLanguage>
}
