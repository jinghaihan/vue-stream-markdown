import type { CompletionInfo, CompletionResult } from '@markmend/core'
import type { MarkdownDocument } from 'comark'
import type {
  Completion,
  MarkmendSyntaxOptions,
  MarkmendParserOptions as ParserOptions,
} from './types'
import { completeMarkdownResult } from '@markmend/core'
import { createMarkdownParser } from 'comark'
import footnotes from 'comark/plugins/footnotes'
import security from 'comark/plugins/security'
import cjkFriendly from 'markdown-it-cjk-friendly'
import { hidePendingFootnoteReferences } from './footnotes'
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
  parse: (markdown: string, mode?: MarkdownMode) => Promise<MarkmendParseResult>
}

export interface MarkmendParseResult {
  completion?: CompletionInfo
  document: MarkdownDocument
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
  let activeCompletion: CompletionInfo | undefined
  let document = EMPTY_DOCUMENT
  let parseResult: MarkmendParseResult = { document }
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
      if (activeMode !== 'streaming') {
        activeCompletion = undefined
        return markdown
      }

      const result = complete(markdown)
      activeCompletion = result.completion
      return result.markdown
    },
  })

  function parse(
    markdown: string,
    mode: MarkdownMode = 'streaming',
  ): Promise<MarkmendParseResult> {
    const result = pending.then(async () => {
      try {
        activeMode = mode
        activeCompletion = undefined
        // Footnotes depend on references outside the unstable tail. Comark's
        // post-processed reference nodes cannot safely be reused by its
        // footnote plugin, so parse these documents with full source context.
        const hasFootnotes = options.syntax?.footnotes !== false && markdown.includes('[^')
        const nextDocument = await parseMarkdown(markdown, {
          streaming: mode === 'streaming' && !hasFootnotes,
        })
        literalTagContent?.flatten(nextDocument.nodes)
        if (hasFootnotes) {
          if (mode === 'streaming')
            hidePendingFootnoteReferences(nextDocument)
          nextDocument.nodes = nextDocument.nodes.map((node, index) => {
            const previous = document.nodes[index]
            return previous !== undefined && JSON.stringify(previous) === JSON.stringify(node)
              ? previous
              : node
          })
        }
        document = nextDocument
        parseResult = {
          document,
          completion: activeCompletion,
        }
      }
      catch {}

      return parseResult
    })

    pending = result.then(() => undefined, () => undefined)
    return result
  }

  return {
    getDocument: () => document,
    parse,
  }
}

function resolveCompletion(completion?: Completion): (markdown: string) => CompletionResult {
  if (completion === false) {
    return markdown => ({ markdown })
  }

  if (typeof completion === 'function') {
    return (markdown) => {
      const result = completion(markdown)
      return typeof result === 'string' ? { markdown: result } : result
    }
  }
  return markdown => completeMarkdownResult(
    markdown,
    typeof completion === 'object' ? completion : undefined,
  )
}
