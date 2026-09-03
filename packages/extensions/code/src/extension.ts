import type {
  CodeExtension,
  CodeHighlightResult,
  CodeToken,
} from '@stream-markdown/core'
import type { ThemeRegistrationResolved } from 'shiki'
import type { CodeRuntimeOptions } from './types'
import { resolveGetter } from '@stream-markdown/core'
import { DEFAULT_SHIKI_DARK_THEME, DEFAULT_SHIKI_LIGHT_THEME } from './constants'
import { createShikiRuntime } from './runtime'

export type CodeExtensionOptions = Omit<CodeRuntimeOptions, 'isDark' | 'lang'>

export function code(options: CodeExtensionOptions = {}): CodeExtension {
  const preloadRuntime = createShikiRuntime({
    ...options,
    lang: 'plaintext',
  })

  return {
    preload: preloadRuntime.preload,
    dispose: preloadRuntime.dispose,
    async highlight(input) {
      const runtime = createShikiRuntime({
        ...options,
        isDark: input.isDark,
        lang: input.language,
      })
      const [result, shiki] = await Promise.all([
        runtime.codeToTokens(input.code),
        runtime.getShiki(),
      ])

      return {
        ...result,
        tokens: result.tokens.map(line => line.map((token): CodeToken => ({
          content: token.content,
          htmlStyle: token.htmlStyle
            ?? shiki.getTokenStyleObject(token) as CodeToken['htmlStyle'],
        }))),
      } satisfies CodeHighlightResult
    },
    async getTheme(isDark) {
      const runtime = createShikiRuntime({
        ...options,
        isDark,
        lang: 'plaintext',
      })
      const highlighter = await runtime.getHighlighter()
      const themes = resolveGetter(options.theme)
        ?? [DEFAULT_SHIKI_LIGHT_THEME, DEFAULT_SHIKI_DARK_THEME]
      const theme: ThemeRegistrationResolved = highlighter.getTheme(themes[isDark ? 1 : 0])
      return Object.fromEntries(Object.entries(theme))
    },
  }
}
