import type { MarkdownDocument } from 'comark'
import type {
  Completion,
  CompletionFunction,
  StreamMarkdownParserOptions,
} from './types/parser'
import { completeMarkdown } from '@markmend/core'
import { createMarkdownParser } from 'comark'

export type MarkdownMode = 'static' | 'streaming'

export interface ComarkParserEngineOptions {
  completion?: Completion
  parserOptions?: StreamMarkdownParserOptions
}

export interface ComarkParserEngine {
  getDocument: () => MarkdownDocument
  parse: (markdown: string, mode?: MarkdownMode) => Promise<MarkdownDocument>
}

const EMPTY_DOCUMENT: MarkdownDocument = {
  frontmatter: {},
  meta: {},
  nodes: [],
}

export function createComarkParserEngine(
  options: ComarkParserEngineOptions = {},
): ComarkParserEngine {
  const complete = resolveCompletion(options.completion)
  let activeMode: MarkdownMode = 'streaming'
  let document = EMPTY_DOCUMENT
  let pending: Promise<void> = Promise.resolve()

  const parseMarkdown = createMarkdownParser({
    ...options.parserOptions,
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
