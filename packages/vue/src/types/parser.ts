import type { CompletionOptions } from '@markmend/core'
import type {
  ComarkPlugin,
  MarkdownDocument,
  Node,
  ParserOptions,
} from 'comark'

export type CompletionFunction = (markdown: string) => string

export type Completion = CompletionOptions | CompletionFunction

export type StreamMarkdownParserOptions<
  TPlugins extends readonly ComarkPlugin<any, any>[] = readonly ComarkPlugin<any, any>[],
> = Omit<ParserOptions<TPlugins>, 'autoClose'>

export type {
  ComarkPlugin,
  MarkdownDocument,
  Node as MarkdownNode,
}
