import type { CompletionOptions, CompletionResult } from '@markmend/core'
import type {
  ComarkPlugin,
  MarkdownDocument,
  Node,
  ParserOptions,
} from 'comark'
import type { FootnotesConfig } from 'comark/plugins/footnotes'
import type security from 'comark/plugins/security'

export type CompletionFunction = (markdown: string) => CompletionResult | string

export type Completion = CompletionOptions | CompletionFunction

export type MarkmendParserOptions<
  TPlugins extends readonly ComarkPlugin<any, any>[] = readonly ComarkPlugin<any, any>[],
> = Omit<ParserOptions<TPlugins>, 'autoClose'>

export type SecurityOptions = NonNullable<Parameters<typeof security>[0]>

export interface MarkmendSyntaxOptions {
  cjk?: boolean
  footnotes?: false | FootnotesConfig
  security?: false | SecurityOptions
}

export type {
  ComarkPlugin,
  MarkdownDocument,
  Node as MarkdownNode,
  ParserOptions,
}
