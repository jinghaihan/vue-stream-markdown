import type { CompletionContext } from '../types'
import { listComparisonPattern } from './pattern'
import {
  findClosedCodeBlockRanges,
  isPositionInRanges,
} from './utils'

/**
 * Escape numeric comparison operators at the start of list items so Markdown
 * parsers do not interpret them as nested blockquotes.
 */
export function fixComparisonOperators(
  content: string,
  options?: Pick<CompletionContext, 'comparisonOperators'>,
): string {
  if (!content.includes('>') || options?.comparisonOperators === false)
    return content

  const codeBlockRanges = findClosedCodeBlockRanges(content)

  return content.replace(listComparisonPattern, (match, prefix: string, suffix: string, offset: number) => {
    if (isPositionInRanges(offset, codeBlockRanges))
      return match

    return `${prefix}\\>${suffix}`
  })
}
