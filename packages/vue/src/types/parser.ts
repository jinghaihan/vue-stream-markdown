import type {
  ComarkPlugin,
  Completion,
  CompletionFunction,
  MarkdownDocument,
  MarkdownNode,
  MarkmendParserOptions,
} from '@markmend/parser'

export type StreamMarkdownParserOptions<
  TPlugins extends readonly ComarkPlugin<any, any>[] = readonly ComarkPlugin<any, any>[],
> = MarkmendParserOptions<TPlugins>

export type {
  ComarkPlugin,
  Completion,
  CompletionFunction,
  MarkdownDocument,
  MarkdownNode,
}
