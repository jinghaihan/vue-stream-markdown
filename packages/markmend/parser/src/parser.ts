import type { MarkdownDocument } from 'comark'
import type {
  Completion,
  CompletionFunction,
  MarkmendSyntaxOptions,
  MarkmendParserOptions as ParserOptions,
} from './types'
import { completeMarkdown } from '@markmend/core'
import { createMarkdownParser } from 'comark'
import footnotes from 'comark/plugins/footnotes'
import security from 'comark/plugins/security'
import cjkFriendly from 'markdown-it-cjk-friendly'
import { createLiteralTagContentProcessor } from './literal-tag-content'

export type MarkdownMode = 'static' | 'streaming'

export interface CreateMarkmendParserOptions {
  completion?: Completion
  literalTagContent?: string[]
  parserOptions?: ParserOptions
  syntax?: MarkmendSyntaxOptions
}

export interface MarkmendParser {
  getDocument: () => MarkdownDocument
  parse: (markdown: string, mode?: MarkdownMode) => Promise<MarkdownDocument>
}

const EMPTY_DOCUMENT: MarkdownDocument = {
  frontmatter: {},
  meta: {},
  nodes: [],
}

export function createMarkmendParser(
  options: CreateMarkmendParserOptions = {},
): MarkmendParser {
  const complete = resolveCompletion(options.completion)
  const literalTagContent = createLiteralTagContentProcessor(options.literalTagContent)
  let activeMode: MarkdownMode = 'streaming'
  let document = EMPTY_DOCUMENT
  let pending: Promise<void> = Promise.resolve()

  const parseMarkdown = createMarkdownParser({
    ...options.parserOptions,
    plugins: [
      ...(literalTagContent ? [literalTagContent.plugin] : []),
      ...(options.parserOptions?.plugins ?? []),
      ...(options.syntax?.cjk === false
        ? []
        : [{ name: 'cjk-friendly', markdownItPlugins: [cjkFriendly] }]),
      ...(options.syntax?.security === false
        ? []
        : [security(options.syntax?.security)]),
      ...(options.syntax?.footnotes === false
        ? []
        : [footnotes(options.syntax?.footnotes)]),
    ],
    autoClose(markdown) {
      return activeMode === 'streaming' ? complete(markdown) : markdown
    },
  })

  function parse(
    markdown: string,
    mode: MarkdownMode = 'streaming',
  ): Promise<MarkdownDocument> {
    const result = pending.then(async () => {
      try {
        activeMode = mode
        const nextDocument = await parseMarkdown(markdown, {
          streaming: mode === 'streaming',
        })
        literalTagContent?.flatten(nextDocument.nodes)
        document = nextDocument
      }
      catch {}

      return document
    })

    pending = result.then(() => undefined, () => undefined)
    return result
  }

  return {
    getDocument: () => document,
    parse,
  }
}

function resolveCompletion(completion?: Completion): CompletionFunction {
  if (typeof completion === 'function')
    return completion
  return markdown => completeMarkdown(markdown, completion)
}
