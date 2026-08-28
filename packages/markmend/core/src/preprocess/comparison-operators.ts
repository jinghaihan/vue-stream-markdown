import type { PreprocessContext } from '../types'
import {
  findClosedCodeBlockRanges,
  isPositionInRanges,
} from './utils'

const listComparisonPattern = /^(\s*(?:[-*+]|\d+[.)])[ \t]+)>(=?[ \t]*\$?\d)/gm

/**
 * Escape numeric comparison operators at the start of list items so Markdown
 * parsers do not interpret them as nested blockquotes.
 */
export function fixComparisonOperators(
  content: string,
  options?: Pick<PreprocessContext, 'comparisonOperators'>,
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
