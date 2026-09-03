import type { CompletionContext } from '../types'
import { getCompletionAnalysis } from './context'
import {
  htmlClosingTagPattern,
  htmlCommentStartPattern,
  htmlDoctypePattern,
  htmlOpeningTagPattern,
  htmlProcessingInstructionPattern,
  optionalTrailingWhitespacePattern,
  trailingLineWhitespacePattern,
} from './pattern'
import {
  isPositionInRanges,
} from './utils'

/**
 * Remove incomplete HTML fragments.
 *
 * @param content - Markdown content, potentially incomplete during streaming.
 * @param context - Optional completion context.
 * @returns The content with the applicable completion applied.
 */
export function fixHtml(content: string, context?: CompletionContext): string {
  if (!content.includes('<'))
    return content

  const analysis = getCompletionAnalysis(content, context)
  if (analysis.hasUnclosedCodeBlock)
    return content

  const trailingWhitespace = content.match(optionalTrailingWhitespacePattern)?.[0] ?? ''
  const visibleEnd = content.length - trailingWhitespace.length
  if (visibleEnd <= 0)
    return content

  const visibleContent = content.slice(0, visibleEnd)
  const fragmentStart = visibleContent.lastIndexOf('<')
  if (fragmentStart === -1)
    return content

  if (fragmentStart > 0 && visibleContent[fragmentStart - 1] === '\\')
    return content

  const fragment = visibleContent.slice(fragmentStart)
  if (!isUnclosedHtmlFragment(fragment))
    return content

  if (isPositionInRanges(fragmentStart, analysis.codeBlockRanges))
    return content

  if (isPositionInRanges(fragmentStart, analysis.inlineCodeRanges))
    return content

  const beforeFragment = content.slice(0, fragmentStart).replace(trailingLineWhitespacePattern, '')
  return `${beforeFragment}${trailingWhitespace}`
}

function isUnclosedHtmlFragment(fragment: string): boolean {
  if (!fragment.startsWith('<') || fragment.includes('>'))
    return false

  if (fragment.length <= 1)
    return false

  return htmlCommentStartPattern.test(fragment)
    || htmlDoctypePattern.test(fragment)
    || htmlProcessingInstructionPattern.test(fragment)
    || htmlClosingTagPattern.test(fragment)
    || htmlOpeningTagPattern.test(fragment)
}
